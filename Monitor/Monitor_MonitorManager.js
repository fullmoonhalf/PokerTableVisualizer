(function (ns) {
    "use strict";
	if(	ns.cMonitorManager )
	{
		return;
	}

    var STORAGE_KEY = "monitor_settings";

    /// <summary>
    /// モニター位置を localStorage から読み込む
    /// </summary>
    function loadMonitorPosition(monitorId) {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var settings = JSON.parse(raw);
            if (!settings.monitorPositions) return null;
            var pos = settings.monitorPositions[monitorId];
            if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
                return pos;
            }
        } catch (e) {
            console.error("monitor_settings: load position failed.", e);
        }
        return null;
    }

    /// <summary>
    /// モニター位置を localStorage へ保存する
    /// </summary>
    function saveMonitorPosition(monitorId, x, y) {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            var settings = {};
            if (raw) {
                settings = JSON.parse(raw);
            }
            if (!settings.monitorPositions) {
                settings.monitorPositions = {};
            }
            settings.monitorPositions[monitorId] = { x: x, y: y };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("monitor_settings: save position failed.", e);
        }
    }

    /// <summary>
    /// モニター要素に保存済み位置を復元する
    /// </summary>
    function restoreMonitorPosition(dragable, monitorId) {
        var pos = loadMonitorPosition(monitorId);
        if (pos) {
            try {
                dragable.setPosition(pos.x, pos.y);
                dragable.apply();
            } catch (e) {
                console.error("monitor position restore failed.", e);
            }
        }
    }

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cMonitorManager()
    {
        this.ContainerMonitorPlayer = document.getElementById(ns.Defines.CONTAINER_MONITORPLAYER_PANEL);
        this.ContainerMonitorDealer = document.getElementById(ns.Defines.CONTAINER_MONITORDEALER_PANEL);
        this.ContainerMonitorSpeech = document.getElementById(ns.Defines.CONTAINER_MONITORSPEECH_PANEL);
        this.TemplateMonitorPlayer = HtmlUtil.searchNodeByClassNameFromDocument(ns.Defines.TEMPLATE_MONITORPLAYER_PANEL);
        this.TemplateMonitorDealer = HtmlUtil.searchNodeByClassNameFromDocument(ns.Defines.TEMPLATE_MONITORDEALER_PANEL);
        this.TemplateMonitorSpeech = HtmlUtil.searchNodeByClassNameFromDocument(ns.Defines.TEMPLATE_MONITORSPEECH_PANEL);
    }

    /// <summary>
    /// 画面のセットアップ
    /// </summary>
    cMonitorManager.prototype.setup = function()
    {
        this.createMonitorSpeech(ns.Defines.MONITOR_SPEECH_PANEL);
    }

    /// <summary>
    /// プレイヤーパネルの生成
    /// </summary>
    cMonitorManager.prototype.createMonitorPlayer = function(monitorId)
    {
        const node = this.TemplateMonitorPlayer.cloneNode(true);
        this.ContainerMonitorPlayer.appendChild(node);
        const monitor = new ns.cProbePlayerMonitor(node);
        monitor.MonitorId = monitorId || null;
        if (monitorId) {
            monitor.DragableObject.onDragEndCallback = function(x, y) {
                saveMonitorPosition(monitorId, x, y);
            };
            restoreMonitorPosition(monitor.DragableObject, monitorId);
        }
        return monitor;
    }

    /// <summary>
    /// ディーラーパネルの生成
    /// </summary>
    cMonitorManager.prototype.createMonitorDealer = function(monitorId)
    {
        const node = this.TemplateMonitorDealer.cloneNode(true);
        this.ContainerMonitorDealer.appendChild(node);
        const monitor = new ns.cProbeDealerMonitor(node);
        monitor.MonitorId = monitorId || null;
        if (monitorId) {
            monitor.DragableControl.onDragEndCallback = function(x, y) {
                saveMonitorPosition(monitorId, x, y);
            };
            restoreMonitorPosition(monitor.DragableControl, monitorId);
        }
        return monitor;
    }

    /// <summary>
    /// 音声パネルの生成
    /// </summary>
    cMonitorManager.prototype.createMonitorSpeech = function(monitorId)
    {
        if (!this.TemplateMonitorSpeech || !this.ContainerMonitorSpeech) return null;

        const node = this.TemplateMonitorSpeech.cloneNode(true);
        this.ContainerMonitorSpeech.appendChild(node);

        const dragableRoot = HtmlUtil.searchNodeByClassNameFromChildren(node, ns.Defines.TEMPLATE_MONITORSPEECH_PANEL_DRAGABLE_ROOT);
        const recognizedTextNode = HtmlUtil.searchNodeByClassNameFromChildren(node, ns.Defines.TEMPLATE_MONITORSPEECH_PANEL_RECOGNIZED_TEXT_VALUE);
        const parsedCommandNode = HtmlUtil.searchNodeByClassNameFromChildren(node, ns.Defines.TEMPLATE_MONITORSPEECH_PANEL_PARSED_COMMAND_VALUE);
        if (!dragableRoot || !recognizedTextNode || !parsedCommandNode) return null;

        recognizedTextNode.id = ns.Defines.MONITOR_SPEECH_RECOGNIZED_TEXT;
        parsedCommandNode.id = ns.Defines.MONITOR_SPEECH_PARSED_COMMAND;
        const dragableObject = new HtmlUtil.cDragableElement(dragableRoot);
        if (monitorId) {
            dragableObject.onDragEndCallback = function(x, y) {
                saveMonitorPosition(monitorId, x, y);
            };
            restoreMonitorPosition(dragableObject, monitorId);
        }

        return {
            HtmlRoot: node,
            DragableObject: dragableObject,
            RecognizedTextNode: recognizedTextNode,
            ParsedCommandNode: parsedCommandNode
        };
    }

    /// 公開
    ns.cMonitorManager = cMonitorManager;
})(Monitor = Monitor || {});
