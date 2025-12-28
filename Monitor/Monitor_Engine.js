(function (ns) {
    "use strict";
    if(ns.cEngine) return;


    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cEngine()
    {
        this.ProbeDeviceManager = null;
    }

    /// <summary>
    /// 初期化
    /// </summary>
    cEngine.prototype.init = function()
    {
        console.log("init.");
        console.log(ns.Defines.VERSION);

        this.ProbeDeviceManager = new ns.cProbeDeviceManager();
        this.ProbeDeviceManager.init();
    }

    ns.cEngine = cEngine;
})(Monitor = Monitor || {});
