(function (ns) {
    "use strict";
    if(ns.cCardslot) return;

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cCardslot(argDeck, argCapacity)
    {
        this.Deck = argDeck;
        this.Capacity = argCapacity;
		this.ReceiveHistory = [];
        this.Cards = null;
    }

    /// <summary>
    /// </summary>
    cCardslot.prototype.scan = function(argValue)
    {
        // カードの更新
        if(argValue.cards.length < 1)
        {
            return false;
        }
        let well_read = false;
        for(const card of argValue.cards)
        {
            if(this.Deck.isUsed(card.card))
            {
                continue;
            }
            this.ReceiveHistory.push(card.card);
            if(this.ReceiveHistory.length > this.Capacity * 8)
            {
                well_read = true;
                this.ReceiveHistory.shift();
            }
        }
        return well_read;
    }

    /// <summary>
    /// リセット
    /// </summary>
    cCardslot.prototype.reset = function()
    {
		this.ReceiveHistory = [];
        this.Cards = null;
    }

    /// <summary>
    /// 現在の推定を取得する
    /// </summary>
    cCardslot.prototype.estimate = function()
    {
        if(this.Cards)
        {
            return this.Cards;
        }
        else
        {
            return this._getTopNFrequentItems(this.ReceiveHistory, this.Capacity);
        }
    }

    /// <summary>
    /// 現在の推定で fix する
    /// </summary>
    cCardslot.prototype.fix = function()
    {
        this.Cards = this.estimate();
        this.Deck.use(this.Cards);
    }

    /// <summary>
	/// 配列内の要素を出現回数でカウントし、多い順に上位N個を返す関数
    /// </summary>
	cCardslot.prototype._getTopNFrequentItems = function(array, n) 
	{
		const countMap = {};

		// 出現回数をカウント
		array.forEach(item => {
			countMap[item] = (countMap[item] || 0) + 1;
		});

		// 出現回数の降順に並べて上位N個を抽出
		const sorted = Object.entries(countMap)
		.sort((a, b) => b[1] - a[1])
		.slice(0, n);

		// 値（キー）だけ取り出す
		return sorted.map(entry => isNaN(entry[0]) ? entry[0] : Number(entry[0]));
	}

    ns.cCardslot = cCardslot;
})(Monitor = Monitor || {});
