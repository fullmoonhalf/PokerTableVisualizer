var PokerConst = PokerConst || 
{
    BettingRound : {
        Invalid : 0,
        DealHand : 1,
        Preflop : 2,
        Flop : 3,
        Turn : 4,
        River : 5,
        EndHand: 6,
    },

    PlayerStatus : {
        //	ゲーム中だが、まだ自分のアクションの順番が来ていない状態
        Waiting : 1,
        // 現在アクションの順番が来ており、選択を待っている状態
        PendingAction : 2,
        // ベット／コール／チェックなど、何らかのアクションを完了した状態
        Acted : 3,
        // フォールド済み。このハンドからは撤退している
        Folded : 4,
        // 全額をベットしており、以後のアクションができない状態（ショーダウン待ち）
        AllIn : 5,
        // テーブルに座っているが、手を休んでいる状態（離席やブラインド逃れ）
        SettingOut : 6,
    },

    PlayerAction : {
        // まだ何もしていない
        None : 0,
        // 既にベットがないときに、何もしないで順番を回す
        Check : 1,
        // チップを新たに賭ける（ラウンド最初のベット）
        Bet : 2,
        // 他のプレイヤーのベット額に合わせて参加する
        Call : 3,
        // ベットに加えてさらにチップを上乗せする
        Raise : 4,
        // 勝負を降りる。以降はそのハンドに参加しない
        Fold : 5,
        //所持チップをすべて賭ける（=ベット or レイズの一種）        
        AllIn : 6,
    },
};

var PokerModel = PokerModel || {};
(function (ns) {
    "use strict";
    if(ns.cCardslot) return;

    // ---------------------------------------------------------------------
	// デッキ管理
	// ---------------------------------------------------------------------
	function cDeck()
	{
		this.Deck = Array.from({ length: 52 }, (_, i) => i + 1); // シャッフル
		this.Used = Array.from({ length: 53 }, (_, i) => false); // 利用済みフラグ
	}
	cDeck.prototype.drawCard = function()
	{
		const index = Math.floor(Math.random() * this.Deck.length);
		const card = this.Deck[index];
		this.Deck.splice(index, 1);
		this.Used[card] = true;
		return card;
	}
	cDeck.prototype.use = function(argIndex)
	{
		this.Deck = this.Deck.filter((_, index) => index !== argIndex);
		this.Used[argIndex] = true;
	}
	cDeck.prototype.useList = function(argIndexList)
	{
		for(const index of argIndexList)
		{
			this.use(index);
		}
	}
	cDeck.prototype.isUsed = function(argIndex)
	{
		return this.Used[argIndex];
	}
    ns.cDeck = cDeck;
})(PokerModel = PokerModel || {});
