import assert from 'node:assert/strict';
import { test } from 'node:test';
import { awardPot, createDemoHand, executeCommand, resetHand, setSeatOut } from '../lib/poker-core.ts';

const blinds = { smallBlind: 100, bigBlind: 200, chipUnit: 1 };
const noAnte = { mode: 'none', amount: 0, priority: 'ante' };
const player = (state, seat) => state.players.find(p => p.seat === seat);
function setup(seats, button, ante = noAnte, stacks = {}) {
  let state = createDemoHand(noAnte, blinds);
  for (const p of state.players) if (!seats.includes(p.seat)) state = setSeatOut(state, p.seat, true);
  state = { ...state, handStartStacks: { ...state.handStartStacks, ...stacks } };
  return resetHand(state, ante, blinds, button);
}
function assertPositions(state, sb, bb, actor) {
  const posts = state.events.filter(e => e.type === 'BLIND_POSTED');
  assert.deepEqual(posts.map(e => [e.seat, e.amount]), [[sb, 100], [bb, 200]]);
  assert.equal(state.actorSeat, actor);
}
function checkStreet(state, first, second) {
  assert.equal(state.actorSeat, first);
  state = executeCommand(state, { type: 'CHECK', seat: first });
  assert.equal(state.actorSeat, second);
  return executeCommand(state, { type: 'CHECK', seat: second });
}

for (const [seats, button, bb] of [[[1, 2], 1, 2], [[1, 2], 2, 1], [[3, 8], 8, 3], [[3, 8], 3, 8]]) {
  test(`HU BTN ${button} / BB ${bb}: preflop and all postflop streets`, () => {
    let state = setup(seats, button);
    assertPositions(state, button, bb, button);
    state = executeCommand(state, { type: 'CALL', seat: button });
    assert.equal(state.actorSeat, bb);
    state = executeCommand(state, { type: 'CHECK', seat: bb });
    for (const street of ['flop', 'turn', 'river']) {
      assert.equal(state.street, street);
      state = checkStreet(state, bb, button);
    }
    assert.equal(state.street, 'showdown');
  });
}
for (const [seats, button, sb, bb, actor] of [
  [[1, 2, 3], 1, 2, 3, 1], [[2, 5, 9], 5, 9, 2, 5],
  [[1, 2, 3, 4], 1, 2, 3, 4], [[1, 2, 3, 4, 5, 6, 7, 8, 9], 9, 1, 2, 3],
]) test(`${seats.length} players preserve existing blind and action order`, () => {
  assertPositions(setup(seats, button), sb, bb, actor);
});

test('seat-out from three players to HU, normalize absent BTN, seat-in back to three', () => {
  let state = setup([2, 5, 9], 2);
  state = setSeatOut(state, 2, true);
  state = resetHand(state, noAnte, blinds, 2);
  assert.equal(state.button, 5);
  assertPositions(state, 5, 9, 5);
  assert.equal(player(state, 2).totalInvested, 0);
  state = setSeatOut(state, 2, false);
  state = resetHand(state, noAnte, blinds, 5);
  assertPositions(state, 9, 2, 5);
});

test('next hand rotates HU button, preserves stacks and increments hands; reset does not double-charge', () => {
  let state = setup([2, 8], 2);
  state = executeCommand(state, { type: 'FOLD', seat: 2 });
  state = awardPot(state, [8]);
  const stacks = Object.fromEntries(state.players.map(p => [p.seat, p.stack]));
  const hands = player(state, 8).stats.hands;
  const number = state.handNumber;
  state = resetHand(state, noAnte, blinds, 8, true);
  assertPositions(state, 8, 2, 8);
  assert.equal(state.handNumber, number + 1);
  assert.equal(player(state, 8).stats.hands, hands + 1);
  assert.equal(player(state, 8).stack, stacks[8] - 100);
  assert.equal(player(state, 2).stack, stacks[2] - 200);
  const reset = resetHand(state, noAnte, blinds, 8);
  assert.deepEqual(reset.players.map(p => [p.stack, p.totalInvested, p.stats.hands]), state.players.map(p => [p.stack, p.totalInvested, p.stats.hands]));
});

