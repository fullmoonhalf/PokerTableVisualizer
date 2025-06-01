var PokerTableMonitor = PokerTableMonitor || {};
PokerTableMonitor.engine = (function(){{
	var version = 0.00;

	// BLEデバイス関係
	const BLE_DEVICE_NAME_PREFIX = "PTV_PP_";
	const BLE_DEVICE_PROBE_NAME_DEALER_PREFIX = "Dealer";
	const UUID_SERVICE = "cbaabb28-4e81-49c4-b775-aedfd27d8db0";
	const UUID_CHARACTERISTIC = "45f116ee-b087-4271-888d-a15eebebd2eb";

	// 操作関係
	const HTML_ID_COMMAND_ADD_PROBE = "command_add_probe";
	const HTML_ID_COMMAND_NEXT_HAND = "command_next_hand";
	const HTML_ID_COMMAND_DUMP_STATUS = "command_dump_status";
	const HTML_ID_COMMAND_TO_FLOP = "command_to_flop";
	const HTML_ID_COMMAND_TO_TURN = "command_to_turn";
	const HTML_ID_COMMAND_TO_RIVER = "command_to_river";
	const HTML_ID_COMMAND_TEST = "command_test";
	const HTML_ID_COMMAND_DEV_DEAL_HAND = "command_dev_deal_hand";
	const HTML_ID_COMMAND_DEV_FLOP = "command_dev_flop";
	const HTML_ID_COMMAND_DEV_TURN = "command_dev_turn";
	const HTML_ID_COMMAND_DEV_RIVER = "command_dev_river";

	// HTML の構造まわり
	const HTML_ID_SECTOR_PLAYER = "sector_player";
	const HTML_ID_PLAYER_VIEEPANEL_PREFIX = "view_panel_player_";
	const HTML_ID_SECTOR_GLOBAL = "sector_global";
	const HTML_CLASS_PANEL_PLAYER = "panel_player";

	const HTML_CLASS_PANEL_PLAYER_NAME_VALUE = "panel_player_name_value";
	const HTML_CLASS_PANEL_PLAYER_HAND_VALUE = "panel_player_hand_value";
	const HTML_CLASS_PANEL_PLAYER_HAND_IMG_STYLE = "panel_player_hand_image_style";
	const HTML_CLASS_PANEL_PLAYER_LOG_VALUE = "panel_player_log_value";
	const HTML_CLASS_PANEL_PLAYER_LOG_UNIT = "panel_player_log_unit";
	const HTML_CLASS_PANEL_PLAYER_LOG_COUNT = "panel_player_log_count";
	const HTML_CLASS_PANEL_PLAYER_LOG_HAND = "panel_player_log_hand";
	const HTML_CLASS_PANEL_PLAYER_LOG_ACTION = "panel_player_log_action";
	const HTML_CLASS_PANEL_PLAYER_LOG_HAND_IMG_STYLE = "panel_player_log_hand_image_style";
	const HTML_CLASS_PANEL_PLAYER_POSITION_VALUE = "panel_player_position_value";
	const HTML_CLASS_PANEL_PLAYER_POSITION_EXIST = "panel_player_position_exist";
	const HTML_CLASS_PANEL_PLAYER_POSITION_EXIST_TRUE = "panel_player_position_exist_alive";
	const HTML_CLASS_PANEL_PLAYER_POSITION_EXIST_FALSE = "panel_player_position_exist_seat_open";
	const HTML_CLASS_PANEL_PLAYER_POSITION_NAME = "panel_player_position_name";
	const HTML_CLASS_PANEL_PLAYER_POSITION_DEALER = "panel_player_position_dealer_button";
	const HTML_CLASS_PANEL_PLAYER_POSITION_DEALER_HAVE = "panel_player_position_dealer_button_have";
	const HTML_CLASS_PANEL_PLAYER_WINRATE_VALUE = "panel_player_winrate_value";
	const HTML_CLASS_PANEL_PLAYER_COMMAND_FOLD = "panel_player_command_fold";
	const HTML_CLASS_PANEL_PLAYER_COMMAND_CALL = "panel_player_command_call";
	const HTML_CLASS_PANEL_PLAYER_COMMAND_AGGRESSIVE_ACTION = "panel_player_command_aggressive_action";
	const HTML_CLASS_PANEL_PLAYER_PROBE_CONNECTOR = "panel_player_probe_connector";

	const HTML_CLASS_PANEL_GLOBAL_HAND = "global_hand_count_value";
	const HTML_CLASS_PANEL_GLOBAL_HAND_NUMBER = "global_hand_count_number";
	const HTML_CLASS_PANEL_GLOBAL_HAND_PHASE = "global_hand_count_phase";
	const HTML_CLASS_PANEL_GLOBAL_COMMUNITY_CARDS = "global_community_cards_value";
	const HTML_CLASS_PANEL_GLOBAL_COMMUNITY_CARDS_FLOP = "global_community_cards_flop";
	const HTML_CLASS_PANEL_GLOBAL_COMMUNITY_CARDS_TURN = "global_community_cards_turn";
	const HTML_CLASS_PANEL_GLOBAL_COMMUNITY_CARDS_RIVER = "global_community_cards_river";
	const HTML_CLASS_PANEL_GLOBAL_PROBE_CONNECTOR = "panel_dealer_probe_connector";
	const HTML_CLASS_PANEL_GLOBAL_DECK_VALUE = "global_deck_contents";
	const HTML_CLASS_PANEL_GLOBAL_DECK_IMAGE = "global_community_cards_card";
	const HTML_CLASS_PANEL_GLOBAL_DECK_SUIT = "global_community_cards_suit";
	const HTML_CLASS_PANEL_GLOBAL_DECK_IMAGE_USED = "global_community_cards_card_used";
	const HTML_CLASS_PANEL_GLOBAL_DECK_IMAGE_INDECK = "global_community_cards_card_in_deck";

	const HTML_CLASS_PANEL_PROBE_INFORMATION_GROUP = "panel_probe_information_group"
	const HTML_CLASS_PANEL_PROBE_INFORMATION_RSSI_VALUE = "panel_probe_information_rssi_value";
	const HTML_CLASS_PANEL_PROBE_INFORMATION_THRESHOLD = "panel_probe_information_threshold";

	// ポジション名
	const POKER_POSITION_DEALER = "D";
	const POKER_POSITION_CUTOFF = "CO";
	const POKER_POSITION_HIJACK = "HJ";
	const POKER_POSITION_MIDDLEp1 = "MP+1";
	const POKER_POSITION_MIDDLE = "MP";
	const POKER_POSITION_UTGp2 = "UTG+2";
	const POKER_POSITION_UTGp1 = "UTG+1";
	const POKER_POSITION_UTG = "UTG";
	const POKER_POSITION_BB = "BB";
	const POKER_POSITION_SB = "SB";
	const POKER_POSITION_OPENSEAT = "-";

	// ポジションリスト。ポジションの悪い方から
	const POKER_POSITION_TABLE = [
		// あると便利なので定義してるだけ
		[POKER_POSITION_OPENSEAT],
		[POKER_POSITION_DEALER],
		// ヘッズアップ
		[POKER_POSITION_BB, POKER_POSITION_DEALER],
		// 3 名
		[POKER_POSITION_SB, POKER_POSITION_BB, POKER_POSITION_DEALER],
		// 4 名
		[POKER_POSITION_SB, POKER_POSITION_BB, POKER_POSITION_UTG, POKER_POSITION_DEALER],
		// 5 名
		[POKER_POSITION_SB, POKER_POSITION_BB, POKER_POSITION_UTG, POKER_POSITION_MIDDLE, POKER_POSITION_DEALER],
		// 6 名
		[POKER_POSITION_SB, POKER_POSITION_BB, POKER_POSITION_UTG, POKER_POSITION_HIJACK, POKER_POSITION_CUTOFF, POKER_POSITION_DEALER],
		// 7 名
		[POKER_POSITION_SB, POKER_POSITION_BB, POKER_POSITION_UTG, POKER_POSITION_MIDDLE, POKER_POSITION_HIJACK, POKER_POSITION_CUTOFF, POKER_POSITION_DEALER],
		// 8 名
		[POKER_POSITION_SB, POKER_POSITION_BB, POKER_POSITION_UTG, POKER_POSITION_UTGp1, POKER_POSITION_MIDDLE, POKER_POSITION_HIJACK, POKER_POSITION_CUTOFF, POKER_POSITION_DEALER],
		// 9 名
		[POKER_POSITION_SB, POKER_POSITION_BB, POKER_POSITION_UTG, POKER_POSITION_UTGp1, POKER_POSITION_MIDDLE, POKER_POSITION_MIDDLEp1, POKER_POSITION_HIJACK, POKER_POSITION_CUTOFF, POKER_POSITION_DEALER],
		// 10 名
		[POKER_POSITION_SB, POKER_POSITION_BB, POKER_POSITION_UTG, POKER_POSITION_UTGp1, POKER_POSITION_UTGp2, POKER_POSITION_MIDDLE, POKER_POSITION_MIDDLEp1, POKER_POSITION_HIJACK, POKER_POSITION_CUTOFF, POKER_POSITION_DEALER],
	];

	// フェイズ
	const POKER_PHASE_PREFLOP = "PreFlop";
	const POKER_PHASE_FLOP = "Flop";
	const POKER_PHASE_TURN = "Turn";
	const POKER_PHASE_RIVER = "River";

	// リソースまわり
	const ASSET_ROOT = "../Assets/UI";


	// ---------------------------------------------------------------------
	// ユーティリティ関数
	// ---------------------------------------------------------------------
	// 配列内の要素を出現回数でカウントし、多い順に上位N個を返す関数
	function getTopNFrequentItems(array, n) 
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

	// 子ノードから所定のクラスを持つノードを取得する
	function searchNodeByClassNameFromChildren(html_node, classname, default_contents = null)
	{
		const element = html_node.querySelector("." + classname);
		if(element)
		{
			if(default_contents != null)
			{
				element.innerHTML = default_contents;
			}
			return element;
		}
		else
		{
			return null;
		}
	}

	// エレメントにイベントを追加する
	function addEventListenerToElement(element, name, event)
	{
		if(element)
		{
			element.addEventListener(name, event);
		}
	}

	// カードの画像 HTML を生成する
	function createCardImageHTML(argCardsIndex, argCssClassNameList)
	{
		let value = "<img ";

		if(argCssClassNameList.length > 0)
		{
			value += 'class="';
			delim = "";

			for(const class_name of argCssClassNameList)
			{
				value += delim + class_name;
				delim = " ";
			}
			value += '" ';
		}

		value += ' src="' + ASSET_ROOT + "/cards_pc-" + argCardsIndex + '.png">';
		return value;
	}

	// カードのリストから画像 HTML を生成する
	function createCardImageListHTML(argCardsList, argCssClassName, argCapacityCount = 0)
	{
		let value = "";
		let count = 0;
		for(const card of argCardsList)
		{
			value += createCardImageHTML(card, [argCssClassName]);
			count++;
		}
		for(;count<argCapacityCount;++count)
		{
			value += "<img class='" + argCssClassName + "' src='" + ASSET_ROOT + "/cards_pc-0.png'>";
		}
		return value;
	}


	// ---------------------------------------------------------------------
	// 各プローブの状況管理
	// ---------------------------------------------------------------------
	function cProbe(argBLECharacteristic)
	{
		this.ProbeName = "";
		this.BLECharacteristic = argBLECharacteristic;
		this.ReceiveCards = [];
		this.TargetModel = null;
		this.ProbeView = null;
	}
	// 各プローブからのデータ受信時の処理
	cProbe.prototype.onCharacteristicValueChanged = function(event)
	{
		try {
			let characteristic = event.target;
			const decoder = new TextDecoder('utf-8');
			const str = decoder.decode(characteristic.value);
			const json = JSON.parse(str);

			// パネルがない場合は追加する
			if(this.TargetModel == null)
			{
				this.ProbeName = json.probe;
				[this.TargetModel, this.ProbeView] = engine.Manager.bindProbe(this);
			}

			// 読み込み閾値の変更
			let rssi_threshold = 180;
			if(this.ProbeView)
			{
				rssi_threshold = this.ProbeView.getRssiThreshold(rssi_threshold);
			}

			// カードの更新
			let need_to_update = false;
			let max_rssi = 0;
			if(json.cards.length >= 1)
			{
				for(const card of json.cards)
				{
					if(card.rssi >= rssi_threshold)
					{
						if(engine.Manager.GlobalStatusModel.Deck.isUsed(card.card) == false)
						{
							this.ReceiveCards.push(card.card);
							if(this.ReceiveCards.length > 16)
							{
								this.ReceiveCards.shift();
							}
							need_to_update = true;
						}
					}
					if(card.rssi > max_rssi)
					{
						max_rssi = card.rssi;
					}
				}
			}
			if(this.ProbeView)
			{
				this.ProbeView.setRssi(max_rssi);
			}
			if(this.TargetModel)
			{
				if(need_to_update)
				{
					this.TargetModel.scanCards(this.ReceiveCards);
				}
			}
		}
		catch(e){
			console.log("[cProbe] onCharacteristicValueChanged error ", this.ProbeName, e);
		}
	}
	// 次のベッティングラウンドに移行するときの処理
	cProbe.prototype.proceedNextPhase = function()
	{
		this.ReceiveCards = [];
	}
	// 次のハンドに移行するときの処理
	cProbe.prototype.proceedNextHand = function()
	{
		this.ReceiveCards = [];
	}
	// 開発向けに現在の状態を出力する
	cProbe.prototype.dumpStatus = function()
	{
		console.log("[cProbe] name: " + this.ProbeName);
	};

	// ---------------------------------------------------------------------
	// プローブ情報の表示関連
	// ---------------------------------------------------------------------
	function cProbeInformationView(argRoot)
	{
		this.RootElement = argRoot;
		this.ElementRssiValue = searchNodeByClassNameFromChildren(this.RootElement, HTML_CLASS_PANEL_PROBE_INFORMATION_RSSI_VALUE);
		this.ElementRssiThreshold = searchNodeByClassNameFromChildren(this.RootElement, HTML_CLASS_PANEL_PROBE_INFORMATION_THRESHOLD);
	}
	cProbeInformationView.prototype.setRssi = function(argRssi)
	{
		this.ElementRssiValue.innerHTML = `${argRssi}`;
	}
	cProbeInformationView.prototype.getRssiThreshold = function(argDefaultNumber = 0)
	{
		// 空白とか除去
		const rawValue = this.ElementRssiThreshold.value.trim();
		if (rawValue === "") 
		{
			return argDefaultNumber;

		} 

		// 数値に変換
		const numberValue = Number(rawValue);
		if (isNaN(numberValue)) 
		{
			return argDefaultNumber;
		}
		return numberValue;
	}

	// ---------------------------------------------------------------------
	// プレイヤーパネル
	// ---------------------------------------------------------------------
	function cPlayerViewPanel(argCloneHtmlNode, argSourceLogUnit)
	{
		this.ViewPanelRoot = argCloneHtmlNode;
		this.argSourceLogUnit = argSourceLogUnit;
		this.ElementNameValue = searchNodeByClassNameFromChildren(argCloneHtmlNode, HTML_CLASS_PANEL_PLAYER_NAME_VALUE, "");
		this.ElementHandValue = searchNodeByClassNameFromChildren(argCloneHtmlNode, HTML_CLASS_PANEL_PLAYER_HAND_VALUE, "");
		this.ElementLogValue = searchNodeByClassNameFromChildren(argCloneHtmlNode, HTML_CLASS_PANEL_PLAYER_LOG_VALUE, "");
		this.ElementPositionValue = searchNodeByClassNameFromChildren(argCloneHtmlNode, HTML_CLASS_PANEL_PLAYER_POSITION_VALUE);
		this.ElementPositionExistValue = searchNodeByClassNameFromChildren(this.ElementPositionValue, HTML_CLASS_PANEL_PLAYER_POSITION_EXIST);
		this.ElementPositionNameValue = searchNodeByClassNameFromChildren(this.ElementPositionValue, HTML_CLASS_PANEL_PLAYER_POSITION_NAME);
		this.ElementPositionDealerValue = searchNodeByClassNameFromChildren(this.ElementPositionValue, HTML_CLASS_PANEL_PLAYER_POSITION_DEALER);
		this.ElementWinRateValue = searchNodeByClassNameFromChildren(argCloneHtmlNode, HTML_CLASS_PANEL_PLAYER_WINRATE_VALUE);
		this.ElementCommandFold = searchNodeByClassNameFromChildren(argCloneHtmlNode, HTML_CLASS_PANEL_PLAYER_COMMAND_FOLD);
		this.ElementCommandCall = searchNodeByClassNameFromChildren(argCloneHtmlNode, HTML_CLASS_PANEL_PLAYER_COMMAND_CALL);
		this.ElementCommandAggressiveAction = searchNodeByClassNameFromChildren(argCloneHtmlNode, HTML_CLASS_PANEL_PLAYER_COMMAND_AGGRESSIVE_ACTION);
		this.ElementProbeConnector = searchNodeByClassNameFromChildren(argCloneHtmlNode, HTML_CLASS_PANEL_PLAYER_PROBE_CONNECTOR);
		this.ElementRssiValue = null;

		addEventListenerToElement(this.ElementPositionExistValue, 'click', this.onClickExistButton.bind(this) );
		addEventListenerToElement(this.ElementPositionDealerValue, 'click', this.onClickExistDealerButton.bind(this) );
		addEventListenerToElement(this.ElementCommandFold, 'click', this.onClickCommandFold.bind(this) );
		addEventListenerToElement(this.ElementCommandCall, 'click', this.onClickCommandCall.bind(this) );
		addEventListenerToElement(this.ElementCommandAggressiveAction, 'click', this.onClickCommandAggresiveAction.bind(this) );

		this.CurrentHand = [];
		this.HandHistory = [];
		this.Name = "";
		this.Alive = null;
		this.Position = null;
		this.BackPlayerCount = 0;
		this.Button = false;
		this.WinRate = "";
		this.Active = true;
		this.ProbeView = null;
	}
	// 名前の設定
	cPlayerViewPanel.prototype.setName = function(argName)
	{
		this.Name = argName;
		this.ElementNameValue.innerHTML = argName;
	}
	// カードスキャナ経由でのハンド設定
	cPlayerViewPanel.prototype.scanCards = function(argCandidateList)
	{
		const items = getTopNFrequentItems(argCandidateList, 2);
		this.setCurrentHand(items);
	}
	// ハンドの設定
	cPlayerViewPanel.prototype.setCurrentHand = function(argHand)
	{
		if(engine.Manager.GlobalStatusModel.HandPhase == POKER_PHASE_PREFLOP)
		{
			this.CurrentHand = argHand;
			this.drawHand();
		}
	}
	// ボタンの設定
	cPlayerViewPanel.prototype.setButton = function(argFlag)
	{
		this.Button = argFlag;
		if(this.Button)
		{
			this.ElementPositionDealerValue.classList.add(HTML_CLASS_PANEL_PLAYER_POSITION_DEALER_HAVE);
		}
		else
		{
			this.ElementPositionDealerValue.classList.remove(HTML_CLASS_PANEL_PLAYER_POSITION_DEALER_HAVE);
		}
	}
	// フロップ以降、自分のアクション以降にプレイヤーが何人いるか？
	cPlayerViewPanel.prototype.setBackPlayerCount = function(argCount)
	{
		this.BackPlayerCount = argCount;
	}
	// ポジションの設定
	cPlayerViewPanel.prototype.setPosition = function(argPosition)
	{
		this.Position = argPosition;
		this.ElementPositionNameValue.innerHTML = argPosition;
	}
	// 勝率の設定
	cPlayerViewPanel.prototype.setWinRate = function(argWinRate)
	{
		this.WinRate = argWinRate;
	}
	// アクティブなプレイヤーかどうかの設定
	cPlayerViewPanel.prototype.setActive = function(argActive)
	{
		this.Active = argActive;
	}
	cPlayerViewPanel.prototype.setAlive = function(argAlive)
	{
		this.Alive = argAlive;
		if(argAlive)
		{
			this.ElementPositionExistValue.classList.remove(HTML_CLASS_PANEL_PLAYER_POSITION_EXIST_FALSE);
			this.ElementPositionExistValue.classList.add(HTML_CLASS_PANEL_PLAYER_POSITION_EXIST_TRUE);
		}
		else
		{
			this.ElementPositionExistValue.classList.remove(HTML_CLASS_PANEL_PLAYER_POSITION_EXIST_TRUE);
			this.ElementPositionExistValue.classList.add(HTML_CLASS_PANEL_PLAYER_POSITION_EXIST_FALSE);
		}
		engine.Manager.updatePosition();
	}
	cPlayerViewPanel.prototype.bindProbe = function(argProbe, argHtml)
	{
		this.ProbeView = argProbe;
		while (this.ElementProbeConnector.firstChild) {
			this.ElementProbeConnector.removeChild(this.ElementProbeConnector.firstChild);
		}
		if(this.ProbeView)
		{
			this.ElementProbeConnector.appendChild(argHtml);
			this.ElementRssiValue = searchNodeByClassNameFromChildren(argHtml, HTML_CLASS_PANEL_PROBE_INFORMATION_RSSI_VALUE);
		}
	}
	// アクティブプレイヤーかどうかを取得する
	cPlayerViewPanel.prototype.isActive = function()
	{
		return this.Alive && this.Active;
	}
	// いるかどうかの設定ボタン押されたときの動作
	cPlayerViewPanel.prototype.onClickExistButton = function(argEvent)
	{
		if(this.Alive)
		{
			this.setAlive(false);
		}
		else
		{
			this.setAlive(true);
		}
		engine.Manager.updatePosition();
	}
	// ディーラーボタン設定ボタンを押下されたときの動作
	cPlayerViewPanel.prototype.onClickExistDealerButton = function(argEvent)
	{
		engine.Manager.setButton(this.Name);
	}
	cPlayerViewPanel.prototype.onClickCommandFold = function(argEvent)
	{
		this.setActive(false);
		engine.Manager.updateWinRate();
	}
	cPlayerViewPanel.prototype.onClickCommandCall = function(argEvent)
	{
	}
	cPlayerViewPanel.prototype.onClickCommandAggresiveAction = function(argEvent)
	{
	}
	cPlayerViewPanel.prototype.proceedNextHand = function(argHandCount)
	{
		// ログの追加
		if(this.CurrentHand.length > 0)
		{
			this.HandHistory.push({count: argHandCount, hand: this.CurrentHand});
			const clone = this.argSourceLogUnit.cloneNode(true);
			searchNodeByClassNameFromChildren(clone, HTML_CLASS_PANEL_PLAYER_LOG_COUNT, `${argHandCount}`);
			searchNodeByClassNameFromChildren(clone, HTML_CLASS_PANEL_PLAYER_LOG_ACTION, "");
			const node_hand = searchNodeByClassNameFromChildren(clone, HTML_CLASS_PANEL_PLAYER_LOG_HAND)
			node_hand.innerHTML = createCardImageListHTML(this.CurrentHand, HTML_CLASS_PANEL_PLAYER_LOG_HAND_IMG_STYLE);
			this.ElementLogValue.appendChild(clone);
		}
		// コンテキストのクリア
		this.CurrentHand = [];
		this.WinRate = "";
		this.Active = true;
	}
	cPlayerViewPanel.prototype.draw = function()
	{
		this.drawHand();
		this.drawHistory();
		this.drawWinRate();
	}
	cPlayerViewPanel.prototype.drawHand = function()
	{
		this.ElementHandValue.innerHTML = createCardImageListHTML(this.CurrentHand, HTML_CLASS_PANEL_PLAYER_HAND_IMG_STYLE, 2);
	}
	cPlayerViewPanel.prototype.drawHistory = function()
	{
	}
	cPlayerViewPanel.prototype.drawWinRate = function()
	{
		this.ElementWinRateValue.innerHTML = this.WinRate;
	}
	cGlobalStatusViewPanel.prototype.drawRSSI = function()
	{
	}
	cGlobalStatusViewPanel.prototype.bindProbe = function(argProbe)
	{
	}


	// ---------------------------------------------------------------------
	// 全体状況表示
	// ---------------------------------------------------------------------
	function cGlobalStatusViewPanel(root_element, argModel)
	{
		this.RootElement = root_element;
		this.ElementHandCount = searchNodeByClassNameFromChildren(this.RootElement, HTML_CLASS_PANEL_GLOBAL_HAND);
		this.ElementHandNumber = searchNodeByClassNameFromChildren(this.ElementHandCount, HTML_CLASS_PANEL_GLOBAL_HAND_NUMBER);
		this.ElementHandPhase = searchNodeByClassNameFromChildren(this.ElementHandCount, HTML_CLASS_PANEL_GLOBAL_HAND_PHASE);
		this.ElementCommunityCards = searchNodeByClassNameFromChildren(this.RootElement, HTML_CLASS_PANEL_GLOBAL_COMMUNITY_CARDS);
		this.ElementCommunityCardsFlop = searchNodeByClassNameFromChildren(this.ElementCommunityCards, HTML_CLASS_PANEL_GLOBAL_COMMUNITY_CARDS_FLOP);
		this.ElementCommunityCardsTurn = searchNodeByClassNameFromChildren(this.ElementCommunityCards, HTML_CLASS_PANEL_GLOBAL_COMMUNITY_CARDS_TURN);
		this.ElementCommunityCardsRiver = searchNodeByClassNameFromChildren(this.ElementCommunityCards, HTML_CLASS_PANEL_GLOBAL_COMMUNITY_CARDS_RIVER);
		this.ElementProbeConnector = searchNodeByClassNameFromChildren(this.RootElement, HTML_CLASS_PANEL_GLOBAL_PROBE_CONNECTOR);
		this.ElementDeckValue = searchNodeByClassNameFromChildren(this.RootElement, HTML_CLASS_PANEL_GLOBAL_DECK_VALUE);
		this.Model = argModel;
		this.ProbeView = null;
	}
	cGlobalStatusViewPanel.prototype.setProbeView = function(argProbe, argHtml)
	{
		this.ProbeView = argProbe;
		while (this.ElementProbeConnector.firstChild) {
			this.ElementProbeConnector.removeChild(this.ElementProbeConnector.firstChild);
		}
		if(this.ProbeView)
		{
			this.ElementProbeConnector.appendChild(argHtml);
			this.ElementRssiValue = searchNodeByClassNameFromChildren(argHtml, HTML_CLASS_PANEL_PROBE_INFORMATION_RSSI_VALUE);
		}
	}

	cGlobalStatusViewPanel.prototype.setHandCount = function(count)
	{
		this.HandCount = count;
	}
	cGlobalStatusViewPanel.prototype.draw = function()
	{
		let contents = `${this.Model.HandCount}`;
		this.ElementHandNumber.innerHTML = contents;0
		this.ElementCommunityCardsFlop.innerHTML = createCardImageListHTML(this.Model.CommunityCardsFlop, HTML_CLASS_PANEL_PLAYER_HAND_IMG_STYLE, 3);
		this.ElementCommunityCardsTurn.innerHTML = createCardImageListHTML(this.Model.CommunityCardsTurn, HTML_CLASS_PANEL_PLAYER_HAND_IMG_STYLE, 1);
		this.ElementCommunityCardsRiver.innerHTML = createCardImageListHTML(this.Model.CommunityCardsRiver, HTML_CLASS_PANEL_PLAYER_HAND_IMG_STYLE, 1);
		this.ElementHandPhase.innerHTML = this.Model.HandPhase;

		let deck_index = "";
		for(let suit=0; suit<4; ++suit)
		{
			deck_index += "<div class='"+ HTML_CLASS_PANEL_GLOBAL_DECK_SUIT+ "'>";
			for(let rank=0; rank<13; ++rank)
			{
				let index = suit * 13 + rank + 1;
				const status_class = this.Model.Deck.isUsed(index) ? HTML_CLASS_PANEL_GLOBAL_DECK_IMAGE_USED : HTML_CLASS_PANEL_GLOBAL_DECK_IMAGE_INDECK;
				const classes = [HTML_CLASS_PANEL_GLOBAL_DECK_IMAGE, status_class];
				deck_index += createCardImageHTML(index, classes);
			}
			deck_index += "</div>";
		}


		this.ElementDeckValue.innerHTML = deck_index;
		
		this.drawRSSI();
	}

	// ---------------------------------------------------------------------
	// デッキ情報の管理
	// ---------------------------------------------------------------------
	function cDeck()
	{
		// 1〜52の数列を作る
		this.Deck = Array.from({ length: 52 }, (_, i) => i + 1);
		this.Used = Array.from({ length: 53 }, (_, i) => false);
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

	// ---------------------------------------------------------------------
	// 全体状況の論理状況
	// ---------------------------------------------------------------------
	function cGlobalStatusModel()
	{
		this.Deck = null;
		this.CommunityCardsFlop = [];
		this.CommunityCardsTurn = [];
		this.CommunityCardsRiver = [];
		this.HandCount = 1;
		this.HandPhase = POKER_PHASE_PREFLOP;
		this.RSSI = 0;
		this.shuffle();
	}
	cPlayerViewPanel.prototype.setRSSI = function(argRSSIValue)
	{
		this.RSSI = argRSSIValue;
	}
	cGlobalStatusModel.prototype.shuffle = function()
	{
		this.Deck = new cDeck();
	}
	cGlobalStatusModel.prototype.drawCard = function()
	{
		return this.Deck.drawCard();
	}
	cGlobalStatusModel.prototype.proceedNextHand = function()
	{
		this.shuffle();
		this.CommunityCardsFlop = [];
		this.CommunityCardsTurn = [];
		this.CommunityCardsRiver = [];
		this.HandPhase = POKER_PHASE_PREFLOP;
		this.HandCount++;
	}
	cGlobalStatusModel.prototype.setPhase = function(argPhase)
	{
		this.HandPhase = argPhase;

		switch(this.HandPhase)
		{
			case POKER_PHASE_PREFLOP:
				break;
			case POKER_PHASE_FLOP:
				{
					for(const player of engine.Manager.PlayerViewPanelCollection)
					{
						this.Deck.useList(player.CurrentHand);
					}
				}
				break;
			case POKER_PHASE_TURN:
				this.Deck.useList(this.CommunityCardsFlop);
				break;
			case POKER_PHASE_RIVER:
				this.Deck.useList(this.CommunityCardsTurn);
				break;
		}
	}
	cGlobalStatusModel.prototype.setFlop = function(argFlop)
	{
		this.CommunityCardsFlop = argFlop;
		engine.Manager.onUpdateFlop();
	}
	cGlobalStatusModel.prototype.setTurn = function(argFlop)
	{
		this.CommunityCardsTurn = argFlop;
		engine.Manager.onUpdateTurn();
	}
	cGlobalStatusModel.prototype.setRiver = function(argFlop)
	{
		this.CommunityCardsRiver = argFlop;
		engine.Manager.onUpdateRiver();
	}
	cGlobalStatusModel.prototype.getCurrentCommunityCards = function()
	{
		return this.CommunityCardsFlop.concat(this.CommunityCardsTurn, this.CommunityCardsRiver);
	}
	cGlobalStatusModel.prototype.scanCards = function(argCandidateList)
	{
		switch(this.HandPhase)
		{
			case POKER_PHASE_PREFLOP:
				{
					// Do Nothing.
				}
				break;
			case POKER_PHASE_FLOP:
				{
					const items = getTopNFrequentItems(argCandidateList, 3);
					this.setFlop(items);
				}
				break;
			case POKER_PHASE_TURN:
				{
					const items = getTopNFrequentItems(argCandidateList, 1);
					this.setTurn(items);
				}
				break;
			case POKER_PHASE_RIVER:
				{
					const items = getTopNFrequentItems(argCandidateList, 1);
					this.setRiver(items);
				}
				break;
		}
	}

	// ---------------------------------------------------------------------
	// マネージャー
	// ---------------------------------------------------------------------
	function cManager()
	{
		console.log("cManager: called.");

		// プレイヤー系の初期化
		this.PlayerViewPanelCollection = [];
		this.ActivePlayerCount = 0;
		var panel_player_elements = document.getElementsByClassName(HTML_CLASS_PANEL_PLAYER);
		if(panel_player_elements)
		{
			this.PlayerPanelTemplate = panel_player_elements[0];
			this.PlayerPanelLogUnitTemplate = searchNodeByClassNameFromChildren(this.PlayerPanelTemplate, HTML_CLASS_PANEL_PLAYER_LOG_UNIT);
		}
		this.SectorPlayerRoot = document.getElementById(HTML_ID_SECTOR_PLAYER);

		// プローブ系初期化
		this.Probes = [];
		var panel_probe_elements = document.getElementsByClassName(HTML_CLASS_PANEL_PROBE_INFORMATION_GROUP);
		if(panel_probe_elements)
		{
			this.ProbePanelTemplate = panel_probe_elements[0];
		}

		// グローバル情報の初期化
		this.GlobalStatusModel = new cGlobalStatusModel();
		const sector_global_root = document.getElementById(HTML_ID_SECTOR_GLOBAL);
		this.GlobalStatusViewPanel = new cGlobalStatusViewPanel(sector_global_root, this.GlobalStatusModel)
		this.GlobalStatusViewPanel.draw();

		// 諸々
		this.Verbose = false;
	}
	// プローブ追加処理
	cManager.prototype.onCommandAddProbe = async function()
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
			const probe = new cProbe(characteristic);
			characteristic.addEventListener('characteristicvaluechanged', probe.onCharacteristicValueChanged.bind(probe));
			characteristic.startNotifications();
			this.Probes.push(probe);
		} 
		catch (error) {
			console.error('BLE読み取りエラー:', error);
		}
	}

	cManager.prototype.onCommandToFlop = function()
	{
		this.proceedNextPhase(POKER_PHASE_FLOP);
	}
	cManager.prototype.onCommandToTurn = function()
	{
		this.proceedNextPhase(POKER_PHASE_TURN);
	}
	cManager.prototype.onCommandToRiver = function()
	{
		this.proceedNextPhase(POKER_PHASE_RIVER);
	}
	// 次のフェイズに進める
	cManager.prototype.proceedNextPhase = function(argNextPhase)
	{
		this.GlobalStatusModel.setPhase(argNextPhase);
		this.Probes.forEach((x,index) => x.proceedNextPhase());
		this.GlobalStatusViewPanel.draw();
	}
	// 次のハンドに進める
	cManager.prototype.onCommandNextHand = function()
	{
		this.Probes.forEach((x,index) => {
			x.proceedNextHand()
		});
		this.PlayerViewPanelCollection.forEach((x, index) => {
			x.proceedNextHand(this.GlobalStatusModel.HandCount);
			x.draw();
		});
		this.GlobalStatusModel.proceedNextHand();
		this.GlobalStatusViewPanel.draw();
	}
	// プローブと View の紐付け
	cManager.prototype.bindProbe = function(argProbe)
	{
		// 表示まわり
		const clone = this.ProbePanelTemplate.cloneNode(true);
		const probe_view = new cProbeInformationView(clone);

		// ディーラー系プローブ
		if(argProbe.ProbeName.startsWith(BLE_DEVICE_PROBE_NAME_DEALER_PREFIX))
		{
			this.GlobalStatusViewPanel.setProbeView(probe_view, clone);
			return [engine.Manager.GlobalStatusModel, probe_view];
		}
		// プレイヤー系プローブ
		else
		{
			const panel = engine.Manager.createPlayerPanelView(argProbe.ProbeName);
			panel.bindProbe(argProbe, clone);
			panel.setAlive(true);
			return [panel, probe_view];
		}
	}

	// 勝率更新
	cManager.prototype.updateWinRate = function()
	{
		const community_cards = this.GlobalStatusModel.getCurrentCommunityCards();
		if(community_cards.length < 3)
		{
			return;
		}

		// 勝率計算処理に食わせられるようにする
		let index_table = [];
		let hand_info = [];
		const view_count = this.PlayerViewPanelCollection.length;
		for(let index=0; index<view_count; ++index)
		{
			const panel = this.PlayerViewPanelCollection[index];
			panel.setWinRate("");
			if(!panel.isActive())
			{
				continue;
			}
			if(panel.CurrentHand.length != 2)
			{
				continue;
			}
			index_table.push(index);
			hand_info.push(panel.CurrentHand);
		}

		// 勝率計算
		const result = WinRate.calc(hand_info, community_cards, [])
		for(let result_index=0; result_index<result.infos.length; ++result_index)
		{
			const access_index = index_table[result_index];
			const panel = this.PlayerViewPanelCollection[access_index];
			const result_unit = result.infos[result_index];
			const rate = Math.round((result_unit.win * 100 / result_unit.comb));

			let rate_expression = `${rate} %`;
			if(this.Verbose)
			{
				rate_expression += `(${result_unit.win}/${result_unit.comb})`;
			}
			panel.setWinRate(rate_expression);
		}

		// 計算表示
		for(let index=0; index<view_count; ++index)
		{
			const panel = this.PlayerViewPanelCollection[index];
			panel.drawWinRate();
		}
	}
	// コミュニティカード更新
	cManager.prototype.updateCommunityCards = function()
	{
		this.updateWinRate();
		this.GlobalStatusViewPanel.draw();
	}
	// フロップが更新された
	cManager.prototype.onUpdateFlop = function()
	{
		this.updateCommunityCards();
	}
	// ターンが更新された
	cManager.prototype.onUpdateTurn = function()
	{
		this.updateCommunityCards();
	}
	// リバーが更新された
	cManager.prototype.onUpdateRiver = function()
	{
		this.updateCommunityCards();
	}
	// プレイヤー向けパネルを生成する
	cManager.prototype.createPlayerPanelView = function(name)
	{
		// すでに生成されているのならば、それを返す。
		const search_panel = this.PlayerViewPanelCollection.find(x => x.Name == name);
		if(search_panel)
		{
			return search_panel;
		}

		// HTML 部分を生成する
		const clone = this.PlayerPanelTemplate.cloneNode(true);
		clone.id = HTML_ID_PLAYER_VIEEPANEL_PREFIX + this.PanelCount; 
		this.SectorPlayerRoot.appendChild(clone);
		
		// オブジェクトで wrapping する。また必要な紐付けを行なう。
		const view_panel = new cPlayerViewPanel(clone, this.PlayerPanelLogUnitTemplate);
		view_panel.setName(name);
		view_panel.draw();
		this.PlayerViewPanelCollection.push(view_panel);
		return view_panel;
	}
	// ボタンをセットする
	cManager.prototype.setButton = function(name)
	{
		for(const panel of this.PlayerViewPanelCollection)
		{
			panel.setButton(panel.Name == name);
		}
		this.updatePosition();
	}
	// ポジションを更新する
	cManager.prototype.updatePosition = function()
	{
		var button_index = this.PlayerViewPanelCollection.findIndex(x => x.Button);
		if(button_index < 0)
		{
			return;
		}

		// BackPlayerCount の計算
		const view_count = this.PlayerViewPanelCollection.length;
		this.ActivePlayerCount = 0;
		for(let index=0; index<view_count; ++index)
		{
			const access_index = (view_count + button_index - index) % view_count;
			const panel = this.PlayerViewPanelCollection[access_index];
			if(panel.Alive)
			{
				panel.setBackPlayerCount(this.ActivePlayerCount);
				this.ActivePlayerCount++;
			}
			else
			{
				panel.setBackPlayerCount(-1);
			}
		}

		// ポジション設定
		const position_list = POKER_POSITION_TABLE[this.ActivePlayerCount];
		for(let index=0; index<view_count; ++index)
		{
			const panel = this.PlayerViewPanelCollection[index];
			if(panel.Alive)
			{
				panel.setPosition(position_list[this.ActivePlayerCount - panel.BackPlayerCount - 1]);
			}
			else
			{
				panel.setPosition(POKER_POSITION_OPENSEAT);
			}
		}
	}
	// 開発向けに現在の状態を出力する
	cManager.prototype.onCommandDumpStatus = function()
	{
		for(const probe of this.Probes)
		{
			probe.dumpStatus();
		}
	}
	// デバッグ用テストコマンド
	cManager.prototype.onCommandTest = function()
	{
		const name = "test_" + Object.keys(this.PlayerViewPanelCollection).length;
		const view_panel = this.createPlayerPanelView(name);
		view_panel.setCurrentHand([0, 0]);
		view_panel.setAlive(true);
	}
	// [開発コマンド] テストのハンド配り
	cManager.prototype.onDevDealHand = function()
	{
		// 配布
		this.GlobalStatusModel.shuffle();
		const view_count = this.PlayerViewPanelCollection.length;
		for(let index=0; index<view_count; ++index)
		{
			const panel = this.PlayerViewPanelCollection[index];
			if(panel.Alive)
			{
				panel.setCurrentHand([this.GlobalStatusModel.drawCard(), this.GlobalStatusModel.drawCard()]);
			}
			else
			{
				panel.setCurrentHand([0, 0]);
			}
		}
	}
	// [開発コマンド] フロップの配布
	cManager.prototype.onDevFlop = function()
	{
		this.GlobalStatusModel.setFlop([this.GlobalStatusModel.drawCard(), this.GlobalStatusModel.drawCard(), this.GlobalStatusModel.drawCard()]);
		this.GlobalStatusViewPanel.draw();
	}
	cManager.prototype.onDevTurn = function()
	{
		this.GlobalStatusModel.setTurn([this.GlobalStatusModel.drawCard()]);
		this.GlobalStatusViewPanel.draw();
	}
	cManager.prototype.onDevRiver = function()
	{
		this.GlobalStatusModel.setRiver([this.GlobalStatusModel.drawCard()]);
		this.GlobalStatusViewPanel.draw();
	}

	// ---------------------------------------------------------------------
	// engine オブジェクト
	// ---------------------------------------------------------------------
	var engine = {
		Manager: null,
		init : function()
		{
			function add_button_event_listener(id, event)
			{
				const element = document.getElementById(id);
				addEventListenerToElement(element, 'click', event);
			}

			console.log("PokerTableMonitor init");
			engine.Manager = new cManager();
			add_button_event_listener(HTML_ID_COMMAND_ADD_PROBE, engine.Manager.onCommandAddProbe.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_TO_FLOP, engine.Manager.onCommandToFlop.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_TO_TURN, engine.Manager.onCommandToTurn.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_TO_RIVER, engine.Manager.onCommandToRiver.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_NEXT_HAND, engine.Manager.onCommandNextHand.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_DUMP_STATUS, engine.Manager.onCommandDumpStatus.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_TEST, engine.Manager.onCommandTest.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_DEV_DEAL_HAND, engine.Manager.onDevDealHand.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_DEV_FLOP, engine.Manager.onDevFlop.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_DEV_TURN, engine.Manager.onDevTurn.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_DEV_RIVER, engine.Manager.onDevRiver.bind(engine.Manager));
		},
	};
	
	return engine;
}})();

(function(){
	if(document.readyState === "loading")
	{
		document.addEventListener("DOMContentLoaded", PokerTableMonitor.engine.init);
	}
	else
	{
		PokerTableMonitor.engine.init();
	}
})();