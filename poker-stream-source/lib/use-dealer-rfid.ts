"use client";

import { useCallback,useEffect,useRef,useState } from "react";
import type { RfidDetectionConfig,RfidDetectionStatus } from "@/lib/use-seat01-rfid";
import { DEFAULT_RFID_DETECTION_CONFIG } from "@/lib/use-seat01-rfid";
import { buildDealerScanCommand,DEALER_SLOT_COUNT,normalizeDealerCandidates,type DealerRawCardCandidate } from "@/lib/dealer-rfid-protocol";
export { buildDealerScanCommand,dealerSlotsForStreet,normalizeDealerCandidates } from "@/lib/dealer-rfid-protocol";

const BLE_SERVICE_UUID="cbaabb28-4e81-49c4-b775-aedfd27d8db0";
const BLE_TX_UUID="45f116ee-b087-4271-888d-a15eebebd2eb";
const BLE_RX_UUID="45f116ee-b087-4271-888d-a15eebebd2ee";
const BLE_DEVICE_PREFIX="PTV_PP_";
const STOP_COMMAND="mode=scan\nscan=0\ntimeout=200\nidle=5000\nheartbeat=10000\n";

type RfidStatus="idle"|"requesting"|"connecting"|"connected"|"disconnected"|"error";
type BluetoothValueEvent=Event&{target:EventTarget&{value?:DataView}};
type BluetoothCharacteristic=EventTarget&{
  value?:DataView;startNotifications:()=>Promise<BluetoothCharacteristic>;stopNotifications?:()=>Promise<BluetoothCharacteristic>;
  writeValue?:(value:BufferSource)=>Promise<void>;writeValueWithResponse?:(value:BufferSource)=>Promise<void>;
};
type BluetoothService={getCharacteristic:(uuid:string)=>Promise<BluetoothCharacteristic>};
type BluetoothServer={connected:boolean;getPrimaryService:(uuid:string)=>Promise<BluetoothService>;disconnect:()=>void};
type BluetoothDevice=EventTarget&{id:string;name?:string;gatt?:{connect:()=>Promise<BluetoothServer>}};
type BluetoothNavigator=Navigator&{bluetooth?:{requestDevice:(options:unknown)=>Promise<BluetoothDevice>}};

export type DealerSlotState={slot:number;detectionStatus:RfidDetectionStatus;candidateCard:number|null;observations:number;coverage:number;stableUpdates:number;confirmedCard:number|null};
export type DealerRfidState={
  status:RfidStatus;deviceName:string;probeName:string;battery:number|null;charging:boolean|null;lastHeartbeatAt:number|null;lastMessageAt:number|null;
  candidates:DealerRawCardCandidate[];slots:DealerSlotState[];activeSlots:number[];rawMessage:string;error:string;scanning:boolean;
};

const emptySlot=(slot:number):DealerSlotState=>({slot,detectionStatus:"empty",candidateCard:null,observations:0,coverage:0,stableUpdates:0,confirmedCard:null});
const INITIAL_STATE:DealerRfidState={status:"idle",deviceName:"",probeName:"",battery:null,charging:null,lastHeartbeatAt:null,lastMessageAt:null,candidates:[],slots:Array.from({length:DEALER_SLOT_COUNT},(_,slot)=>emptySlot(slot)),activeSlots:[],rawMessage:"",error:"",scanning:false};

const extractJsonObjects=(source:string)=>{
  const objects:string[]=[];let start=-1,depth=0,inString=false,escaped=false,lastEnd=0;
  for(let index=0;index<source.length;index+=1){
    const char=source[index];
    if(start<0){if(char==="{"){start=index;depth=1;}continue;}
    if(inString){if(escaped)escaped=false;else if(char==="\\")escaped=true;else if(char==='"')inString=false;continue;}
    if(char==='"'){inString=true;continue;}
    if(char==="{")depth+=1;else if(char==="}"){depth-=1;if(depth===0){objects.push(source.slice(start,index+1));lastEnd=index+1;start=-1;}}
  }
  return {objects,remainder:start>=0?source.slice(start):source.slice(lastEnd).trim()};
};

