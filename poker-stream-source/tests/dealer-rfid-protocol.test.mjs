import assert from "node:assert/strict";
import test from "node:test";
import { buildDealerScanCommand,dealerSlotsForStreet,normalizeDealerCandidates } from "../lib/dealer-rfid-protocol.ts";

test("uses zero-origin slots for each street",()=>{
  assert.deepEqual(dealerSlotsForStreet("preflop"),[]);
  assert.deepEqual(dealerSlotsForStreet("flop"),[0,1,2]);
  assert.deepEqual(dealerSlotsForStreet("turn"),[3]);
  assert.deepEqual(dealerSlotsForStreet("river"),[4]);
});

test("builds the extended key-value scan command with idle spelling",()=>{
  const command=buildDealerScanCommand([0,1,2]);
  assert.match(command,/slots=0,1,2\n/);
  assert.match(command,/idle=5000\n/);
  assert.doesNotMatch(command,/idol=/);
});

test("normalizes dealer cards while preserving native slot numbers",()=>{
  assert.deepEqual(normalizeDealerCandidates([
    {slot:0,card:1,deck:2,rssi:240},
    {slot:4,card:52,rssi:-40},
    {slot:5,card:10},
    {slot:2,card:53},
  ]),[
    {slot:0,card:1,deck:2,rssi:240},
    {slot:4,card:52,rssi:-40},
  ]);
});
