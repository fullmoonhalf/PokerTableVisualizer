var SpeechRecognizer = SpeechRecognizer || {};
(function (ns) {
    "use strict";
    if(ns.cSpeechRecognizer) return;

    function cSpeechRecognizer()
    {
        this._Recogination = null;
        this._KeepAlive = false;
        this._IsAvailable = false;
        this._IsRunning = false;
        this._OnStateChanged = null;
    }

    /// <summary>
    /// 初期化
    /// </summary>
    cSpeechRecognizer.prototype.init = function()
    {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("このブラウザは音声認識に対応していません");
            this._IsAvailable = false;
            this._IsRunning = false;
            this._notifyStateChanged();
            return false;
        }

        this._Recogination = new SpeechRecognition();
        this._IsAvailable = true;
        this._IsRunning = false;
        this._Recogination.lang = "ja-JP";
        this._Recogination.continuous = true;
        this._Recogination.interimResults = false;
        this._Recogination.onresult = this._onResult.bind(this);
        this._Recogination.onerror = this._onError.bind(this);
        this._Recogination.onend = this._onEnd.bind(this);
        this._notifyStateChanged();

        return true;
    }

    /// <summary>
    /// 音声認識開始
    /// </summary>
    cSpeechRecognizer.prototype.start = function()
    {
        if (!this._IsAvailable || !this._Recogination) {
            return false;
        }
        if (this._IsRunning) {
            return true;
        }
        this._KeepAlive = true;
        try {
            this._Recogination.start();
            this._IsRunning = true;
            this._notifyStateChanged();
            return true;
        } catch (e) {
            console.error("音声認識開始失敗:", e);
            this._IsRunning = false;
            this._notifyStateChanged();
            return false;
        }
    }

    /// <summary>
    /// 音声認識停止
    /// </summary>
    cSpeechRecognizer.prototype.stop = function()
    {
        if (!this._Recogination) {
            return;
        }
        this._KeepAlive = false;
        this._Recogination.stop();
    }

    cSpeechRecognizer.prototype.isAvailable = function()
    {
        return this._IsAvailable;
    }

    cSpeechRecognizer.prototype.isRunning = function()
    {
        return this._IsRunning;
    }

    cSpeechRecognizer.prototype.setOnStateChanged = function(callback)
    {
        this._OnStateChanged = callback;
        this._notifyStateChanged();
    }

    cSpeechRecognizer.prototype._notifyStateChanged = function()
    {
        if (typeof this._OnStateChanged !== "function") {
            return;
        }
        this._OnStateChanged({
            available: this._IsAvailable,
            running: this._IsRunning,
        });
    }


    /// <summary>
    /// 音声認識結果コールバック
    /// </summary>
    cSpeechRecognizer.prototype._onResult = function(event)
    {
        const text = event.results[event.results.length - 1][0].transcript.trim();
        console.log("認識:", text);        
    }

    /// <summary>
    /// 音声認識エラーコールバック
    /// </summary>
    cSpeechRecognizer.prototype._onError = function(event)
    {
        console.error("音声認識エラー:", event.error);
    }

    cSpeechRecognizer.prototype._onEnd = function(event)
    {
        console.log("音声認識終了");
        this._IsRunning = false;
        this._notifyStateChanged();
        if (this._KeepAlive) {
            this.start();
        }
    }

    ns.cSpeechRecognizer = cSpeechRecognizer;
})(SpeechRecognizer = SpeechRecognizer || {});
