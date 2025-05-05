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
	var HTML_CLASS_PANEL_PLAYER = "panel_player";
	var HTML_CLASS_PANEL_PLAYER_NAME_VALUE = "panel_player_name_value";
	var HTML_CLASS_PANEL_PLAYER_HAND_VALUE = "panel_player_hand_value";
	var HTML_CLASS_PANEL_PLAYER_HAND_IMG_STYLE = "panel_player_hand_image_style";
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

	//
	// カード情報
	//
	function cCard(argDeck, argCard)
	{
		this.Deck = argDeck
		this.Card = argCard
		this.Count = 0
	}
	cCard.prototype.dumpStatus = function()
	{
		console.log("[cCard] deck:" + this.Deck + " card:" + this.Card);
	}


	//
	// 各プローブの状況管理
	//
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
		catch(e){
			console.log("[cProbe] onCharacteristicValueChanged error ", this.ProbeName, e);
		}
	}
	cProbe.prototype.clearHand = function()
	{
		this.ReceiveCards = [];
	}
	cProbe.prototype.drawHand = function()
	{
		const items = getTopNFrequentItems(this.ReceiveCards, 2);
		let value = "";
		for(const card of items)
		{
			value += "<img class='" + HTML_CLASS_PANEL_PLAYER_HAND_IMG_STYLE + "' src='" + ASSET_ROOT + "/cards_pc-" + card + ".png'>";
		}

		this.ViewPanel.setCard(value);
	}
	// 開発向けに現在の状態を出力する
	cProbe.prototype.dumpStatus = function()
	{
		console.log("[cProbe] name: " + this.ProbeName);
	};

	//
	// プレイヤーパネル
	//
	function cPlayerViewPanel(argCloneHtmlNode)
	{
		this.ViewPanelRoot = argCloneHtmlNode;
		this.ElementNameValue = null;
		this.ElementHandValue = null;

		const element_name_value = argCloneHtmlNode.querySelector("." + HTML_CLASS_PANEL_PLAYER_NAME_VALUE);
		if(element_name_value)
		{
			this.ElementNameValue = element_name_value;
			this.ElementNameValue.innerHTML = "";
		}
		
		const element_hand_value = argCloneHtmlNode.querySelector("." + HTML_CLASS_PANEL_PLAYER_HAND_VALUE);
		if(element_hand_value)
		{
			this.ElementHandValue = element_hand_value;
			this.ElementHandValue.innerHTML = "";
		}
	}
	cPlayerViewPanel.prototype.setName = function(argName)
	{
		this.ElementNameValue.innerHTML = argName;
	}
	cPlayerViewPanel.prototype.setCard = function(argCard)
	{
		this.ElementHandValue.innerHTML = argCard;
	}

	//
	// マネージャー
	//
	function cManager()
	{
		console.log("cManager: called.");
		this.Probes = [];
		this.ViewPanel = {};

		var panel_player_elements = document.getElementsByClassName(HTML_CLASS_PANEL_PLAYER);
		if(panel_player_elements)
		{
			this.PlayerPanelTemplate = panel_player_elements[0];
		}

		this.SectorPlayerRoot = null;
		var element_sector_player = document.getElementById(HTML_ID_SECTOR_PLAYER);
		if(element_sector_player)
		{
			this.SectorPlayerRoot = element_sector_player;
		}
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
	// 
	cManager.prototype.onCommandNextHand = function()
	{
		for(const probe of this.Probes)
		{
			probe.clearHand();
			probe.drawHand();
		}
	}
	cManager.prototype.onCommandTest = function()
	{
		console.log("test");
		const name = "test" + Object.keys(this.ViewPanel).length;
		const view_panel = this.createPlayerPanelView(name);
		view_panel.setCard("<img class='" + HTML_CLASS_PANEL_PLAYER_HAND_IMG_STYLE + "' src='" + ASSET_ROOT + "/cards_pc-" + 1 + ".png'>");

	}
	// プレイヤー向けパネルを生成する
	cManager.prototype.createPlayerPanelView = function(name)
	{
		// すでに生成されているのならば、それを返す。
		if(name in this.ViewPanel)
		{
			return this.ViewPanel[name];
		}

		// HTML 部分を生成する
		const clone = this.PlayerPanelTemplate.cloneNode(true);
		clone.id = HTML_ID_PLAYER_VIEEPANEL_PREFIX + this.PanelCount; 
		this.SectorPlayerRoot.appendChild(clone);
		
		// オブジェクトで wrapping する。また必要な紐付けを行なう。
		const view_panel = new cPlayerViewPanel(clone);
		view_panel.setName(name);
		this.ViewPanel[name] = view_panel;
		return view_panel;
	}


	//
	// engine オブジェクト
	//
	var engine = {
		Manager: null,
		init : function()
		{
			console.log("PokerTableMonitor init");
			engine.Manager = new cManager();

			const element_command_add_probe = document.getElementById(HTML_ID_COMMAND_ADD_PROBE);
			if(element_command_add_probe)
			{
				element_command_add_probe.addEventListener('click', engine.Manager.onCommandAddProbe.bind(engine.Manager));
			}

			const element_command_next_hand = document.getElementById(HTML_ID_COMMAND_NEXT_HAND);
			if(element_command_next_hand)
			{
				element_command_next_hand.addEventListener('click', engine.Manager.onCommandNextHand.bind(engine.Manager));
			}
			
			const element_command_dump_status = document.getElementById(HTML_ID_COMMAND_DUMP_STATUS);
			if(element_command_dump_status)
			{
				element_command_dump_status.addEventListener('click', engine.Manager.onCommandDumpStatus.bind(engine.Manager));
			}

			const element_command_test = document.getElementById(HTML_ID_COMMAND_TEST);
			if(element_command_test)
			{
				element_command_test.addEventListener('click', engine.Manager.onCommandTest.bind(engine.Manager));
			}
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