(function (ns) {
    "use strict";
    if (ns.cGuideManager) return;

    var STORAGE_KEY = "monitor_settings";

    /// <summary>
    /// デフォルト設定を返す
    /// </summary>
    function defaultSettings() {
        return {
            guide: {
                enabled: false,
                guides: []
            }
        };
    }

    /// <summary>
    /// localStorage から設定を読み込む
    /// </summary>
    function loadSettings() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                // guide プロパティが存在しない場合はデフォルトで補完
                if (!parsed.guide) {
                    parsed.guide = defaultSettings().guide;
                }
                if (typeof parsed.guide.enabled !== "boolean") {
                    parsed.guide.enabled = false;
                }
                if (!Array.isArray(parsed.guide.guides)) {
                    parsed.guide.guides = [];
                }
                return parsed;
            }
        } catch (e) {
            console.error("monitor_settings: load failed.", e);
        }
        return defaultSettings();
    }

    /// <summary>
    /// localStorage の guide セクションだけを上書き保存する
    /// </summary>
    function saveSettings(settings) {
        try {
            var current = {};
            try {
                var raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    current = JSON.parse(raw);
                }
            } catch (e) {}
            current.guide = settings.guide;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        } catch (e) {
            console.error("monitor_settings: save failed.", e);
        }
    }

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cGuideManager() {
        this._settings = null;
        this._overlayContainer = null;
        this._settingsBox = null;
        this._guideListContainer = null;
        this._toggleButton = null;
        this._saveTimer = null;
    }

    /// <summary>
    /// 初期化
    /// </summary>
    cGuideManager.prototype.setup = function () {
        this._settings = loadSettings();
        this._buildSettingsUI();
        this._buildOverlay();
        this._renderGuideList();
        this._renderOverlay();
    };

    /// <summary>
    /// 設定エリア UI の構築
    /// </summary>
    cGuideManager.prototype._buildSettingsUI = function () {
        var settingsArea = document.getElementById("SETTINGS_AREA");
        if (!settingsArea) return;

        // ガイド設定ボックス
        var box = document.createElement("div");
        box.className = "settings_box";

        // ヘッダー（折りたたみ）
        var header = document.createElement("div");
        header.className = "settings_box_header";

        var title = document.createElement("span");
        title.textContent = "ガイド設定";

        var collapseBtn = document.createElement("button");
        collapseBtn.className = "DEVELOP_COMMAND_BUTTON settings_collapse_btn";
        collapseBtn.textContent = "▼";

        header.appendChild(title);
        header.appendChild(collapseBtn);

        // 本体
        var body = document.createElement("div");
        body.className = "settings_box_body";
        body.style.display = "none"; // デフォルト：閉じ

        // ON/OFF トグル
        var toggleRow = document.createElement("div");
        toggleRow.className = "settings_row";

        var toggleLabel = document.createElement("span");
        toggleLabel.textContent = "表示：";

        var toggleBtn = document.createElement("button");
        toggleBtn.className = "DEVELOP_COMMAND_BUTTON";
        toggleBtn.textContent = this._settings.guide.enabled ? "ON" : "OFF";
        this._toggleButton = toggleBtn;

        var self = this;
        toggleBtn.addEventListener("click", function () {
            self._settings.guide.enabled = !self._settings.guide.enabled;
            toggleBtn.textContent = self._settings.guide.enabled ? "ON" : "OFF";
            self._scheduleSave();
            self._renderOverlay();
        });

        toggleRow.appendChild(toggleLabel);
        toggleRow.appendChild(toggleBtn);

        // ガイドリスト
        var guideList = document.createElement("div");
        guideList.className = "guide_list";
        this._guideListContainer = guideList;

        // 追加ボタン
        var addBtn = document.createElement("button");
        addBtn.className = "DEVELOP_COMMAND_BUTTON";
        addBtn.textContent = "+ ガイド追加";
        addBtn.addEventListener("click", function () {
            self._addGuide();
        });

        body.appendChild(toggleRow);
        body.appendChild(guideList);
        body.appendChild(addBtn);

        box.appendChild(header);
        box.appendChild(body);

        // 折りたたみ動作
        collapseBtn.addEventListener("click", function () {
            var isOpen = body.style.display !== "none";
            body.style.display = isOpen ? "none" : "block";
            collapseBtn.textContent = isOpen ? "▼" : "▲";
        });

        settingsArea.appendChild(box);
        this._settingsBox = box;
    };

    /// <summary>
    /// オーバーレイ要素の構築
    /// </summary>
    cGuideManager.prototype._buildOverlay = function () {
        var overlay = document.getElementById("GUIDE_OVERLAY");
        if (!overlay) return;
        this._overlayContainer = overlay;
    };

    /// <summary>
    /// ガイドリスト UI の再描画
    /// </summary>
    cGuideManager.prototype._renderGuideList = function () {
        if (!this._guideListContainer) return;
        var container = this._guideListContainer;
        container.innerHTML = "";

        var guides = this._settings.guide.guides;
        var self = this;

        guides.forEach(function (guide) {
            var row = document.createElement("div");
            row.className = "guide_row";

            function makeField(labelText, key, placeholder) {
                var wrap = document.createElement("span");
                wrap.className = "guide_field";

                var lbl = document.createElement("label");
                lbl.textContent = labelText;

                var input = document.createElement("input");
                input.type = key === "color" ? "color" : "number";
                input.className = "guide_input";
                input.value = guide[key];
                if (key !== "color") {
                    input.placeholder = placeholder || key;
                    input.style.width = "46px";
                }

                input.addEventListener("change", function () {
                    guide[key] = key === "color" ? input.value : Number(input.value);
                    self._scheduleSave();
                    self._renderOverlay();
                });

                wrap.appendChild(lbl);
                wrap.appendChild(input);
                return wrap;
            }

            var delBtn = document.createElement("button");
            delBtn.className = "DEVELOP_COMMAND_BUTTON";
            delBtn.textContent = "✕";
            delBtn.addEventListener("click", function () {
                var idx = self._settings.guide.guides.indexOf(guide);
                if (idx !== -1) {
                    self._settings.guide.guides.splice(idx, 1);
                }
                self._scheduleSave();
                self._renderGuideList();
                self._renderOverlay();
            });

            row.appendChild(makeField("x:", "x", "0"));
            row.appendChild(makeField("y:", "y", "0"));
            row.appendChild(makeField("w:", "width", "100"));
            row.appendChild(makeField("h:", "height", "100"));
            row.appendChild(makeField("色:", "color", "#ffffff"));
            row.appendChild(delBtn);

            container.appendChild(row);
        });
    };

    /// <summary>
    /// オーバーレイの再描画
    /// </summary>
    cGuideManager.prototype._renderOverlay = function () {
        if (!this._overlayContainer) return;
        var container = this._overlayContainer;
        container.innerHTML = "";

        if (!this._settings.guide.enabled) return;

        var guides = this._settings.guide.guides;
        guides.forEach(function (guide) {
            var div = document.createElement("div");
            div.className = "guide_rect";
            div.style.left = guide.x + "px";
            div.style.top = guide.y + "px";
            div.style.width = guide.width + "px";
            div.style.height = guide.height + "px";
            div.style.borderColor = guide.color;
            container.appendChild(div);
        });
    };

    /// <summary>
    /// ガイドを追加する
    /// </summary>
    cGuideManager.prototype._addGuide = function () {
        var guide = {
            id: "guide-" + Date.now(),
            x: 0,
            y: 0,
            width: 160,
            height: 90,
            color: "#444444"
        };
        this._settings.guide.guides.push(guide);
        this._scheduleSave();
        this._renderGuideList();
        this._renderOverlay();
    };

    /// <summary>
    /// 保存をスケジュールする（過剰な連続書き込みを避けるためデバウンス）
    /// </summary>
    cGuideManager.prototype._scheduleSave = function () {
        if (this._saveTimer !== null) {
            clearTimeout(this._saveTimer);
        }
        var self = this;
        this._saveTimer = setTimeout(function () {
            self._saveTimer = null;
            saveSettings(self._settings);
        }, 300);
    };

    ns.cGuideManager = cGuideManager;
})(Monitor = Monitor || {});
