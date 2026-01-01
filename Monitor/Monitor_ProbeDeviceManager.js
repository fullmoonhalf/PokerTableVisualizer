(function (ns) {
    "use strict";
    if(ns.cProbeDeviceManager) return;


    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeDeviceManager()
    {
        this.Devices = [];
    }

    /// <summary>
    /// 初期化
    /// </summary>
    cProbeDeviceManager.prototype.init = function()
    {
		HtmlUtil.addButtonEventListenerByID(ns.Defines.COMMAND_DEVELOP_PROVE_DEVICE_MANAGER_DUMP_STATUS, this.dumpStatus.bind(this));
		HtmlUtil.addButtonEventListenerByID(ns.Defines.COMMAND_DEVELOP_PROVE_DEVICE_MANAGER_TEST_SCAN_ON, this.testScanOn.bind(this));
		HtmlUtil.addButtonEventListenerByID(ns.Defines.COMMAND_DEVELOP_PROVE_DEVICE_MANAGER_TEST_SCAN_OFF, this.testScanOff.bind(this));
        HtmlUtil.addButtonEventListenerByID(ns.Defines.COMMAND_PROVE_DEVICE_MANAGER_SCAN, this.scan.bind(this));
    }

    /// <summary>
    /// デバイスをスキャンする。
    /// </summary>
	cProbeDeviceManager.prototype.scan = async function()
	{
		console.log("[cProbeDeviceManager] scan");
		try 
        {
			// 1. デバイスをスキャン
			const device = await navigator.bluetooth.requestDevice({
				filters: [
					{ services: [ns.Defines.BLE_UUID_SERVICE]},
					{ namePrefix : [ns.Defines.BLE_DEVICE_NAME_PREFIX], }
				]
			});

			// 2. GATT サーバへ接続
			const server = await device.gatt.connect();
		
			// 3. サービス取得
			const service = await server.getPrimaryService(ns.Defines.BLE_UUID_SERVICE);
		
			// 4. キャラクタリスティック取得
			const characteristic_tx = await service.getCharacteristic(ns.Defines.BLE_UUID_CHARACTERISTIC_TX);
			const characteristic_rx = await service.getCharacteristic(ns.Defines.BLE_UUID_CHARACTERISTIC_RX);

			// 管理オブジェクトとの紐付けを行なう
			const unit = new ns.cProbeDeviceUnit(this, device.name, characteristic_tx, characteristic_rx);
			device.addEventListener('gattserverdisconnected', unit.onDisconnected.bind(unit));
			characteristic_tx.addEventListener('characteristicvaluechanged', unit.onCharacteristicValueChanged.bind(unit));
			characteristic_tx.startNotifications();

            // 登録
            this.Devices.push(unit);
    		console.log("[cProbeDeviceManager] scan add " + unit.Name);
		} 
		catch (error) {
			console.error('[cProbeDeviceManager] BLE読み取りエラー:', error);
		}
	}

    /// <summary>
    /// 指定のデバイスを除去する。
    /// </summary>
	cProbeDeviceManager.prototype.remove = function(device)
    {
		console.log("[cProbeDeviceManager] remove " + device.Name);
        this.Devices = this.Devices.filter(x => x != device);
    }

    /// <summary>
    /// 状態出力
    /// </summary>
    cProbeDeviceManager.prototype.dumpStatus = function()
    {
        console.log("[cProbeDeviceManager] dumpStatus - Start");
        console.log("[cProbeDeviceManager] Connection List");
        for(const device of this.Devices)
        {
            console.log(device.Name);
        }
        console.log("[cProbeDeviceManager] dumpStatus - End");
    }

    /// <summary>
    /// テスト送信
    /// </summary>
    cProbeDeviceManager.prototype.testScanOn = function()
    {
        console.log("[cProbeDeviceManager] testScanOn - Start");
        for(const device of this.Devices)
        {
            console.log(device.Name);
            device.write("mode=test\nscan=1\ntimeout=200\nidol=500000\n");
        }
        console.log("[cProbeDeviceManager] testScanOn - End");
    }
    cProbeDeviceManager.prototype.testScanOff = function()
    {
        console.log("[cProbeDeviceManager] testScanOff - Start");
        for(const device of this.Devices)
        {
            console.log(device.Name);
            device.write("mode=test\nscan=0\ntimeout=200\nidol=500000\n");
        }
        console.log("[cProbeDeviceManager] testScanOff - End");
    }

    ns.cProbeDeviceManager = cProbeDeviceManager;
})(Monitor = Monitor || {});
