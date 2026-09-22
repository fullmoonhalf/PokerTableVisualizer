export type Street = "preflop" | "flop" | "turn" | "river" | "showdown" | "finished";
export type AnteMode = "none" | "big-blind" | "all-players";
export type BigBlindAntePriority = "blind" | "ante";
export type AnteConfig = { mode:AnteMode; amount:number; priority:BigBlindAntePriority };
export type BlindConfig = { smallBlind:number; bigBlind:number; chipUnit:number };
export type PlayerStats = { hands:number; vpipHands:number; pfrHands:number; threeBetOpportunities:number; threeBets:number; flopCBetOpportunities:number; flopCBets:number; foldToFlopCBetOpportunities:number; foldsToFlopCBet:number; sawFlop:number; wentToShowdown:number; showdownWins:number };
export type Player = { seat:number; name:string; stack:number; streetBet:number; totalInvested:number; folded:boolean; allIn:boolean; acted:boolean; sittingOut:boolean; cards:[string,string] | null; stats:PlayerStats };
export type PokerEvent = { id:number; type:string; seat?:number; amount?:number; street:Street; label:string };
export type HandState = { handNumber:number; street:Street; button:number; smallBlind:number; bigBlind:number; chipUnit:number; ante:AnteConfig; currentBet:number; minRaise:number; actorSeat:number|null; pot:number; players:Player[]; board:string[]; events:PokerEvent[]; handStartStacks:Record<number,number>; vpipSeats:number[]; pfrSeats:number[]; threeBetOpportunitySeats:number[]; preflopRaiseCount:number; preflopAggressorSeat:number|null; flopCBetSeat:number|null; flopCBetResponses:number[] };
export type PokerCommand =
  | { type:"FOLD"|"CHECK"|"CALL"|"ALL_IN"; seat:number }
  | { type:"BET_TO"|"RAISE_TO"; seat:number; amount:number };

const roster = [
  [1,"Mina",20000],[2,"Kai",18200],[3,"Sora",23500],
  [4,"Ren",16400],[5,"Aoi",21000],[6,"Yui",19800],
  [7,"Haru",22400],[8,"Nagi",17600],[9,"Riku",20800],
] as const;
export const DEFAULT_ANTE:AnteConfig={mode:"big-blind",amount:200,priority:"ante"};
export const DEFAULT_BLINDS:BlindConfig={smallBlind:100,bigBlind:200,chipUnit:100};
export const EMPTY_PLAYER_STATS:PlayerStats={hands:0,vpipHands:0,pfrHands:0,threeBetOpportunities:0,threeBets:0,flopCBetOpportunities:0,flopCBets:0,foldToFlopCBetOpportunities:0,foldsToFlopCBet:0,sawFlop:0,wentToShowdown:0,showdownWins:0};
type ForcedBet = { seat:number; amount:number; kind:"small-blind"|"big-blind"|"ante"; countsTowardStreetBet:boolean };
const canAct = (p:Player) => !p.sittingOut && !p.folded && !p.allIn;
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
const addStat=(players:Player[],seat:number,key:keyof PlayerStats)=>players.map(player=>player.seat===seat?{...player,stats:{...player.stats,[key]:player.stats[key]+1}}:player);
const commit=(p:Player,chips:number):Player=>{
  const paid=Math.max(0,Math.min(chips,p.stack));
  const stack=p.stack-paid;
  return {...p,stack,streetBet:p.streetBet+paid,totalInvested:p.totalInvested+paid,allIn:stack===0};
};
const forcedBets=(activeSeats:number[],button:number,smallBlind:number,bigBlind:number,ante:AnteConfig):ForcedBet[]=>{
  if(activeSeats.length<2)return [];
  const buttonIndex=activeSeats.indexOf(button);
  const seatAfter=(_:number,offset:number)=>activeSeats[(buttonIndex+offset)%activeSeats.length];
  const smallBlindSeat=seatAfter(button,1);
  const bigBlindSeat=seatAfter(button,2);
  const smallBlindPost:ForcedBet={seat:smallBlindSeat,amount:smallBlind,kind:"small-blind",countsTowardStreetBet:true};
  const bigBlindPost:ForcedBet={seat:bigBlindSeat,amount:bigBlind,kind:"big-blind",countsTowardStreetBet:true};
  if(ante.mode==="big-blind"){
    const antePost:ForcedBet={seat:bigBlindSeat,amount:ante.amount,kind:"ante",countsTowardStreetBet:false};
    return ante.priority==="blind"?[smallBlindPost,bigBlindPost,antePost]:[antePost,smallBlindPost,bigBlindPost];
  }
  const antes:ForcedBet[]=ante.mode==="all-players"
    ?activeSeats.map(seat=>({seat,amount:ante.amount,kind:"ante" as const,countsTowardStreetBet:false}))
    :[];
  return [...antes,smallBlindPost,bigBlindPost];
};
const postForcedBet=(player:Player,bet:ForcedBet):Player=>{
  const paid=Math.max(0,Math.min(bet.amount,player.stack));
  const stack=player.stack-paid;
  return {...player,stack,streetBet:player.streetBet+(bet.countsTowardStreetBet?paid:0),totalInvested:player.totalInvested+paid,allIn:stack===0};
};

