"use client";
import { useEffect,useMemo,useRef,useState } from "react";
import { Download,ExternalLink,History,Mic,Plus,Radio,RotateCcw,ScanLine,Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NativeSelect,NativeSelectOption } from "@/components/ui/native-select";
import { Tabs,TabsContent,TabsList,TabsTrigger } from "@/components/ui/tabs";
import { amountToCall,createDemoHand,DEFAULT_ANTE,DEFAULT_BLINDS,executeCommand,resetHand,type AnteConfig,type BlindConfig,type HandState,type PokerCommand } from "@/lib/poker-core";
import { calculateEquity,deck } from "@/lib/equity";

declare global{interface Document{modelContext?:{registerTool:(tool:Record<string,unknown>,options?:{signal?:AbortSignal})=>void|Promise<void>}}}
const STORAGE_KEY="poker-stream.hand.v1";
const LAYOUT_KEY="poker-stream.layout.v1";
const LEVELS_KEY="poker-stream.levels.v1";
type Point={x:number;y:number};
type OverlayLayout={seats:Record<number,Point>;gamePanel:Point;area:{x:number;y:number;width:number;height:number}};
type BlindLevel={id:number;smallBlind:number;bigBlind:number;ante:AnteConfig};
const DEFAULT_LAYOUT:OverlayLayout={
  seats:{1:{x:50,y:8},2:{x:75,y:13},3:{x:88,y:38},4:{x:82,y:75},5:{x:62,y:88},6:{x:38,y:88},7:{x:18,y:75},8:{x:12,y:38},9:{x:25,y:13}},
  gamePanel:{x:50,y:50},
  area:{x:8,y:6,width:84,height:88}
};
const DEFAULT_LEVELS:BlindLevel[]=[
  {id:1,smallBlind:100,bigBlind:200,ante:{mode:"big-blind",amount:200,priority:"ante"}},
  {id:2,smallBlind:200,bigBlind:400,ante:{mode:"big-blind",amount:400,priority:"ante"}},
  {id:3,smallBlind:300,bigBlind:600,ante:{mode:"big-blind",amount:600,priority:"ante"}},
  {id:4,smallBlind:400,bigBlind:800,ante:{mode:"big-blind",amount:800,priority:"ante"}},
  {id:5,smallBlind:500,bigBlind:1000,ante:{mode:"big-blind",amount:1000,priority:"ante"}},
  {id:6,smallBlind:600,bigBlind:1200,ante:{mode:"big-blind",amount:1200,priority:"ante"}},
  {id:7,smallBlind:800,bigBlind:1600,ante:{mode:"big-blind",amount:1600,priority:"ante"}},
  {id:8,smallBlind:1000,bigBlind:2000,ante:{mode:"big-blind",amount:2000,priority:"ante"}},
];
const normalizeHandState=(restored:HandState&{handId?:string}):HandState=>{
  const {handId,...current}=restored;
  const legacyNumber=Number(handId?.match(/(\d+)$/)?.[1]??1);
  return {
    ...current,
    handNumber:Number.isFinite(restored.handNumber)&&restored.handNumber>0?restored.handNumber:legacyNumber,
    ante:{...(restored.ante??{mode:"none",amount:0}),priority:restored.ante?.priority??"ante"} as AnteConfig,
    handStartStacks:restored.handStartStacks??Object.fromEntries(restored.players.map(player=>[player.seat,player.stack+player.totalInvested]))
  };
};

