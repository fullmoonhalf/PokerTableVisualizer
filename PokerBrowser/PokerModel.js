var PokerConst = PokerConst || 
{
    BettingRound : {
        Preflop : 1,
        Flop : 2,
        Turn : 3,
        River : 4,
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
    function cPlayer()
    {
        this.Identifier = "";
        this.ChipCount = 0;
    }

    // ---------------------------------------------------------------------
	// ハンドの状況
	// ---------------------------------------------------------------------
    function cHand(argHandCount)
    {
        this.HandCount = argHandCount;
		this.CommunityCardsFlop = [];
		this.CommunityCardsTurn = [];
		this.CommunityCardsRiver = [];
    }

    // ---------------------------------------------------------------------
	// プレイヤーのアクション
	// ---------------------------------------------------------------------
    function cHandPlayerAction()
    {
        this.HandCount = 0;
        this.BettingRound = PokerConst.BettingRound.Preflop;
        this.Type = PokerConst.PlayerAction.Fold;
        this.BetAmount = 0;
    }

    // ---------------------------------------------------------------------
	// ハンドにおける各プレイヤー
	// ---------------------------------------------------------------------
    function cHandPlayer()
    {
        this.HoleCards = [];
        this.Status = PokerConst.PlayerStatus.Waiting;
        this.CurrentAction = null;
        this.ActionHistory = [];
    }

    // ---------------------------------------------------------------------
	// テーブルの状況
	// ---------------------------------------------------------------------
    function cSession()
    {
        this.Players = [];
        this.AlivePlayers = [];
        this.HandHistory = [];
    }

    ///
	var _model = {
		init : function()
		{
            console.log("model init");
		},
        reset : function()
        {
        },
	};

    _model.init();
	return _model;
})();
