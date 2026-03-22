(function (ns) {
    "use strict";
    if (ns.CardListView) return;

    ns.CardListView = {};

    /// <summary>
    /// カード番号から画像パスへ変換する（0 = 裏面）
    /// </summary>
    ns.CardListView.getCardImagePath = function(argCardNumber)
    {
        return `../Assets/UI/cards_m5-${argCardNumber}.jpg`;
    }

    /// <summary>
    /// カードリスト HTML を生成する（汎用処理）
    /// argAllCards : 表示対象のカード番号配列
    /// argUsedSet  : 裏面表示対象のカード番号 Set（null 可）
    /// </summary>
    ns.CardListView.createCardListHTML = function(argAllCards, argUsedSet)
    {
        let html = `<div class="CARD_LIST_GRID">`;
        for (const cardNumber of argAllCards)
        {
            const isUsed = argUsedSet != null && argUsedSet.has(cardNumber);
            const displayNumber = isUsed ? 0 : cardNumber;
            const imgSrc = ns.CardListView.getCardImagePath(displayNumber);
            html += `<img class="CARD_LIST_ITEM" src="${imgSrc}">`;
        }
        html += `</div>`;
        return html;
    }

})(Monitor = Monitor || {});
