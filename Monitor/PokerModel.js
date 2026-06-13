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

    // =====================================================================
    // カードランク定数 (A=14, K=13, ..., 2=2)
    // =====================================================================
    RANK_A : 14,
    RANK_K : 13,
    RANK_Q : 12,
    RANK_J : 11,
    RANK_T : 10,
    RANK_9 : 9,
    RANK_8 : 8,
    RANK_7 : 7,
    RANK_6 : 6,
    RANK_5 : 5,
    RANK_4 : 4,
    RANK_3 : 3,
    RANK_2 : 2,

    // =====================================================================
    // カードスート定数 (スペード→ハート→ダイヤ→クラブ)
    // =====================================================================
    SUIT_S : "S",
    SUIT_H : "H",
    SUIT_D : "D",
    SUIT_C : "C",

    // =====================================================================
    // ランク表示名 (A-low ストレート用に 1: "A" も定義)
    // =====================================================================
    RankNames : {
        14 : "A",
        13 : "K",
        12 : "Q",
        11 : "J",
        10 : "T",
        9  : "9",
        8  : "8",
        7  : "7",
        6  : "6",
        5  : "5",
        4  : "4",
        3  : "3",
        2  : "2",
        1  : "A",
    },

    // =====================================================================
    // 役名定義
    // =====================================================================
    HandNames : {
        StraightFlush : "ストレートフラッシュ",
        FourOfAKind   : "フォーカード",
        FullHouse     : "フルハウス",
        Flush         : "フラッシュ",
        Straight      : "ストレート",
        ThreeOfAKind  : "スリーカード",
        TwoPair       : "ツーペア",
        OnePair       : "ワンペア",
        HighCard      : "ハイカード",
    },

    // =====================================================================
    // 役強度定義
    // =====================================================================
    HandRanks : {
        StraightFlush : 8,
        FourOfAKind   : 7,
        FullHouse     : 6,
        Flush         : 5,
        Straight      : 4,
        ThreeOfAKind  : 3,
        TwoPair       : 2,
        OnePair       : 1,
        HighCard      : 0,
    },
};

// =====================================================================
// カード定義 (cardIndex 1-52 → { cardIndex, rank, suit })
// スペード(1-13) → ハート(14-26) → ダイヤ(27-39) → クラブ(40-52)
// =====================================================================
(function ()
{
    const suits = [PokerConst.SUIT_S, PokerConst.SUIT_H, PokerConst.SUIT_D, PokerConst.SUIT_C];
    PokerConst.CardDefinitions = {};
    for (let cardIndex = 1; cardIndex <= 52; cardIndex++)
    {
        const i1 = cardIndex - 1;
        const suitIndex = Math.floor(i1 / 13);
        let baseRank = i1 % 13 + 1;
        const rank = (baseRank === 1) ? 14 : baseRank; // Ace は 14
        PokerConst.CardDefinitions[cardIndex] = {
            cardIndex : cardIndex,
            rank      : rank,
            suit      : suits[suitIndex],
        };
    }
})();

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