export default function PokerConsole(){
  const [hydrated,setHydrated]=useState(false);
  const [state,setState]=useState<HandState>(()=>createDemoHand());
  const [nextAnte,setNextAnte]=useState<AnteConfig>(DEFAULT_ANTE);
  const [nextBlinds,setNextBlinds]=useState<BlindConfig>(DEFAULT_BLINDS);
  const [nextButton,setNextButton]=useState(1);
  const [buttonSeatInput,setButtonSeatInput]=useState(1);
  const [levels,setLevels]=useState<BlindLevel[]>(DEFAULT_LEVELS);
  const [levelsReady,setLevelsReady]=useState(false);
  const [selectedLevelId,setSelectedLevelId]=useState<number|null>(1);
  const [history,setHistory]=useState<HandState[]>([]);
  const [amount,setAmount]=useState("600");
  const [shortcutAmountEditing,setShortcutAmountEditing]=useState(false);
  const [shortcutAmountDraft,setShortcutAmountDraft]=useState("");
  const [notice,setNotice]=useState("Ready");
  const [storageReady,setStorageReady]=useState(false);
  const [layout,setLayout]=useState<OverlayLayout>(DEFAULT_LAYOUT);
  const [layoutReady,setLayoutReady]=useState(false);
  const [editorScale,setEditorScale]=useState(1);
  const [overlay,setOverlay]=useState(false);
  const [chroma,setChroma]=useState("00ff00");
  const stageRef=useRef<HTMLDivElement>(null);
  const shortcutAmountActive=useRef(false);
  const shortcutAmountBuffer=useRef("");
  const actor=state.players.find(p=>p.seat===state.actorSeat);
  const callAmount=actor?amountToCall(state,actor.seat):0;
  const equity=useMemo(()=>calculateEquity(state.players,state.board),[state.players,state.board]);
  const dispatch=(command:PokerCommand)=>{
    try{
      const next=executeCommand(state,command);
      setHistory(items=>[...items,state]);setState(next);setNotice(next.events.at(-1)?.label??"Updated");
      shortcutAmountActive.current=false;shortcutAmountBuffer.current="";setShortcutAmountEditing(false);setShortcutAmountDraft("");
      return true;
    }
    catch(error){setNotice(error instanceof Error?error.message:"Action failed");return false;}
  };
  const undoLastAction=()=>{
    const previous=history.at(-1);if(!previous)return;
    setState(previous);setHistory(items=>items.slice(0,-1));setNotice("Last action undone");
  };
  const submitBetOrRaise=(value=amount)=>{
    if(!actor)return false;
    const target=Number(value);
    if(!Number.isFinite(target))return false;
    return dispatch({type:state.currentBet===0?"BET_TO":"RAISE_TO",seat:actor.seat,amount:target});
  };
  useEffect(()=>setHydrated(true),[]);
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    setOverlay(params.get("view")==="overlay");
    setChroma(params.get("key")||"00ff00");
  },[]);
  useEffect(()=>{
    if(overlay)return;
    const onKeyDown=(event:KeyboardEvent)=>{
      const target=event.target as HTMLElement|null;
      const editable=target?.matches("input, textarea, select, [contenteditable='true']")??false;
      const betAmountInput=target?.matches("[data-bet-amount]")??false;
      if((event.ctrlKey||event.metaKey)&&event.code==="KeyZ"&&(!editable||betAmountInput)){
        if(history.length&&!event.repeat){event.preventDefault();undoLastAction();}
        return;
      }
      if(editable||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
      const digit=event.code.match(/^Digit([0-9])$/)?.[1]??event.code.match(/^Numpad([0-9])$/)?.[1];
      if(digit!==undefined){
        event.preventDefault();
        shortcutAmountBuffer.current=shortcutAmountActive.current?`${shortcutAmountBuffer.current}${digit}`:digit;
        shortcutAmountActive.current=true;setShortcutAmountEditing(true);setShortcutAmountDraft(shortcutAmountBuffer.current);return;
      }
      if(event.code==="Backspace"&&shortcutAmountActive.current){
        event.preventDefault();shortcutAmountBuffer.current=shortcutAmountBuffer.current.slice(0,-1);setShortcutAmountDraft(shortcutAmountBuffer.current);return;
      }
      if(event.code==="Escape"&&shortcutAmountActive.current){
        event.preventDefault();shortcutAmountActive.current=false;shortcutAmountBuffer.current="";setShortcutAmountEditing(false);setShortcutAmountDraft("");return;
      }
      if((event.code==="Enter"||event.code==="NumpadEnter")&&shortcutAmountActive.current){event.preventDefault();submitBetOrRaise(shortcutAmountBuffer.current);return;}
      if(event.repeat||!actor)return;
      if(event.code==="KeyF"){event.preventDefault();dispatch({type:"FOLD",seat:actor.seat});}
      else if(event.code==="KeyC"&&callAmount>0){event.preventDefault();dispatch({type:"CALL",seat:actor.seat});}
      else if(event.code==="KeyX"&&callAmount===0){event.preventDefault();dispatch({type:"CHECK",seat:actor.seat});}
      else if(event.code==="KeyA"){event.preventDefault();dispatch({type:"ALL_IN",seat:actor.seat});}
    };
    window.addEventListener("keydown",onKeyDown);
    return()=>window.removeEventListener("keydown",onKeyDown);
  },[overlay,state,actor,callAmount,amount,history]);
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
    if(saved){try{const restored=normalizeHandState(JSON.parse(saved) as HandState);if(restored.players.length===9){setState(restored);setNextAnte(restored.ante);setNextBlinds({smallBlind:restored.smallBlind,bigBlind:restored.bigBlind});setNextButton(restored.button);setButtonSeatInput(restored.button);setSelectedLevelId(null);}}catch{}}
    setStorageReady(true);
    const sync=(event:StorageEvent)=>{if(event.key===STORAGE_KEY&&event.newValue){try{const restored=normalizeHandState(JSON.parse(event.newValue) as HandState);if(restored.players.length===9)setState(restored);}catch{}}};
    window.addEventListener("storage",sync);
    return()=>window.removeEventListener("storage",sync);
  },[]);
  useEffect(()=>{if(storageReady)window.localStorage.setItem(STORAGE_KEY,JSON.stringify(state));},[state,storageReady]);
  useEffect(()=>{
    const saved=window.localStorage.getItem(LEVELS_KEY);
    if(saved){try{const restored=JSON.parse(saved) as BlindLevel[];if(restored.length)setLevels(restored.map(level=>({...level,ante:{...level.ante,priority:level.ante.priority??"ante"}})));}catch{}}
    setLevelsReady(true);
  },[]);
  useEffect(()=>{if(levelsReady&&!overlay)window.localStorage.setItem(LEVELS_KEY,JSON.stringify(levels));},[levels,levelsReady,overlay]);
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
    setState(previous=>{
      const player=previous.players.find(item=>item.seat===seat);
      const handStartStacks=changes.stack===undefined||!player?previous.handStartStacks:{...previous.handStartStacks,[seat]:changes.stack+player.totalInvested};
      return {...previous,handStartStacks,players:previous.players.map(item=>item.seat===seat?{...item,...changes}:item)};
    });
  };
  const cardSuitClass=(card:string)=>card.endsWith("♠")?"suit-spade":card.endsWith("♥")?"suit-heart":card.endsWith("♦")?"suit-diamond":card.endsWith("♣")?"suit-club":"suit-unknown";
  const renderCardFace=(card:string,fallback:string,key?:React.Key)=><b className={`card-face ${cardSuitClass(card)}`} key={key}>{card?<><span className="card-suit">{card.slice(-1)}</span><span className="card-rank">{card.slice(0,-1)}</span></>:<span className="card-rank">{fallback}</span>}</b>;
  const updateLevel=(id:number,changes:Partial<BlindLevel>)=>{setLevels(current=>current.map(level=>level.id===id?{...level,...changes}:level));if(selectedLevelId===id)setSelectedLevelId(null);};
  const applyLevel=(level:BlindLevel)=>{
    const blinds={smallBlind:Math.max(1,level.smallBlind),bigBlind:Math.max(Math.max(1,level.smallBlind),level.bigBlind)};
    setNextBlinds(blinds);setNextAnte(level.ante);setSelectedLevelId(level.id);
    setNotice(`Level ${levels.findIndex(item=>item.id===level.id)+1} selected · ${blinds.smallBlind}/${blinds.bigBlind} · ${anteLabel(level.ante)}`);
  };
  const addLevel=()=>setLevels(current=>{
    const last=current.at(-1)??DEFAULT_LEVELS[0];
    return [...current,{...last,id:Math.max(0,...current.map(level=>level.id))+1,ante:{...last.ante}}];
  });
  const removeLevel=(id:number)=>{setLevels(current=>current.filter(level=>level.id!==id));if(selectedLevelId===id)setSelectedLevelId(null);};
  const anteLabel=(ante:AnteConfig)=>ante.mode==="big-blind"?`BB ANTE ${ante.amount.toLocaleString()}`:ante.mode==="all-players"?`ANTE ${ante.amount.toLocaleString()}`:"NO ANTE";
  const startFreshHand=(advance:boolean)=>{
    const button=advance?nextButton%state.players.length+1:nextButton;
    const next=resetHand(state,nextAnte,nextBlinds,button,advance);
    setState(next);
    setNextButton(next.button);
    setButtonSeatInput(next.button);
    setNextBlinds({smallBlind:next.smallBlind,bigBlind:next.bigBlind});
    shortcutAmountActive.current=false;shortcutAmountBuffer.current="";setShortcutAmountEditing(false);setShortcutAmountDraft("");setAmount(String(next.bigBlind*3));
    setHistory([]);
    setNotice(`${advance?"New hand":"Reset"} · BTN Seat ${next.button} · ${next.smallBlind}/${next.bigBlind} · ${anteLabel(next.ante)}`);
  };
  const cardSelect=(value:string,onChange:(value:string)=>void,label:string)=><NativeSelect size="sm" aria-label={label} value={value} onChange={event=>onChange(event.target.value)}><NativeSelectOption value="">—</NativeSelectOption>{deck.map(card=><NativeSelectOption value={card} key={card}>{card}</NativeSelectOption>)}</NativeSelect>;
  const renderPlayerContent=(player:HandState["players"][number],showShortcutAmount=false)=><>
    <div className="seat-top"><span>{positionName(player.seat)}</span></div>
    <div className="seat-name">{player.name}</div>
    <div className="seat-stack">{player.stack.toLocaleString()}</div>
    <div className="last-action">{lastAction(player.seat)||"Active"}</div>
    <div className="player-hand"><div className="hole-cards">{player.cards?player.cards.map((card,index)=>renderCardFace(card,"-",index)):[0,1].map(index=>renderCardFace("","-",index))}</div><div className="seat-metrics"><span>EQ <b>{equity?.percentages[player.seat]!==undefined?`${equity.percentages[player.seat].toFixed(1)}%`:"—"}</b></span></div></div>
    {player.streetBet>0&&<span className="bet-chip">{player.streetBet.toLocaleString()}</span>}
    {showShortcutAmount&&<span className={`pending-bet-chip${player.streetBet>0?" has-current-bet":""}`}>INPUT {shortcutAmountDraft||"—"}</span>}
  </>;
  const renderBoard=()=> <div className="community-board">
    <div className="card-group"><span>FLOP</span><div>{[0,1,2].map(index=>renderCardFace(state.board[index]??"","—",index))}</div></div>
    <div className="card-group"><span>TURN</span><div>{renderCardFace(state.board[3]??"","—")}</div></div>
    <div className="card-group"><span>RIVER</span><div>{renderCardFace(state.board[4]??"","—")}</div></div>
  </div>;
  const renderGamePanel=(draggable=false)=> <section className={`game-panel${draggable?" editor-draggable":""}`} style={gamePanelPosition} onPointerDown={draggable?event=>dragItem("game",event):undefined}>
    <div className="game-panel-top"><span className="top-pot-stat"><small>POT</small><strong>{state.pot.toLocaleString()}</strong></span><b>{state.street.toUpperCase()}</b></div>
    {renderBoard()}
    <div className="game-panel-bottom"><span className="game-stat hand-stat"><small>HAND</small><strong>{state.handNumber}</strong></span><span className="game-stat blind-stat"><small>BLINDS</small><strong>{state.smallBlind} / {state.bigBlind}</strong></span><span className="game-stat ante-stat"><small>{state.ante.mode==="big-blind"?"BB ANTE":"ANTE"}</small><strong>{state.ante.mode==="none"?"—":state.ante.amount.toLocaleString()}</strong></span></div>
  </section>;
  const exportJson=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`hand-${state.handNumber}.json`;link.click();URL.revokeObjectURL(url);};
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
      <div className="hand-meta"><span>HAND {state.handNumber}</span><b>{state.smallBlind} / {state.bigBlind} · {anteLabel(state.ante)}</b><Badge className="street-badge">{state.street.toUpperCase()}</Badge></div>
      <div className="system-state"><Button variant="outline" size="sm" onClick={()=>window.open("?view=overlay&key=00ff00","poker-overlay")}><ExternalLink size={15}/> OBS Overlay</Button><span className="live-dot"/> LOCAL <Radio size={17}/></div>
    </header>
    <section className="workspace">
      <div className="layout-panel">
        <Tabs defaultValue="layout" className="layout-tabs">
          <TabsList className="layout-tabs-list"><TabsTrigger value="layout">OBSレイアウト</TabsTrigger><TabsTrigger value="players">プレイヤー設定</TabsTrigger><TabsTrigger value="levels">レベルストラクチャ</TabsTrigger></TabsList>
          <TabsContent value="layout">
            <div className="layout-heading"><div><span className="eyebrow">OBS LAYOUT</span><h1>Overlay placement</h1><p>Seat panels can be dragged. The dashed rectangle marks the capture area.</p></div><Button variant="outline" onClick={()=>setLayout(DEFAULT_LAYOUT)}>Reset layout</Button></div>
            <div className="layout-editor" ref={stageRef}>
              <div className="editor-canvas" style={{transform:`scale(${editorScale})`}}>
                <div className="capture-area" style={{left:`${layout.area.x}%`,top:`${layout.area.y}%`,width:`${layout.area.width}%`,height:`${layout.area.height}%`}}><span>OBS CAPTURE AREA</span></div>
                {renderGamePanel(true)}
                {state.players.map(player=><article key={player.seat} onPointerDown={event=>dragItem(player.seat,event)} style={seatPosition(player.seat)} className={`overlay-seat editor-draggable ${playerStatus(player)}`}>
                  {renderPlayerContent(player,shortcutAmountEditing&&player.seat===actor?.seat)}
                </article>)}
              </div>
            </div>
            <section className="area-controls"><span className="eyebrow">CAPTURE AREA (%)</span>{(["x","y","width","height"] as const).map(key=><label key={key}>{key.toUpperCase()}<Input type="number" min="0" max="100" value={Math.round(layout.area[key])} onChange={event=>setArea(key,Number(event.target.value))}/></label>)}</section>
            <section className="equity-note">{equity?<><b>{equity.mode==="exact"?"EXACT":"MONTE CARLO"}</b><span>{equity.samples.toLocaleString()} runouts · known hands only</span></>:<span>Equity requires at least two known active hands.</span>}</section>
          </TabsContent>
          <TabsContent value="players" className="player-settings">
            <div className="layout-heading"><div><span className="eyebrow">PLAYER SETTINGS</span><h1>プレイヤー設定</h1><p>名前と現在のスタックを編集します。変更はOBS表示へ即時反映されます。</p></div></div>
            <section className="table-settings">
              <div><span className="eyebrow">NEXT HAND</span><b>テーブル設定</b><small>次に「NewHand」または「Reset」を押したときに適用されます。</small></div>
              <label>SB<Input type="number" min="1" step="50" value={nextBlinds.smallBlind} onChange={event=>{setSelectedLevelId(null);setNextBlinds(current=>({...current,smallBlind:Math.max(1,Number(event.target.value)||1)}));}}/></label>
              <label>BB<Input type="number" min="1" step="50" value={nextBlinds.bigBlind} onChange={event=>{setSelectedLevelId(null);setNextBlinds(current=>({...current,bigBlind:Math.max(1,Number(event.target.value)||1)}));}}/></label>
              <label>方式<NativeSelect value={nextAnte.mode} onChange={event=>{setSelectedLevelId(null);setNextAnte(current=>({...current,mode:event.target.value as AnteConfig["mode"]}));}}><NativeSelectOption value="none">Anteなし</NativeSelectOption><NativeSelectOption value="big-blind">BB Ante</NativeSelectOption><NativeSelectOption value="all-players">全員Ante</NativeSelectOption></NativeSelect></label>
              <label>金額<Input type="number" min="0" step="100" disabled={nextAnte.mode==="none"} value={nextAnte.amount} onChange={event=>{setSelectedLevelId(null);setNextAnte(current=>({...current,amount:Math.max(0,Number(event.target.value)||0)}));}}/></label>
              <label>BB不足時<NativeSelect disabled={nextAnte.mode!=="big-blind"} value={nextAnte.priority} onChange={event=>{setSelectedLevelId(null);setNextAnte(current=>({...current,priority:event.target.value as AnteConfig["priority"]}));}}><NativeSelectOption value="blind">BB優先</NativeSelectOption><NativeSelectOption value="ante">Ante優先</NativeSelectOption></NativeSelect></label>
            </section>
            <div className="player-settings-grid">{state.players.map(player=><section key={player.seat} className="player-setting-card">
              <div><span>SEAT {player.seat}</span><b>{positionName(player.seat)}</b></div>
              <label>NAME<Input value={player.name} maxLength={24} onChange={event=>setPlayerProfile(player.seat,{name:event.target.value})}/></label>
              <label>STACK<Input type="number" min="0" step="100" value={player.stack} onChange={event=>setPlayerProfile(player.seat,{stack:Math.max(0,Number(event.target.value)||0)})}/></label>
            </section>)}</div>
          </TabsContent>
          <TabsContent value="levels" className="level-structure">
            <div className="layout-heading"><div><span className="eyebrow">BLIND LEVELS</span><h1>レベルストラクチャ</h1><p>各レベルを編集し、「選択」で次ハンドのブラインドとAnteへ反映します。</p></div><Button variant="outline" onClick={addLevel}><Plus size={16}/> レベル追加</Button></div>
            <div className="level-list">
              <div className="level-list-head"><span>LEVEL</span><span>SB</span><span>BB</span><span>ANTE方式</span><span>ANTE額</span><span>BB不足時</span><span>操作</span></div>
              {levels.map((level,index)=><section key={level.id} className={`level-row${selectedLevelId===level.id?" is-selected":""}`}>
                <b>LEVEL {index+1}</b>
                <Input aria-label={`Level ${index+1} SB`} type="number" min="1" step="50" value={level.smallBlind} onChange={event=>updateLevel(level.id,{smallBlind:Math.max(1,Number(event.target.value)||1)})}/>
                <Input aria-label={`Level ${index+1} BB`} type="number" min="1" step="50" value={level.bigBlind} onChange={event=>updateLevel(level.id,{bigBlind:Math.max(1,Number(event.target.value)||1)})}/>
                <NativeSelect aria-label={`Level ${index+1} Ante mode`} value={level.ante.mode} onChange={event=>updateLevel(level.id,{ante:{...level.ante,mode:event.target.value as AnteConfig["mode"]}})}><NativeSelectOption value="none">なし</NativeSelectOption><NativeSelectOption value="big-blind">BB Ante</NativeSelectOption><NativeSelectOption value="all-players">全員Ante</NativeSelectOption></NativeSelect>
                <Input aria-label={`Level ${index+1} Ante`} type="number" min="0" step="100" disabled={level.ante.mode==="none"} value={level.ante.amount} onChange={event=>updateLevel(level.id,{ante:{...level.ante,amount:Math.max(0,Number(event.target.value)||0)}})}/>
                <NativeSelect aria-label={`Level ${index+1} BB Ante priority`} disabled={level.ante.mode!=="big-blind"} value={level.ante.priority} onChange={event=>updateLevel(level.id,{ante:{...level.ante,priority:event.target.value as AnteConfig["priority"]}})}><NativeSelectOption value="blind">BB優先</NativeSelectOption><NativeSelectOption value="ante">Ante優先</NativeSelectOption></NativeSelect>
                <div><Button size="sm" onClick={()=>applyLevel(level)}>{selectedLevelId===level.id?"選択中":"選択"}</Button><Button size="icon-sm" variant="ghost" disabled={levels.length===1} aria-label={`Level ${index+1}を削除`} onClick={()=>removeLevel(level.id)}><Trash2 size={15}/></Button></div>
              </section>)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <aside className="control-panel">
        <div className="input-health">
          <div><ScanLine size={18}/><span>RFID gateway<small>Adapter ready</small></span><b>MOCK</b></div>
          <div><Mic size={18}/><span>Voice input<small>Command port ready</small></span><b>OFF</b></div>
        </div>
        <section className="button-control">
          <div><span className="eyebrow">HAND BUTTON</span><b>Seat {nextButton}</b></div>
          <NativeSelect aria-label="Dealer button seat" value={String(buttonSeatInput)} onChange={event=>setButtonSeatInput(Number(event.target.value))}>{state.players.map(player=><NativeSelectOption value={String(player.seat)} key={player.seat}>Seat {player.seat} · {player.name}</NativeSelectOption>)}</NativeSelect>
          <Button variant="outline" onClick={()=>{setNextButton(buttonSeatInput);setNotice(`Dealer button set to Seat ${buttonSeatInput}`);}}>Set BTN</Button>
        </section>
        <section className="actor-card"><span className="eyebrow">CURRENT ACTION</span><h2>{actor?`Seat ${actor.seat} · ${actor.name}`:"Betting complete"}</h2><div className="actor-numbers"><span>TO CALL <b>{callAmount}</b></span><span>STACK <b>{actor?.stack.toLocaleString()??"—"}</b></span></div></section>
        <section className="actions">
          <div className="action-row">
            <Button disabled={!actor} variant="outline" onClick={()=>actor&&dispatch({type:"FOLD",seat:actor.seat})}>Fold</Button>
            <Button disabled={!actor||callAmount>0} variant="outline" onClick={()=>actor&&dispatch({type:"CHECK",seat:actor.seat})}>Check</Button>
            <Button disabled={!actor||callAmount===0} onClick={()=>actor&&dispatch({type:"CALL",seat:actor.seat})}>Call {callAmount||""}</Button>
          </div>
          <label>BET / RAISE TO</label>
          <div className="amount-row"><Input data-bet-amount="true" inputMode="numeric" value={amount} onChange={event=>{shortcutAmountActive.current=false;shortcutAmountBuffer.current="";setShortcutAmountEditing(false);setShortcutAmountDraft("");setAmount(event.target.value);}} onKeyDown={event=>{if(event.code==="Enter"||event.code==="NumpadEnter"){event.preventDefault();submitBetOrRaise();}}} aria-label="Bet or raise total"/><Button disabled={!actor} onClick={()=>submitBetOrRaise()}>{state.currentBet===0?"Bet":"Raise"}</Button></div>
          <Button className="allin" disabled={!actor} variant="outline" onClick={()=>actor&&dispatch({type:"ALL_IN",seat:actor.seat})}>All-in</Button>
        </section>
        <section className="card-editor">
          <div className="section-title"><span>COMMUNITY CARDS</span></div>
          <div className="board-editor">{["F1","F2","F3","T","R"].map((label,index)=><label key={label}><span>{label}</span>{cardSelect(state.board[index]??"",value=>setBoardCard(index,value),label)}</label>)}</div>
          <div className="section-title"><span>HOLE CARDS</span></div>
          <div className="hole-editor">{state.players.map(player=><div key={player.seat}><b>S{player.seat}</b>{cardSelect(player.cards?.[0]??"",value=>setHoleCard(player.seat,0,value),`Seat ${player.seat} card 1`)}{cardSelect(player.cards?.[1]??"",value=>setHoleCard(player.seat,1,value),`Seat ${player.seat} card 2`)}</div>)}</div>
        </section>
        <div className="notice" aria-live="polite">{notice}</div>
        <footer className="panel-footer">
          <Button variant="ghost" disabled={!history.length} onClick={undoLastAction}><RotateCcw size={16}/> Undo</Button>
          <Button variant="ghost" onClick={()=>startFreshHand(true)}>NewHand</Button>
          <Button variant="ghost" onClick={()=>startFreshHand(false)}>Reset</Button>
          <Button variant="ghost" onClick={exportJson}><Download size={16}/> JSON</Button>
        </footer>
        <section className="history-panel"><div className="section-title"><span><History size={17}/> ACTION LOG</span><b>{state.events.length}</b></div><ol>{[...state.events].reverse().slice(0,7).map(event=><li key={event.id}><span>{event.street}</span><p>{event.label}</p></li>)}</ol></section>
      </aside>
    </section>
  </main>;
}
