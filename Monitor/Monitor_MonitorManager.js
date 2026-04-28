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
        this.TemplateMonitorPlayer = HtmlUtil.searchNodeByClassNameFromDocument(ns.Defines.TEMPLATE_MONITORPLAYER_PANEL);
        this.TemplateMonitorDealer = HtmlUtil.searchNodeByClassNameFromDocument(ns.Defines.TEMPLATE_MONITORDEALER_PANEL);
    }

    /// <summary>
    /// 画面のセットアップ
    /// </summary>
    cMonitorManager.prototype.setup = function()
    {
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

    /// 公開
    ns.cMonitorManager = cMonitorManager;
})(Monitor = Monitor || {});
