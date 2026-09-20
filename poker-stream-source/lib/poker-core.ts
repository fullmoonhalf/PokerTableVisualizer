export type Street = "preflop" | "flop" | "turn" | "river" | "showdown" | "finished";
export type Player = { seat:number; name:string; stack:number; streetBet:number; totalInvested:number; folded:boolean; allIn:boolean; acted:boolean; cards:[string,string] | null };
export type PokerEvent = { id:number; type:string; seat?:number; amount?:number; street:Street; label:string };
export type HandState = { handId:string; street:Street; button:number; smallBlind:number; bigBlind:number; currentBet:number; minRaise:number; actorSeat:number|null; pot:number; players:Player[]; board:string[]; events:PokerEvent[] };
export type PokerCommand =
  | { type:"FOLD"|"CHECK"|"CALL"|"ALL_IN"; seat:number }
  | { type:"BET_TO"|"RAISE_TO"; seat:number; amount:number };

const roster = [
  [1,"Mina",20000],[2,"Kai",18200],[3,"Sora",23500],
  [4,"Ren",16400],[5,"Aoi",21000],[6,"Yui",19800],
  [7,"Haru",22400],[8,"Nagi",17600],[9,"Riku",20800],
] as const;
const canAct = (p:Player) => !p.folded && !p.allIn;
const nextSeat = (state:HandState, from:number) => {
  const seats=[...state.players].sort((a,b)=>a.seat-b.seat);
  for(let offset=1;offset<=seats.length;offset+=1){
    const seat=((from-1+offset)%seats.length)+1;
    const player=seats.find(p=>p.seat===seat);
    if(player && canAct(player)) return seat;
  }
  return null;
};
const record=(state:HandState,event:Omit<PokerEvent,"id"|"street">):HandState=>({
  ...state,events:[...state.events,{...event,id:state.events.length+1,street:state.street}]
});
const commit=(p:Player,chips:number):Player=>{
  const paid=Math.max(0,Math.min(chips,p.stack));
  const stack=p.stack-paid;
  return {...p,stack,streetBet:p.streetBet+paid,totalInvested:p.totalInvested+paid,allIn:stack===0};
};

export function createDemoHand():HandState{
  let state:HandState={
    handId:`LIVE-${new Date().toISOString().slice(0,10)}-001`,street:"preflop",button:1,
    smallBlind:100,bigBlind:200,currentBet:200,minRaise:200,actorSeat:4,pot:300,board:[],
    players:roster.map(([seat,name,stack])=>({seat,name,stack:stack-(seat===2?100:seat===3?200:0),streetBet:seat===2?100:seat===3?200:0,totalInvested:seat===2?100:seat===3?200:0,folded:false,allIn:false,acted:false,cards:seat===1?["A♠","K♠"]:seat===2?["Q♥","Q♦"]:null})),
    events:[]
  };
  state=record(state,{type:"HAND_STARTED",label:"Hand started · BTN Seat 1"});
  state=record(state,{type:"BLIND_POSTED",seat:2,amount:100,label:"Kai posts SB 100"});
  return record(state,{type:"BLIND_POSTED",seat:3,amount:200,label:"Sora posts BB 200"});
}

const settle=(state:HandState,actingSeat:number):HandState=>{
  const contenders=state.players.filter(p=>!p.folded);
  if(contenders.length===1) return record({...state,street:"finished",actorSeat:null},{type:"POT_AWARDED",seat:contenders[0].seat,amount:state.pot,label:`${contenders[0].name} wins ${state.pot}`});
  const active=contenders.filter(p=>!p.allIn);
  const complete=active.every(p=>p.acted&&p.streetBet===state.currentBet);
  if(!complete) return {...state,actorSeat:nextSeat(state,actingSeat)};
  if(state.street==="river"||active.length===0) return record({...state,street:"showdown",actorSeat:null},{type:"SHOWDOWN_REACHED",label:"Showdown ready"});
  const order:Street[]=["preflop","flop","turn","river"];
  const street=order[order.indexOf(state.street)+1];
  let advanced:HandState={...state,street,currentBet:0,minRaise:state.bigBlind,actorSeat:null,players:state.players.map(p=>({...p,streetBet:0,acted:false}))};
  advanced={...advanced,actorSeat:nextSeat(advanced,advanced.button)};
  return record(advanced,{type:"STREET_ADVANCED",label:`${street.toUpperCase()} begins`});
};

export function executeCommand(state:HandState,command:PokerCommand):HandState{
  if(state.actorSeat!==command.seat) throw new Error("現在のアクターではありません");
  const actor=state.players.find(p=>p.seat===command.seat);
  if(!actor||!canAct(actor)) throw new Error("このプレイヤーはアクションできません");
  let players=state.players,currentBet=state.currentBet,minRaise=state.minRaise,amount=0,label="";
  if(command.type==="FOLD"){players=players.map(p=>p.seat===actor.seat?{...p,folded:true,acted:true}:p);label=`${actor.name} folds`;}
  else if(command.type==="CHECK"){if(actor.streetBet!==currentBet)throw new Error("コールが必要です");players=players.map(p=>p.seat===actor.seat?{...p,acted:true}:p);label=`${actor.name} checks`;}
  else if(command.type==="CALL"){amount=Math.min(currentBet-actor.streetBet,actor.stack);if(amount<=0)throw new Error("コール額がありません");players=players.map(p=>p.seat===actor.seat?{...commit(p,amount),acted:true}:p);label=`${actor.name} calls ${amount}`;}
  else if(command.type==="ALL_IN"){
    amount=actor.stack;const target=actor.streetBet+amount;const raising=target>currentBet;
    if(raising){minRaise=Math.max(minRaise,target-currentBet);currentBet=target;}
    players=players.map(p=>p.seat===actor.seat?{...commit(p,amount),acted:true}:raising&&canAct(p)?{...p,acted:false}:p);
    label=`${actor.name} is all-in ${target}`;
  } else {
    const target=command.amount,minimum=currentBet===0?state.bigBlind:currentBet+minRaise;
    if(!Number.isFinite(target)||target<minimum)throw new Error(`最低額は ${minimum} です`);
    if(target<=actor.streetBet||target-actor.streetBet>actor.stack)throw new Error("スタックを超えています");
    amount=target-actor.streetBet;minRaise=currentBet===0?target:target-currentBet;currentBet=target;
    players=players.map(p=>p.seat===actor.seat?{...commit(p,amount),acted:true}:canAct(p)?{...p,acted:false}:p);
    label=`${actor.name} ${command.type==="BET_TO"?"bets":"raises to"} ${target}`;
  }
  let next:HandState={...state,players,currentBet,minRaise,pot:state.pot+amount};
  next=record(next,{type:command.type,seat:actor.seat,amount:amount||undefined,label});
  return settle(next,actor.seat);
}
export const amountToCall=(state:HandState,seat:number)=>{
  const player=state.players.find(p=>p.seat===seat);
  return player?Math.max(0,Math.min(state.currentBet-player.streetBet,player.stack)):0;
};
