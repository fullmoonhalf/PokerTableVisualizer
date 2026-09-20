"use client";
import { useEffect,useMemo,useRef,useState } from "react";
import { Download,ExternalLink,History,Mic,Radio,RotateCcw,ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NativeSelect,NativeSelectOption } from "@/components/ui/native-select";
import { Tabs,TabsContent,TabsList,TabsTrigger } from "@/components/ui/tabs";
import { amountToCall,createDemoHand,DEFAULT_ANTE,DEFAULT_BLINDS,executeCommand,type AnteConfig,type BlindConfig,type HandState,type PokerCommand } from "@/lib/poker-core";
import { calculateEquity,deck } from "@/lib/equity";

declare global{interface Document{modelContext?:{registerTool:(tool:Record<string,unknown>,options?:{signal?:AbortSignal})=>void|Promise<void>}}}
const STORAGE_KEY="poker-stream.hand.v1";
const LAYOUT_KEY="poker-stream.layout.v1";
type Point={x:number;y:number};
type OverlayLayout={seats:Record<number,Point>;gamePanel:Point;area:{x:number;y:number;width:number;height:number}};
const DEFAULT_LAYOUT:OverlayLayout={
  seats:{1:{x:50,y:8},2:{x:75,y:13},3:{x:88,y:38},4:{x:82,y:75},5:{x:62,y:88},6:{x:38,y:88},7:{x:18,y:75},8:{x:12,y:38},9:{x:25,y:13}},
  gamePanel:{x:50,y:50},
  area:{x:8,y:6,width:84,height:88}
};

