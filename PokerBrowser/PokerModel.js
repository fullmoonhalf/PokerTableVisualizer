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


var PokerModel = PokerModel || (function(){
    // ---------------------------------------------------------------------
	// プレイヤーの状況
	// ---------------------------------------------------------------------
    function cPlayer(name)
    {
        this.Identifier = name; // プレイヤー識別子
    }

    // ---------------------------------------------------------------------
	// ハンドにおける各プレイヤー
	// ---------------------------------------------------------------------
    function cHandPlayer(player)
    {
        this.Player = player; // プレイヤー
    }

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

    // ---------------------------------------------------------------------
	// ハンド: 1 回のゲーム(カード配ってから決着がつくまで)の単位
	// ---------------------------------------------------------------------
    function cHand(argHandCount)
    {
        this.HandCount = argHandCount; // 何ハンド目なのか
        this.BettingRound = PokerConst.BettingRound.Preflop;
        this.HandPlayers = []; // ハンドに参加したプレイヤーのリスト
        this.Deck = new cDeck(); // デッキの情報
		this.CommunityCardsFlop = []; // Flop で出たカード(3枚)
		this.CommunityCardsTurn = []; // Turn で出たカード(1枚)
		this.CommunityCardsRiver = []; // River で出たカード(1枚)
    }

    // ---------------------------------------------------------------------
	// Session: テーブル始まってから終わるまでの単位
	// ---------------------------------------------------------------------
    function cSession()
    {
        this.HandHistory = [] // cHand のリストが入る。
    }

	// =====================================================================
	// モデル全体
	// =====================================================================
    function cModel()
    {
        this.Session = new cSession();
        this.PlayerList = {};
        this.Notifier = null;
        this.CurrentHand = new cHand(0);
    }
    cModel.prototype.init = function()
    {
        console.log("model init");
    }
    // ---------------------------------------------------------------------
    // モデルへの操作(ゲーム進行系)
	// ---------------------------------------------------------------------
    cModel.prototype.startHand = function(argAlivePlayers)
    {
        this.CurrentHand = new cHand(this.CurrentHand.HandCount+1);
        this.BettingRound = PokerConst.BettingRound.Preflop;
    }
    cModel.prototype.startFlop = function()
    {
        this.BettingRound = PokerConst.BettingRound.Flop;
    }
    cModel.prototype.startTurn = function()
    {
        this.BettingRound = PokerConst.BettingRound.Turn;
    }
    cModel.prototype.startRiver = function()
    {
        this.BettingRound = PokerConst.BettingRound.River;
    }
    cModel.prototype.getBettingRound = function()
    {
        return this.BettingRound;
    }

    // ---------------------------------------------------------------------
    // カード状態の設定
	// ---------------------------------------------------------------------
    cModel.prototype.useHoleCards = function(argPlayerName, argCards)
    {
        this.CurrentHand.Deck.useList(argCards);
    }
    cModel.prototype.useFlopCards = function(argFlop)
    {
		this.CommunityCardsFlop = argFlop;
        this.CurrentHand.Deck.useList(argFlop);
    }
    cModel.prototype.useTurnCards = function(argTurn)
    {
		this.CommunityCardsTurn = argTurn;
        this.CurrentHand.Deck.useList(argTurn);
    }
    cModel.prototype.useRiverCards = function(argRiver)
    {
		this.CommunityCardsRiver = argRiver;
        this.CurrentHand.Deck.useList(argRiver);
    }

    // ---------------------------------------------------------------------
    // 状態の取得
	// ---------------------------------------------------------------------
    cModel.prototype.getCurrentHandCount = function()
    {
        return this.CurrentHand.HandCount;
    }
    cModel.prototype.isUsedCard = function(argCard)
    {
        return this.CurrentHand.Deck.isUsed(argCard);
    }

    // ---------------------------------------------------------------------
    // モデルへの操作
	// ---------------------------------------------------------------------
    cModel.prototype.reset = function()
    {
        console.log("model reset");
    }

    _model = new cModel();
    _model.init();
	return _model;
})();
