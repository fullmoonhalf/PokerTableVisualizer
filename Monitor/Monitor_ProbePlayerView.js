(function (ns) {
    "use strict";
	if(	ns.cProbePlayerView )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbePlayerView(argHtmlRoot)
    {
        this.Model = null;

        this.HtmlRoot = argHtmlRoot;
        this.NameLabel = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_NAME_LABEL, "");
        this.NameValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_NAME_VALUE);
        this.NickLabel = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_NICK_LABEL, "");
        this.NickInput = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_NICK_INPUT);
        this.HolecardValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_HOLECARD_VALUE, "" );

        this.ActoinFoldButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_ACTION_FOLD ); 
        this.ActoinCheckButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_ACTION_CHECK );
        this.ActoinBetButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_ACTION_BET );
        this.ActoinCallButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_ACTION_CALL );
        this.ActoinRaiseButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_ACTION_RAISE );
        this.ActoinAllinButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_ACTION_ALLIN );
        this.ActionButtonList = [
            this.ActoinFoldButton,
            this.ActoinCheckButton,
            this.ActoinBetButton,
            this.ActoinCallButton,
            this.ActoinRaiseButton,
            this.ActoinAllinButton
        ];
        this.ControlAliveButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_CONTROL_ALIVE );
        this.ControlActButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_CONTROL_ACT );
        this.ControlPositionButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEPLAYER_PANEL_CONTROL_POSITION );

        ns.cProbeViewBase.call(this, this.HtmlRoot);

        HtmlUtil.addEventListenerToElement(this.ActoinFoldButton, "click", this._onPlayerActionFold.bind(this));
        HtmlUtil.addEventListenerToElement(this.ActoinCheckButton, "click", this._onPlayerActionCheck.bind(this));
        HtmlUtil.addEventListenerToElement(this.ActoinBetButton, "click", this._onPlayerActionBet.bind(this));
        HtmlUtil.addEventListenerToElement(this.ActoinCallButton, "click", this._onPlayerActionCall.bind(this));
        HtmlUtil.addEventListenerToElement(this.ActoinRaiseButton, "click", this._onPlayerActionRaise.bind(this));
        HtmlUtil.addEventListenerToElement(this.ActoinAllinButton, "click", this._onPlayerActionAllin.bind(this));
        HtmlUtil.addEventListenerToElement(this.ControlAliveButton, "click", this._onControlAlive.bind(this));
        HtmlUtil.addEventListenerToElement(this.ControlActButton, "click", this._onControlAct.bind(this));
        HtmlUtil.addEventListenerToElement(this.ControlPositionButton, "click", this._onControlPositionButton.bind(this));
        HtmlUtil.addEventListenerToElement(this.NickInput, "change", this.onInputNick.bind(this));

        this.setActiveButton(this.ControlAliveButton);
        this.setInactiveButton(this.ControlRescanButton);
        this.setInactiveButton(this.ControlPositionButton);
        this._disableAllPlayerAction();
        this.toDead();
    }
    cProbePlayerView.prototype = Object.create(ns.cProbeViewBase.prototype);
    cProbePlayerView.prototype.constructor = cProbePlayerView;

    /// <summary>
    /// ニックネーム入力時のイベントハンドラ
    /// </summary>
    cProbePlayerView.prototype.onInputNick = function(argEvent)
    {
        this.Model.setNick(argEvent.target.value);
    }

    /// <summary>
    /// 名前の表示
    /// </summary>
    cProbePlayerView.prototype.showName = function(argName)
    {
        this.NameValue.innerHTML = argName;
    }

    /// <summary>
    /// ポジションの表示
    /// </summary>
    cProbePlayerView.prototype.showPosition = function(argPosition)
    {
        this.ControlPositionButton.innerHTML = argPosition;
    }

    /// <summary>
    /// カードの表示
    /// </summary>
    cProbePlayerView.prototype.showCard = function(argCard)
    {
        this.HolecardValue.innerHTML = this.createHoleCardsHTML(argCard, ns.Defines.TEMPLATE_GLOBAL_CARD_SMALL, 2);
    }

    /// <summary>
    /// プレイヤーアクションの表示
    /// </summary>
    cProbePlayerView.prototype.showPlayerAction = function(argPlayerAction)
    {
        switch (argPlayerAction) {
            case PokerConst.PlayerAction.None:
                // まだ何もしていない
                this._disableAllPlayerAction();
                this.HtmlRoot.classList.toggle("action_allin", false);
                this.HtmlRoot.classList.toggle("action_fold", false);
                this.HtmlRoot.classList.toggle("status_acting", false);
                break;
            case PokerConst.PlayerAction.Check:
                // チェック
                this._selectPlayerAction(this.ActoinCheckButton);
                this.HtmlRoot.classList.toggle("action_allin", false);
                this.HtmlRoot.classList.toggle("action_fold", false);
                this.HtmlRoot.classList.toggle("status_acting", false);
                break;
            case PokerConst.PlayerAction.Bet:
                // ベット
                this._selectPlayerAction(this.ActoinBetButton);
                this.HtmlRoot.classList.toggle("action_allin", false);
                this.HtmlRoot.classList.toggle("action_fold", false);
                this.HtmlRoot.classList.toggle("status_acting", false);
                break;
            case PokerConst.PlayerAction.Call:
                // コール
                this._selectPlayerAction(this.ActoinCallButton);
                this.HtmlRoot.classList.toggle("action_allin", false);
                this.HtmlRoot.classList.toggle("action_fold", false);
                this.HtmlRoot.classList.toggle("status_acting", false);
                break;
            case PokerConst.PlayerAction.Raise:
                // レイズ
                this._selectPlayerAction(this.ActoinRaiseButton);
                this.HtmlRoot.classList.toggle("action_allin", false);
                this.HtmlRoot.classList.toggle("action_fold", false);
                this.HtmlRoot.classList.toggle("status_acting", false);
                break;
            case PokerConst.PlayerAction.Fold:
                // フォールド
                this._selectPlayerAction(this.ActoinFoldButton);
                this.HtmlRoot.classList.toggle("action_allin", false);
                this.HtmlRoot.classList.toggle("action_fold", true);
                this.HtmlRoot.classList.toggle("status_acting", false);
                break;
            case PokerConst.PlayerAction.AllIn:
                // オールイン
                this._selectPlayerAction(this.ActoinAllinButton);
                this.HtmlRoot.classList.toggle("action_allin", true);
                this.HtmlRoot.classList.toggle("action_fold", false);
                this.HtmlRoot.classList.toggle("status_acting", false);
                break;
            default:
                console.warn("[cProbePlayerView] Unknown PlayerAction:", argPlayerAction);
                break;
        }
    }


    /// <summary>
    /// アクション中かどうかの表示
    /// </summary>
    cProbePlayerView.prototype.setActing = function(argActing)
    {
        this.HtmlRoot.classList.toggle("status_acting", argActing);
    }

    /// <summary>
    /// </summary>
    cProbePlayerView.prototype.toAlive = function()
    {
        this.HtmlRoot.classList.toggle("status_dead", false);
    }

    /// <summary>
    /// </summary>
    cProbePlayerView.prototype.toDead = function()
    {
        this.HtmlRoot.classList.toggle("status_dead", true);
        this._disableAllPlayerAction();
    }

    /// <summary>
    /// プレイヤーのアクション状態設定(fold)
    /// </summary>
    cProbePlayerView.prototype._onPlayerActionFold = function(argEvent)
    {
        this.Model.setPlayerAction(PokerConst.PlayerAction.Fold);
    }

    /// <summary>
    /// プレイヤーのアクション状態設定(check)
    /// </summary>
    cProbePlayerView.prototype._onPlayerActionCheck = function(argEvent)
    {
        this.Model.setPlayerAction(PokerConst.PlayerAction.Check);
    }

    /// <summary>
    /// プレイヤーのアクション状態設定(bet)
    /// </summary>
    cProbePlayerView.prototype._onPlayerActionBet = function(argEvent)
    {
        this.Model.setPlayerAction(PokerConst.PlayerAction.Bet);
    }

    /// <summary>
    /// プレイヤーのアクション状態設定(call)
    /// </summary>
    cProbePlayerView.prototype._onPlayerActionCall = function(argEvent)
    {
        this.Model.setPlayerAction(PokerConst.PlayerAction.Call);
    }

    /// <summary>
    /// プレイヤーのアクション状態設定(raise)
    /// </summary>
    cProbePlayerView.prototype._onPlayerActionRaise = function(argEvent)
    {
        this.Model.setPlayerAction(PokerConst.PlayerAction.Raise);
    }

    /// <summary>
    /// プレイヤーのアクション状態設定(all-in)
    /// </summary>
    cProbePlayerView.prototype._onPlayerActionAllin = function(argEvent)
    {
        this.Model.setPlayerAction(PokerConst.PlayerAction.AllIn);
    }

    /// <summary>
    /// プレイヤーの生存設定
    /// </summary>
    cProbePlayerView.prototype._onControlAlive = function(argEvent)
    {
        this.Model.toggleAlive();
    }

    /// <summary>
    /// アクション中プレイヤーの設定
    /// </summary>
    cProbePlayerView.prototype._onControlAct = function(argEvent)
    {
        if (this.Model.Alive) {
            ns.Engine.ProbeManager.setActionPlayer(this.Model);
        }
    }

    /// <summary>
    /// プレイヤーのボタン設定
    /// </summary>
    cProbePlayerView.prototype._onControlPositionButton = function(argEvent)
    {
        ns.Engine.ProbeManager.changeButton(this.Model);
    }

    /// <summary>
    /// プレイヤーアクションボタンの全てを無効表示にする
    /// </summary>
    cProbePlayerView.prototype._disableAllPlayerAction = function()
    {
        for(const button of this.ActionButtonList)
        {
            this.setInactiveButton(button);
        }
    }

    /// <summary>
    /// プレイヤーアクションボタンの指定されたものを有効表示にする
    /// </summary>
    cProbePlayerView.prototype._selectPlayerAction = function(argButton)
    {
        this._disableAllPlayerAction();
        this.setActiveButton(argButton);
    }

    ns.cProbePlayerView = cProbePlayerView;

})(Monitor = Monitor || {});
