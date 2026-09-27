"use client";

import { useCallback,useEffect,useRef,useState } from "react";

const BLE_SERVICE_UUID="cbaabb28-4e81-49c4-b775-aedfd27d8db0";
const BLE_TX_UUID="45f116ee-b087-4271-888d-a15eebebd2eb";
const BLE_RX_UUID="45f116ee-b087-4271-888d-a15eebebd2ee";
const BLE_DEVICE_PREFIX="PTV_PP_";
const SCAN_COMMAND="mode=scan\nscan=1\ntimeout=200\nidol=5000\nheartbeat=10000\n";
const STOP_COMMAND="mode=scan\nscan=0\ntimeout=200\nidol=5000\nheartbeat=10000\n";

type RfidStatus="idle"|"requesting"|"connecting"|"connected"|"disconnected"|"error";
export type RfidDetectionStatus="empty"|"detecting"|"stable"|"conflict"|"confirmed";
export type RawCardCandidate={card:number;deck?:number;rssi?:number};
export type AggregatedCardCandidate={card:number;observations:number;coverage:number};
export type RfidDetectionConfig={observationWindow:number;minObservations:number;minCoverage:number;requiredStableUpdates:number;conflictRatio:number};
type BluetoothValueEvent=Event&{target:EventTarget&{value?:DataView}};
type BluetoothCharacteristic=EventTarget&{
  value?:DataView;
  startNotifications:()=>Promise<BluetoothCharacteristic>;
  stopNotifications?:()=>Promise<BluetoothCharacteristic>;
  writeValue?:(value:BufferSource)=>Promise<void>;
  writeValueWithResponse?:(value:BufferSource)=>Promise<void>;
};
type BluetoothService={getCharacteristic:(uuid:string)=>Promise<BluetoothCharacteristic>};
type BluetoothServer={connected:boolean;getPrimaryService:(uuid:string)=>Promise<BluetoothService>;disconnect:()=>void};
type BluetoothDevice=EventTarget&{id:string;name?:string;gatt?:{connect:()=>Promise<BluetoothServer>}};
type BluetoothNavigator=Navigator&{bluetooth?:{requestDevice:(options:unknown)=>Promise<BluetoothDevice>}};

export type Seat01RfidState={
  status:RfidStatus;deviceName:string;probeName:string;battery:number|null;charging:boolean|null;
  lastHeartbeatAt:number|null;lastMessageAt:number|null;candidates:RawCardCandidate[];rawMessage:string;error:string;
  detectionStatus:RfidDetectionStatus;aggregatedCandidates:AggregatedCardCandidate[];confirmedCards:number[];scanMessageCount:number;stableUpdates:number;
};

const INITIAL_STATE:Seat01RfidState={status:"idle",deviceName:"",probeName:"",battery:null,charging:null,lastHeartbeatAt:null,lastMessageAt:null,candidates:[],rawMessage:"",error:"",detectionStatus:"empty",aggregatedCandidates:[],confirmedCards:[],scanMessageCount:0,stableUpdates:0};
export const DEFAULT_RFID_DETECTION_CONFIG:RfidDetectionConfig={observationWindow:20,minObservations:6,minCoverage:.35,requiredStableUpdates:5,conflictRatio:.7};
const RFID_CONFIG_KEY="poker-stream-rfid-detection-v1";

const extractJsonObjects=(source:string)=>{
  const objects:string[]=[];let start=-1,depth=0,inString=false,escaped=false,lastEnd=0;
  for(let index=0;index<source.length;index+=1){
    const char=source[index];
    if(start<0){if(char==="{"){start=index;depth=1;}continue;}
    if(inString){if(escaped)escaped=false;else if(char==="\\")escaped=true;else if(char==='"')inString=false;continue;}
    if(char==='"'){inString=true;continue;}
    if(char==="{")depth+=1;
    else if(char==="}"){depth-=1;if(depth===0){objects.push(source.slice(start,index+1));lastEnd=index+1;start=-1;}}
  }
  return {objects,remainder:start>=0?source.slice(start):source.slice(lastEnd).trim()};
};

const normalizeCandidates=(value:unknown):RawCardCandidate[]=>{
  if(!Array.isArray(value))return [];
  return value.flatMap(item=>{
    if(!item||typeof item!=="object")return [];
    const candidate=item as Record<string,unknown>,card=Number(candidate.card);
    if(!Number.isInteger(card)||card<1||card>52)return [];
    const deck=Number(candidate.deck),rssi=Number(candidate.rssi);
    return [{card,...(Number.isFinite(deck)?{deck}:{}),...(Number.isFinite(rssi)?{rssi}:{})}];
  });
};

export const cardIndexLabel=(cardIndex:number)=>{
  if(!Number.isInteger(cardIndex)||cardIndex<1||cardIndex>52)return `#${cardIndex}`;
  const suits=["♠","♥","♦","♣"],rankIndex=(cardIndex-1)%13+1;
  const rank=rankIndex===1?"A":rankIndex===11?"J":rankIndex===12?"Q":rankIndex===13?"K":String(rankIndex);
  return `${rank}${suits[Math.floor((cardIndex-1)/13)]}`;
};

