(function (ns) {
    "use strict";
    if(ns.createHoleCardsHTML) return;
    if(ns.cDragableElement) return;

	// カードにつかうcssクラス名
	ns.CLASS_CARD_SMALL = "template_card_hand_small";
	ns.CLASS_CARD_NORMAL = "template_card_hand";

	// =====================================================================
	// ポジション関連
	// =====================================================================
	// ポジション名
	ns.POKER_POSITION_DEALER = "D";
	ns.POKER_POSITION_CUTOFF = "CO";
	ns.POKER_POSITION_HIJACK = "HJ";
	ns.POKER_POSITION_MIDDLEp1 = "MP+1";
	ns.POKER_POSITION_MIDDLE = "MP";
	ns.POKER_POSITION_UTGp2 = "UTG+2";
	ns.POKER_POSITION_UTGp1 = "UTG+1";
	ns.POKER_POSITION_UTG = "UTG";
	ns.POKER_POSITION_BB = "BB";
	ns.POKER_POSITION_SB = "SB";
	ns.POKER_POSITION_OPENSEAT = "-";

	// ポジションリスト。ポジションの悪い方から
	const POKER_POSITION_TABLE = [
		// あると便利なので定義してるだけ
		[ns.POKER_POSITION_OPENSEAT],
		[ns.POKER_POSITION_DEALER],
		// ヘッズアップ
		[ns.POKER_POSITION_DEALER, ns.POKER_POSITION_BB],
		// 3 名
		[ns.POKER_POSITION_DEALER, ns.POKER_POSITION_BB, ns.POKER_POSITION_SB],
		// 4 名
		[ns.POKER_POSITION_DEALER, ns.POKER_POSITION_UTG, ns.POKER_POSITION_BB, ns.POKER_POSITION_SB],
		// 5 名
		[ns.POKER_POSITION_DEALER, ns.POKER_POSITION_MIDDLE, ns.POKER_POSITION_UTG, ns.POKER_POSITION_BB, ns.POKER_POSITION_SB],
		// 6 名
		[ns.POKER_POSITION_DEALER, ns.POKER_POSITION_CUTOFF, ns.POKER_POSITION_HIJACK, ns.POKER_POSITION_UTG, ns.POKER_POSITION_BB, ns.POKER_POSITION_SB],
		// 7 名
		[ns.POKER_POSITION_DEALER, ns.POKER_POSITION_CUTOFF, ns.POKER_POSITION_HIJACK, ns.POKER_POSITION_MIDDLE, ns.POKER_POSITION_UTG, ns.POKER_POSITION_BB, ns.POKER_POSITION_SB],
		// 8 名
		[ns.POKER_POSITION_DEALER, ns.POKER_POSITION_CUTOFF, ns.POKER_POSITION_HIJACK, ns.POKER_POSITION_MIDDLE, ns.POKER_POSITION_UTGp1, ns.POKER_POSITION_UTG, ns.POKER_POSITION_BB, ns.POKER_POSITION_SB],
		// 9 名
		[ns.POKER_POSITION_DEALER, ns.POKER_POSITION_CUTOFF, ns.POKER_POSITION_HIJACK, ns.POKER_POSITION_MIDDLEp1, ns.POKER_POSITION_MIDDLE, ns.POKER_POSITION_UTGp1, ns.POKER_POSITION_UTG, ns.POKER_POSITION_BB, ns.POKER_POSITION_SB],
		// 10 名
		[ns.POKER_POSITION_DEALER, ns.POKER_POSITION_CUTOFF, ns.POKER_POSITION_HIJACK, ns.POKER_POSITION_MIDDLEp1, ns.POKER_POSITION_MIDDLE, ns.POKER_POSITION_UTGp2, ns.POKER_POSITION_UTGp1, ns.POKER_POSITION_UTG, ns.POKER_POSITION_BB, ns.POKER_POSITION_SB],
	];

	// 人数とディーラーに対しての残り人数からポジションを求める。
	ns.convertPositionName = function(argPlayerCount, argPositionIndex)
	{
		return POKER_POSITION_TABLE[argPlayerCount][argPositionIndex];
	}


	// =====================================================================
	// カードの表示順関連
	// =====================================================================
	// カードの表示順
	const CARD_ORDER = [
		0,
	//	A,  2,  3,  4,  5,  6,  7,  8,  9,  T,  J,  Q, K
		1, 49, 45, 41, 37, 33, 29, 25, 21, 17, 13,  9, 5,
		2, 50, 46, 42, 38, 34, 30, 26, 22, 18, 14, 10, 6,
		3, 51, 47, 43, 39, 35, 31, 27, 23, 19, 15, 11, 7,
		4, 52, 48, 44, 40, 36, 32, 28, 24, 20, 16, 12, 8,
	]
	ns.getCardOrder = function(argCardIndex)
	{
		return CARD_ORDER[argCardIndex];
	}

	// =====================================================================
	// ユーティリティ
	// =====================================================================
    ns.createHoleCardsHTML = function (argHoleCards, argClassName, argCapacity)
	{
		let html = "";
		let index = 0;
		for(const card of argHoleCards)
		{
			html += `<img class="${argClassName}" src="../Assets/UI/cards_pc-${card}.png">`;
			index++;
		}
		while(index < argCapacity)
		{
			html += `<img class="${argClassName}" src="../Assets/UI/cards_pc-0.png">`;
			index++;
		}
		return html;
	}


	// =====================================================================
	// DnDまわり
	// =====================================================================
	function cDragableElement(argElement)
	{
		this.TargetElement = argElement;
		HtmlUtil.addEventListenerToElement(argElement, "pointerdown", this.onDragStart.bind(this));
		HtmlUtil.addEventListenerToElement(argElement, "pointermove", this.onDragMove.bind(this));
		HtmlUtil.addEventListenerToElement(argElement, "pointerup", this.onDragEnd.bind(this));
		HtmlUtil.addEventListenerToElement(argElement, "pointercancel", this.onDragEnd.bind(this));

		this.Draggning = false;
		this.DragPrevX = 0;
		this.DragPrevY = 0;
		this.TransX = 0;
		this.TransY = 0;
	}
	cDragableElement.prototype.onDragStart = function(event)
	{
		event.preventDefault();
		this.Draggning = true;
		this.DragPrevX = event.clientX;
		this.DragPrevY = event.clientY;
	}
	cDragableElement.prototype.onDragMove = function(event)
	{
		const grid_size = 16;
		if(this.Draggning)
		{
			let dx = event.clientX - this.DragPrevX;
			let dy = event.clientY - this.DragPrevY;
			this.TransX += dx;
			this.TransY += dy;
			this.DragPrevX = event.clientX;
			this.DragPrevY = event.clientY;
			const nx = Math.round(this.TransX/grid_size)*grid_size;
			const ny = Math.round(this.TransY/grid_size)*grid_size;
			this.TargetElement.style.transform = `translate(${nx}px, ${ny}px)`;
		}
	}
	cDragableElement.prototype.onDragEnd = function(event)
	{
		this.Draggning = false;
	}


    ns.cDragableElement = cDragableElement;
})(PokerBrowser = PokerBrowser || {});
