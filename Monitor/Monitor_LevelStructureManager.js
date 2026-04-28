(function (ns) {
    "use strict";
    if (ns.cLevelStructureManager) return;

    var STORAGE_KEY = "monitor_settings";

    /// <summary>
    /// デフォルト設定を返す
    /// </summary>
    function defaultLevelStructure() {
        return {
            levels: [
                { level: 1, smallBlind: 100, bigBlind: 200 }
            ],
            selectedLevel: 1
        };
    }

    /// <summary>
    /// localStorage から levelStructure 設定を読み込む
    /// </summary>
    function loadLevelStructure() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                var ls = parsed.levelStructure;
                if (!ls) {
                    return defaultLevelStructure();
                }
                if (!Array.isArray(ls.levels) || ls.levels.length === 0) {
                    ls.levels = defaultLevelStructure().levels;
                }
                if (typeof ls.selectedLevel !== "number") {
                    ls.selectedLevel = ls.levels[0].level;
                }
                return ls;
            }
        } catch (e) {
            console.error("monitor_settings: load failed.", e);
        }
        return defaultLevelStructure();
    }

    /// <summary>
    /// localStorage の levelStructure セクションだけを上書き保存する
    /// </summary>
    function saveLevelStructure(levelStructure) {
        try {
            var current = {};
            try {
                var raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    current = JSON.parse(raw);
                }
            } catch (e) {}
            current.levelStructure = levelStructure;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        } catch (e) {
            console.error("monitor_settings: save failed.", e);
        }
    }

    /// <summary>
    /// コンストラクタ
    /// </summary>
    function cLevelStructureManager() {
        this._levelStructure = null;
        this._levelListContainer = null;
        this._saveTimer = null;
    }

    /// <summary>
    /// 初期化
    /// </summary>
    cLevelStructureManager.prototype.setup = function () {
        this._levelStructure = loadLevelStructure();
        this._buildSettingsUI();
        this._notifyDealerView();
    };

    /// <summary>
    /// 現在のレベル一覧を返す
    /// </summary>
    cLevelStructureManager.prototype.getLevels = function () {
        return this._levelStructure.levels;
    };

    /// <summary>
    /// 選択中レベル番号を返す
    /// </summary>
    cLevelStructureManager.prototype.getSelectedLevel = function () {
        return this._levelStructure.selectedLevel;
    };

    /// <summary>
    /// 選択中レベル番号を保存する
    /// </summary>
    cLevelStructureManager.prototype.setSelectedLevel = function (levelNumber) {
        this._levelStructure.selectedLevel = levelNumber;
        this._scheduleSave();
    };

    /// <summary>
    /// 設定エリア UI の構築
    /// </summary>
    cLevelStructureManager.prototype._buildSettingsUI = function () {
        var settingsArea = document.getElementById("SETTINGS_AREA");
        if (!settingsArea) return;

        // 既存ガイド設定ボックスとの区切り
        var separator = document.createElement("hr");
        separator.className = "settings_separator";
        settingsArea.appendChild(separator);

        // レベルストラクチャー設定ボックス
        var box = document.createElement("div");
        box.className = "settings_box";

        // ヘッダー（折りたたみ）
        var header = document.createElement("div");
        header.className = "settings_box_header";

        var title = document.createElement("span");
        title.textContent = "レベルストラクチャー設定";

        var collapseBtn = document.createElement("button");
        collapseBtn.className = "DEVELOP_COMMAND_BUTTON settings_collapse_btn";
        collapseBtn.textContent = "▼";

        header.appendChild(title);
        header.appendChild(collapseBtn);

        // 本体
        var body = document.createElement("div");
        body.className = "settings_box_body";
        body.style.display = "none"; // デフォルト：閉じ

        // レベルリスト
        var levelList = document.createElement("div");
        levelList.className = "level_list";
        this._levelListContainer = levelList;

        // 追加ボタン
        var self = this;
        var addBtn = document.createElement("button");
        addBtn.className = "DEVELOP_COMMAND_BUTTON";
        addBtn.textContent = "+ レベル追加";
        addBtn.addEventListener("click", function () {
            self._addLevel();
        });

        body.appendChild(levelList);
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
        this._renderLevelList();
    };

    /// <summary>
    /// レベルリスト UI の再描画
    /// </summary>
    cLevelStructureManager.prototype._renderLevelList = function () {
        if (!this._levelListContainer) return;
        var container = this._levelListContainer;
        container.innerHTML = "";

        var levels = this._levelStructure.levels;
        var self = this;

        levels.forEach(function (levelItem) {
            var row = document.createElement("div");
            row.className = "level_row";

            var levelLabel = document.createElement("span");
            levelLabel.className = "level_field";
            levelLabel.textContent = "Lv" + levelItem.level + ":";

            function makeField(labelText, key) {
                var wrap = document.createElement("span");
                wrap.className = "level_field";

                var lbl = document.createElement("label");
                lbl.textContent = labelText;

                var input = document.createElement("input");
                input.type = "number";
                input.className = "level_input";
                input.value = levelItem[key];
                input.style.width = "46px";

                input.addEventListener("change", function () {
                    levelItem[key] = Number(input.value);
                    self._scheduleSave();
                    self._notifyDealerView();
                });

                wrap.appendChild(lbl);
                wrap.appendChild(input);
                return wrap;
            }

            var delBtn = document.createElement("button");
            delBtn.className = "DEVELOP_COMMAND_BUTTON";
            delBtn.textContent = "✕";
            delBtn.addEventListener("click", function () {
                var idx = self._levelStructure.levels.indexOf(levelItem);
                if (idx !== -1) {
                    self._levelStructure.levels.splice(idx, 1);
                    // 削除後のレベル番号を再採番
                    self._levelStructure.levels.forEach(function (l, i) {
                        l.level = i + 1;
                    });
                    // 選択中レベルが存在しなくなった場合は先頭レベルを選択
                    var remaining = self._levelStructure.levels;
                    if (remaining.length > 0) {
                        var exists = remaining.some(function (l) {
                            return l.level === self._levelStructure.selectedLevel;
                        });
                        if (!exists) {
                            self._levelStructure.selectedLevel = remaining[0].level;
                        }
                    }
                }
                self._scheduleSave();
                self._renderLevelList();
                self._notifyDealerView();
            });

            row.appendChild(levelLabel);
            row.appendChild(makeField("SB:", "smallBlind"));
            row.appendChild(makeField("BB:", "bigBlind"));
            row.appendChild(delBtn);

            container.appendChild(row);
        });
    };

    /// <summary>
    /// レベルを追加する
    /// </summary>
    cLevelStructureManager.prototype._addLevel = function () {
        var levels = this._levelStructure.levels;
        var lastLevel = levels.length > 0 ? levels[levels.length - 1] : null;
        var nextLevel = lastLevel ? lastLevel.level + 1 : 1;
        var lastSB = lastLevel ? lastLevel.smallBlind : 100;
        var lastBB = lastLevel ? lastLevel.bigBlind : 200;
        levels.push({ level: nextLevel, smallBlind: lastSB, bigBlind: lastBB });
        this._scheduleSave();
        this._renderLevelList();
        this._notifyDealerView();
    };

    /// <summary>
    /// ディーラービューのブラインドセレクトを更新する
    /// </summary>
    cLevelStructureManager.prototype._notifyDealerView = function () {
        if (!ns.Engine || !ns.Engine.ProbeManager || !ns.Engine.ProbeManager.DealerProbe) return;
        var view = ns.Engine.ProbeManager.DealerProbe.View;
        if (!view || typeof view.buildBlindSelect !== "function") return;
        view.buildBlindSelect(
            this._levelStructure.levels,
            this._levelStructure.selectedLevel
        );
    };

    /// <summary>
    /// 保存をスケジュールする（過剰な連続書き込みを避けるためデバウンス）
    /// </summary>
    cLevelStructureManager.prototype._scheduleSave = function () {
        if (this._saveTimer !== null) {
            clearTimeout(this._saveTimer);
        }
        var self = this;
        this._saveTimer = setTimeout(function () {
            self._saveTimer = null;
            saveLevelStructure(self._levelStructure);
        }, 300);
    };

    ns.cLevelStructureManager = cLevelStructureManager;
})(Monitor = Monitor || {});
