(function (ns) {
    "use strict";
    if (ns.cSpeechRecognizerManager) return;

    function cSpeechRecognizerManager() {
        this._speechRecognizer = null;
        this._view = null;
        this._statusValue = null;
        this._startButton = null;
        this._stopButton = null;
        this._parser = new ns.cVoiceCommandParser();
    }

    cSpeechRecognizerManager.prototype.setup = function (speechRecognizer, view) {
        this._speechRecognizer = speechRecognizer;
        this._view = view || null;
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
        var result = this._parser.processText(recognizedText);
        var executedResults = [];

        for (var i = 0; i < result.commands.length; i++) {
            var cmd = result.commands[i];
            var executed = this._executeVoiceCommand(cmd);
            executedResults.push({ command: cmd, executed: executed });
        }

        console.log("[SpeechCommand]", {
            recognizedText: recognizedText,
            normalizedText: result.normalizedText,
            tokens: result.tokens,
            commands: result.commands,
            executedResults: executedResults
        });

        if (this._view) {
            this._view.showRecognizedText(recognizedText);
            this._view.showParsedCommands(executedResults);
        }
    };

    cSpeechRecognizerManager.prototype._executeVoiceCommand = function (command) {
        if (!command || !ns.Engine || !ns.Engine.ProbeManager) return false;
        var probe = ns.Engine.ProbeManager.PlayerProbeCollection.find(function (model) {
            return model.Name === command.seatId;
        });
        if (!probe || !probe.View) return false;

        if (command.playerAction === PokerConst.PlayerAction.Bet ||
            command.playerAction === PokerConst.PlayerAction.Raise)
        {
            if (ns.Engine.ProbeManager.getAggressivePlayerAction() !== command.playerAction) {
                return false;
            }
            if (!probe.View.ActoinAggressiveButton) return false;
            probe.View.ActoinAggressiveButton.click();
            return true;
        }

        switch (command.playerAction) {
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