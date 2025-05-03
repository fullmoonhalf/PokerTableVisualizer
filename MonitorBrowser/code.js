var PokerTableMonitor = PokerTableMonitor || {};
PokerTableMonitor.engine = (function(){{
	var version = 0.00;
	var BLE_DEVICE_NAME_PREFIX = "PTV_PP_";
	var UUID_SERVICE = "cbaabb28-4e81-49c4-b775-aedfd27d8db0";
	var UUID_CHARACTERISTIC = "45f116ee-b087-4271-888d-a15eebebd2eb";
	var HTML_ID_COMMAND_ADD_PROBE = "command_add_probe";
	var HTML_ID_COMMAND_DUMP_STATUS = "command_dump_status";
	var HTML_ID_COMMAND_TEST = "command_test";
	var HTML_ID_SECTOR_PLAYER = "sector_player";
	var HTML_ID_PLAYER_VIEEPANEL_PREFIX = "view_panel_player_";
	var HTML_CLASS_PANEL_PLAYER = "panel_player";
	var HTML_CLASS_PANEL_PLAYER_NAME_VALUE = "panel_player_name_value";
	var HTML_CLASS_PANEL_PLAYER_HAND_VALUE = "panel_player_hand_value";
	var ASSET_ROOT = "../Assets/UI";

	//
	// 各プローブの状況管理
	//
	function cProbe(argBLECharacteristic, argViewPanel)
	{
		this.ProbeName = "";
		this.BLECharacteristic = argBLECharacteristic;
		this.ViewPanel = argViewPanel
	}
	cProbe.prototype.onCharacteristicValueChanged = function(event)
	{
		try {
			let characteristic = event.target;
			const decoder = new TextDecoder('utf-8');
			const str = decoder.decode(characteristic.value);
			const json = JSON.parse(str);
			//console.log(json);
			this.ProbeName = json.probe;
			this.ViewPanel.setName(this.ProbeName);

			let value = "";
			for(const card of json.cards)
			{
				value += "<img src='" + ASSET_ROOT + "/cards_pc-" + card.card + ".png'>";
			}
			this.ViewPanel.setCard(value);
		}
		catch(e){
			console.log("[cProbe] onCharacteristicValueChanged error ", this.ProbeName, e);
		}
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
		this.PanelCount = 0;

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
			const view_panel = this.createPlayerPanelView();
			const probe = new cProbe(characteristic, view_panel);
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
	cManager.prototype.onCommandTest = function()
	{
		this.Count += 1;

		console.log("test");
		const view_panel = this.createPlayerPanelView();
		view_panel.setName("aaaaaaaaaaaaa");
	}
	cManager.prototype.createPlayerPanelView = function()
	{
		this.PanelCount += 1;

		const clone = this.PlayerPanelTemplate.cloneNode(true);
		clone.id = HTML_ID_PLAYER_VIEEPANEL_PREFIX + this.PanelCount; 
		this.SectorPlayerRoot.appendChild(clone);
		
		const view_panel = new cPlayerViewPanel(clone);
		return view_panel;
	}


	//
	// engine オブジェクト
	//
	var engine = {
		init : function()
		{
			console.log("PokerTableMonitor init");
			this.Manager = new cManager();

			const element_command_add_probe = document.getElementById(HTML_ID_COMMAND_ADD_PROBE);
			if(element_command_add_probe)
			{
				element_command_add_probe.addEventListener('click', this.Manager.onCommandAddProbe.bind(this.Manager));
			}

			const element_command_dump_status = document.getElementById(HTML_ID_COMMAND_DUMP_STATUS);
			if(element_command_dump_status)
			{
				element_command_dump_status.addEventListener('click', this.Manager.onCommandDumpStatus.bind(this.Manager));
			}

			const element_command_test = document.getElementById(HTML_ID_COMMAND_TEST);
			if(element_command_test)
			{
				element_command_test.addEventListener('click', this.Manager.onCommandTest.bind(this.Manager));
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