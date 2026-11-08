export const DEALER_SLOT_COUNT=5;

export type DealerRawCardCandidate={slot:number;card:number;deck?:number;rssi?:number};

export const dealerSlotsForStreet=(street:string):number[]=>street==="flop"?[0,1,2]:street==="turn"?[3]:street==="river"?[4]:[];

export const buildDealerScanCommand=(slots:number[])=>`mode=scan\nscan=1\nslots=${slots.join(",")}\ntimeout=200\nidle=5000\nheartbeat=10000\n`;

export const normalizeDealerCandidates=(value:unknown):DealerRawCardCandidate[]=>{
  if(!Array.isArray(value))return [];
  return value.flatMap(item=>{
    if(!item||typeof item!=="object")return [];
    const candidate=item as Record<string,unknown>,slot=Number(candidate.slot),card=Number(candidate.card);
    if(!Number.isInteger(slot)||slot<0||slot>=DEALER_SLOT_COUNT||!Number.isInteger(card)||card<1||card>52)return [];
    const deck=Number(candidate.deck),rssi=Number(candidate.rssi);
    return [{slot,card,...(Number.isFinite(deck)?{deck}:{}),...(Number.isFinite(rssi)?{rssi}:{})}];
  });
};