export function useDealerRfid(){
  const expectedProbe="Dealer01";
  const [state,setState]=useState<DealerRfidState>(INITIAL_STATE);
  const [config,setConfigState]=useState<RfidDetectionConfig>(DEFAULT_RFID_DETECTION_CONFIG);
  const configRef=useRef(config),deviceRef=useRef<BluetoothDevice|null>(null),serverRef=useRef<BluetoothServer|null>(null),txRef=useRef<BluetoothCharacteristic|null>(null),rxRef=useRef<BluetoothCharacteristic|null>(null);
  const receiveBufferRef=useRef(""),activeSlotsRef=useRef<number[]>([]);
  const observationsRef=useRef<Array<Array<number|null>>>(Array.from({length:DEALER_SLOT_COUNT},()=>[]));
  const stableCardRef=useRef<Array<number|null>>(Array(DEALER_SLOT_COUNT).fill(null)),stableUpdatesRef=useRef<number[]>(Array(DEALER_SLOT_COUNT).fill(0)),confirmedCardsRef=useRef<Array<number|null>>(Array(DEALER_SLOT_COUNT).fill(null));

  const clearDetection=useCallback(()=>{
    observationsRef.current=Array.from({length:DEALER_SLOT_COUNT},()=>[]);stableCardRef.current=Array(DEALER_SLOT_COUNT).fill(null);stableUpdatesRef.current=Array(DEALER_SLOT_COUNT).fill(0);confirmedCardsRef.current=Array(DEALER_SLOT_COUNT).fill(null);
    setState(current=>({...current,candidates:[],slots:Array.from({length:DEALER_SLOT_COUNT},(_,slot)=>emptySlot(slot))}));
  },[]);

  const updateConfig=useCallback((changes:Partial<RfidDetectionConfig>)=>{
    setConfigState(current=>{
      const next={observationWindow:Math.max(2,Math.min(100,Math.round(changes.observationWindow??current.observationWindow))),minObservations:Math.max(1,Math.min(100,Math.round(changes.minObservations??current.minObservations))),minCoverage:Math.max(.01,Math.min(1,changes.minCoverage??current.minCoverage)),requiredStableUpdates:Math.max(1,Math.min(30,Math.round(changes.requiredStableUpdates??current.requiredStableUpdates))),conflictRatio:Math.max(.01,Math.min(1,changes.conflictRatio??current.conflictRatio))};
      configRef.current=next;window.localStorage.setItem("poker-stream.rfid-detection.Dealer01.v1",JSON.stringify(next));return next;
    });
    clearDetection();
  },[clearDetection]);

  const write=useCallback(async(text:string)=>{
    const characteristic=rxRef.current;if(!characteristic)throw new Error(`${expectedProbe}は接続されていません`);
    const bytes=new TextEncoder().encode(text);
    if(characteristic.writeValueWithResponse)await characteristic.writeValueWithResponse(bytes);else if(characteristic.writeValue)await characteristic.writeValue(bytes);else throw new Error("BLE書き込みに対応していません");
  },[]);

  const onValueChanged=useCallback((event:Event)=>{
    const value=(event as BluetoothValueEvent).target.value;if(!value)return;
    receiveBufferRef.current=(receiveBufferRef.current+new TextDecoder().decode(value)).slice(-8192);
    const extracted=extractJsonObjects(receiveBufferRef.current);receiveBufferRef.current=extracted.remainder;
    for(const raw of extracted.objects){
      try{
        const message=JSON.parse(raw) as Record<string,unknown>,probe=typeof message.probe==="string"?message.probe:"";
        if(!probe.startsWith("Dealer")){setState(current=>({...current,status:"error",probeName:probe,rawMessage:raw,error:`Dealer以外の通知を受信しました: ${probe||"unknown"}`}));continue;}
        const mode=typeof message.mode==="string"?message.mode:"unknown",battery=Number(message.battery),charging=message.charging===true||message.charging==="true"?true:message.charging===false||message.charging==="false"?false:null,now=Date.now();
        if(mode!=="scan"){setState(current=>({...current,status:"connected",probeName:probe,battery:Number.isFinite(battery)?battery:current.battery,charging,lastMessageAt:now,lastHeartbeatAt:mode==="heartbeat"?now:current.lastHeartbeatAt,rawMessage:JSON.stringify(message,null,2),error:""}));continue;}
        const candidates=normalizeDealerCandidates(message.cards),detectionConfig=configRef.current,nextSlots:DealerSlotState[]=[];
        for(let slot=0;slot<DEALER_SLOT_COUNT;slot+=1){
          if(activeSlotsRef.current.includes(slot)){
            const card=candidates.find(candidate=>candidate.slot===slot)?.card??null;
            observationsRef.current[slot]=[...observationsRef.current[slot],card].slice(-detectionConfig.observationWindow);
          }
          const observations=observationsRef.current[slot],counts=new Map<number,number>();
          observations.forEach(card=>{if(card!==null)counts.set(card,(counts.get(card)??0)+1);});
          const ranked=[...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0]),candidateCard=ranked[0]?.[0]??null,candidateObservations=ranked[0]?.[1]??0,coverage=observations.length?candidateObservations/observations.length:0;
          const stable=candidateCard!==null&&candidateObservations>=detectionConfig.minObservations&&coverage>=detectionConfig.minCoverage;
          if(!stable){stableCardRef.current[slot]=null;stableUpdatesRef.current[slot]=0;}
          else if(stableCardRef.current[slot]===candidateCard)stableUpdatesRef.current[slot]+=1;
          else{stableCardRef.current[slot]=candidateCard;stableUpdatesRef.current[slot]=1;confirmedCardsRef.current[slot]=null;}
          if(stable&&stableUpdatesRef.current[slot]>=detectionConfig.requiredStableUpdates)confirmedCardsRef.current[slot]=candidateCard;
          const confirmedCard=confirmedCardsRef.current[slot],detectionStatus:RfidDetectionStatus=confirmedCard!==null?"confirmed":stable?"stable":candidateCard!==null?"detecting":"empty";
          nextSlots.push({slot,detectionStatus,candidateCard,observations:candidateObservations,coverage,stableUpdates:stableUpdatesRef.current[slot],confirmedCard});
        }
        setState(current=>({...current,status:"connected",probeName:probe,battery:Number.isFinite(battery)?battery:current.battery,charging,lastMessageAt:now,candidates,slots:nextSlots,rawMessage:JSON.stringify(message,null,2),error:""}));
      }catch(error){setState(current=>({...current,status:"error",rawMessage:raw,error:error instanceof Error?error.message:"BLE通知を解析できません"}));}
    }
  },[]);

  const onDisconnected=useCallback(()=>{serverRef.current=null;txRef.current=null;rxRef.current=null;setState(current=>({...current,status:"disconnected",scanning:false,error:"BLE接続が切断されました"}));},[]);
  const disconnect=useCallback(()=>{const device=deviceRef.current,tx=txRef.current;if(tx){tx.removeEventListener("characteristicvaluechanged",onValueChanged);void tx.stopNotifications?.().catch(()=>undefined);}if(device){device.removeEventListener("gattserverdisconnected",onDisconnected);serverRef.current?.disconnect();}deviceRef.current=null;serverRef.current=null;txRef.current=null;rxRef.current=null;receiveBufferRef.current="";setState(current=>({...current,status:"disconnected",scanning:false,error:""}));},[onDisconnected,onValueChanged]);
  const connect=useCallback(async()=>{
    const bluetooth=(navigator as BluetoothNavigator).bluetooth;if(!bluetooth){setState(current=>({...current,status:"error",error:"このブラウザはWeb Bluetoothに対応していません"}));return;}
    try{setState(current=>({...current,status:"requesting",error:""}));const device=await bluetooth.requestDevice({filters:[{namePrefix:BLE_DEVICE_PREFIX,services:[BLE_SERVICE_UUID]}]});if(!device.gatt)throw new Error("選択したデバイスはGATT接続に対応していません");setState(current=>({...current,status:"connecting",deviceName:device.name??device.id}));const server=await device.gatt.connect(),service=await server.getPrimaryService(BLE_SERVICE_UUID);const [tx,rx]=await Promise.all([service.getCharacteristic(BLE_TX_UUID),service.getCharacteristic(BLE_RX_UUID)]);deviceRef.current=device;serverRef.current=server;txRef.current=tx;rxRef.current=rx;device.addEventListener("gattserverdisconnected",onDisconnected);tx.addEventListener("characteristicvaluechanged",onValueChanged);await tx.startNotifications();setState(current=>({...current,status:"connected",deviceName:device.name??device.id,error:""}));clearDetection();}
    catch(error){setState(current=>({...current,status:"error",error:error instanceof Error?error.message:"BLE接続に失敗しました"}));}
  },[clearDetection,onDisconnected,onValueChanged]);

  const startScan=useCallback(async(slots:number[])=>{
    const valid=[...new Set(slots.filter(slot=>Number.isInteger(slot)&&slot>=0&&slot<DEALER_SLOT_COUNT))].sort((a,b)=>a-b);if(!valid.length)return;
    valid.forEach(slot=>{observationsRef.current[slot]=[];stableCardRef.current[slot]=null;stableUpdatesRef.current[slot]=0;confirmedCardsRef.current[slot]=null;});activeSlotsRef.current=valid;
    try{await write(buildDealerScanCommand(valid));setState(current=>({...current,activeSlots:valid,scanning:true,error:"",slots:current.slots.map(item=>valid.includes(item.slot)?emptySlot(item.slot):item)}));}catch(error){setState(current=>({...current,scanning:false,error:error instanceof Error?error.message:"スキャン開始に失敗しました"}));}
  },[write]);
  const stopScan=useCallback(async()=>{activeSlotsRef.current=[];try{await write(STOP_COMMAND);setState(current=>({...current,activeSlots:[],scanning:false,error:""}));}catch(error){setState(current=>({...current,error:error instanceof Error?error.message:"スキャン停止に失敗しました"}));}},[write]);
  const resetForNewHand=useCallback(()=>{clearDetection();activeSlotsRef.current=[];if(rxRef.current)void write(STOP_COMMAND).then(()=>setState(current=>({...current,activeSlots:[],scanning:false,error:""}))).catch(error=>setState(current=>({...current,error:error instanceof Error?error.message:"NewHandの停止指示に失敗しました"})));},[clearDetection,write]);
  useEffect(()=>{try{const saved=JSON.parse(window.localStorage.getItem("poker-stream.rfid-detection.Dealer01.v1")??"null") as Partial<RfidDetectionConfig>|null;if(saved)updateConfig(saved);}catch{/* 破損した設定は既定値を使う */}},[updateConfig]);
  useEffect(()=>()=>{const device=deviceRef.current,tx=txRef.current;if(tx)tx.removeEventListener("characteristicvaluechanged",onValueChanged);if(device)device.removeEventListener("gattserverdisconnected",onDisconnected);},[onDisconnected,onValueChanged]);
  return {expectedProbe,state,config,updateConfig,resetConfig:()=>updateConfig(DEFAULT_RFID_DETECTION_CONFIG),clearDetection,connect,disconnect,startScan,stopScan,resetForNewHand};
}
