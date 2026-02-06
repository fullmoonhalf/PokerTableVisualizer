(function (ns) {
    "use strict";
	if(	ns.cHtmlBase )
	{
		return;
	}

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cHtmlBase()
    {
    }

    /// <summary>
    /// 更新時刻の更新
    /// </summary>
    cHtmlBase.prototype.createHoleCardsHTML = function (argHoleCards, argClassName, argCapacity)
	{
		let html = "";
		let index = 0;
        if(argHoleCards)
        {
            for(const card of argHoleCards)
            {
                html += `<img class="${argClassName}" src="../Assets/UI/cards_pc-${card}.png">`;
                index++;
            }
        }
		while(index < argCapacity)
		{
			html += `<img class="${argClassName}" src="../Assets/UI/cards_pc-0.png">`;
			index++;
		}
		return html;
	}

    /// <summary>
    /// ボタンを active 状態にする
    /// </summary>
    cHtmlBase.prototype.setActiveButton = function(argButton)
    {
        argButton.classList.toggle("active", true);
        argButton.classList.toggle("inactive", false);
    }

    /// <summary>
    /// ボタンを inactive 状態にする
    /// </summary>
    cHtmlBase.prototype.setInactiveButton = function(argButton)
    {
        argButton.classList.toggle("active", false);
        argButton.classList.toggle("inactive", true);
    }

    /// 公開
    ns.cHtmlBase = cHtmlBase;
})(Monitor = Monitor || {});
