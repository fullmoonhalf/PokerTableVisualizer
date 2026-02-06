(function (ns) {
    "use strict";
    if(ns.cEngine) return;


    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cEngine()
    {
        this.ProbeDeviceManager = null;
        this.ViewManager = null;
    }

    /// <summary>
    /// 初期化
    /// </summary>
    cEngine.prototype.init = function()
    {
        console.log("init.");
        console.log(ns.Defines.VERSION);

        // オブジェクト生成
        this.ProbeDeviceManager = new ns.cProbeDeviceManager();
        this.ProbeManager = new ns.cProbeManager();
        this.ViewManager = new ns.cViewManager();
        this.MonitorManager = new ns.cMonitorManager();

        // 初期化
        this.ProbeDeviceManager.init();
        this.ProbeManager.init();
        this.ViewManager.setup();
        this.MonitorManager.setup();
    }

    ns.cEngine = cEngine;
})(Monitor = Monitor || {});
