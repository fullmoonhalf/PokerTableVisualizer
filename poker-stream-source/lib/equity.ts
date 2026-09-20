import type { Player } from "./poker-core";

const ranks="23456789TJQKA";
const suits=["♠","♥","♦","♣"];
export const deck=suits.flatMap(suit=>[...ranks].map(rank=>rank+suit));

type Score=[number,...number[]];
const compare=(a:Score,b:Score)=>{for(let i=0;i<Math.max(a.length,b.length);i+=1){const diff=(a[i]??0)-(b[i]??0);if(diff)return diff;}return 0;};

const evaluateFive=(cards:string[]):Score=>{
  const values=cards.map(card=>ranks.indexOf(card[0])+2).sort((a,b)=>b-a);
  const counts=new Map<number,number>();values.forEach(value=>counts.set(value,(counts.get(value)??0)+1));
  const groups=[...counts.entries()].sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
  const flush=cards.every(card=>card.slice(1)===cards[0].slice(1));
  const unique=[...new Set(values)];
  if(unique[0]===14)unique.push(1);
  let straight=0;
  for(let i=0;i<=unique.length-5;i+=1)if(unique[i]-unique[i+4]===4){straight=unique[i];break;}
  if(flush&&straight)return[8,straight];
  if(groups[0][1]===4)return[7,groups[0][0],groups[1][0]];
  if(groups[0][1]===3&&groups[1]?.[1]>=2)return[6,groups[0][0],groups[1][0]];
  if(flush)return[5,...values];
  if(straight)return[4,straight];
  if(groups[0][1]===3)return[3,groups[0][0],...groups.slice(1).map(group=>group[0]).sort((a,b)=>b-a)];
  if(groups[0][1]===2&&groups[1]?.[1]===2){const pairs=[groups[0][0],groups[1][0]].sort((a,b)=>b-a);return[2,...pairs,groups.find(group=>group[1]===1)?.[0]??0];}
  if(groups[0][1]===2)return[1,groups[0][0],...groups.slice(1).map(group=>group[0]).sort((a,b)=>b-a)];
  return[0,...values];
};

const bestScore=(cards:string[]):Score=>{
  let best:Score=[-1];
  for(let a=0;a<cards.length-4;a+=1)for(let b=a+1;b<cards.length-3;b+=1)for(let c=b+1;c<cards.length-2;c+=1)for(let d=c+1;d<cards.length-1;d+=1)for(let e=d+1;e<cards.length;e+=1){
    const score=evaluateFive([cards[a],cards[b],cards[c],cards[d],cards[e]]);
    if(compare(score,best)>0)best=score;
  }
  return best;
};

const combinations=(items:string[],choose:number):string[][]=>{
  if(choose===0)return[[]];
  const result:string[][]=[];
  const visit=(start:number,picked:string[])=>{
    if(picked.length===choose){result.push(picked);return;}
    for(let i=start;i<=items.length-(choose-picked.length);i+=1)visit(i+1,[...picked,items[i]]);
  };
  visit(0,[]);return result;
};

const randomRunout=(items:string[],count:number)=>{
  const copy=[...items];
  for(let i=copy.length-1;i>0;i-=1){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy.slice(0,count);
};

export type EquityResult={percentages:Record<number,number>;mode:"monte-carlo"|"exact";samples:number};

export function calculateEquity(players:Player[],board:string[],trials=5000):EquityResult|null{
  const contenders=players.filter(player=>!player.folded&&player.cards?.every(Boolean));
  if(contenders.length<2)return null;
  const knownBoard=board.filter(Boolean);
  const dead=new Set([...knownBoard,...contenders.flatMap(player=>player.cards??[])]);
  if(dead.size!==knownBoard.length+contenders.length*2)return null;
  const remaining=deck.filter(card=>!dead.has(card));
  const missing=Math.max(0,5-knownBoard.length);
  const exact=knownBoard.length>=3;
  const runouts=exact?combinations(remaining,missing):Array.from({length:trials},()=>randomRunout(remaining,missing));
  const shares:Record<number,number>=Object.fromEntries(contenders.map(player=>[player.seat,0]));
  runouts.forEach(runout=>{
    const finalBoard=[...knownBoard,...runout];
    const scores=contenders.map(player=>({seat:player.seat,score:bestScore([...(player.cards??[]),...finalBoard])}));
    const best=scores.reduce((winner,item)=>compare(item.score,winner.score)>0?item:winner,scores[0]).score;
    const winners=scores.filter(item=>compare(item.score,best)===0);
    winners.forEach(winner=>{shares[winner.seat]+=1/winners.length;});
  });
  const samples=runouts.length;
  return{percentages:Object.fromEntries(Object.entries(shares).map(([seat,value])=>[seat,(value/samples)*100])),mode:exact?"exact":"monte-carlo",samples};
}
