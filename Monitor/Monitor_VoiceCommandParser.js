(function (ns) {
    "use strict";
    if (ns.cVoiceCommandParser) return;

    var STATE_WAITING_SEAT = "WaitingSeat";
    var STATE_WAITING_ACTION = "WaitingAction";

    /// <summary>
    /// 音声コマンドパーサー
    /// 認識文字列の正規化・トークン化・状態機械による文法解析・Command配列生成を担う。
    /// </summary>
    function cVoiceCommandParser(seatWordMap, actionWordMap) {
        this._seatWordMap = seatWordMap;
        this._actionWordMap = actionWordMap;
        this._seatWords = Object.keys(seatWordMap).sort(function (a, b) { return b.length - a.length; });
        this._actionWords = Object.keys(actionWordMap).sort(function (a, b) { return b.length - a.length; });
    }

    /// <summary>
    /// テキスト正規化
    /// 全角数字を半角へ変換し、空白・句読点を除去する。
    /// </summary>
    cVoiceCommandParser.prototype.normalizeText = function (text) {
        return (text || "")
            .trim()
            .replace(/[０-９]/g, function (value) {
                return String.fromCharCode(value.charCodeAt(0) - 0xFEE0);
            })
            .replace(/[ 　\t\r\n]/g, "")
            .replace(/[、。,.]/g, "");
    };

    /// <summary>
    /// トークン化
    /// 正規化済みテキストを既知語彙（席番号・アクション）で最長一致分割する。
    /// 未知文字は type:"unknown" として1文字ずつ切り出す。
    /// </summary>
    cVoiceCommandParser.prototype.tokenize = function (normalizedText) {
        var tokens = [];
        var text = normalizedText;
        while (text.length > 0) {
            var matched = false;
            for (var i = 0; i < this._seatWords.length; i++) {
                var sw = this._seatWords[i];
                if (text.indexOf(sw) === 0) {
                    tokens.push({ type: "seat", word: sw, seatId: this._seatWordMap[sw] });
                    text = text.substring(sw.length);
                    matched = true;
                    break;
                }
            }
            if (matched) continue;
            for (var j = 0; j < this._actionWords.length; j++) {
                var aw = this._actionWords[j];
                if (text.indexOf(aw) === 0) {
                    tokens.push({ type: "action", word: aw, actionInfo: this._actionWordMap[aw] });
                    text = text.substring(aw.length);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                tokens.push({ type: "unknown", word: text[0] });
                text = text.substring(1);
            }
        }
        return tokens;
    };

    /// <summary>
    /// 状態機械による文法解析
    /// トークン列から有効な Command[] を生成する。
    ///
    /// 状態:
    ///   WaitingSeat   : 席番号待ち
    ///   WaitingAction : アクション待ち
    ///
    /// WaitingSeat  + seat    → pendingSeat保持, WaitingAction
    /// WaitingSeat  + other   → 無視, WaitingSeat
    /// WaitingAction + action → コマンド確定, WaitingSeat
    /// WaitingAction + other  → pendingSeat破棄, WaitingSeat（現トークンは消費）
    /// </summary>
    cVoiceCommandParser.prototype.parseTokens = function (tokens) {
        var commands = [];
        var state = STATE_WAITING_SEAT;
        var pendingSeatWord = null;
        var pendingSeatId = null;

        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (state === STATE_WAITING_SEAT) {
                if (token.type === "seat") {
                    pendingSeatWord = token.word;
                    pendingSeatId = token.seatId;
                    state = STATE_WAITING_ACTION;
                }
                // action または unknown: 無視
            } else if (state === STATE_WAITING_ACTION) {
                if (token.type === "action") {
                    commands.push({
                        seatWord: pendingSeatWord,
                        seatId: pendingSeatId,
                        actionWord: token.word,
                        actionLabel: token.actionInfo.label,
                        playerAction: token.actionInfo.playerAction
                    });
                    pendingSeatWord = null;
                    pendingSeatId = null;
                    state = STATE_WAITING_SEAT;
                } else {
                    // seat または unknown: 途中状態を破棄して WaitingSeat へ戻る
                    // 現トークンは消費（再処理しない）
                    pendingSeatWord = null;
                    pendingSeatId = null;
                    state = STATE_WAITING_SEAT;
                }
            }
        }

        return commands;
    };

    /// <summary>
    /// テキスト処理エントリーポイント
    /// 正規化・トークン化・解析をまとめて行い結果を返す。
    /// </summary>
    cVoiceCommandParser.prototype.processText = function (text) {
        var normalizedText = this.normalizeText(text);
        var tokens = this.tokenize(normalizedText);
        var commands = this.parseTokens(tokens);
        return {
            normalizedText: normalizedText,
            tokens: tokens,
            commands: commands
        };
    };

    ns.cVoiceCommandParser = cVoiceCommandParser;
})(Monitor = Monitor || {});