for (const seats of [[1, 2], [1, 2, 3]]) for (const priority of ['blind', 'ante']) {
  const bb = seats.length === 2 ? 2 : 3;
  for (const stack of [50, 150, 300, 500]) test(`${seats.length} players BB ante ${priority}, BB stack ${stack}`, () => {
    const state = setup(seats, 1, { mode: 'big-blind', amount: 200, priority }, { [bb]: stack });
    const p = player(state, bb);
    const expectedBlind = priority === 'blind' ? Math.min(200, stack) : Math.min(200, Math.max(0, stack - 200));
    assert.equal(p.streetBet, expectedBlind);
    assert.equal(p.totalInvested, Math.min(stack, 400));
    assert.equal(p.stack, Math.max(0, stack - 400));
    assert.equal(p.allIn, stack <= 400);
    assert.equal(state.currentBet, 200);
    assert.equal(state.minRaise, 200);
    assert.equal(state.actorSeat, 1);
    const posts = state.events.filter(e => e.seat === bb && ['ANTE_POSTED', 'BLIND_POSTED'].includes(e.type));
    assert.deepEqual(posts.map(e => e.type), priority === 'blind' ? ['BLIND_POSTED', 'ANTE_POSTED'] : ['ANTE_POSTED', 'BLIND_POSTED']);
    assert.equal(state.pot, 100 + Math.min(stack, 400));
    for (const p of state.players) assert.equal(p.stack + p.totalInvested, state.handStartStacks[p.seat]);
  });
}

test('short HU SB is all-in and skipped as actor', () => {
  const state = setup([1, 2], 1, noAnte, { 1: 50 });
  assert.equal(player(state, 1).streetBet, 50);
  assert.equal(player(state, 1).allIn, true);
  assert.equal(state.actorSeat, 2);
  assert.equal(state.pot, 250);
});
for (const seats of [[1, 2], [1, 2, 3]]) test(`all-player antes remain dead money (${seats.length} players)`, () => {
  const state = setup(seats, 1, { mode: 'all-players', amount: 50, priority: 'ante' });
  assertPositions(state, seats.length === 2 ? 1 : 2, seats.length === 2 ? 2 : 3, 1);
  assert.equal(state.pot, 300 + seats.length * 50);
  for (const seat of seats) assert.equal(player(state, seat).totalInvested - player(state, seat).streetBet, 50);
});
for (const seats of [[], [4]]) test(`${seats.length} active players: no forced bets or actor`, () => {
  const state = setup(seats, 1);
  assert.equal(state.street, 'finished');
  assert.equal(state.actorSeat, null);
  assert.equal(state.pot, 0);
});

for (const removed of [1, 2, 3]) test(`enter HU after seat ${removed} leaves: surviving previous BB becomes BTN`, () => {
  let state = setup([1, 2, 3], 1);
  state = setSeatOut(state, removed, true);
  const survivors = [1, 2, 3].filter(seat => seat !== removed);
  const requested = survivors.find(seat => seat > state.button) ?? survivors[0];
  state = resetHand(state, noAnte, blinds, requested, true);
  const button = removed === 3 ? requested : 3;
  const bb = survivors.find(seat => seat !== button);
  assert.equal(state.button, button);
  assertPositions(state, button, bb, button);
  if (removed !== 3) assert.notEqual(bb, 3);
  state = executeCommand(state, { type: 'CALL', seat: button });
  state = executeCommand(state, { type: 'CHECK', seat: bb });
  assert.equal(state.street, 'flop');
  assert.equal(state.actorSeat, bb);
});

test('same-hand reset into HU preserves requested BTN', () => {
  let state = setup([1, 2, 3], 1);
  state = setSeatOut(state, 2, true);
  state = resetHand(state, noAnte, blinds, 1);
  assertPositions(state, 1, 3, 1);
});

test('existing HU respects supplied BTN on next hand', () => {
  const state = resetHand(setup([1, 3], 1), noAnte, blinds, 1, true);
  assertPositions(state, 1, 3, 1);
});

test('multiway next hand keeps requested BTN', () => {
  const state = resetHand(setup([1, 2, 3, 4], 1), noAnte, blinds, 2, true);
  assertPositions(state, 3, 4, 1);
});

for (const priority of ['blind', 'ante']) test(`multiple seat-outs into HU preserve short BB ante (${priority})`, () => {
  let state = setup([2, 4, 7, 9], 2);
  state = setSeatOut(state, 2, true);
  state = setSeatOut(state, 4, true);
  // Previous BB was 7. Seat 9 becomes the new short BB, even with BTN requested as 9.
  state = { ...state, players: state.players.map(p => p.seat === 9 ? { ...p, stack: 300 } : p) };
  const opening = Object.fromEntries(state.players.map(p => [p.seat, p.stack]));
  state = resetHand(state, { mode: 'big-blind', amount: 200, priority }, blinds, 9, true);
  assert.equal(state.button, 7);
  assert.equal(state.actorSeat, 7);
  assert.equal(player(state, 9).streetBet, priority === 'blind' ? 200 : 100);
  assert.equal(player(state, 9).totalInvested, 300);
  assert.equal(player(state, 9).allIn, true);
  assert.equal(state.pot, 400);
  for (const p of state.players) assert.equal(p.stack + p.totalInvested, opening[p.seat]);
  const again = resetHand(state, state.ante, blinds, state.button);
  assert.equal(again.button, 7);
  assert.equal(again.pot, state.pot);
});
