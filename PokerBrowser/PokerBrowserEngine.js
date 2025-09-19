(function (ns) {
	if(	ns.engine )
	{
		return;
	}

	var version = 1.00;

	// BLEデバイス関係
	const BLE_DEVICE_NAME_PREFIX = "PTV_PP_";
	const BLE_DEVICE_PROBE_NAME_DEALER = "Dealer01";
	const UUID_SERVICE = "cbaabb28-4e81-49c4-b775-aedfd27d8db0";
	const UUID_CHARACTERISTIC = "45f116ee-b087-4271-888d-a15eebebd2eb";

	const COMMAND_PROBE_ADD = "command_probe_add"; // ユーザー追加コマンド
	const COMMAND_DEAL_HAND = "command_deal_hand"; // ハンド開始コマンド
	const COMMAND_FIX_HAND = "command_fix_hand"; // ハンド固定コマンド
	const COMMAND_START_FLOP = "command_start_flop"; // フロップ開始コマンド
	const COMMAND_START_TURN = "command_start_turn"; // ターン開始コマンド
	const COMMAND_START_RIVER = "command_start_river"; // リバー開始コマンド
	const COMMAND_END_HAND = "command_end_hand"; // ハンド終了コマンド
	
	const COMMAND_DEV_DEAL_HAND = "command_dev_deal_hands"; // [開発] ハンド配布
	const COMMAND_DEV_DEAL_FLOP = "command_dev_deal_flop"; // [開発] ハンド配布
	const COMMAND_DEV_DEAL_TURN = "command_dev_deal_turn"; // [開発] ハンド配布
	const COMMAND_DEV_DEAL_RIVER = "command_dev_deal_river"; // [開発] ハンド配布

	const SCREEN_USER_LIST = "screen_management_user_list"; // ユーザーリスト表示領域
	const SCREEN_DISPLAY = "screen_display";

	const TEMPLATE_PANEL_CURRENT_HAND = "template_panel_user_current_hand";
	const TEMPLATE_PANEL_PROBE = "template_panel_probe";

	const TEMPLATE_DEALER_CONTROL = "template_panel_dealer_control";
	const TEMPLATE_DEALER_CONTROL_HAND = "template_panel_dealer_probe_hand";
	const TEMPLATE_DEALER_CONTROL_ROUND = "template_panel_dealer_probe_round";
	const TEMPLATE_DEALER_CONTROL_BOARD_FLOP = "template_panel_dealer_probe_flop";
	const TEMPLATE_DEALER_CONTROL_BOARD_TURN = "template_panel_dealer_probe_turn";
	const TEMPLATE_DEALER_CONTROL_BOARD_RIVER = "template_panel_dealer_probe_river";
	const TEMPLATE_DEALER_CONTROL_RSSI = "template_panel_dealer_probe_rssi";
	const TEMPLATE_DEALER_CONTROL_Battery = "template_panel_dealer_probe_battery";
	const TEMPLATE_DEALER_CONTROL_SB_INPUT = "template_panel_dealer_probe_sb_input";
	const TEMPLATE_DEALER_CONTROL_BB_INPUT = "template_panel_dealer_probe_bb_input";
	const TEMPLATE_DEALER_CONTROL_POT_INPUT = "template_panel_dealer_probe_pot_input";

	const TEMPLATE_DEALER_VIEW = "template_panel_dealer_view";
	const TEMPLATE_DEALER_VIEW_DRAG = "template_panel_dealer_view_drag";
	const TEMPLATE_DEALER_VIEW_BOARD_FLOP = "template_panel_dealer_view_flop";
	const TEMPLATE_DEALER_VIEW_BOARD_TURN = "template_panel_dealer_view_turn";
	const TEMPLATE_DEALER_VIEW_BOARD_RIVER = "template_panel_dealer_view_river";
	const TEMPLATE_DEALER_VIEW_BLIND_VALUE = "template_panel_dealer_view_blind_value";
	const TEMPLATE_DEALER_VIEW_POT_VALUE = "template_panel_dealer_view_pot_value";

	const ELEMENT_PANEL_PROBE = "element_panel_probe";

	
	// =====================================================================
	// Dealer 表示オブジェクト
	// =====================================================================
	function cDealerLiveView(argBaseElement)
	{
		this.ElementBase = argBaseElement;
		this.ElementDrag = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_DRAG); 
		this.ElementBoardFlop = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_BOARD_FLOP);
		this.ElementBoardTurn = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_BOARD_TURN);
		this.ElementBoardRiver = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_BOARD_RIVER);
		this.DragControl = new ns.cDragableElement(this.ElementDrag);
		this.ElementBlindValue = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_BLIND_VALUE, "");
		this.ElementPotValue = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_VIEW_POT_VALUE, "0");
	}
	cDealerLiveView.prototype.setBoardFlop = function(argCards)
	{
		this.ElementBoardFlop.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 3);
	}
	cDealerLiveView.prototype.setBoardTurn = function(argCards)
	{
		this.ElementBoardTurn.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 1);
	}
	cDealerLiveView.prototype.setBoardRiver = function(argCards)
	{
		this.ElementBoardRiver.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 1);
	}
	cDealerLiveView.prototype.setPot = function(argPot)
	{
		this.ElementPotValue.innerHTML = argPot;
	}
	cDealerLiveView.prototype.setBlind = function(argBlind)
	{
		this.ElementBlindValue.innerHTML = `Blind: ${argBlind.sb}/${argBlind.bb}`;
	}

	// =====================================================================
	// Dealer 制御オブジェクト
	// =====================================================================
	function cDealerControlView(argBaseElement)
	{
		this.ElementBase = argBaseElement;
		this.ElementHand = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_HAND, "");
		this.ElementRound = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_ROUND, "");
		this.ElementBoardFlop = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_BOARD_FLOP);
		this.ElementBoardTurn = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_BOARD_TURN);
		this.ElementBoardRiver = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_BOARD_RIVER);
		this.ElementRssi = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_RSSI, "");
		this.ElementBattery = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_Battery, "");
		this.InputSB = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_SB_INPUT);
		this.InputBB = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_BB_INPUT);
		this.InputPot = HtmlUtil.searchNodeByClassNameFromChildren(this.ElementBase, TEMPLATE_DEALER_CONTROL_POT_INPUT);
	}
	cDealerControlView.prototype.setRound = function(argRound)
	{
		switch(argRound)
		{
			case PokerConst.BettingRound.DealHand:
				this.ElementRound.innerHTML = "Preflop(deal)";
				break;
			case PokerConst.BettingRound.Preflop:
				this.ElementRound.innerHTML = "Preflop";
				break;
			case PokerConst.BettingRound.Flop:
				this.ElementRound.innerHTML = "Flop";
				break;
			case PokerConst.BettingRound.Turn:
				this.ElementRound.innerHTML = "Turn";
				break;
			case PokerConst.BettingRound.River:
				this.ElementRound.innerHTML = "River";
				break;
		}
	}
	cDealerControlView.prototype.setRSSI = function(argRSSI)
	{
		this.ElementRssi.innerHTML = "R:" + argRSSI;
	}
	cDealerControlView.prototype.setBattery = function(argBattery)
	{
		this.ElementBattery.innerHTML ="B:" + argBattery + "%";
	}
	cDealerControlView.prototype.setHandCount = function(argHandCount)
	{
		this.ElementHand.innerHTML = `Hand: ${argHandCount}`;
	}
	cDealerControlView.prototype.setBoardFlop = function(argCards)
	{
		this.ElementBoardFlop.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 3);
	}
	cDealerControlView.prototype.setBoardTurn = function(argCards)
	{
		this.ElementBoardTurn.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 1);
	}
	cDealerControlView.prototype.setBoardRiver = function(argCards)
	{
		this.ElementBoardRiver.innerHTML = ns.createHoleCardsHTML(argCards, ns.CLASS_CARD_NORMAL, 1);
	}
	cDealerControlView.prototype.addPot = function(argChip)
	{
		let pot = Number(this.InputPot.value) || 0;
		pot += argChip;
		this.InputPot.value = pot;
	}
	cDealerControlView.prototype.getBlind = function()
	{
		let sb = Number(this.InputSB.value) || 0;
		let bb = Number(this.InputBB.value) || 0;
		return {"sb":sb, "bb":bb};
	}
	cDealerControlView.prototype.getPot = function()
	{
		return this.InputPot.value;
	}

	// =====================================================================
	// Dealer オブジェクト
	// =====================================================================
	function cDealerView(argControlBaseElement, argLiveBaseElement)
	{
		this.ControlView = new cDealerControlView(argControlBaseElement);
		this.LiveView = new cDealerLiveView(argLiveBaseElement);
		this.Round = PokerConst.BettingRound.Invalid;
		this.BoardFlop = [];
		this.BoardTurn = [];
		this.BoardRiver = [];
		this.SeatName = BLE_DEVICE_PROBE_NAME_DEALER;
		this.CurrentRound = PokerConst.BettingRound.Invalid;
	}
	cDealerView.prototype.setRSSI = function(argRSSI)
	{
		this.ControlView.setRSSI(argRSSI);
	}
	cDealerView.prototype.setBattery = function(argBattery)
	{
		this.ControlView.setBattery(argBattery);
	}
	cDealerView.prototype.setHoleCards = function(argHoleCards)
	{
		const disp_hole_cards = argHoleCards.sort((a, b) => ns.getCardOrder[a] - ns.getCardOrder[b]);
		switch(this.CurrentRound)
		{
			case PokerConst.BettingRound.Flop:
				this.BoardFlop = disp_hole_cards;
				this.ControlView.setBoardFlop(disp_hole_cards);
				this.LiveView.setBoardFlop(disp_hole_cards);
				PokerBrowser.engine.broadcastWinrate();
				break;
			case PokerConst.BettingRound.Turn:
				this.BoardTurn = disp_hole_cards;
				this.ControlView.setBoardTurn(disp_hole_cards);
				this.LiveView.setBoardTurn(disp_hole_cards);
				PokerBrowser.engine.broadcastWinrate();
				break;
			case PokerConst.BettingRound.River:
				this.BoardRiver = disp_hole_cards;
				this.ControlView.setBoardRiver(disp_hole_cards);
				this.LiveView.setBoardRiver(disp_hole_cards);
				PokerBrowser.engine.broadcastWinrate();
				break;
			default:
				break;
		}
	}
	cDealerView.prototype.setRound = function(argRound)
	{
		this.CurrentRound = argRound;
		this.ControlView.setRound(argRound);
		switch(this.CurrentRound)
		{
			case PokerConst.BettingRound.Flop:
				break;
			case PokerConst.BettingRound.Turn:
				PokerModel.useFlopCards(this.BoardFlop);
				break;
			case PokerConst.BettingRound.River:
				PokerModel.useTurnCards(this.BoardTurn);
				break;
			case PokerConst.BettingRound.EndHand:
				PokerModel.useRiverCards(this.BoardRiver);
				break;
			default:
				break;
		}
	}
	cDealerView.prototype.setHandCount = function(argHandCount)
	{
		this.ControlView.setHandCount(argHandCount);
	}
	cDealerView.prototype.getScanCount = function()
	{
		switch(this.CurrentRound)
		{
			case PokerConst.BettingRound.Flop:
				return 3;
			case PokerConst.BettingRound.Turn:
				return 1;
			case PokerConst.BettingRound.River:
				return 1;
			default:
				return 0;
		}
	}
	cDealerView.prototype.getCurrentCommunityCards = function()
	{
		return this.BoardFlop.concat(this.BoardTurn, this.BoardRiver);
	}
	cDealerView.prototype.toDealed = function()
	{
		this.BoardFlop = [];
		this.BoardTurn = [];
		this.BoardRiver = [];
		this.ControlView.setBoardFlop([]);
		this.LiveView.setBoardFlop([]);
		this.ControlView.setBoardTurn([]);
		this.LiveView.setBoardTurn([]);
		this.ControlView.setBoardRiver([]);
		this.LiveView.setBoardRiver([]);
		this.LiveView.setBlind(this.ControlView.getBlind());
	}
	// ブラインドの取得
	cDealerView.prototype.getBlind = function()
	{
		return this.ControlView.getBlind();
	}
	// ポットの追加
	cDealerView.prototype.addPot = function(argChip)
	{
		this.ControlView.addPot(argChip);
		this.LiveView.setPot(this.ControlView.getPot());
	}

	// =====================================================================
	// engine オブジェクト
	// =====================================================================
	function cEngine()
	{
	}
	// 初期化
	cEngine.prototype.init = function()
	{
		console.log("cEngine.prototype.init");
+
		// HTML 構造の取得
		HtmlUtil.addButtonEventListenerByID(COMMAND_PROBE_ADD, this.onCommandProbeAdd.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEAL_HAND, this.onCommandDealHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_FIX_HAND, this.onCommandFixHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_FLOP, this.onCommandStartFlop.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_TURN, this.onCommandStartTurn.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_START_RIVER, this.onCommandStartRiver.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_END_HAND, this.onCommandEndHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_HAND, this.onCommandDevDealHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_FLOP, this.onCommandDevDealFlop.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_TURN, this.onCommandDevDealTurn.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_RIVER, this.onCommandDevDealRiver.bind(this));
		
		this.ScreenUserList = document.getElementById(SCREEN_USER_LIST);
		this.ScreenDisplay = document.getElementById(SCREEN_DISPLAY);
		this.DealerControlElementBase = document.getElementById(TEMPLATE_DEALER_CONTROL);
		this.TemplateDealerLive = document.getElementById(TEMPLATE_DEALER_VIEW).cloneNode(true);
		this.TemplateSeatLive = document.getElementById(TEMPLATE_PANEL_CURRENT_HAND).cloneNode(true);
		this.TemplateSeatControl = document.getElementById(TEMPLATE_PANEL_PROBE).cloneNode(true);

		// ディスプレイフィールドの初期化
		this.ScreenDisplay.innerHTML = "";

		// ディーラー系コントロールパネルの初期化
		const dealer_live_view = this.TemplateDealerLive.cloneNode(true);
		this.DealerView = new cDealerView(this.DealerControlElementBase, dealer_live_view);
		this.ScreenDisplay.appendChild(dealer_live_view);

		// ユーザー系コントロールパネルの初期化
		this.SeatViews = [];
		this.DealerSeatName = "";
		const element_panel_probes = document.getElementsByClassName(ELEMENT_PANEL_PROBE);
		for(const element of element_panel_probes)
		{
			const id = element.id;
			const seat_control_element = this.TemplateSeatControl.cloneNode(true);
			const seat_view_element = this.TemplateSeatLive.cloneNode(true);
			const view = new ns.cSeatView(id, seat_control_element, seat_view_element);
			this.SeatViews.push(view);

			// HTML の書き換え
			element.innerHTML = "";
			element.appendChild(seat_control_element);
			this.ScreenDisplay.appendChild(seat_view_element);
		}

		//
		this.Probes = [];
		console.log("cEngine.prototype.init - ok");
	}
	// シートビューの取得
	cEngine.prototype.getSeatView = function(argName)
	{
		if(argName == BLE_DEVICE_PROBE_NAME_DEALER)
		{
			return this.DealerView;
		}

		const view = this.SeatViews.find(x => x.SeatName == argName);
		if(view)
		{
			return view;
		}

		const new_view = new cSeatView(argName, this.TemplateProbe);
		this.SeatViews.push(new_view);
		return new_view;
	}

	// ---------------------------------------------------------------------
	// コマンド処理まわり
	// ---------------------------------------------------------------------
	// プローブリスト追加コマンドの処理をする
	cEngine.prototype.onCommandProbeAdd = async function()
	{
		console.log("PokerTableMonitor engine.onCommandAddProbe");
		try {
			// 1. デバイスをスキャン
			const device = await navigator.bluetooth.requestDevice({
				filters: [
					{ services: [UUID_SERVICE]},
					{ namePrefix : [BLE_DEVICE_NAME_PREFIX], }
				]
			});
		
			// 2. GATT サーバへ接続
			const server = await device.gatt.connect();
		
			// 3. サービス取得
			const service = await server.getPrimaryService(UUID_SERVICE);
		
			// 4. キャラクタリスティック取得
			const characteristic = await service.getCharacteristic(UUID_CHARACTERISTIC);

			// 管理オブジェクトとの紐付けを行ない引き渡す
			const probe = new ns.cProbe(characteristic);
			characteristic.addEventListener('characteristicvaluechanged', probe.onCharacteristicValueChanged.bind(probe));
			characteristic.startNotifications();
			this.Probes.push(probe);
		} 
		catch (error) {
			console.error('BLE読み取りエラー:', error);
		}
	}
	// ハンド開始コマンド
	cEngine.prototype.onCommandDealHand = function()
	{
		this.startHand();
		this.broadcastRound(PokerConst.BettingRound.DealHand);
	}
	// ハンド開始コマンド
	cEngine.prototype.onCommandFixHand = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Preflop);
	}
	// フロップ開始コマンド
	cEngine.prototype.onCommandStartFlop = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Flop);
		PokerModel.startFlop();
	}
	// ターン開始コマンド
	cEngine.prototype.onCommandStartTurn = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Turn);
		PokerModel.startTurn();
	}
	// リバー開始コマンド
	cEngine.prototype.onCommandStartRiver = function()
	{
		this.broadcastRound(PokerConst.BettingRound.River);
		PokerModel.startRiver();
	}
	// ハンド終了コマンド
	cEngine.prototype.onCommandEndHand = function()
	{
		this.broadcastRound(PokerConst.BettingRound.EndHand);
	}

	// ---------------------------------------------------------------------
	// コマンド処理まわり(開発オンリー)
	// ---------------------------------------------------------------------
	cEngine.prototype.onCommandDevDealHand = function()
	{
		this.startHand();
		this.broadcastRound(PokerConst.BettingRound.DealHand);
		for(const seat of  this.SeatViews)
		{
			if(seat.isActive())
			{
				const holdcard = [
					PokerModel.CurrentHand.Deck.drawCard(),
					PokerModel.CurrentHand.Deck.drawCard(),
				];
				seat.setHoleCards(holdcard);
			}
		}
	}
	cEngine.prototype.onCommandDevDealFlop = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Flop);
		const holdcard = [
			PokerModel.CurrentHand.Deck.drawCard(),
			PokerModel.CurrentHand.Deck.drawCard(),
			PokerModel.CurrentHand.Deck.drawCard(),
		];
		this.DealerView.setHoleCards(holdcard);
	}
	cEngine.prototype.onCommandDevDealTurn = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Turn);
		const holdcard = [
			PokerModel.CurrentHand.Deck.drawCard(),
		];
		this.DealerView.setHoleCards(holdcard);
	}
	cEngine.prototype.onCommandDevDealRiver = function()
	{
		this.broadcastRound(PokerConst.BettingRound.River);
		const holdcard = [
			PokerModel.CurrentHand.Deck.drawCard(),
		];
		this.DealerView.setHoleCards(holdcard);
	}
	// ---------------------------------------------------------------------
	// 論理設定
	// ---------------------------------------------------------------------
	// ハンド開始時の処理
	cEngine.prototype.startHand = function()
	{
		// ボタンを更新して、ポジション情報を更新する。
		if(PokerModel.getCurrentHandCount() > 0)
		{
			const button_index = this.SeatViews.findIndex(x => x.SeatName == this.DealerSeatName);
			if(button_index >= 0)
			{
				for(let count=0; count<this.SeatViews.length; ++count)
				{
					let index = (button_index + count + 1) % this.SeatViews.length;
					const seat = this.SeatViews[index];
					if(seat.isAlive())
					{
						this.setButton(seat.SeatName);
						break;
					}
				}
			}
		}

		// ハンドカウントを進める
		PokerModel.startHand();
		this.DealerView.setHandCount(PokerModel.getCurrentHandCount());

		// シートの状態の初期化
		const blind = this.DealerView.getBlind();
		this.DealerView.toDealed();
		for(const seat of this.SeatViews)
		{
			seat.toDealed();
			if(seat.isBB())
			{
				let post_chip = seat.postBlind(blind.bb);
				this.DealerView.addPot(post_chip);
				post_chip = seat.postAnti(blind.bb);
				this.DealerView.addPot(post_chip);
			}
			else if(seat.isSB())
			{
				let post_chip = seat.postBlind(blind.sb);
				this.DealerView.addPot(post_chip);
			}
		}
	}
	// ボタンの設定
	cEngine.prototype.setButton = function(argSeatName)
	{
		this.DealerSeatName = "";
		let alive_player_num = 0;
		for(const seat of this.SeatViews)
		{
			if(seat.isAlive())
			{
				++alive_player_num;
			}
		}

		const button_index = this.SeatViews.findIndex(x => x.SeatName == argSeatName);
		if(button_index < 0)
		{
			return;
		}

		this.DealerSeatName = argSeatName;
		let position_index = alive_player_num - 1;
		for(let count=0; count<this.SeatViews.length; ++count)
		{
			let index = (button_index + count + 1) % this.SeatViews.length;
			const seat = this.SeatViews[index];
			if(seat.isAlive())
			{
				seat.setPosition(position_index, alive_player_num);
				position_index--;
			}
		}
	}
	// ラウンドの設定
	cEngine.prototype.broadcastRound = function(argRound)
	{
		this.SeatViews.forEach(x => x.setRound(argRound));
		this.DealerView.setRound(argRound);
		this.Probes.forEach(x => x.proceedRound());
	}

	cEngine.prototype.broadcastWinrate = function()
	{
		// 現在の制約上、フロップが開くまでは確率表示できない。
		const community_cards = this.DealerView.getCurrentCommunityCards();
		if(community_cards.length < 3)
		{
			return;
		}

		// 勝率計算処理に食わせられるようにする
		let index_table = [];
		let hand_info = [];
		for(let index=0; index<this.SeatViews.length; ++index)
		{
			const seat = this.SeatViews[index];
			if(!seat.isActive())
			{
				continue;
			}
			if(seat.CurrentHoleCards.length < 2)
			{
				continue;
			}
			index_table.push(index);
			hand_info.push(seat.CurrentHoleCards);
		}

		// 勝率計算
		const result = WinRate.calc(hand_info, community_cards, [])
		for(let result_index=0; result_index<result.infos.length; ++result_index)
		{
			const access_index = index_table[result_index];
			const seat = this.SeatViews[access_index];
			const result_unit = result.infos[result_index];
			const rate = Math.round((result_unit.win * 100 / result_unit.comb));
			seat.setWinRate(rate);
		}
	}

	// =====================================================================
	// エンジンオブジェクト生成
	// =====================================================================
	PokerBrowser.engine = new cEngine();
})(PokerBrowser = PokerBrowser || {});


(function(){
	if(document.readyState === "loading")
	{
		document.addEventListener("DOMContentLoaded", PokerBrowser.engine.init.bind(PokerBrowser.engine));
	}
	else
	{
		PokerBrowser.engine.init();
	}
})();