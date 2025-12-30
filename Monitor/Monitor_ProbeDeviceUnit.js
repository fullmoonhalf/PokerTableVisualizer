(function (ns) {
    "use strict";
    if(ns.cProbeDeviceUnit) return;

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cProbeDeviceUnit(argOwner, argName, argBLECharacteristicTX, argBLECharacteristicRX)
    {
		this.Owner = argOwner;
		this.Name = argName;
		this.BLECharacteristicRX = argBLECharacteristicRX;
		this.BLECharacteristicTX = argBLECharacteristicTX;

		console.log("[cProbeDeviceUnit] name", argName );
		console.log("[cProbeDeviceUnit] BLECharacteristicTX", this.BLECharacteristicTX.uuid );
		console.log("[cProbeDeviceUnit] BLECharacteristicRX", this.BLECharacteristicRX.uuid );
		if (!this.BLECharacteristicRX.properties.write &&
			!this.BLECharacteristicRX.properties.writeWithoutResponse) 
		{
			console.log("[cProbeDeviceUnit] BLECharacteristicRX - cannot writable");
		}
	}

    /// <summary>
    /// 切断時処理
    /// </summary>
	cProbeDeviceUnit.prototype.onDisconnected = function(event)
	{
		this.Owner.remove(this);
	}

    /// <summary>
    /// データ受信時の処理
    /// </summary>
	cProbeDeviceUnit.prototype.onCharacteristicValueChanged = function(event)
	{
		try {
			let characteristic = event.target;
			const str = HtmlUtil.TextDecoder.decode(characteristic.value);
			console.log("[cProbeDeviceUnit]", str);
			const json = JSON.parse(str);
			console.log("[cProbeDeviceUnit]", json);
		}
		catch(e){
			console.log("[cProbeDeviceUnit] onCharacteristicValueChanged error ", this.ProbeName, e);
		}
	}

    /// <summary>
    /// データ送信の処理
    /// </summary>
	cProbeDeviceUnit.prototype.write = async function(text)
	{
		if (!this.BLECharacteristicRX)
		{
			throw new Error('Not connected.');
		}
		console.log("[cProbeDeviceUnit] write" + text);
		const bytes = HtmlUtil.TextEncoder.encode(text);
		await this.BLECharacteristicRX.writeValue(bytes);
	}

    ns.cProbeDeviceUnit = cProbeDeviceUnit;
})(Monitor = Monitor || {});
