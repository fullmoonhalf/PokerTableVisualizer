(function (ns) {
    "use strict";
    if (ns.HandRange) return;

    ns.HandRange = {};

    // =====================================================================
    // アクション評価値の定数
    // =====================================================================
    ns.HandRange.ACTION_VALUE_FOLD  = 0.0;
    ns.HandRange.ACTION_VALUE_CHECK = 0.0;
    ns.HandRange.ACTION_VALUE_CALL  = 0.5;
    ns.HandRange.ACTION_VALUE_RAISE = 1.0;

    // ランク順序（インデックス0がAce）
    const RANK_ORDER = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    const MATRIX_SIZE = 13;

    /// <summary>
    /// カードインデックス(1-52)をランクとスートに変換する
    /// </summary>
    function _cardToRankSuit(cardIndex)
    {
        const i1 = cardIndex - 1;
        const suit = Math.floor(i1 / 13);
        let rank = i1 % 13 + 1;
        if (rank === 1) rank = 14; // Ace
        return { rank: rank, suit: suit };
    }

    /// <summary>
    /// ランクを行/列インデックスに変換する
    /// </summary>
    function _rankToIndex(rank)
    {
        return RANK_ORDER.indexOf(rank);
    }

    /// <summary>
    /// アクションを評価値に変換する
    /// </summary>
    ns.HandRange.getActionValue = function(argAction)
    {
        switch (argAction)
        {
            case PokerConst.PlayerAction.Fold:
            case PokerConst.PlayerAction.Check:
                return ns.HandRange.ACTION_VALUE_FOLD;
            case PokerConst.PlayerAction.Call:
                return ns.HandRange.ACTION_VALUE_CALL;
            case PokerConst.PlayerAction.Bet:
            case PokerConst.PlayerAction.Raise:
            case PokerConst.PlayerAction.AllIn:
                return ns.HandRange.ACTION_VALUE_RAISE;
            default:
                return ns.HandRange.ACTION_VALUE_FOLD;
        }
    };

    /// <summary>
    /// 2枚のカードからハンドセル(row, col)を返す
    /// スーテッド: 上三角 (row < col)
    /// オフスート: 下三角 (row > col)
    /// ペア: 対角 (row == col)
    /// </summary>
    ns.HandRange.getHandCell = function(card1, card2)
    {
        const c1 = _cardToRankSuit(card1);
        const c2 = _cardToRankSuit(card2);

        const highCard = c1.rank >= c2.rank ? c1 : c2;
        const lowCard  = c1.rank >= c2.rank ? c2 : c1;

        const hiIdx = _rankToIndex(highCard.rank);
        const loIdx = _rankToIndex(lowCard.rank);

        if (hiIdx === -1 || loIdx === -1) return null;

        if (highCard.rank === lowCard.rank)
        {
            // ポケットペア: 対角
            return { row: hiIdx, col: hiIdx };
        }

        const suited = (highCard.suit === lowCard.suit);
        if (suited)
        {
            // スーテッド: 上三角 (row < col)
            return { row: hiIdx, col: loIdx };
        }
        else
        {
            // オフスート: 下三角 (row > col)
            return { row: loIdx, col: hiIdx };
        }
    };

    /// <summary>
    /// ハンドキー文字列を取得する
    /// </summary>
    ns.HandRange.getHandKey = function(card1, card2)
    {
        const cell = ns.HandRange.getHandCell(card1, card2);
        if (!cell) return null;
        return `${cell.row}_${cell.col}`;
    };

    /// <summary>
    /// 平均値を色(CSS文字列)に変換する
    /// 0.0 → 青, 0.5 → 緑, 1.0 → 赤
    /// </summary>
    function _avgToColor(avg)
    {
        if (avg <= 0.5)
        {
            const t = avg * 2; // 0→0.5: t=0→1
            const r = 0;
            const g = Math.round(255 * t);
            const b = Math.round(255 * (1 - t));
            return `rgb(${r},${g},${b})`;
        }
        else
        {
            const t = (avg - 0.5) * 2; // 0.5→1.0: t=0→1
            const r = Math.round(255 * t);
            const g = Math.round(255 * (1 - t));
            const b = 0;
            return `rgb(${r},${g},${b})`;
        }
    }

    /// <summary>
    /// ハンドレンジ統計データを保持し、記録と描画を行うクラス
    /// </summary>
    function cHandRange()
    {
        this.Stats = {};
        this.History = [];
    }

    /// <summary>
    /// プリフロップのアクションをハンドレンジ統計に記録する
    /// card1, card2: カードインデックス(1-52)
    /// argAction: PokerConst.PlayerAction の値
    /// </summary>
    cHandRange.prototype.record = function(card1, card2, argAction)
    {
        const key = ns.HandRange.getHandKey(card1, card2);
        if (key === null) return;

        const value = ns.HandRange.getActionValue(argAction);

        if (!this.Stats[key])
        {
            this.Stats[key] = { count: 0, sum: 0.0 };
        }
        this.Stats[key].count++;
        this.Stats[key].sum += value;

        this.History.push({ cards: [card1, card2], action: argAction });
    };

    /// <summary>
    /// キャンバスにハンドレンジマトリクスを描画する
    /// argCanvas: HTMLCanvasElement
    /// </summary>
    cHandRange.prototype.draw = function(argCanvas)
    {
        ns.HandRange.drawMatrix(argCanvas, this.Stats);
    };

    ns.cHandRange = cHandRange;

    /// <summary>
    /// キャンバスにハンドレンジマトリクスを描画する
    /// argStats: { "row_col": {count, sum} } の形式
    /// </summary>
    ns.HandRange.drawMatrix = function(argCanvas, argStats)
    {
        const ctx = argCanvas.getContext("2d");
        const w = argCanvas.width;
        const h = argCanvas.height;
        const cellW = w / MATRIX_SIZE;
        const cellH = h / MATRIX_SIZE;

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);
        for (let r = 0; r < MATRIX_SIZE; r++)
        {
            for (let c = 0; c < MATRIX_SIZE; c++)
            {
                const key = `${r}_${c}`;
                const stat = argStats[key];

                if (stat && stat.count > 0)
                {
                    const avg = stat.sum / stat.count;
                    ctx.fillStyle = _avgToColor(avg);
                }
                else
                {
                    ctx.fillStyle = "#000";
                }

                ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
            }
        }

        ctx.strokeStyle = "white";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, cellH*4);
        ctx.lineTo(w, cellH*4);
        ctx.stroke();
        ctx.moveTo(cellW*4, 0);
        ctx.lineTo(cellW*4, h);
        ctx.stroke();

    };

})(Monitor = Monitor || {});
