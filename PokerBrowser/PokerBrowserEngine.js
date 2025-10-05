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
	const COMMAND_DEV_SETUP = "command_dev_setup";

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
		this.CommandPhaseStartDealHand = HtmlUtil.addButtonEventListenerByID(COMMAND_DEAL_HAND, this.onCommandDealHand.bind(this));
		this.CommandPhaseStartDealFixHand = HtmlUtil.addButtonEventListenerByID(COMMAND_FIX_HAND, this.onCommandFixHand.bind(this));
		this.CommandPhaseStartFlop = HtmlUtil.addButtonEventListenerByID(COMMAND_START_FLOP, this.onCommandStartFlop.bind(this));
		this.CommandPhaseStartTurn = HtmlUtil.addButtonEventListenerByID(COMMAND_START_TURN, this.onCommandStartTurn.bind(this));
		this.CommandPhaseStartRiver = HtmlUtil.addButtonEventListenerByID(COMMAND_START_RIVER, this.onCommandStartRiver.bind(this));
		this.CommandPhaseStartEndHand = HtmlUtil.addButtonEventListenerByID(COMMAND_END_HAND, this.onCommandEndHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_HAND, this.onCommandDevDealHand.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_FLOP, this.onCommandDevDealFlop.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_TURN, this.onCommandDevDealTurn.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_DEAL_RIVER, this.onCommandDevDealRiver.bind(this));
		HtmlUtil.addButtonEventListenerByID(COMMAND_DEV_SETUP, this.onCommandDevSetup.bind(this));
		
		this.CommandPhaseButtons = [this.CommandPhaseStartDealHand, this.CommandPhaseStartDealFixHand, this.CommandPhaseStartFlop, this.CommandPhaseStartTurn, this.CommandPhaseStartRiver, this.CommandPhaseStartEndHand ];
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
		this.DealerSeat = null;
		this.CurrentRound = PokerConst.BettingRound.Invalid;
		const element_panel_probes = document.getElementsByClassName(ELEMENT_PANEL_PROBE);
		for(const element of element_panel_probes)
		{
			const id = element.id;
			const seat_control_element = this.TemplateSeatControl.cloneNode(true);
			const seat_view_element = this.TemplateSeatLive.cloneNode(true);
			const view = new ns.cSeatView(id, seat_control_element, seat_view_element);
			view.setActionReceiver(this);
			this.SeatViews.push(view);

			// HTML の書き換え
			element.innerHTML = "";
			element.appendChild(seat_control_element);
			this.ScreenDisplay.appendChild(seat_view_element);
		}

		// シートの構造設定
		for(let index=0; index<this.SeatViews.length; ++index)
		{
			const next_index = (index + 1) % this.SeatViews.length;
			const next_seat = this.SeatViews[next_index];
			const seat = this.SeatViews[index];
			seat.setNextSeat(next_seat);
		}

		// プローブリスト
		this.Probes = [];
		console.log("cEngine.prototype.init - ok");
	}
	// シートビューの取得
	cEngine.prototype.getSeatView = function(argName)
	{
		if(argName == ns.BLE_DEVICE_PROBE_NAME_DEALER)
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
	}
	// ハンド開始コマンド
	cEngine.prototype.onCommandFixHand = function()
	{
		this.startFixHand();
	}
	// フロップ開始コマンド
	cEngine.prototype.onCommandStartFlop = function()
	{
		this.startFlop();
	}
	// ターン開始コマンド
	cEngine.prototype.onCommandStartTurn = function()
	{
		this.startTurn();
	}
	// リバー開始コマンド
	cEngine.prototype.onCommandStartRiver = function()
	{
		this.startRiver();
	}
	// ハンド終了コマンド
	cEngine.prototype.onCommandEndHand = function()
	{
		this.startEndHand();
	}
	// テスト用セットアップ
	cEngine.prototype.onCommandDevSetup = function()
	{
		const seat_list = [
			{"target": "Seat01", "stack": 20000, "dealer":false, "view_panel_x": 176, "view_panel_y": 176, },
			{"target": "Seat02", "stack": 20000, "dealer":false, "view_panel_x": 320, "view_panel_y": 240, },
			{"target": "Seat04", "stack": 20000, "dealer":true , "view_panel_x": 320, "view_panel_y": 304, },
			{"target": "Seat06", "stack": 20000, "dealer":false, "view_panel_x": 176, "view_panel_y": 368, },
			{"target": "Seat07", "stack": 20000, "dealer":false, "view_panel_x":  48, "view_panel_y": 304, },
			{"target": "Seat08", "stack": 20000, "dealer":false, "view_panel_x":  48, "view_panel_y": 240, },
		]
		
		this.DealerView.setBlind(50, 100);
		let dealer_seat = null;
		for(const seat_conf of seat_list)
		{
			const seat = this.getSeatView(seat_conf.target);
			seat.onCommandAlive(null);
			seat.setStack(seat_conf.stack);
			if(seat_conf.dealer)
			{
				dealer_seat = seat;
			}
			seat.SeatLive.DragControl.setPosition(seat_conf.view_panel_x, seat_conf.view_panel_y);
			seat.SeatLive.DragControl.apply();
		}
		if(dealer_seat)
		{
			this.setButton(dealer_seat);
		}
	}

	// ---------------------------------------------------------------------
	// 通知受け
	// ---------------------------------------------------------------------
	cEngine.prototype.notifySeatFold = function(argSeatView)
	{
		this.setCurrentActorSeat(this.getNextActiveSeat(argSeatView));
		this.broadcastWinrate();
	}
	// コール
	cEngine.prototype.notifySeatCall = function(argSeatView)
	{
		const to_call_amount = this.DealerView.getToCallAmount();

		// check になる場合
		if(to_call_amount == 0)
		{
			argSeatView.addBetAmount("Check", 0);
			this.setCurrentActorSeat(this.getNextActiveSeat(argSeatView));
			return true;
		}

		// コールになる場合
		const stack = argSeatView.getStack();
		if(to_call_amount > stack)
		{
			return false;
		}

		const current_bet = argSeatView.getBetAmount();
		const call_amount = to_call_amount - current_bet;
		if(call_amount <= 0)
		{
			return false;
		}

		// コールが成立したので、ポットに追加する。
		const actual_bet_amount = argSeatView.addBetAmount("CALL", call_amount);
		this.DealerView.addPot(actual_bet_amount);

		// 次のシートへ
		this.setCurrentActorSeat(this.getNextActiveSeat(argSeatView));

		return true;
	}
	// アグレッシブアクション系
	cEngine.prototype.notifySeatAggressiveAction = function(argSeatView)
	{
		const threshold = this.DealerView.getMinimumRaiseAmount();
		const input_amount = argSeatView.getBetInputAmount();
		
		// 基準額に達しているかを確認
		if(input_amount < threshold)
		{
			return false;
		}

		// スタック足りてるかを確認
		const stack = argSeatView.getStack();
		if(input_amount > stack)
		{
			return false;
		}

		// 実際のベット額を計算
		const current_bet = argSeatView.getBetAmount();
		const bet_amount = input_amount - current_bet;
		if(bet_amount <= 0)
		{
			return false;
		}

		// ベットが成立したので、ポッドに追加する
		const actual_bet_amount = argSeatView.addBetAmount("Raise", bet_amount);
		this.DealerView.addPot(actual_bet_amount);

		// 必要コール額・レイズ額の更新
		const to_call_amount = this.DealerView.getToCallAmount();
		const next_minimum_raize_amount = input_amount + input_amount - to_call_amount;
		this.DealerView.setToCallAmount(input_amount);
		this.DealerView.setMinimumRaiseAmount("Minimum Raise: ", next_minimum_raize_amount);

		// 次のシートへ
		this.setCurrentActorSeat(this.getNextActiveSeat(argSeatView));

		return true;
	}

	cEngine.prototype.notifySeatAllin = function(argSeatView)
	{
		this.broadcastWinrate();
	}
	cEngine.prototype.notifySeatEntry = function(argSeatView)
	{
		this.broadcastWinrate();
	}
	cEngine.prototype.notifySeatOpen = function(argSeatView)
	{
		this.broadcastWinrate();
	}

	// ---------------------------------------------------------------------
	// コマンド処理まわり(開発オンリー)
	// ---------------------------------------------------------------------
	cEngine.prototype.onCommandDevDealHand = function()
	{
		this.startHand();
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
	// フェイズ処理
	// ---------------------------------------------------------------------
	// ハンド開始時の処理
	cEngine.prototype.startHand = function()
	{
		// ボタンを更新して、ポジション情報を更新する。
		if(PokerModel.getCurrentHandCount() > 0)
		{
			this.setButton(this.getNextAliveSeat(this.DealerSeat));
		}

		// ハンドカウントを進める
		PokerModel.startHand();
		this.DealerView.setHandCount(PokerModel.getCurrentHandCount());

		// フェーズ開始の通知
		this.broadcastRound(PokerConst.BettingRound.DealHand);

		// ブラインドの支払いとアクターシートを決める
		this.CurrentActorSeat = null;
		const blind = this.DealerView.getBlind();
		for(let index=0; index<this.SeatViews.length; ++index)
		{
			const seat = this.SeatViews[index];
			if(seat.isSB())
			{
				let post_chip = seat.postBlind(blind.sb);
				this.DealerView.addPot(post_chip);
			}
			else if(seat.isBB())
			{
				let post_chip = seat.postBlind(blind.bb);
				this.DealerView.addPot(post_chip);
				post_chip = seat.postAnti(blind.bb);
				this.DealerView.addPot(post_chip);
				this.setCurrentActorSeat(this.getNextAliveSeat(seat));
			}
		}
	}

	cEngine.prototype.startFixHand = function()
	{
		this.broadcastRound(PokerConst.BettingRound.Preflop);
	}
	// Flop 開始時の処理
	cEngine.prototype.startFlop = function()
	{
		PokerModel.startFlop();
		this.setCurrentActorSeat(this.getFirstActorAfterPreflop());
		this.broadcastRound(PokerConst.BettingRound.Flop);
	}
	cEngine.prototype.startTurn = function()
	{
		PokerModel.startTurn();
		this.setCurrentActorSeat(this.getFirstActorAfterPreflop());
		this.broadcastRound(PokerConst.BettingRound.Turn);
	}
	cEngine.prototype.startRiver = function()
	{
		PokerModel.startRiver();
		this.setCurrentActorSeat(this.getFirstActorAfterPreflop());
		this.broadcastRound(PokerConst.BettingRound.River);
	}
	// ハンドの決着がついた
	cEngine.prototype.startEndHand = function()
	{
		const FinishRound = this.CurrentRound;

		// ノーコールで決着
		if(this.winByNoCall())
		{
			this.broadcastRound(PokerConst.BettingRound.EndHand);
		}

		// ショウダウン
	}

	// ノーコールで決着がついた場合の処理
	cEngine.prototype.winByNoCall = function()
	{
		let active_count = this.getActiveCount();
		if(active_count > 1)
		{
			return false;
		}

		const pot = this.DealerView.getPot();
		const winner_seat = this.SeatViews.find(x => x.isActive());
		if(winner_seat)
		{
			winner_seat.addStack(pot);
		}
		return true;
	}

	cEngine.prototype.winByShowdown = function()
	{
		if(FinishRound == PokerConst.BettingRound.River)
		{
		}

		return false;
	}

	// ---------------------------------------------------------------------
	// アクター関連
	// ---------------------------------------------------------------------
	cEngine.prototype.setCurrentActorSeat = function(argSeat)
	{
		this.CurrentActorSeat = argSeat;
		if(!this.CurrentActorSeat)
		{
			return;
		}

		this.CurrentActorSeat.setCurrentActor();
		for(let seat = argSeat.getNextSeat(); seat != argSeat; seat = seat.getNextSeat())
		{
			seat.resetCurrentActor();
		}
	}

	// ---------------------------------------------------------------------
	// 
	// ---------------------------------------------------------------------
	// 次の生存を取得する
	cEngine.prototype.getNextAliveSeat = function(argSeat)
	{
		for(let seat = argSeat.getNextSeat(); seat != argSeat; seat = seat.getNextSeat())
		{
			if(seat.isAlive())
			{
				return seat;
			}
		}
		return null;
	}
	// 次のアクティブを取得する
	cEngine.prototype.getNextActiveSeat = function(argSeat)
	{
		for(let seat = argSeat.getNextSeat(); seat != argSeat; seat = seat.getNextSeat())
		{
			if(seat.isActive())
			{
				return seat;
			}
		}
		return null;
	}
	// プリフロップ以降の最初のプレイヤーを取得
	cEngine.prototype.getFirstActorAfterPreflop = function()
	{
		const first_actor = this.getNextActiveSeat(this.DealerSeat);
		if(first_actor)
		{
			return first_actor;
		}
		if(this.DealerSeat.isActive())
		{
			return this.DealerSeat;
		}
		return null;
	}
	// アクティブプレイヤーの数を数える
	cEngine.prototype.getActiveCount = function()
	{
		let count = 0;
		for(let index=0; index<this.SeatViews.length; ++index)
		{
			const seat = this.SeatViews[index];
			if(seat.isActive())
			{
				count++;
			}
		}
		return count;
	}


	// ---------------------------------------------------------------------
	// 
	// ---------------------------------------------------------------------
	// ボタンの設定
	cEngine.prototype.setButton = function(argSeat)
	{
		this.DealerSeat = argSeat;
		if(!this.DealerSeat)
		{
			return;
		}

		// 生存者カウント
		let alive_player_num = 0;
		for(const seat of this.SeatViews)
		{
			if(seat.isAlive())
			{
				++alive_player_num;
			}
		}

		// ポジションの計算(ディーラーに対する残り人数)
		const button_index = this.SeatViews.findIndex(x => x == argSeat)
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
			else
			{
				// シートオープンを意味する。
				seat.setPosition(0, 0);
			}
		}
	}


	// ---------------------------------------------------------------------
	// 各要素への通達
	// ---------------------------------------------------------------------
	// ラウンドの設定
	cEngine.prototype.broadcastRound = function(argRound)
	{
		this.CurrentRound = argRound;
		this.DealerView.setRound(argRound);
		this.SeatViews.forEach(x => x.setRound(argRound));
		this.Probes.forEach(x => x.proceedRound());
	}
	// 勝率の通知
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