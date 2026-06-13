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
        this.GuideManager = new ns.cGuideManager();
        this.LevelStructureManager = new ns.cLevelStructureManager();
        this.SpeechRecognizer = new SpeechRecognizer.cSpeechRecognizer();
        this.SpeechRecognizerManager = new ns.cSpeechRecognizerManager();

        // 初期化
        this.ProbeDeviceManager.init();
        this.ProbeManager.init();
        this.ViewManager.setup();
        this.GuideManager.setup();
        this.LevelStructureManager.setup();
        this.SpeechRecognizer.init();
        this.SpeechRecognizerManager.setup(this.SpeechRecognizer, this.MonitorManager.createMonitorSpeech(ns.Defines.MONITOR_SPEECH_PANEL));
    }

    ns.cEngine = cEngine;
})(Monitor = Monitor || {});
