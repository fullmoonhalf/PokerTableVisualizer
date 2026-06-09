(function (ns) {
    "use strict";
    if (ns.cSpeechRecognizerManager) return;

    function cSpeechRecognizerManager() {
        this._speechRecognizer = null;
        this._statusValue = null;
        this._startButton = null;
        this._stopButton = null;
        this._seatWordMap = {
            "一番": "Seat01", "1番": "Seat01", "いちばん": "Seat01",
            "二番": "Seat02", "2番": "Seat02", "にばん": "Seat02",
            "三番": "Seat03", "3番": "Seat03", "さんばん": "Seat03",
            "四番": "Seat04", "4番": "Seat04", "よんばん": "Seat04",
            "五番": "Seat05", "5番": "Seat05", "ごばん": "Seat05",
            "六番": "Seat06", "6番": "Seat06", "ろくばん": "Seat06",
            "七番": "Seat07", "7番": "Seat07", "ななばん": "Seat07",
            "八番": "Seat08", "8番": "Seat08", "はちばん": "Seat08",
            "九番": "Seat09", "9番": "Seat09", "きゅうばん": "Seat09",
            "十番": "Seat10", "10番": "Seat10", "じゅうばん": "Seat10"
        };
        this._actionWordMap = {
            "フォールド": { label: "Fold", playerAction: PokerConst.PlayerAction.Fold },
            "チェック": { label: "Check", playerAction: PokerConst.PlayerAction.Check },
            "コール": { label: "Call", playerAction: PokerConst.PlayerAction.Call },
            "ベット": { label: "Bet", playerAction: PokerConst.PlayerAction.Bet },
            "レイズ": { label: "Raise", playerAction: PokerConst.PlayerAction.Raise },
            "オールイン": { label: "AllIn", playerAction: PokerConst.PlayerAction.AllIn },
            "全部": { label: "AllIn", playerAction: PokerConst.PlayerAction.AllIn }
        };
        this._seatWords = Object.keys(this._seatWordMap).sort(function (a, b) { return b.length - a.length; });
    }

    cSpeechRecognizerManager.prototype.setup = function (speechRecognizer) {
        this._speechRecognizer = speechRecognizer;
        this._buildSettingsUI();

        if (this._speechRecognizer && this._speechRecognizer.setOnStateChanged) {
            this._speechRecognizer.setOnStateChanged(this._onStateChanged.bind(this));
        } else {
            this._updateView();
        }
        if (this._speechRecognizer && this._speechRecognizer.setOnResult) {
            this._speechRecognizer.setOnResult(this._onSpeechResult.bind(this));
        }
    };

    cSpeechRecognizerManager.prototype._buildSettingsUI = function () {
        var settingsArea = document.getElementById("SETTINGS_AREA");
        if (!settingsArea) return;

        var separator = document.createElement("hr");
        separator.className = "settings_separator";
        settingsArea.appendChild(separator);

        var box = document.createElement("div");
        box.className = "settings_box";

        var header = document.createElement("div");
        header.className = "settings_box_header";

        var title = document.createElement("span");
        title.textContent = "音声認識";

        var collapseBtn = document.createElement("button");
        collapseBtn.className = "DEVELOP_COMMAND_BUTTON settings_collapse_btn";
        collapseBtn.textContent = "▼";

        header.appendChild(title);
        header.appendChild(collapseBtn);

        var body = document.createElement("div");
        body.className = "settings_box_body";
        body.style.display = "none";

        var statusRow = document.createElement("div");
        statusRow.className = "settings_row";

        var statusLabel = document.createElement("span");
        statusLabel.textContent = "状態: ";

        var statusValue = document.createElement("span");
        statusValue.className = "speech_recognition_status";
        statusValue.textContent = "停止";
        this._statusValue = statusValue;

        statusRow.appendChild(statusLabel);
        statusRow.appendChild(statusValue);

        var controlRow = document.createElement("div");
        controlRow.className = "settings_row";

        var startBtn = document.createElement("button");
        startBtn.className = "DEVELOP_COMMAND_BUTTON";
        startBtn.textContent = "開始";
        this._startButton = startBtn;

        var stopBtn = document.createElement("button");
        stopBtn.className = "DEVELOP_COMMAND_BUTTON";
        stopBtn.textContent = "停止";
        this._stopButton = stopBtn;

        var self = this;
        startBtn.addEventListener("click", function () {
            if (self._speechRecognizer && self._speechRecognizer.start) {
                self._speechRecognizer.start();
            }
            self._updateView();
        });

        stopBtn.addEventListener("click", function () {
            if (self._speechRecognizer && self._speechRecognizer.stop) {
                self._speechRecognizer.stop();
            }
            self._updateView();
        });

        controlRow.appendChild(startBtn);
        controlRow.appendChild(stopBtn);

        body.appendChild(statusRow);
        body.appendChild(controlRow);

        box.appendChild(header);
        box.appendChild(body);

        collapseBtn.addEventListener("click", function () {
            var isOpen = body.style.display !== "none";
            body.style.display = isOpen ? "none" : "block";
            collapseBtn.textContent = isOpen ? "▼" : "▲";
        });

        settingsArea.appendChild(box);

        this._updateView();
    };

    cSpeechRecognizerManager.prototype._onStateChanged = function () {
        this._updateView();
    };

    cSpeechRecognizerManager.prototype._onSpeechResult = function (recognizedText) {
        var normalizedText = this._normalizeText(recognizedText);
        var parsedCommand = this._parseVoiceCommand(normalizedText);
        var executed = false;
        if (parsedCommand) {
            executed = this._executeVoiceCommand(parsedCommand);
        }

        console.log("[SpeechCommand]", {
            recognizedText: recognizedText,
            normalizedText: normalizedText,
            parsedCommand: parsedCommand,
            executed: executed
        });

        this._showSpeechStatus(this._buildSpeechStatusMessage(recognizedText, parsedCommand, executed));
    };

    cSpeechRecognizerManager.prototype._normalizeText = function (text) {
        var normalized = (text || "")
            .trim()
            .replace(/[０-９]/g, function (value) {
                return String.fromCharCode(value.charCodeAt(0) - 0xFEE0);
            })
            .replace(/[ 　\t\r\n]/g, "")
            .replace(/[、。,.]/g, "");
        return normalized;
    };

    cSpeechRecognizerManager.prototype._parseVoiceCommand = function (normalizedText) {
        if (!normalizedText) return null;

        var seatWord = null;
        var seatName = null;
        for (var i = 0; i < this._seatWords.length; i++) {
            var current = this._seatWords[i];
            if (normalizedText.indexOf(current) !== 0) continue;
            seatWord = current;
            seatName = this._seatWordMap[current];
            break;
        }
        if (!seatWord || !seatName) return null;

        var actionWord = normalizedText.substring(seatWord.length);
        if (!actionWord) return null;
        var actionInfo = this._actionWordMap[actionWord];
        if (!actionInfo) return null;

        return {
            seatWord: seatWord,
            seatName: seatName,
            actionWord: actionWord,
            actionLabel: actionInfo.label,
            playerAction: actionInfo.playerAction
        };
    };

    cSpeechRecognizerManager.prototype._executeVoiceCommand = function (parsedCommand) {
        if (!parsedCommand || !ns.Engine || !ns.Engine.ProbeManager) return false;
        var probe = ns.Engine.ProbeManager.PlayerProbeCollection.find(function (model) {
            return model.Name === parsedCommand.seatName;
        });
        if (!probe || !probe.View) return false;

        if (parsedCommand.playerAction === PokerConst.PlayerAction.Bet ||
            parsedCommand.playerAction === PokerConst.PlayerAction.Raise)
        {
            if (ns.Engine.ProbeManager.getAggressivePlayerAction() !== parsedCommand.playerAction) {
                return false;
            }
            if (!probe.View.ActoinAggressiveButton) return false;
            probe.View.ActoinAggressiveButton.click();
            return true;
        }

        switch (parsedCommand.playerAction) {
            case PokerConst.PlayerAction.Fold:
                if (!probe.View.ActoinFoldButton) return false;
                probe.View.ActoinFoldButton.click();
                return true;
            case PokerConst.PlayerAction.Check:
                if (!probe.View.ActoinCheckButton) return false;
                probe.View.ActoinCheckButton.click();
                return true;
            case PokerConst.PlayerAction.Call:
                if (!probe.View.ActoinCallButton) return false;
                probe.View.ActoinCallButton.click();
                return true;
            case PokerConst.PlayerAction.AllIn:
                if (!probe.View.ActoinAllinButton) return false;
                probe.View.ActoinAllinButton.click();
                return true;
            default:
                return false;
        }
    };

    cSpeechRecognizerManager.prototype._showSpeechStatus = function (statusText) {
        if (!ns.Engine || !ns.Engine.ProbeManager || !ns.Engine.ProbeManager.PlayerProbeCollection) return;
        for (var i = 0; i < ns.Engine.ProbeManager.PlayerProbeCollection.length; i++) {
            var probe = ns.Engine.ProbeManager.PlayerProbeCollection[i];
            if (!probe || !probe.Monitor || !probe.Monitor.showSpeechStatus) continue;
            probe.Monitor.showSpeechStatus(statusText);
        }
    };

    cSpeechRecognizerManager.prototype._buildSpeechStatusMessage = function (recognizedText, parsedCommand, executed) {
        if (!parsedCommand) {
            return "音声: " + (recognizedText || "-") + " | 解析: NG | 実行: NG";
        }
        return "音声: " + (recognizedText || "-") +
            " | 席: " + parsedCommand.seatWord + " -> " + parsedCommand.seatName +
            " | アクション: " + parsedCommand.actionWord + " -> " + parsedCommand.actionLabel +
            " | 実行: " + (executed ? "OK" : "NG");
    };

    cSpeechRecognizerManager.prototype._updateView = function () {
        if (!this._statusValue || !this._startButton || !this._stopButton) {
            return;
        }

        var isAvailable = false;
        var isRunning = false;

        if (this._speechRecognizer) {
            if (this._speechRecognizer.isAvailable) {
                isAvailable = this._speechRecognizer.isAvailable();
            }
            if (this._speechRecognizer.isRunning) {
                isRunning = this._speechRecognizer.isRunning();
            }
        }

        if (!isAvailable) {
            this._statusValue.textContent = "未対応";
            this._startButton.disabled = true;
            this._stopButton.disabled = true;
            return;
        }

        this._statusValue.textContent = isRunning ? "動作中" : "停止";
        this._startButton.disabled = isRunning;
        this._stopButton.disabled = !isRunning;
    };

    ns.cSpeechRecognizerManager = cSpeechRecognizerManager;
})(Monitor = Monitor || {});