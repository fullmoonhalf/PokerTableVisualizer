(function (ns) {
    "use strict";
    if(ns.cProbe) return;

	// =====================================================================
	// プローブとの通信まわり
	// =====================================================================
	function cProbe(argBLECharacteristic)
	{
		this.ProbeName = "";
		this.BLECharacteristic = argBLECharacteristic;
		this.SeatView = null;
		this.ReceiveHistory = [];
	}
	// 切断時処理
	cProbe.prototype.onDisconnected = function(event)
	{
		this.SeatView.setDisconnect();
	}
	// 各プローブからのデータ受信時の処理
	cProbe.prototype.onCharacteristicValueChanged = function(event)
	{
		try {
			let characteristic = event.target;
			const decoder = new TextDecoder('utf-8');
			const str = decoder.decode(characteristic.value);
			const json = JSON.parse(str);
			this.ProbeName = json.probe;

			if(this.SeatView == null)
			{
				this.SeatView = PokerBrowser.engine.getSeatView(this.ProbeName);
			}
			if(this.SeatView == null)
			{
				return;
			}

			// 読み込み閾値の変更
			let rssi_threshold = 180;
			const scan_count = this.SeatView.getScanCount();

			// カードの更新
			let need_to_update = false;
			let max_rssi = 0;
			if(json.cards.length >= 1)
			{
				for(const card of json.cards)
				{
					if(PokerModel.isUsedCard(card.card))
					{
						continue;
					}
					if(card.rssi >= rssi_threshold)
					{
						this.ReceiveHistory.push(card.card);
						if(this.ReceiveHistory.length > 16)
						{
							this.ReceiveHistory.shift();
						}
						need_to_update = true;
					}
					if(card.rssi > max_rssi)
					{
						max_rssi = card.rssi;
					}
				}
			}

			if(need_to_update)
			{
				const hold_cards = this.getTopNFrequentItems(this.ReceiveHistory, scan_count);
				this.SeatView.setHoleCards(hold_cards);
			}

			this.SeatView.setRSSI(max_rssi);
			this.SeatView.setBattery(json.battery);
		}
		catch(e){
			console.log("[cProbe] onCharacteristicValueChanged error ", this.ProbeName, e);
		}
	}
	// 配列内の要素を出現回数でカウントし、多い順に上位N個を返す関数
	cProbe.prototype.getTopNFrequentItems = function(array, n) 
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
	cProbe.prototype.proceedRound = function()
	{
		this.ReceiveHistory = [];
	}

    ns.cProbe = cProbe
})(PokerBrowser = PokerBrowser || {});
