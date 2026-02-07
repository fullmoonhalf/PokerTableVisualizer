(function (ns) {
    "use strict";
	if(	ns.cProbeDealerView )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeDealerView(argHtmlRoot)
    {
        this.Model = null;
        this.HtmlRoot = argHtmlRoot;
        this.HandcountLabel = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_HANDCOUNT_LABEL, "");
        this.HandcountValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_HANDCOUNT_INPUT);

        this.BoardFlopValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_FLOP_VALUE);
        this.BoardTurnValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_TURN_VALUE);
        this.BoardRiverValue = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_RIVER_VALUE);

        this.BlindSBInput = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BLIND_SB_INPUT);
        this.BlindBBInput = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BLIND_BB_INPUT);

        this.BettingroundDealButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BETTINGROUND_DEAL);
        this.BettingroundPreflopButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BETTINGROUND_PREFLOP);
        this.BettingroundFlopButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BETTINGROUND_FLOP);
        this.BettingroundTurnButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BETTINGROUND_TURN);
        this.BettingroundRiverButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BETTINGROUND_RIVER);
        this.BettingroundEndButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_BETTINGROUND_END);
        this.BettingroundButtonCollection = [
            this.BettingroundDealButton,
            this.BettingroundPreflopButton,
            this.BettingroundFlopButton,
            this.BettingroundTurnButton,
            this.BettingroundRiverButton,
            this.BettingroundEndButton
        ];
        this.ControlNexthandButton = HtmlUtil.searchNodeByClassNameFromChildren(this.HtmlRoot, ns.Defines.TEMPLATE_PROBEDEALER_PANEL_CONTROL_NEXT_HAND);

        ns.cProbeViewBase.call(this, this.HtmlRoot);

        HtmlUtil.addEventListenerToElement(this.BettingroundDealButton, "click", this._onBettingroundDeal.bind(this));
        HtmlUtil.addEventListenerToElement(this.BettingroundPreflopButton, "click", this._onBettingroundPreflop.bind(this));
        HtmlUtil.addEventListenerToElement(this.BettingroundFlopButton, "click", this._onBettingroundFlop.bind(this));
        HtmlUtil.addEventListenerToElement(this.BettingroundTurnButton, "click", this._onBettingroundTurn.bind(this));
        HtmlUtil.addEventListenerToElement(this.BettingroundRiverButton, "click", this._onBettingroundRiver.bind(this));
        HtmlUtil.addEventListenerToElement(this.BettingroundEndButton, "click", this._onBettingroundEnd.bind(this));
        HtmlUtil.addEventListenerToElement(this.ControlNexthandButton, "click", this._ControlNexthandButton.bind(this));
        HtmlUtil.addEventListenerToElement(this.HandcountValue, "change", this._onHandcountValueChange.bind(this));
        HtmlUtil.addEventListenerToElement(this.BlindSBInput, "change", this._onBlindValueChange.bind(this));
        HtmlUtil.addEventListenerToElement(this.BlindBBInput, "change", this._onBlindValueChange.bind(this));

        this._disableAllBettingRound();
    }
    cProbeDealerView.prototype = Object.create(ns.cProbeViewBase.prototype);
    cProbeDealerView.prototype.constructor = cProbeDealerView;

    /// <summary>
    /// BettingRond の表示
    /// </summary>
    cProbeDealerView.prototype.showBettingRound = function(argBettingRound)
    {
        switch(argBettingRound)
        {
            case PokerConst.BettingRound.DealHand:
                this._selectBettingRound(this.BettingroundDealButton);
                break;
            case PokerConst.BettingRound.Preflop:
                this._selectBettingRound(this.BettingroundPreflopButton);
                break;
            case PokerConst.BettingRound.Flop:
                this._selectBettingRound(this.BettingroundFlopButton);
                break;
            case PokerConst.BettingRound.Turn:
                this._selectBettingRound(this.BettingroundTurnButton);
                break;
            case PokerConst.BettingRound.River:
                this._selectBettingRound(this.BettingroundRiverButton);
                break;
            case PokerConst.BettingRound.EndHand:
                this._selectBettingRound(this.BettingroundEndButton);
                break;
            default:
                this._disableAllBettingRound();
                break;
        }
    }

    /// <summary>
    /// flow の表示
    /// </summary>
    cProbeDealerView.prototype.showFlopCard = function(argCard)
    {
        this.BoardFlopValue.innerHTML = this.createHoleCardsHTML(argCard, ns.Defines.TEMPLATE_GLOBAL_CARD_SMALL, 3);
    }

    /// <summary>
    /// turn の表示
    /// </summary>
    cProbeDealerView.prototype.showTurnCard = function(argCard)
    {
        this.BoardTurnValue.innerHTML = this.createHoleCardsHTML(argCard, ns.Defines.TEMPLATE_GLOBAL_CARD_SMALL, 1);
    }

    /// <summary>
    /// river の表示
    /// </summary>
    cProbeDealerView.prototype.showRiverCard = function(argCard)
    {
        this.BoardRiverValue.innerHTML = this.createHoleCardsHTML(argCard, ns.Defines.TEMPLATE_GLOBAL_CARD_SMALL, 1);
    }

    /// <summary>
    /// Deal ボタン押下
    /// </summary>
    cProbeDealerView.prototype._onBettingroundDeal = function(argEvent)
    {
        this.Model.setBettingRound(PokerConst.BettingRound.DealHand);
    }

    /// <summary>
    /// Preflop ボタン押下
    /// </summary>
    cProbeDealerView.prototype._onBettingroundPreflop = function(argEvent)
    {
        this.Model.setBettingRound(PokerConst.BettingRound.Preflop);
    }

    /// <summary>
    /// Flop ボタン押下
    /// </summary>
    cProbeDealerView.prototype._onBettingroundFlop = function(argEvent)
    {
        this.Model.setBettingRound(PokerConst.BettingRound.Flop);
    }

    /// <summary>
    /// Turn ボタン押下
    /// </summary>
    cProbeDealerView.prototype._onBettingroundTurn = function(argEvent)
    {
        this.Model.setBettingRound(PokerConst.BettingRound.Turn);
    }

    /// <summary>
    /// River ボタン押下
    /// </summary>
    cProbeDealerView.prototype._onBettingroundRiver = function(argEvent)
    {
        this.Model.setBettingRound(PokerConst.BettingRound.River);
    }

    /// <summary>
    /// End ボタン押下
    /// </summary>
    cProbeDealerView.prototype._onBettingroundEnd = function(argEvent)
    {
        this.Model.setBettingRound(PokerConst.BettingRound.EndHand);
    }

    /// <summary>
    /// Next ボタン押下
    /// </summary>
    cProbeDealerView.prototype._ControlNexthandButton = function(argEvent)
    {
        this._updateHandCount(1);
        ns.Engine.ProbeManager.changeButtonNext();
        this.Model.setBettingRound(PokerConst.BettingRound.DealHand);
    }
    
    /// <summary>
    /// ハンドカウント
    /// </summary>
    cProbeDealerView.prototype._onHandcountValueChange = function(argEvent)
    {
        this._updateHandCount(0);
    }

    /// <summary>
    /// ハンドカウントの更新処理
    /// </summary>
    cProbeDealerView.prototype._updateHandCount = function(argIncrimentValue)
    {
        const value = HtmlUtil.tryGetInputNumber(this.HandcountValue);
        if(value != undefined)
        {
            const next_hand_conut = value + argIncrimentValue;
            this.HandcountValue.value = next_hand_conut;
            this.Model.setHandCount(next_hand_conut);
        }
    }

    /// <summary>
    /// ブラインド
    /// </summary>
    cProbeDealerView.prototype._onBlindValueChange = function(argEvent)
    {
        const sb = HtmlUtil.tryGetInputNumber(this.BlindSBInput);
        if(sb == undefined)
        {
            return;
        }
        const bb = HtmlUtil.tryGetInputNumber(this.BlindBBInput);
        if(bb == undefined)
        {
            return;
        }
        this.Model.setBlind(sb, bb);
    }
    

    /// <summary>
    /// ベッティングラウンドボタンの全てを無効表示にする
    /// </summary>
    cProbeDealerView.prototype._disableAllBettingRound = function()
    {
        for(const button of this.BettingroundButtonCollection)
        {
            this.setInactiveButton(button);
        }
    }

    /// <summary>
    /// ベッティングラウンドボタンの指定されたものを有効表示にする
    /// </summary>
    cProbeDealerView.prototype._selectBettingRound = function(argButton)
    {
        this._disableAllBettingRound();
        this.setActiveButton(argButton);
    }

    ns.cProbeDealerView = cProbeDealerView;
})(Monitor = Monitor || {});