const startHand=(basePlayers:Player[],handNumber:number,ante:AnteConfig,blinds:BlindConfig,dealerButton:number,countHand=true):HandState=>{
  const normalizedAnte:AnteConfig={mode:ante.mode,amount:Math.max(0,Math.floor(ante.amount)),priority:ante.priority??"ante"};
  const smallBlind=Math.max(1,Math.floor(blinds.smallBlind));
  const bigBlind=Math.max(smallBlind,Math.floor(blinds.bigBlind));
  const chipUnit=Math.max(1,Math.floor(blinds.chipUnit));
  const requestedButton=Math.max(1,Math.min(basePlayers.length,Math.floor(dealerButton)));
  const activeSeats=basePlayers.filter(player=>!player.sittingOut).map(player=>player.seat).sort((a,b)=>a-b);
  const button=activeSeats.find(seat=>seat>=requestedButton)??activeSeats[0]??requestedButton;
  const posts=forcedBets(activeSeats,button,smallBlind,bigBlind,normalizedAnte);
  const handStartStacks=Object.fromEntries(basePlayers.map(player=>[player.seat,player.stack]));
  let players=basePlayers.map(player=>({...player,stats:{...EMPTY_PLAYER_STATS,...player.stats,hands:player.stats.hands+(countHand&&!player.sittingOut?1:0)}}));
  const appliedPosts:ForcedBet[]=[];
  for(const post of posts){
    const player=players.find(item=>item.seat===post.seat);
    const applied={...post,amount:Math.min(post.amount,player?.stack??0)};
    players=players.map(item=>item.seat===post.seat?postForcedBet(item,applied):item);
    appliedPosts.push(applied);
  }
  const pot=players.reduce((total,player)=>total+player.totalInvested,0);
  let state:HandState={
    handNumber,street:activeSeats.length>=2?"preflop":"finished",button,
    smallBlind,bigBlind,chipUnit,ante:normalizedAnte,currentBet:bigBlind,minRaise:bigBlind,actorSeat:null,pot,board:[],players,handStartStacks,
    events:[],vpipSeats:[],pfrSeats:[],threeBetOpportunitySeats:[],preflopRaiseCount:0,preflopAggressorSeat:null,flopCBetSeat:null,flopCBetResponses:[]
  };
  const bigBlindSeat=posts.find(post=>post.kind==="big-blind")?.seat;
  state={...state,actorSeat:bigBlindSeat===undefined?null:nextSeat(state,bigBlindSeat)};
  state=record(state,{type:"HAND_STARTED",label:`Hand started · BTN Seat ${button}`});
  for(const post of appliedPosts){
    const player=state.players.find(item=>item.seat===post.seat);
    const label=post.kind==="ante"?(normalizedAnte.mode==="big-blind"?"BB Ante":"Ante"):post.kind==="small-blind"?"SB":"BB";
    state=record(state,{type:post.kind==="ante"?"ANTE_POSTED":"BLIND_POSTED",seat:post.seat,amount:post.amount,label:`${player?.name??`Seat ${post.seat}`} posts ${label} ${post.amount}`});
  }
  return state;
};

export function createDemoHand(ante:AnteConfig=DEFAULT_ANTE,blinds:BlindConfig=DEFAULT_BLINDS,dealerButton=1):HandState{
  const players:Player[]=roster.map(([seat,name,stack])=>({seat,name,stack,streetBet:0,totalInvested:0,folded:false,allIn:false,acted:false,sittingOut:false,cards:seat===1?["A♠","K♠"]:seat===2?["Q♥","Q♦"]:null,stats:{...EMPTY_PLAYER_STATS}}));
  return startHand(players,1,ante,blinds,dealerButton);
}

export function resetHand(previous:HandState,ante:AnteConfig,blinds:BlindConfig,dealerButton:number,advanceHandNumber=false):HandState{
  const handNumber=advanceHandNumber?previous.handNumber+1:previous.handNumber;
  const openingStacks=previous.handStartStacks??Object.fromEntries(previous.players.map(player=>[player.seat,player.stack+player.totalInvested]));
  const players=previous.players.map(player=>{
    const stack=advanceHandNumber?player.stack:openingStacks[player.seat]??player.stack+player.totalInvested;
    return {...player,stack,streetBet:0,totalInvested:0,folded:player.sittingOut,allIn:stack===0,acted:player.sittingOut,cards:null};
  });
  return startHand(players,handNumber,ante,blinds,dealerButton,advanceHandNumber);
}