// =====================================================================
// カード変換・役判定関数
// =====================================================================
(function (ns)
{
    "use strict";
    if (ns.cardIndexToRankSuit) return;

    /// <summary>
    /// RFIDカードインデックスをランク・スート情報に変換する
    /// </summary>
    ns.cardIndexToRankSuit = function(cardIndex)
    {
        const def = PokerConst.CardDefinitions[cardIndex];
        if (!def) return null;
        return { cardIndex: def.cardIndex, rank: def.rank, suit: def.suit };
    };

    /// <summary>
    /// カードインデックス配列をランク・スート情報配列に変換する
    /// 無効なカードが含まれる場合は null を返す
    /// </summary>
    ns.cardIndexesToRankSuits = function(cardIndexes)
    {
        const result = [];
        for (const ci of cardIndexes)
        {
            const card = ns.cardIndexToRankSuit(ci);
            if (card === null) return null;
            result.push(card);
        }
        return result;
    };

    // ---------------------------------------------------------------------
    // 内部: 5枚組の全組み合わせを列挙する
    // ---------------------------------------------------------------------
    function _combinations5(arr)
    {
        const result = [];
        const n = arr.length;
        for (let a = 0; a < n - 4; a++)
        for (let b = a + 1; b < n - 3; b++)
        for (let c = b + 1; c < n - 2; c++)
        for (let d = c + 1; d < n - 1; d++)
        for (let e = d + 1; e < n; e++)
            result.push([arr[a], arr[b], arr[c], arr[d], arr[e]]);
        return result;
    }

    // ---------------------------------------------------------------------
    // 内部: A-low ストレート(A-2-3-4-5)かどうかを判定する
    // ranks は降順ソート済みの5枚のランク配列
    // ---------------------------------------------------------------------
    function _isAceLowStraight(ranks, rankCounts)
    {
        return Object.keys(rankCounts).length === 5 &&
               ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 &&
               ranks[3] === 3  && ranks[4] === 2;
    }

    // ---------------------------------------------------------------------
    // 内部: キッカー表示文字列を生成する（キッカーがない場合は空文字列）
    // ---------------------------------------------------------------------
    function _kickerSuffix(kickers, rankNames)
    {
        return kickers.length > 0 ? ` キッカー(${rankNames[kickers[0]]})` : "";
    }

    // ---------------------------------------------------------------------
    // 内部: 5枚のカードを評価して役判定結果を返す
    // ---------------------------------------------------------------------
    function _evaluate5Cards(cards)
    {
        // ランク降順にソート
        const sorted = [...cards].sort((a, b) => b.rank - a.rank);
        const ranks  = sorted.map(c => c.rank);
        const suits  = sorted.map(c => c.suit);

        // ランク出現回数
        const rankCounts = {};
        for (const r of ranks)
        {
            rankCounts[r] = (rankCounts[r] || 0) + 1;
        }

        // フラッシュ判定
        const isFlush = suits.every(s => s === suits[0]);

        // ストレート判定
        let isStraight     = false;
        let straightHigh   = ranks[0];
        if (Object.keys(rankCounts).length === 5 && ranks[0] - ranks[4] === 4)
        {
            isStraight   = true;
            straightHigh = ranks[0];
        }
        // A-low ストレート: A-2-3-4-5 → 5 High
        if (!isStraight && _isAceLowStraight(ranks, rankCounts))
        {
            isStraight   = true;
            straightHigh = 5;
        }

        // カウント別グループ { 4: [ranks], 3: [ranks], 2: [ranks], 1: [ranks] }
        const countGroups = {};
        for (const [r, cnt] of Object.entries(rankCounts))
        {
            if (!countGroups[cnt]) countGroups[cnt] = [];
            countGroups[cnt].push(parseInt(r));
        }
        for (const k of Object.keys(countGroups))
        {
            countGroups[k].sort((a, b) => b - a);
        }

        let handType, handRank, primaryRank, secondaryRank, kickers, displayName;
        const HN = PokerConst.HandNames;
        const HR = PokerConst.HandRanks;
        const RN = PokerConst.RankNames;

        if (isFlush && isStraight)
        {
            handType      = "StraightFlush";
            handRank      = HR.StraightFlush;
            primaryRank   = straightHigh;
            secondaryRank = null;
            kickers       = [];
            displayName   = `${HN.StraightFlush}(${RN[primaryRank]} High)`;
        }
        else if (countGroups[4])
        {
            handType      = "FourOfAKind";
            handRank      = HR.FourOfAKind;
            primaryRank   = countGroups[4][0];
            secondaryRank = null;
            kickers       = countGroups[1] ? countGroups[1].slice() : [];
            displayName   = `${HN.FourOfAKind}(${RN[primaryRank]})${_kickerSuffix(kickers, RN)}`;
        }
        else if (countGroups[3] && countGroups[2])
        {
            handType      = "FullHouse";
            handRank      = HR.FullHouse;
            primaryRank   = countGroups[3][0];
            secondaryRank = countGroups[2][0];
            kickers       = [];
            displayName   = `${HN.FullHouse}(${RN[primaryRank]}-${RN[secondaryRank]})`;
        }
        else if (isFlush)
        {
            handType      = "Flush";
            handRank      = HR.Flush;
            primaryRank   = ranks[0];
            secondaryRank = null;
            kickers       = ranks.slice(1);
            displayName   = `${HN.Flush}(${RN[primaryRank]} High)`;
        }
        else if (isStraight)
        {
            handType      = "Straight";
            handRank      = HR.Straight;
            primaryRank   = straightHigh;
            secondaryRank = null;
            kickers       = [];
            displayName   = `${HN.Straight}(${RN[primaryRank]} High)`;
        }
        else if (countGroups[3])
        {
            handType      = "ThreeOfAKind";
            handRank      = HR.ThreeOfAKind;
            primaryRank   = countGroups[3][0];
            secondaryRank = null;
            kickers       = countGroups[1] ? countGroups[1].slice() : [];
            displayName   = `${HN.ThreeOfAKind}(${RN[primaryRank]})${_kickerSuffix(kickers, RN)}`;
        }
        else if (countGroups[2] && countGroups[2].length >= 2)
        {
            handType      = "TwoPair";
            handRank      = HR.TwoPair;
            primaryRank   = countGroups[2][0];
            secondaryRank = countGroups[2][1];
            kickers       = countGroups[1] ? countGroups[1].slice() : [];
            displayName   = `${HN.TwoPair}(${RN[primaryRank]}-${RN[secondaryRank]})${_kickerSuffix(kickers, RN)}`;
        }
        else if (countGroups[2])
        {
            handType      = "OnePair";
            handRank      = HR.OnePair;
            primaryRank   = countGroups[2][0];
            secondaryRank = null;
            kickers       = countGroups[1] ? countGroups[1].slice() : [];
            displayName   = `${HN.OnePair}(${RN[primaryRank]})${_kickerSuffix(kickers, RN)}`;
        }
        else
        {
            handType      = "HighCard";
            handRank      = HR.HighCard;
            primaryRank   = ranks[0];
            secondaryRank = null;
            kickers       = ranks.slice(1);
            displayName   = `${HN.HighCard}(${RN[primaryRank]})`;
        }

        return {
            handType      : handType,
            handRank      : handRank,
            cards         : sorted,
            primaryRank   : primaryRank,
            secondaryRank : secondaryRank,
            kickers       : kickers,
            displayName   : displayName,
        };
    }

    // ---------------------------------------------------------------------
    // 内部: 2つの役判定結果を比較する（正: a が強い、負: b が強い、0: 同じ）
    // ---------------------------------------------------------------------
    function _compareHands(a, b)
    {
        if (a.handRank !== b.handRank) return a.handRank - b.handRank;
        if (a.primaryRank !== b.primaryRank) return a.primaryRank - b.primaryRank;
        const ar = a.secondaryRank || 0;
        const br = b.secondaryRank || 0;
        if (ar !== br) return ar - br;
        for (let i = 0; i < Math.max(a.kickers.length, b.kickers.length); i++)
        {
            const ak = a.kickers[i] || 0;
            const bk = b.kickers[i] || 0;
            if (ak !== bk) return ak - bk;
        }
        return 0;
    }

    /// <summary>
    /// カードインデックス配列から最良の役を判定して返す
    /// 引数: RFIDカードインデックス配列 (5〜7枚)
    /// 戻り値: 役判定結果オブジェクト、または null
    /// </summary>
    ns.evaluateHand = function(cardIndexes)
    {
        if (!cardIndexes || cardIndexes.length < 5 || cardIndexes.length > 7) return null;
        const cards = ns.cardIndexesToRankSuits(cardIndexes);
        if (cards === null) return null;

        const combos = _combinations5(cards);
        let best = null;
        for (const combo of combos)
        {
            const result = _evaluate5Cards(combo);
            if (best === null || _compareHands(result, best) > 0)
            {
                best = result;
            }
        }
        return best;
    };

})(PokerModel = PokerModel || {});
