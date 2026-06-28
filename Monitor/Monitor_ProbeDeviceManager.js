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
        HtmlUtil.addButtonEventListenerByID(ns.Defines.COMMAND_DEVELOP_PROVE_DEVICE_MANAGER_DEBUG_DEAL_CARD, this.debugDealCard.bind(this));
        HtmlUtil.addButtonEventListenerByID(ns.Defines.COMMAND_DEVELOP_PROVE_DEVICE_MANAGER_DEBUG_FLOP, this.debugFlop.bind(this));
        HtmlUtil.addButtonEventListenerByID(ns.Defines.COMMAND_DEVELOP_PROVE_DEVICE_MANAGER_DEBUG_TURN, this.debugTurn.bind(this));
        HtmlUtil.addButtonEventListenerByID(ns.Defines.COMMAND_DEVELOP_PROVE_DEVICE_MANAGER_DEBUG_RIVER, this.debugRiver.bind(this));
    }

    /// <summary>
    /// デバイス → ブラウザへの通知
    /// </summary>
    cProbeDeviceManager.prototype.onNofitied = function(argValue)
    {
        const target = argValue.probe;
        ns.Engine.ProbeManager.notifiedFromProbe(target, argValue);
    }

    /// <summary>
    /// ブラウザ → 指定デバイスへの通知
    /// </summary>
    cProbeDeviceManager.prototype.writeByProbeName = function(argTarget, argValue)
    {
        const devices = this.Devices.filter(x => x.ProbeName.startsWith(argTarget));
        for(const device of devices)
        {
            device.write(argValue);
        }
    }

    /// <summary>
    /// ブラウザ → 全デバイスへの通知
    /// </summary>
    cProbeDeviceManager.prototype.writeAll = function(argValue)
    {
        for(const device of this.Devices)
        {
            device.write(argValue);
        }
    }

    /// <summary>
    /// ブラウザ → センターモニターへの通知
    /// </summary>
    cProbeDeviceManager.prototype.writeDealerDisplayState = function(argValue)
    {
        const devices = this.Devices.filter(x => x.IsCenterMonitor);
        for(const device of devices)
        {
            device.write(argValue);
        }
    }

    /// <summary>
    /// ブラウザ → 指定デバイスへの通知: スキャン開始
    /// </summary>
    cProbeDeviceManager.prototype.writeStartScan = function(argTarget)
    {
		console.log(`[cProbeDeviceManager] writeStartScan(${argTarget})`);
        this.writeByProbeName(argTarget, "mode=scan\nscan=1\ntimeout=200\nidol=5000\nheartbeat=10000\n");
    }

    /// <summary>
    /// ブラウザ → 指定デバイスへの通知: スキャン停止
    /// </summary>
    cProbeDeviceManager.prototype.writeStopScan = function(argTarget)
    {
		console.log(`[cProbeDeviceManager] writeStopScan(${argTarget})`);
        this.writeByProbeName(argTarget, "mode=scan\nscan=0\ntimeout=200\nidol=5000\nheartbeat=10000\n");
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
		console.log("[cProbeDeviceManager] remove " + device.Name + "(" + device.ProbeName + ")");
        ns.Engine.ProbeManager.onRemoveProbe(device.ProbeName);
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
        this.writeAll("mode=test\nscan=1\ntimeout=200\nidol=5000\nheartbeat=10000\n");
        console.log("[cProbeDeviceManager] testScanOn - End");
    }
    cProbeDeviceManager.prototype.testScanOff = function()
    {
        console.log("[cProbeDeviceManager] testScanOff - Start");
        this.writeAll("mode=test\nscan=0\ntimeout=200\nidol=5000\nheartbeat=10000\n");
        console.log("[cProbeDeviceManager] testScanOff - End");
    }

    /// <summary>
    /// デバッグ用途でシートにカードを配布する。
    /// Alive かつカードが配布されていないシートに対して、Deck から ランダムにカードを配布する。
    /// デバッグ用なので、配布されたカードはスキャンで読み取られたものとして扱う。
    /// </summary>
    cProbeDeviceManager.prototype.debugDealCard = function()
    {
        console.log("[cProbeDeviceManager] debugDealCard - Start");
        
        // Alive かつカードが配布されていないシートに対して処理
        for(const probe of ns.Engine.ProbeManager.PlayerProbeCollection)
        {
            if(probe.Alive && probe.Cardslot.Cards == null)
            {
                // Deck からランダムにカードを配布（Capacity分）
                for(let i = 0; i < probe.Cardslot.Capacity; i++)
                {
                    const card = ns.Engine.ProbeManager.Carddeck.Deck.drawCard();
                    // スキャンで読み取られたものとして ReceiveHistory に追加
                    probe.Cardslot.ReceiveHistory.push(card);
                }
                
                // 推定カードを算出して表示
                const estimatedCards = probe.Cardslot.estimate();
                if(probe.View)
                {
                    probe.View.showCard(estimatedCards);
                }
                if(probe.Monitor)
                {
                    probe.Monitor.showCard(estimatedCards);
                }

                ns.Engine.ProbeManager.updateWinRate();
                probe.Cardslot.fix();
            }
        }
        ns.Engine.ProbeManager.updateDealerDisplayState();
        
        console.log("[cProbeDeviceManager] debugDealCard - End");
    }

    /// <summary>
    /// デバッグ用途でフロップを配布する。
    /// ボードにフロップを Deck からランダムに配布する。
    /// デバッグ用なので、配布されたカードはスキャンで読み取られたものとして扱う。
    /// 勝率計算も更新する
    /// </summary>
    cProbeDeviceManager.prototype.debugFlop = function()
    {
        console.log("[cProbeDeviceManager] debugFlop - Start");

        const dealerProbe = ns.Engine.ProbeManager.DealerProbe;
        const cardslot = dealerProbe.BoardFlopSlot;
        if(cardslot.Cards == null)
        {
            cardslot.ReceiveHistory = [];
            for(let i = 0; i < cardslot.Capacity; i++)
            {
                const card = ns.Engine.ProbeManager.Carddeck.Deck.drawCard();
                cardslot.ReceiveHistory.push(card);
            }

            cardslot.fix();
            const flopCards = cardslot.Cards;
            dealerProbe.View.showFlopCard(flopCards);
            dealerProbe.Monitor.showFlopCard(flopCards);
            ns.Engine.ProbeManager.updateWinRate();
            ns.Engine.ProbeManager.updateDealerDisplayState();
        }

        console.log("[cProbeDeviceManager] debugFlop - End");
    }

    /// <summary>
    /// デバッグ用途でターンを配布する。
    /// ボードにターンを Deck からランダムに配布する。
    /// デバッグ用なので、配布されたカードはスキャンで読み取られたものとして扱う。
    /// 勝率計算も更新する
    /// </summary>
    cProbeDeviceManager.prototype.debugTurn = function()
    {
        console.log("[cProbeDeviceManager] debugTurn - Start");

        const dealerProbe = ns.Engine.ProbeManager.DealerProbe;
        const cardslot = dealerProbe.BoardTurnSlot;
        if(cardslot.Cards == null)
        {
            cardslot.ReceiveHistory = [];
            for(let i = 0; i < cardslot.Capacity; i++)
            {
                const card = ns.Engine.ProbeManager.Carddeck.Deck.drawCard();
                cardslot.ReceiveHistory.push(card);
            }

            cardslot.fix();
            const turnCards = cardslot.Cards;
            dealerProbe.View.showTurnCard(turnCards);
            dealerProbe.Monitor.showTurnCard(turnCards);
            ns.Engine.ProbeManager.updateWinRate();
            ns.Engine.ProbeManager.updateDealerDisplayState();
        }

        console.log("[cProbeDeviceManager] debugTurn - End");
    }

    /// <summary>
    /// デバッグ用途でリバーを配布する。
    /// ボードにリバーを Deck からランダムに配布する。
    /// デバッグ用なので、配布されたカードはスキャンで読み取られたものとして扱う。
    /// 勝率計算も更新する
    /// </summary>
    cProbeDeviceManager.prototype.debugRiver = function()
    {
        console.log("[cProbeDeviceManager] debugRiver - Start");

        const dealerProbe = ns.Engine.ProbeManager.DealerProbe;
        const cardslot = dealerProbe.BoardRiverSlot;
        if(cardslot.Cards == null)
        {
            cardslot.ReceiveHistory = [];
            for(let i = 0; i < cardslot.Capacity; i++)
            {
                const card = ns.Engine.ProbeManager.Carddeck.Deck.drawCard();
                cardslot.ReceiveHistory.push(card);
            }

            cardslot.fix();
            const riverCards = cardslot.Cards;
            dealerProbe.View.showRiverCard(riverCards);
            dealerProbe.Monitor.showRiverCard(riverCards);
            ns.Engine.ProbeManager.updateWinRate();
            ns.Engine.ProbeManager.updateDealerDisplayState();
        }

        console.log("[cProbeDeviceManager] debugRiver - End");
    }


    ns.cProbeDeviceManager = cProbeDeviceManager;
})(Monitor = Monitor || {});
