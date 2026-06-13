(function (ns) {
    "use strict";
    if (ns.cSpeechRecognizerView) return;

    /// <summary>
    /// 音声コマンドパネルの表示を担当するビュークラス。
    /// 認識テキストノードとパース済みコマンドノードへの表示処理を集約する。
    /// </summary>
    function cSpeechRecognizerView(recognizedTextNode, parsedCommandNode) {
        this._recognizedTextNode = recognizedTextNode || null;
        this._parsedCommandNode = parsedCommandNode || null;
    }

    /// <summary>
    /// 音声認識テキストを表示する。
    /// </summary>
    cSpeechRecognizerView.prototype.showRecognizedText = function (recognizedText) {
        if (!this._recognizedTextNode) return;
        this._recognizedTextNode.textContent = "音声: " + (recognizedText || "-");
    };

    /// <summary>
    /// パース済みコマンド一覧を表示する。
    /// コマンドが存在しない場合は認識失敗として表示する。
    /// </summary>
    cSpeechRecognizerView.prototype.showParsedCommands = function (executedResults) {
        if (!this._parsedCommandNode) return;
        if (!executedResults || executedResults.length === 0) {
            this._parsedCommandNode.textContent = "認識失敗";
            return;
        }
        var lines = [];
        for (var i = 0; i < executedResults.length; i++) {
            var r = executedResults[i];
            var cmd = r.command;
            lines.push(
                cmd.seatWord + " -> " + cmd.seatId +
                " | " + cmd.actionWord + " -> " + cmd.actionLabel +
                " | " + (r.executed ? "OK" : "NG")
            );
        }
        this._parsedCommandNode.textContent = lines.join("\n");
    };

    ns.cSpeechRecognizerView = cSpeechRecognizerView;
})(Monitor = Monitor || {});
