var PokerConst = PokerConst || 
{
    BettingRound : {
        Interval : 0,
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
    function cPlayer(name)
    {
        this.Identifier = name; // プレイヤー識別子
        this.ChipCount = 0; // 現在のチップカウント
        this.Alive = true;
    }

    // ---------------------------------------------------------------------
	// プレイヤーのアクション
	// ---------------------------------------------------------------------
    function cHandPlayerAction()
    {
        this.HandCount = argHandCount; // 何ハンド目なのか
        this.HandPlayer = null; // プレイヤー。cHandPlayer を入れる。
        this.BettingRound = PokerConst.BettingRound.Preflop;
        this.Type = PokerConst.PlayerAction.Fold;
        this.BetAmount = 0;
    }

    // ---------------------------------------------------------------------
	// ハンドにおける各プレイヤー
	// ---------------------------------------------------------------------
    function cHandPlayer(player)
    {
        this.Player = player; // プレイヤー
        this.HoleCards = []; // ホールカード
        this.Position = 0; // ディーラーから数えて何人目か(ディーラーなら 0)。
        this.Status = PokerConst.PlayerStatus.Waiting; // 現在の状態
        this.CurrentAction = null; // 現在のアクション
        this.ActionHistory = []; // アクション履歴
    }

    // ---------------------------------------------------------------------
	// ハンド: 1 回のゲーム(カード配ってから決着がつくまで)の単位
	// ---------------------------------------------------------------------
    function cHand(argHandCount)
    {
        this.HandCount = argHandCount; // 何ハンド目なのか
        this.HandPlayers = []; // ハンドに参加したプレイヤーのリスト
		this.CommunityCardsFlop = []; // Flop で出たカード(3枚)
		this.CommunityCardsTurn = []; // Turn で出たカード(3枚)
		this.CommunityCardsRiver = []; // River で出たカード(3枚)
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
        this.PlayerList = [];
        this.Notifier = null;
        this.CurrentHand = new cHand(0);
    }
    cModel.prototype.init = function()
    {
        console.log("model init");
    }
    
    // ---------------------------------------------------------------------
    // 通知関連
	// ---------------------------------------------------------------------
    cModel.prototype.bindModelUpdateNotifier = function(notifier)
    {
        this.Notifier = notifier;
    }
    cModel.prototype.notify = function()
    {
        if(this.Notifier)
        {
            this.Notifier.notifyModelUpdate();
        }
    }
    cModel.prototype.notifyHand = function(hand)
    {
        if(this.Notifier)
        {
            this.Notifier.notifyModelUpdateHand(hand);
        }
    }

    // ---------------------------------------------------------------------
    // モデルへの操作(ゲーム進行系)
	// ---------------------------------------------------------------------
    cModel.prototype.startHand = function()
    {
        this.CurrentHand = new cHand(this.CurrentHand.HandCount);
        for(const player of this.PlayerList)
        {
            if(player.Alive)
            {
                this.CurrentHand.HandPlayers.push(new cHandPlayer(player));
            }
        }
        this.notifyHand(this.CurrentHand);
    }
    cModel.prototype.startFlop = function()
    {
    }
    cModel.prototype.startTurn = function()
    {
    }
    cModel.prototype.startRiver = function()
    {
    }

    // ---------------------------------------------------------------------
    // モデルへの操作
	// ---------------------------------------------------------------------
    cModel.prototype.reset = function()
    {
        console.log("model reset");
    }
    cModel.prototype.addUser = function(name)
    {
        let user = new cPlayer(name);
        this.PlayerList.push(user);
        this.notify();
    }

    _model = new cModel();
    _model.init();
	return _model;
})();
