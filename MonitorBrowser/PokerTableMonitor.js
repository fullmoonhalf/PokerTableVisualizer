var PokerTableMonitor = PokerTableMonitor || {};
PokerTableMonitor.engine = (function(){{
	var version = 0.00;

	// BLEデバイス関係
	var BLE_DEVICE_NAME_PREFIX = "PTV_PP_";
	var UUID_SERVICE = "cbaabb28-4e81-49c4-b775-aedfd27d8db0";
	var UUID_CHARACTERISTIC = "45f116ee-b087-4271-888d-a15eebebd2eb";

	// 操作関係
	var HTML_ID_COMMAND_ADD_PROBE = "command_add_probe";
	var HTML_ID_COMMAND_NEXT_HAND = "command_next_hand";
	var HTML_ID_COMMAND_DUMP_STATUS = "command_dump_status";
	var HTML_ID_COMMAND_TEST = "command_test";

	// HTML の構造まわり
	var HTML_ID_SECTOR_PLAYER = "sector_player";
	var HTML_ID_PLAYER_VIEEPANEL_PREFIX = "view_panel_player_";
	var HTML_ID_SECTOR_GLOBAL = "sector_global";
	var HTML_CLASS_PANEL_PLAYER = "panel_player";
	var HTML_CLASS_PANEL_PLAYER_NAME_VALUE = "panel_player_name_value";
	var HTML_CLASS_PANEL_PLAYER_HAND_VALUE = "panel_player_hand_value";
	var HTML_CLASS_PANEL_PLAYER_HAND_IMG_STYLE = "panel_player_hand_image_style";
	var HTML_CLASS_PANEL_PLAYER_LOG_VALUE = "panel_player_log_value";
	var HTML_CLASS_PANEL_PLAYER_LOG_UNIT = "panel_player_log_unit";
	var HTML_CLASS_PANEL_PLAYER_LOG_COUNT = "panel_player_log_count";
	var HTML_CLASS_PANEL_PLAYER_LOG_HAND = "panel_player_log_hand";
	var HTML_CLASS_PANEL_PLAYER_LOG_ACTION = "panel_player_log_action";
	var HTML_CLASS_PANEL_PLAYER_LOG_HAND_IMG_STYLE = "panel_player_log_hand_image_style";

	

	// リソースまわり
	var ASSET_ROOT = "../Assets/UI";


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

	// ---------------------------------------------------------------------
	// 各プローブの状況管理
	// ---------------------------------------------------------------------
	function cProbe(argBLECharacteristic)
	{
		this.ProbeName = "";
		this.BLECharacteristic = argBLECharacteristic;
		this.ViewPanel = null;
		this.ReceiveCards = [];
	}
	// 各プローブからのデータ受信時の処理
	cProbe.prototype.onCharacteristicValueChanged = function(event)
	{
		try {
			let characteristic = event.target;
			const decoder = new TextDecoder('utf-8');
			const str = decoder.decode(characteristic.value);
			const json = JSON.parse(str);
			//console.log(json);

			let need_to_update = false;
			if(json.cards.length >= 2)
			{
				for(const card of json.cards)
				{
					if(card.rssi > 210)
					{
						this.ReceiveCards.push(card.card);
						if(this.ReceiveCards.length > 16)
						{
							this.ReceiveCards.shift();
						}
						need_to_update = true;
					}
				}
			}

			if(need_to_update)
			{
				if(this.ViewPanel == null)
				{
					this.ProbeName = json.probe;
					this.ViewPanel = engine.Manager.createPlayerPanelView(json.probe);
				}
				if(this.ViewPanel != null)
				{
					this.drawHand();
				}
			}
		}
		catch(e){
			console.log("[cProbe] onCharacteristicValueChanged error ", this.ProbeName, e);
		}
	}
	cProbe.prototype.proceedNextHand = function(argHandCount)
	{
		this.ViewPanel.proceedNextHand(argHandCount);
		this.ReceiveCards = [];
	}
	cProbe.prototype.draw = function()
	{
		this.ViewPanel.draw();
	}
	cProbe.prototype.drawHand = function()
	{
		const items = getTopNFrequentItems(this.ReceiveCards, 2);
		this.ViewPanel.setCurrentHand(items);
	}
	// 開発向けに現在の状態を出力する
	cProbe.prototype.dumpStatus = function()
	{
		console.log("[cProbe] name: " + this.ProbeName);
	};


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
		this.CurrentHand = [];
		this.HandHistory = [];
	}
	cPlayerViewPanel.prototype.setName = function(argName)
	{
		this.ElementNameValue.innerHTML = argName;
	}
	cPlayerViewPanel.prototype.setCurrentHand = function(argHand)
	{
		this.CurrentHand = argHand;
		this.drawHand();

	}
	cPlayerViewPanel.prototype.proceedNextHand = function(argHandCount)
	{
		if(this.CurrentHand.length > 0)
		{
			this.HandHistory.push({count: argHandCount, hand: this.CurrentHand});
			const clone = this.argSourceLogUnit.cloneNode(true);
			searchNodeByClassNameFromChildren(clone, HTML_CLASS_PANEL_PLAYER_LOG_COUNT, `${argHandCount}`);
			searchNodeByClassNameFromChildren(clone, HTML_CLASS_PANEL_PLAYER_LOG_ACTION, "");
			const node_hand = searchNodeByClassNameFromChildren(clone, HTML_CLASS_PANEL_PLAYER_LOG_HAND)

			let value = "";
			for(const card of this.CurrentHand)
			{
				value += "<img class='" + HTML_CLASS_PANEL_PLAYER_LOG_HAND_IMG_STYLE + "' src='" + ASSET_ROOT + "/cards_pc-" + card + ".png'>";
			}
			node_hand.innerHTML = value;
			this.ElementLogValue.appendChild(clone);
		}
		this.CurrentHand = [];
	}
	cPlayerViewPanel.prototype.draw = function()
	{
		this.drawHand();
		this.drawHistory();
	}
	cPlayerViewPanel.prototype.drawHand = function()
	{
		let value = "";
		for(const card of this.CurrentHand)
		{
			value += "<img class='" + HTML_CLASS_PANEL_PLAYER_HAND_IMG_STYLE + "' src='" + ASSET_ROOT + "/cards_pc-" + card + ".png'>";
		}
		this.ElementHandValue.innerHTML = value;
	}
	cPlayerViewPanel.prototype.drawHistory = function()
	{
	}

	// ---------------------------------------------------------------------
	// 全体状況
	// ---------------------------------------------------------------------
	function cGlobalStatusViewPanel(root_element)
	{
		this.RootElement = root_element;
		this.HandCount = 1;
	}
	cGlobalStatusViewPanel.prototype.setHandCount = function(count)
	{
		this.HandCount = count;
	}
	cGlobalStatusViewPanel.prototype.draw = function()
	{
		let contents = "";
		contents += "<p>Hand: " + this.HandCount;
		this.RootElement.innerHTML = contents;
	}


	// ---------------------------------------------------------------------
	// マネージャー
	// ---------------------------------------------------------------------
	function cManager()
	{
		console.log("cManager: called.");
		this.Probes = [];
		this.PlayerViewPanelCollection = {};
		this.HandCount = 1;

		var panel_player_elements = document.getElementsByClassName(HTML_CLASS_PANEL_PLAYER);
		if(panel_player_elements)
		{
			this.PlayerPanelTemplate = panel_player_elements[0];
			this.PlayerPanelLogUnitTemplate = searchNodeByClassNameFromChildren(this.PlayerPanelTemplate, HTML_CLASS_PANEL_PLAYER_LOG_UNIT);
		}

		this.SectorPlayerRoot = document.getElementById(HTML_ID_SECTOR_PLAYER);

		const sector_global_root = document.getElementById(HTML_ID_SECTOR_GLOBAL);
		this.GlobalStatusViewPanel = new cGlobalStatusViewPanel(sector_global_root)
		this.GlobalStatusViewPanel.draw();
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
	// 開発向けに現在の状態を出力する
	cManager.prototype.onCommandDumpStatus = function()
	{
		for(const probe of this.Probes)
		{
			probe.dumpStatus();
		}
	}
	// 次のハンドに進める
	cManager.prototype.onCommandNextHand = function()
	{
		for(const probe of this.Probes)
		{
			probe.proceedNextHand(this.HandCount);
			probe.draw();
		}

		this.HandCount += 1;
		this.GlobalStatusViewPanel.setHandCount(this.HandCount);
		this.GlobalStatusViewPanel.draw();
	}
	// デバッグ用テストコマンド
	cManager.prototype.onCommandTest = function()
	{
		console.log("test");
		const name = "test" + Object.keys(this.PlayerViewPanelCollection).length;
		const view_panel = this.createPlayerPanelView(name);
		view_panel.setCurrentHand([1, 2]);
	}
	// プレイヤー向けパネルを生成する
	cManager.prototype.createPlayerPanelView = function(name)
	{
		// すでに生成されているのならば、それを返す。
		if(name in this.PlayerViewPanelCollection)
		{
			return this.PlayerViewPanelCollection[name];
		}

		// HTML 部分を生成する
		const clone = this.PlayerPanelTemplate.cloneNode(true);
		clone.id = HTML_ID_PLAYER_VIEEPANEL_PREFIX + this.PanelCount; 
		this.SectorPlayerRoot.appendChild(clone);
		
		// オブジェクトで wrapping する。また必要な紐付けを行なう。
		const view_panel = new cPlayerViewPanel(clone, this.PlayerPanelLogUnitTemplate);
		view_panel.setName(name);
		this.PlayerViewPanelCollection[name] = view_panel;
		return view_panel;
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
				if(element)
				{
					element.addEventListener('click', event);
				}
			}

			console.log("PokerTableMonitor init");
			engine.Manager = new cManager();
			add_button_event_listener(HTML_ID_COMMAND_ADD_PROBE, engine.Manager.onCommandAddProbe.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_NEXT_HAND, engine.Manager.onCommandNextHand.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_DUMP_STATUS, engine.Manager.onCommandDumpStatus.bind(engine.Manager));
			add_button_event_listener(HTML_ID_COMMAND_TEST, engine.Manager.onCommandTest.bind(engine.Manager));
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