export default function PokerConsole(){
  const [hydrated,setHydrated]=useState(false);
  const [state,setState]=useState<HandState>(()=>createDemoHand());
  const [nextAnte,setNextAnte]=useState<AnteConfig>(DEFAULT_ANTE);
  const [nextBlinds,setNextBlinds]=useState<BlindConfig>(DEFAULT_BLINDS);
  const [history,setHistory]=useState<HandState[]>([]);
  const [amount,setAmount]=useState("600");
  const [notice,setNotice]=useState("Ready");
  const [storageReady,setStorageReady]=useState(false);
  const [layout,setLayout]=useState<OverlayLayout>(DEFAULT_LAYOUT);
  const [layoutReady,setLayoutReady]=useState(false);
  const [editorScale,setEditorScale]=useState(1);
  const [overlay,setOverlay]=useState(false);
  const [chroma,setChroma]=useState("00ff00");
  const stageRef=useRef<HTMLDivElement>(null);
  const actor=state.players.find(p=>p.seat===state.actorSeat);
  const callAmount=actor?amountToCall(state,actor.seat):0;
  const equity=useMemo(()=>calculateEquity(state.players,state.board),[state.players,state.board]);
  const dispatch=(command:PokerCommand)=>{
    try{const next=executeCommand(state,command);setHistory(items=>[...items,state]);setState(next);setNotice(next.events.at(-1)?.label??"Updated");}
    catch(error){setNotice(error instanceof Error?error.message:"Action failed");}
  };
  useEffect(()=>setHydrated(true),[]);
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    setOverlay(params.get("view")==="overlay");
    setChroma(params.get("key")||"00ff00");
  },[]);
  useEffect(()=>{
    const context=document.modelContext;if(!context?.registerTool)return;
    const lifecycle=new AbortController();
    void Promise.resolve(context.registerTool({
      name:"record_poker_action",title:"Record poker action",description:"Record one action for the current actor at the live poker table.",
      inputSchema:{type:"object",properties:{type:{enum:["FOLD","CHECK","CALL","BET_TO","RAISE_TO","ALL_IN"]},seat:{type:"number"},amount:{type:"number"}},required:["type","seat"],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},
      execute:(input:unknown)=>{const command=input as PokerCommand;dispatch(command);return{accepted:true,command};}
    },{signal:lifecycle.signal})).catch(()=>undefined);
    return()=>lifecycle.abort();
  },[state]);
  useEffect(()=>{
    const saved=window.localStorage.getItem(STORAGE_KEY);
    if(saved){try{const restored=JSON.parse(saved) as HandState;const normalized={...restored,ante:restored.ante??{mode:"none",amount:0}};if(normalized.players.length===9){setState(normalized);setNextAnte(normalized.ante);setNextBlinds({smallBlind:normalized.smallBlind,bigBlind:normalized.bigBlind});}}catch{}}
    setStorageReady(true);
    const sync=(event:StorageEvent)=>{if(event.key===STORAGE_KEY&&event.newValue){try{const restored=JSON.parse(event.newValue) as HandState;if(restored.players.length===9)setState({...restored,ante:restored.ante??{mode:"none",amount:0}});}catch{}}};
    window.addEventListener("storage",sync);
    return()=>window.removeEventListener("storage",sync);
  },[]);
  useEffect(()=>{if(storageReady)window.localStorage.setItem(STORAGE_KEY,JSON.stringify(state));},[state,storageReady]);
  useEffect(()=>{
    const saved=window.localStorage.getItem(LAYOUT_KEY);
    if(saved){try{const restored=JSON.parse(saved) as Partial<OverlayLayout>;setLayout({...DEFAULT_LAYOUT,...restored,seats:{...DEFAULT_LAYOUT.seats,...restored.seats},area:{...DEFAULT_LAYOUT.area,...restored.area},gamePanel:restored.gamePanel??DEFAULT_LAYOUT.gamePanel});}catch{}}
    setLayoutReady(true);
    const sync=(event:StorageEvent)=>{if(event.key===LAYOUT_KEY&&event.newValue){try{setLayout(JSON.parse(event.newValue) as OverlayLayout);}catch{}}};
    window.addEventListener("storage",sync);
    return()=>window.removeEventListener("storage",sync);
  },[]);
  useEffect(()=>{if(layoutReady&&!overlay)window.localStorage.setItem(LAYOUT_KEY,JSON.stringify(layout));},[layout,layoutReady,overlay]);
  useEffect(()=>{
    const stage=stageRef.current;if(!stage)return;
    const updateScale=()=>setEditorScale(stage.clientWidth/1920);
    updateScale();
    const observer=new ResizeObserver(updateScale);observer.observe(stage);
    return()=>observer.disconnect();
  },[]);
  const dragItem=(target:number|"game",event:React.PointerEvent)=>{
    event.preventDefault();
    const stageRect=stageRef.current?.getBoundingClientRect();if(!stageRect)return;
    const draggedElement=event.currentTarget as HTMLElement;
    const startPoint=target==="game"?layout.gamePanel:(layout.seats[target]??{x:50,y:50});
    const startPointerX=event.clientX;
    const startPointerY=event.clientY;
    const dragArea={...layout.area};
    let pointerX=event.clientX;
    let pointerY=event.clientY;
    let currentX=startPoint.x;
    let currentY=startPoint.y;
    let animationFrame=0;
    const updatePosition=()=>{
      animationFrame=0;
      const deltaX=((pointerX-startPointerX)/stageRect.width)*(10000/dragArea.width);
      const deltaY=((pointerY-startPointerY)/stageRect.height)*(10000/dragArea.height);
      currentX=Math.max(3,Math.min(97,startPoint.x+deltaX));
      currentY=Math.max(5,Math.min(95,startPoint.y+deltaY));
      draggedElement.style.left=`${dragArea.x+(currentX*dragArea.width)/100}%`;
      draggedElement.style.top=`${dragArea.y+(currentY*dragArea.height)/100}%`;
    };
    const move=(pointer:PointerEvent)=>{
      pointer.preventDefault();
      pointerX=pointer.clientX;
      pointerY=pointer.clientY;
      if(!animationFrame)animationFrame=window.requestAnimationFrame(updatePosition);
    };
    const stop=()=>{
      if(animationFrame){window.cancelAnimationFrame(animationFrame);updatePosition();}
      setLayout(current=>target==="game"?{...current,gamePanel:{x:currentX,y:currentY}}:{...current,seats:{...current.seats,[target]:{x:currentX,y:currentY}}});
      window.removeEventListener("pointermove",move);
      window.removeEventListener("pointerup",stop);
      window.removeEventListener("pointercancel",stop);
    };
    window.addEventListener("pointermove",move);window.addEventListener("pointerup",stop);
    window.addEventListener("pointercancel",stop);
  };
  const setArea=(key:keyof OverlayLayout["area"],value:number)=>setLayout(current=>({...current,area:{...current.area,[key]:Math.max(key==="width"||key==="height"?10:0,Math.min(100,value))}}));
  const seatPosition=(seat:number)=>{
    const point=layout.seats[seat]??{x:50,y:50};
    return {left:`${layout.area.x+(point.x*layout.area.width)/100}%`,top:`${layout.area.y+(point.y*layout.area.height)/100}%`};
  };
  const gamePanelPosition={left:`${layout.area.x+(layout.gamePanel.x*layout.area.width)/100}%`,top:`${layout.area.y+(layout.gamePanel.y*layout.area.height)/100}%`};
  const positionName=(seat:number)=>{
    const count=state.players.length;
    const offset=(seat-state.button+count)%count;
    const labels=count===9?["BTN","SB","BB","UTG","UTG+1","MP","LJ","HJ","CO"]:["BTN","SB","BB","UTG","MP","HJ","CO","CO","CO"];
    return labels[offset]??`S${seat}`;
  };
  const lastAction=(seat:number)=>{
    const event=[...state.events].reverse().find(item=>item.seat===seat&&["FOLD","CHECK","CALL","BET_TO","RAISE_TO","ALL_IN"].includes(item.type));
    if(!event)return "";
    if(event.type==="FOLD")return "Fold";
    if(event.type==="CHECK")return "Check";
    if(event.type==="CALL")return "Call";
    if(event.type==="BET_TO")return "Bet";
    if(event.type==="ALL_IN")return "All-In";
    const raises=state.events.filter(item=>item.street===event.street&&item.type==="RAISE_TO"&&item.id<=event.id).length;
    return raises<=1?"Raise":`${raises+1}-Bet`;
  };
  const playerStatus=(player:HandState["players"][number])=>{
    if(player.folded)return "status-folded";
    if(player.seat===state.actorSeat)return "status-current";
    if(player.allIn)return "status-allin";
    const action=lastAction(player.seat);
    if(action==="Call")return "status-called";
    if(action==="Bet"||action==="Raise"||action.endsWith("-Bet"))return "status-raised";
    return "status-active";
  };
  const cardUsedElsewhere=(value:string,current:string)=>{
    if(!value||value===current)return false;
    return [...state.board,...state.players.flatMap(player=>player.cards??[])].includes(value);
  };
  const setHoleCard=(seat:number,index:0|1,value:string)=>{
    const player=state.players.find(item=>item.seat===seat);if(!player)return;
    const current=player.cards?.[index]??"";
    if(cardUsedElsewhere(value,current)){setNotice(`${value} is already assigned`);return;}
    setState(previous=>({...previous,players:previous.players.map(item=>{
      if(item.seat!==seat)return item;
      const cards:[string,string]=item.cards?[...item.cards]:["",""];
      cards[index]=value;return{...item,cards:cards[0]||cards[1]?cards:null};
    })}));
  };
  const setBoardCard=(index:number,value:string)=>{
    const current=state.board[index]??"";
    if(cardUsedElsewhere(value,current)){setNotice(`${value} is already assigned`);return;}
    setState(previous=>{const board=Array.from({length:5},(_,i)=>previous.board[i]??"");board[index]=value;return{...previous,board};});
  };
  const setPlayerProfile=(seat:number,changes:Partial<Pick<HandState["players"][number],"name"|"stack">>)=>{
    setState(previous=>({...previous,players:previous.players.map(player=>player.seat===seat?{...player,...changes}:player)}));
  };
  const anteLabel=(ante:AnteConfig)=>ante.mode==="big-blind"?`BB ANTE ${ante.amount.toLocaleString()}`:ante.mode==="all-players"?`ANTE ${ante.amount.toLocaleString()}`:"NO ANTE";
  const cardSelect=(value:string,onChange:(value:string)=>void,label:string)=><NativeSelect size="sm" aria-label={label} value={value} onChange={event=>onChange(event.target.value)}><NativeSelectOption value="">—</NativeSelectOption>{deck.map(card=><NativeSelectOption value={card} key={card}>{card}</NativeSelectOption>)}</NativeSelect>;
  const renderPlayerContent=(player:HandState["players"][number])=><>
    <div className="seat-top"><span>{positionName(player.seat)}</span></div>
    <div className="seat-name">{player.name}</div>
    <div className="seat-stack">{player.stack.toLocaleString()}</div>
    <div className="last-action">{lastAction(player.seat)||"Active"}</div>
    <div className="player-hand"><div className="hole-cards">{player.cards?player.cards.map((card,index)=><b key={index}>{card||"-"}</b>):<><b>-</b><b>-</b></>}</div><div className="seat-metrics"><span>EQ <b>{equity?.percentages[player.seat]!==undefined?`${equity.percentages[player.seat].toFixed(1)}%`:"—"}</b></span></div></div>
    {player.streetBet>0&&<span className="bet-chip">{player.streetBet.toLocaleString()}</span>}
  </>;
  const renderBoard=()=> <div className="community-board">
    <div className="card-group"><span>FLOP</span><div>{[0,1,2].map(index=><b key={index}>{state.board[index]??"—"}</b>)}</div></div>
    <div className="card-group"><span>TURN</span><div><b>{state.board[3]??"—"}</b></div></div>
    <div className="card-group"><span>RIVER</span><div><b>{state.board[4]??"—"}</b></div></div>
  </div>;
  const renderGamePanel=(draggable=false)=> <section className={`game-panel${draggable?" editor-draggable":""}`} style={gamePanelPosition} onPointerDown={draggable?event=>dragItem("game",event):undefined}>
    <div className="game-panel-top"><span>HAND <strong>{state.handId}</strong></span><b>{state.street.toUpperCase()}</b></div>
    {renderBoard()}
    <div className="game-panel-bottom"><span>POT <strong>{state.pot.toLocaleString()}</strong></span><span>BLINDS <strong>{state.smallBlind} / {state.bigBlind}</strong></span><span>{anteLabel(state.ante)}</span></div>
  </section>;
  const exportJson=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`${state.handId}.json`;link.click();URL.revokeObjectURL(url);};
  if(!hydrated)return <main className="hydration-shell" aria-hidden="true"/>;
  if(overlay)return <main className="overlay-canvas" style={{backgroundColor:`#${chroma.replace("#","")}`}}>
    {renderGamePanel()}
    {state.players.map(player=><article key={player.seat} style={seatPosition(player.seat)} className={`overlay-seat ${playerStatus(player)}`}>
      {renderPlayerContent(player)}
    </article>)}
  </main>;
  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">P</span><div><strong>POKER STREAM</strong><small>OPERATOR CONSOLE</small></div></div>
      <div className="hand-meta"><span>{state.handId}</span><b>{state.smallBlind} / {state.bigBlind} · {anteLabel(state.ante)}</b><Badge className="street-badge">{state.street.toUpperCase()}</Badge></div>
      <div className="system-state"><Button variant="outline" size="sm" onClick={()=>window.open("?view=overlay&key=00ff00","poker-overlay")}><ExternalLink size={15}/> OBS Overlay</Button><span className="live-dot"/> LOCAL <Radio size={17}/></div>
    </header>
    <section className="workspace">
      <div className="layout-panel">
        <Tabs defaultValue="layout" className="layout-tabs">
          <TabsList className="layout-tabs-list"><TabsTrigger value="layout">OBSレイアウト</TabsTrigger><TabsTrigger value="players">プレイヤー設定</TabsTrigger></TabsList>
          <TabsContent value="layout">
            <div className="layout-heading"><div><span className="eyebrow">OBS LAYOUT</span><h1>Overlay placement</h1><p>Seat panels can be dragged. The dashed rectangle marks the capture area.</p></div><Button variant="outline" onClick={()=>setLayout(DEFAULT_LAYOUT)}>Reset layout</Button></div>
            <div className="layout-editor" ref={stageRef}>
              <div className="editor-canvas" style={{transform:`scale(${editorScale})`}}>
                <div className="capture-area" style={{left:`${layout.area.x}%`,top:`${layout.area.y}%`,width:`${layout.area.width}%`,height:`${layout.area.height}%`}}><span>OBS CAPTURE AREA</span></div>
                {renderGamePanel(true)}
                {state.players.map(player=><article key={player.seat} onPointerDown={event=>dragItem(player.seat,event)} style={seatPosition(player.seat)} className={`overlay-seat editor-draggable ${playerStatus(player)}`}>
                  {renderPlayerContent(player)}
                </article>)}
              </div>
            </div>
            <section className="area-controls"><span className="eyebrow">CAPTURE AREA (%)</span>{(["x","y","width","height"] as const).map(key=><label key={key}>{key.toUpperCase()}<Input type="number" min="0" max="100" value={Math.round(layout.area[key])} onChange={event=>setArea(key,Number(event.target.value))}/></label>)}</section>
            <section className="equity-note">{equity?<><b>{equity.mode==="exact"?"EXACT":"MONTE CARLO"}</b><span>{equity.samples.toLocaleString()} runouts · known hands only</span></>:<span>Equity requires at least two known active hands.</span>}</section>
          </TabsContent>
          <TabsContent value="players" className="player-settings">
            <div className="layout-heading"><div><span className="eyebrow">PLAYER SETTINGS</span><h1>プレイヤー設定</h1><p>名前と現在のスタックを編集します。変更はOBS表示へ即時反映されます。</p></div></div>
            <section className="table-settings">
              <div><span className="eyebrow">NEXT HAND</span><b>テーブル設定</b><small>次に「New hand」を押したときに適用されます。</small></div>
              <label>SB<Input type="number" min="1" step="50" value={nextBlinds.smallBlind} onChange={event=>setNextBlinds(current=>({...current,smallBlind:Math.max(1,Number(event.target.value)||1)}))}/></label>
              <label>BB<Input type="number" min="1" step="50" value={nextBlinds.bigBlind} onChange={event=>setNextBlinds(current=>({...current,bigBlind:Math.max(1,Number(event.target.value)||1)}))}/></label>
              <label>方式<NativeSelect value={nextAnte.mode} onChange={event=>setNextAnte(current=>({...current,mode:event.target.value as AnteConfig["mode"]}))}><NativeSelectOption value="none">Anteなし</NativeSelectOption><NativeSelectOption value="big-blind">BB Ante</NativeSelectOption><NativeSelectOption value="all-players">全員Ante</NativeSelectOption></NativeSelect></label>
              <label>金額<Input type="number" min="0" step="100" disabled={nextAnte.mode==="none"} value={nextAnte.amount} onChange={event=>setNextAnte(current=>({...current,amount:Math.max(0,Number(event.target.value)||0)}))}/></label>
            </section>
            <div className="player-settings-grid">{state.players.map(player=><section key={player.seat} className="player-setting-card">
              <div><span>SEAT {player.seat}</span><b>{positionName(player.seat)}</b></div>
              <label>NAME<Input value={player.name} maxLength={24} onChange={event=>setPlayerProfile(player.seat,{name:event.target.value})}/></label>
              <label>STACK<Input type="number" min="0" step="100" value={player.stack} onChange={event=>setPlayerProfile(player.seat,{stack:Math.max(0,Number(event.target.value)||0)})}/></label>
            </section>)}</div>
          </TabsContent>
        </Tabs>
      </div>
      <aside className="control-panel">
        <div className="input-health">
          <div><ScanLine size={18}/><span>RFID gateway<small>Adapter ready</small></span><b>MOCK</b></div>
          <div><Mic size={18}/><span>Voice input<small>Command port ready</small></span><b>OFF</b></div>
        </div>
        <section className="actor-card"><span className="eyebrow">CURRENT ACTION</span><h2>{actor?`Seat ${actor.seat} · ${actor.name}`:"Betting complete"}</h2><div className="actor-numbers"><span>TO CALL <b>{callAmount}</b></span><span>STACK <b>{actor?.stack.toLocaleString()??"—"}</b></span></div></section>
        <section className="actions">
          <div className="action-row">
            <Button disabled={!actor} variant="outline" onClick={()=>actor&&dispatch({type:"FOLD",seat:actor.seat})}>Fold</Button>
            <Button disabled={!actor||callAmount>0} variant="outline" onClick={()=>actor&&dispatch({type:"CHECK",seat:actor.seat})}>Check</Button>
            <Button disabled={!actor||callAmount===0} onClick={()=>actor&&dispatch({type:"CALL",seat:actor.seat})}>Call {callAmount||""}</Button>
          </div>
          <label>BET / RAISE TO</label><div className="amount-row"><Input inputMode="numeric" value={amount} onChange={e=>setAmount(e.target.value)} aria-label="Bet or raise total"/><Button disabled={!actor} onClick={()=>actor&&dispatch({type:state.currentBet===0?"BET_TO":"RAISE_TO",seat:actor.seat,amount:Number(amount)})}>{state.currentBet===0?"Bet":"Raise"}</Button></div>
          <Button className="allin" disabled={!actor} variant="outline" onClick={()=>actor&&dispatch({type:"ALL_IN",seat:actor.seat})}>All-in</Button>
        </section>
        <section className="card-editor">
          <div className="section-title"><span>COMMUNITY CARDS</span></div>
          <div className="board-editor">{["F1","F2","F3","T","R"].map((label,index)=><label key={label}><span>{label}</span>{cardSelect(state.board[index]??"",value=>setBoardCard(index,value),label)}</label>)}</div>
          <div className="section-title"><span>HOLE CARDS</span></div>
          <div className="hole-editor">{state.players.map(player=><div key={player.seat}><b>S{player.seat}</b>{cardSelect(player.cards?.[0]??"",value=>setHoleCard(player.seat,0,value),`Seat ${player.seat} card 1`)}{cardSelect(player.cards?.[1]??"",value=>setHoleCard(player.seat,1,value),`Seat ${player.seat} card 2`)}</div>)}</div>
        </section>
        <div className="notice" aria-live="polite">{notice}</div>
        <section className="history-panel"><div className="section-title"><span><History size={17}/> ACTION LOG</span><b>{state.events.length}</b></div><ol>{[...state.events].reverse().slice(0,7).map(event=><li key={event.id}><span>{event.street}</span><p>{event.label}</p></li>)}</ol></section>
        <footer className="panel-footer">
          <Button variant="ghost" disabled={!history.length} onClick={()=>{const previous=history.at(-1);if(previous){setState(previous);setHistory(items=>items.slice(0,-1));setNotice("Last action undone");}}}><RotateCcw size={16}/> Undo</Button>
          <Button variant="ghost" onClick={()=>{const next=createDemoHand(nextAnte,nextBlinds);setState(next);setNextBlinds({smallBlind:next.smallBlind,bigBlind:next.bigBlind});setHistory([]);setNotice(`New hand · ${next.smallBlind}/${next.bigBlind} · ${anteLabel(next.ante)}`);}}>New hand</Button>
          <Button variant="ghost" onClick={exportJson}><Download size={16}/> JSON</Button>
        </footer>
      </aside>
    </section>
  </main>;
}