const settle=(state:HandState,actingSeat:number):HandState=>{
  const contenders=state.players.filter(p=>!p.folded);
  if(contenders.length===1) return record({...state,street:"finished",actorSeat:null},{type:"WINNER_REQUIRED",seat:contenders[0].seat,label:`Betting complete · select the winner`});
  const active=contenders.filter(p=>!p.allIn);
  const complete=active.every(p=>p.acted&&p.streetBet===state.currentBet);
  if(!complete) return {...state,actorSeat:nextSeat(state,actingSeat)};
  if(state.street==="river"||active.length===0){
    let players=state.players;
    if(state.street==="preflop")for(const player of players.filter(item=>!item.folded&&!item.sittingOut))players=addStat(players,player.seat,"sawFlop");
    for(const player of players.filter(item=>!item.folded&&!item.sittingOut))players=addStat(players,player.seat,"wentToShowdown");
    return record({...state,players,street:"showdown",actorSeat:null},{type:"SHOWDOWN_REACHED",label:"Showdown ready"});
  }
  const order:Street[]=["preflop","flop","turn","river"];
  const street=order[order.indexOf(state.street)+1];
  let players=state.players.map(p=>({...p,streetBet:0,acted:false}));
  if(street==="flop")for(const player of players.filter(item=>!item.folded&&!item.sittingOut))players=addStat(players,player.seat,"sawFlop");
  let advanced:HandState={...state,street,currentBet:0,minRaise:state.bigBlind,actorSeat:null,players};
  advanced={...advanced,actorSeat:nextSeat(advanced,advanced.button)};
  return record(advanced,{type:"STREET_ADVANCED",label:`${street.toUpperCase()} begins`});
};

export function setSeatOut(state:HandState,seat:number,sittingOut:boolean):HandState{
  const player=state.players.find(item=>item.seat===seat);
  if(!player) throw new Error("対象のSeatが見つかりません");
  if(player.sittingOut===sittingOut) return state;
  const players=state.players.map(item=>item.seat===seat
    ?{...item,sittingOut,folded:sittingOut?true:item.folded,acted:sittingOut?true:item.acted,cards:sittingOut?null:item.cards}
    :item);
  let next=record({...state,players},{type:sittingOut?"SEAT_OUT":"SEAT_IN",seat,label:`${player.name} · ${sittingOut?"Seat Out":"Seat In (next hand)"}`});
  if(!sittingOut)return next;
  const contenders=next.players.filter(item=>!item.folded&&!item.sittingOut);
  if(contenders.length===1)return record({...next,street:"finished",actorSeat:null},{type:"WINNER_REQUIRED",seat:contenders[0].seat,label:"Betting complete · select the winner"});
  if(state.actorSeat===seat)next=settle(next,seat);
  return next;
}

export function awardPot(state:HandState,seats:number[]):HandState{
  if(state.pot<=0) throw new Error("配分できるPotがありません");
  const uniqueSeats=[...new Set(seats)];
  if(!uniqueSeats.length) throw new Error("勝者を1人以上選択してください");
  const winners=uniqueSeats.map(seat=>state.players.find(player=>player.seat===seat));
  if(winners.some(winner=>!winner)) throw new Error("勝者の席が見つかりません");
  if(winners.some(winner=>winner?.folded||winner?.sittingOut)) throw new Error("フォールド済み／Seat Outのプレイヤーは選べません");
  const amount=state.pot;
  const chipUnit=Math.max(1,state.chipUnit);
  if(amount%chipUnit!==0) throw new Error(`Potは最低チップ ${chipUnit} で割り切れません`);
  const baseUnits=Math.floor(amount/chipUnit/uniqueSeats.length);
  let oddUnits=amount/chipUnit-baseUnits*uniqueSeats.length;
  const orderedSeats=[...uniqueSeats].sort((a,b)=>{
    const distance=(seat:number)=>((seat-state.button+state.players.length)%state.players.length)||state.players.length;
    return distance(a)-distance(b);
  });
  const payouts=Object.fromEntries(uniqueSeats.map(seat=>[seat,baseUnits*chipUnit])) as Record<number,number>;
  for(const seat of orderedSeats){if(oddUnits<=0)break;payouts[seat]+=chipUnit;oddUnits-=1;}
  const reachedShowdown=state.street==="showdown"||state.events.some(event=>event.type==="SHOWDOWN_REACHED");
  let players=state.players.map(player=>payouts[player.seat]?{...player,stack:player.stack+payouts[player.seat]}:player);
  if(reachedShowdown)for(const seat of uniqueSeats)players=addStat(players,seat,"showdownWins");
  const names=winners.map(winner=>winner?.name).join(" / ");
  const label=uniqueSeats.length===1?`${names} wins ${amount}`:`${names} chop ${amount}`;
  return record({...state,players,pot:0,street:"finished",actorSeat:null},{type:"POT_AWARDED",amount,label});
}

