# Poker Stream

React + TypeScriptで構築した、ライブポーカー運営アプリの実行可能スケルトンです。ゲーム状態はブラウザ内だけで管理し、バックエンドAPIを使用しません。

## 現在できること

- 最大9人卓のハンド開始
- Fold / Check / Call / Bet / Raise / All-in
- Stack・Street Bet・Potの自動更新
- PreflopからShowdownまでの進行
- 直前アクションのUndo
- Canonical Hand JSONのダウンロード
- RFID・音声入力アダプター用の境界
- localStorageによる操作画面とOBSオーバーレイの同期
- 単色背景のOBSカラーキー用オーバーレイ
- ドラッグ操作による9席の自由配置
- OBS表示区画のX / Y / Width / Height指定
- コミュニティカード、Pot、Hand ID、Street、Blindの大型ゲーム情報パネル
- プレイヤー状態の色分けと最終アクション表示
- ButtonからCOまでのポジション表示
- Raise履歴に応じた3-Bet、4-Bet以降の自動表記
- 中央ゲーム情報パネルのドラッグ配置
- Hole Card・Flop・Turn・Riverの手動編集
- 各席の現在Street Bet表示
- 既知ハンド間のEquity計算
- 大きな文字を維持したコンパクトな配信パネル
- 未知のHole Cardを2枚の「-」として表示

## ローカル実行

```bash
pnpm install
pnpm dev
```

Pokerの状態遷移は `lib/poker-core.ts` にあり、React UIから独立しています。

OBSでは操作画面の「OBS Overlay」を開き、そのURLをブラウザソースへ指定します。背景色はURLの `key=00ff00` で変更できます。

操作画面のレイアウトエディターで席をドラッグすると、別ウィンドウのOBSオーバーレイへ即時反映されます。表示区画の数値を変更すると、席配置全体を指定範囲へ移動・拡縮できます。

Equityはホールカードが2枚とも判明している、フォールドしていないプレイヤーを対象にします。Boardが3枚未満なら5,000回のモンテカルロ、Flop以降は残りBoardの全組み合わせを列挙します。未知のプレイヤーは計算対象外です。
