(function (ns) {
    "use strict";
    if(ns.cCarddeck) return;

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cCarddeck()
    {
        this.reset();
    }

    /// <summary>
    /// </summary>
    cCarddeck.prototype.reset = function()
    {
        this.Deck = new PokerModel.cDeck();
    }

    /// <summary>
    /// 利用フラグ立てる
    /// </summary>
    cCarddeck.prototype.use = function(argCards)
    {
        this.Deck.useList(argCards)
    }

    /// <summary>
    /// 利用されているか確認する
    /// </summary>
    cCarddeck.prototype.isUsed = function(argIndex)
	{
        return this.Deck.isUsed(argIndex);
	}

    ns.cCarddeck = cCarddeck;
})(Monitor = Monitor || {});