export function executeCommand(state:HandState,command:PokerCommand):HandState{
  if(state.actorSeat!==command.seat) throw new Error("現在のアクターではありません");
  const actor=state.players.find(p=>p.seat===command.seat);
  if(!actor||!canAct(actor)) throw new Error("このプレイヤーはアクションできません");
  let players=state.players,currentBet=state.currentBet,minRaise=state.minRaise,amount=0,label="";
  let vpipSeats=state.vpipSeats,pfrSeats=state.pfrSeats,threeBetOpportunitySeats=state.threeBetOpportunitySeats;
  let preflopRaiseCount=state.preflopRaiseCount,preflopAggressorSeat=state.preflopAggressorSeat,flopCBetSeat=state.flopCBetSeat,flopCBetResponses=state.flopCBetResponses;
  const facedThreeBetOpportunity=state.street==="preflop"&&state.preflopRaiseCount===1&&!threeBetOpportunitySeats.includes(actor.seat);
  if(facedThreeBetOpportunity){players=addStat(players,actor.seat,"threeBetOpportunities");threeBetOpportunitySeats=[...threeBetOpportunitySeats,actor.seat];}
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
    if(target%state.chipUnit!==0)throw new Error(`ベット額は最低チップ ${state.chipUnit} 単位です`);
    if(target<=actor.streetBet||target-actor.streetBet>actor.stack)throw new Error("スタックを超えています");
    amount=target-actor.streetBet;minRaise=currentBet===0?target:target-currentBet;currentBet=target;
    players=players.map(p=>p.seat===actor.seat?{...commit(p,amount),acted:true}:canAct(p)?{...p,acted:false}:p);
    label=`${actor.name} ${command.type==="BET_TO"?"bets":"raises to"} ${target}`;
  }
  const aggressive=command.type==="BET_TO"||command.type==="RAISE_TO"||(command.type==="ALL_IN"&&currentBet>state.currentBet);
  const voluntary=amount>0&&["CALL","BET_TO","RAISE_TO","ALL_IN"].includes(command.type);
  if(state.street==="preflop"&&voluntary&&!vpipSeats.includes(actor.seat)){players=addStat(players,actor.seat,"vpipHands");vpipSeats=[...vpipSeats,actor.seat];}
  if(state.street==="preflop"&&aggressive){
    if(!pfrSeats.includes(actor.seat)){players=addStat(players,actor.seat,"pfrHands");pfrSeats=[...pfrSeats,actor.seat];}
    if(state.preflopRaiseCount===1)players=addStat(players,actor.seat,"threeBets");
    preflopRaiseCount+=1;preflopAggressorSeat=actor.seat;
  }
  const hasFlopCBetOpportunity=state.street==="flop"&&state.currentBet===0&&state.preflopAggressorSeat===actor.seat;
  if(hasFlopCBetOpportunity){players=addStat(players,actor.seat,"flopCBetOpportunities");if(aggressive){players=addStat(players,actor.seat,"flopCBets");flopCBetSeat=actor.seat;}}
  const respondsToFlopCBet=state.street==="flop"&&state.flopCBetSeat!==null&&actor.seat!==state.flopCBetSeat&&state.currentBet>actor.streetBet&&!flopCBetResponses.includes(actor.seat);
  if(respondsToFlopCBet){players=addStat(players,actor.seat,"foldToFlopCBetOpportunities");if(command.type==="FOLD")players=addStat(players,actor.seat,"foldsToFlopCBet");flopCBetResponses=[...flopCBetResponses,actor.seat];}
  let next:HandState={...state,players,currentBet,minRaise,pot:state.pot+amount,vpipSeats,pfrSeats,threeBetOpportunitySeats,preflopRaiseCount,preflopAggressorSeat,flopCBetSeat,flopCBetResponses};
  next=record(next,{type:command.type,seat:actor.seat,amount:amount||undefined,label});
  return settle(next,actor.seat);
}
export const amountToCall=(state:HandState,seat:number)=>{
  const player=state.players.find(p=>p.seat===seat);
  return player?Math.max(0,Math.min(state.currentBet-player.streetBet,player.stack)):0;
};