export function useSeat01Rfid(){
  const [state,setState]=useState<Seat01RfidState>(INITIAL_STATE);
  const [config,setConfigState]=useState<RfidDetectionConfig>(DEFAULT_RFID_DETECTION_CONFIG);
  const configRef=useRef(config);
  const deviceRef=useRef<BluetoothDevice|null>(null),serverRef=useRef<BluetoothServer|null>(null),txRef=useRef<BluetoothCharacteristic|null>(null),rxRef=useRef<BluetoothCharacteristic|null>(null);
  const receiveBufferRef=useRef("");
  const observationPacketsRef=useRef<number[][]>([]),stableSignatureRef=useRef(""),stableUpdatesRef=useRef(0),confirmedCardsRef=useRef<number[]>([]);

  const resetDetection=useCallback(()=>{
    observationPacketsRef.current=[];stableSignatureRef.current="";stableUpdatesRef.current=0;confirmedCardsRef.current=[];
    setState(current=>({...current,candidates:[],detectionStatus:"empty",aggregatedCandidates:[],confirmedCards:[],scanMessageCount:0,stableUpdates:0}));
  },[]);

  const updateConfig=useCallback((changes:Partial<RfidDetectionConfig>)=>{
    setConfigState(current=>{
      const next={
        observationWindow:Math.max(2,Math.min(100,Math.round(changes.observationWindow??current.observationWindow))),
        minObservations:Math.max(1,Math.min(100,Math.round(changes.minObservations??current.minObservations))),
        minCoverage:Math.max(.01,Math.min(1,changes.minCoverage??current.minCoverage)),
        requiredStableUpdates:Math.max(1,Math.min(30,Math.round(changes.requiredStableUpdates??current.requiredStableUpdates))),
        conflictRatio:Math.max(.01,Math.min(1,changes.conflictRatio??current.conflictRatio)),
      };
      configRef.current=next;window.localStorage.setItem(RFID_CONFIG_KEY,JSON.stringify(next));return next;
    });
    resetDetection();
  },[resetDetection]);

  const write=useCallback(async(text:string)=>{
    const characteristic=rxRef.current;if(!characteristic)throw new Error("Seat01は接続されていません");
    const bytes=new TextEncoder().encode(text);
    if(characteristic.writeValueWithResponse)await characteristic.writeValueWithResponse(bytes);
    else if(characteristic.writeValue)await characteristic.writeValue(bytes);
    else throw new Error("BLE書き込みに対応していません");
  },[]);

  const onValueChanged=useCallback((event:Event)=>{
    const value=(event as BluetoothValueEvent).target.value;if(!value)return;
    receiveBufferRef.current=(receiveBufferRef.current+new TextDecoder().decode(value)).slice(-8192);
    const extracted=extractJsonObjects(receiveBufferRef.current);receiveBufferRef.current=extracted.remainder;
    for(const raw of extracted.objects){
      try{
        const message=JSON.parse(raw) as Record<string,unknown>;
        const probe=typeof message.probe==="string"?message.probe:"";
        if(probe!=="Seat01"){setState(current=>({...current,status:"error",probeName:probe,rawMessage:raw,error:`Seat01以外の通知を受信しました: ${probe||"unknown"}`}));continue;}
        const mode=typeof message.mode==="string"?message.mode:"unknown",battery=Number(message.battery);
        const charging=message.charging===true||message.charging==="true"?true:message.charging===false||message.charging==="false"?false:null;
        const now=Date.now(),candidates=normalizeCandidates(message.cards);
        if(mode==="scan"){
          const detectionConfig=configRef.current;
          const cards=[...new Set(candidates.map(candidate=>candidate.card))];
          observationPacketsRef.current=[...observationPacketsRef.current,cards].slice(-detectionConfig.observationWindow);
          const packets=observationPacketsRef.current,counts=new Map<number,number>();
          packets.forEach(packet=>packet.forEach(card=>counts.set(card,(counts.get(card)??0)+1)));
          const aggregatedCandidates=[...counts.entries()].map(([card,observations])=>({card,observations,coverage:observations/packets.length})).sort((a,b)=>b.observations-a.observations||a.card-b.card);
          const [first,second,third]=aggregatedCandidates;
          const validPair=Boolean(first&&second&&first.observations>=detectionConfig.minObservations&&second.observations>=detectionConfig.minObservations&&first.coverage>=detectionConfig.minCoverage&&second.coverage>=detectionConfig.minCoverage);
          const conflict=Boolean(validPair&&third&&third.observations>=second.observations*detectionConfig.conflictRatio);
          const signature=validPair&&!conflict?[first.card,second.card].sort((a,b)=>a-b).join("-"):"";
          const confirmedSignature=confirmedCardsRef.current.join("-");
          if(confirmedSignature&&signature!==confirmedSignature)confirmedCardsRef.current=[];
          const supportsPair=Boolean(signature&&cards.some(card=>card===first.card||card===second.card));
          if(!signature){stableSignatureRef.current="";stableUpdatesRef.current=0;}
          else if(supportsPair){stableUpdatesRef.current=stableSignatureRef.current===signature?stableUpdatesRef.current+1:1;stableSignatureRef.current=signature;}
          if(!confirmedCardsRef.current.length&&signature&&stableUpdatesRef.current>=detectionConfig.requiredStableUpdates)confirmedCardsRef.current=[first.card,second.card].sort((a,b)=>a-b);
          const detectionStatus:RfidDetectionStatus=confirmedCardsRef.current.length?"confirmed":conflict?"conflict":validPair?"stable":aggregatedCandidates.length?"detecting":"empty";
          setState(current=>({...current,status:"connected",probeName:probe,battery:Number.isFinite(battery)?battery:current.battery,charging,lastMessageAt:now,candidates,rawMessage:JSON.stringify(message,null,2),error:"",detectionStatus,aggregatedCandidates,confirmedCards:confirmedCardsRef.current,scanMessageCount:packets.length,stableUpdates:stableUpdatesRef.current}));
        }else setState(current=>({...current,status:"connected",probeName:probe,battery:Number.isFinite(battery)?battery:current.battery,charging,lastMessageAt:now,lastHeartbeatAt:mode==="heartbeat"?now:current.lastHeartbeatAt,rawMessage:JSON.stringify(message,null,2),error:""}));
      }catch(error){setState(current=>({...current,status:"error",rawMessage:raw,error:error instanceof Error?error.message:"BLE通知を解析できません"}));}
    }
  },[]);

  const onDisconnected=useCallback(()=>{serverRef.current=null;txRef.current=null;rxRef.current=null;setState(current=>({...current,status:"disconnected",error:"BLE接続が切断されました"}));},[]);

  const disconnect=useCallback(()=>{
    const device=deviceRef.current,tx=txRef.current;
    if(tx){tx.removeEventListener("characteristicvaluechanged",onValueChanged);void tx.stopNotifications?.().catch(()=>undefined);}
    if(device){device.removeEventListener("gattserverdisconnected",onDisconnected);serverRef.current?.disconnect();}
    deviceRef.current=null;serverRef.current=null;txRef.current=null;rxRef.current=null;receiveBufferRef.current="";
    setState(current=>({...current,status:"disconnected",error:""}));
  },[onDisconnected,onValueChanged]);

  const connect=useCallback(async()=>{
    const bluetooth=(navigator as BluetoothNavigator).bluetooth;
    if(!bluetooth){setState(current=>({...current,status:"error",error:"このブラウザはWeb Bluetoothに対応していません"}));return;}
    try{
      setState(current=>({...current,status:"requesting",error:""}));
      const device=await bluetooth.requestDevice({filters:[{namePrefix:BLE_DEVICE_PREFIX,services:[BLE_SERVICE_UUID]}]});
      if(!device.gatt)throw new Error("選択したデバイスはGATT接続に対応していません");
      setState(current=>({...current,status:"connecting",deviceName:device.name??device.id}));
      const server=await device.gatt.connect(),service=await server.getPrimaryService(BLE_SERVICE_UUID);
      const [tx,rx]=await Promise.all([service.getCharacteristic(BLE_TX_UUID),service.getCharacteristic(BLE_RX_UUID)]);
      deviceRef.current=device;serverRef.current=server;txRef.current=tx;rxRef.current=rx;
      device.addEventListener("gattserverdisconnected",onDisconnected);tx.addEventListener("characteristicvaluechanged",onValueChanged);await tx.startNotifications();
      setState(current=>({...current,status:"connected",deviceName:device.name??device.id,error:""}));
      resetDetection();
      await write(SCAN_COMMAND);
    }catch(error){setState(current=>({...current,status:"error",error:error instanceof Error?error.message:"BLE接続に失敗しました"}));}
  },[onDisconnected,onValueChanged,resetDetection,write]);

  const startScan=useCallback(async()=>{try{resetDetection();await write(SCAN_COMMAND);setState(current=>({...current,error:""}));}catch(error){setState(current=>({...current,error:error instanceof Error?error.message:"スキャン開始に失敗しました"}));}},[resetDetection,write]);
  const stopScan=useCallback(async()=>{try{await write(STOP_COMMAND);setState(current=>({...current,error:""}));}catch(error){setState(current=>({...current,error:error instanceof Error?error.message:"スキャン停止に失敗しました"}));}},[write]);
  useEffect(()=>{try{const saved=JSON.parse(window.localStorage.getItem(RFID_CONFIG_KEY)??"null") as Partial<RfidDetectionConfig>|null;if(saved)updateConfig(saved);}catch{/* 破損した設定は既定値を使う */}},[updateConfig]);
  useEffect(()=>()=>{const device=deviceRef.current,tx=txRef.current;if(tx)tx.removeEventListener("characteristicvaluechanged",onValueChanged);if(device)device.removeEventListener("gattserverdisconnected",onDisconnected);},[onDisconnected,onValueChanged]);
  return {state,config,updateConfig,resetConfig:()=>updateConfig(DEFAULT_RFID_DETECTION_CONFIG),clearDetection:resetDetection,connect,disconnect,startScan,stopScan};
}
