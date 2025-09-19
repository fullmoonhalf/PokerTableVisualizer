(function (ns) {
	if(	ns.engine )
	{
		return;
	}

	var version = 1.00;

	// BLEデバイス関係
	const BLE_DEVICE_NAME_PREFIX = "PTV_PP_";
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
	const TEMPLATE_DEALER_VIEW = "template_panel_dealer_view";

	const ELEMENT_PANEL_PROBE = "element_panel_probe";

	
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
		this.DealerView = new ns.cDealerView(this.DealerControlElementBase, dealer_live_view);
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

		const new_view = new ns.cSeatView(argName, this.TemplateProbe);
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