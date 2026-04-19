# PokerTableVisualizer

テキサスホールデム向けのリアルタイム・ポーカーテーブル可視化システムです。
RFIDカードリーダーデバイスで読み取ったカード情報を、ブラウザ上にリアルタイム表示します。

---

## Project Overview

| 項目 | 内容 |
|------|------|
| ゲーム形式 | テキサスホールデム（ポーカー） |
| カード読み取り | M5Stack Core2 + RFID Unit (UnitRfid2) |
| 通信方式 | Bluetooth Low Energy (BLE) |
| 表示 | ブラウザアプリ（ローカル HTML/JS/CSS） |
| 主な用途 | ライブ配信オーバーレイ・対戦情報のリアルタイム表示 |

各プレイヤー席とディーラー席に M5Stack Core2 デバイスを配置し、RFIDでカードを読み取ります。  
読み取ったデータはBLEでブラウザに送信され、`monitor_screen` に配信用オーバーレイとして表示されます。

---

## System Architecture

```
┌────────────────────────────────────┐
│  CardScanner (M5Stack Core2)       │
│  ・RFIDによるカード読み取り         │
│  ・BLEでブラウザへ通知             │
└──────────────┬─────────────────────┘
               │ BLE (Bluetooth Low Energy)
               │ Service UUID: cbaabb28-...
               │ TX Characteristic: 45f116ee-...b2eb
               │ RX Characteristic: 45f116ee-...b2ee
               ▼
┌────────────────────────────────────┐
│  Monitor (ブラウザアプリ)           │
│  ┌──────────────────────────────┐  │
│  │ monitor_manage               │  │
│  │ ┌──────────────────────────┐ │  │
│  │ │ poker_browser            │ │  │
│  │ │ プレイヤー/ボード制御UI   │ │  │
│  │ └──────────────────────────┘ │  │
│  │ ┌──────────────────────────┐ │  │
│  │ │ settings_area            │ │  │
│  │ │ アプリ設定UI             │ │  │
│  │ └──────────────────────────┘ │  │
│  │ ┌──────────────────────────┐ │  │
│  │ │ develop                  │ │  │
│  │ │ デバッグ用UI             │ │  │
│  │ └──────────────────────────┘ │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ monitor_screen               │  │
│  │ 配信用描画エリア（描画専用）  │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

---

## Directory Structure

```
PokerTableVisualizer/
├── README.md
├── CardScanner/          # M5Stack Core2 向けファームウェア（Arduino / C++）
├── Monitor/              # ブラウザアプリ（HTML / JS / CSS）
└── Assets/
    ├── UI/               # カード画像など UI 用画像リソース
    └── Settings/         # CardScanner デバイス向けデフォルト設定ファイル
```

### CardScanner/

M5Stack Core2 上で動作するカードリーダー制御アプリです。  
Arduino IDE でビルドし、デバイスに書き込みます。

| ファイル / ディレクトリ | 役割 |
|------------------------|------|
| `CardScanner.ino` | エントリポイント |
| `AppMode*.cpp/h` | アプリ動作モード（Reader / Writer / Deckcheck / Develop） |
| `AppCardListener*.cpp/h` | RFIDカード読み取りロジック（UnitRfid2 対応） |
| `AppSetting.cpp/h` | デバイス設定の読み書き |
| `AppDrawablePlaycard.cpp/h` | ディスプレイへのカード描画 |
| `SysBLEControl.cpp/h` | BLE 通信制御 |
| `SysDisplay.cpp/h` | M5Stack ディスプレイ管理 |
| `SysMode*.cpp/h` | モード管理基盤 |
| `SysSetting*.cpp/h` | 設定管理基盤 |
| `MFRC522_I2C.cpp/h` | RFID ドライバ（I2C 接続） |
| `UnitRfid2*.cpp/h` | M5Stack UnitRfid2 ドライバ |

### Monitor/

ブラウザで動作するリアルタイム表示アプリです。  
ローカルファイルとしてブラウザで直接開くか、簡易 HTTP サーバ上で提供します。

| ファイル | 役割 |
|---------|------|
| `index.html` | アプリ全体の構成とエントリポイント。全 UI 領域の定義と JS の読み込みを行う |
| `Monitor_Bootstrap.js` | アプリ起動処理 |
| `Monitor_Defines.js` | 定数・BLE UUID・HTML ID などのグローバル定義 |
| `Monitor_Engine.js` | 各マネージャの生成・初期化を行うアプリケーション中枢 |
| `Monitor_ProbeDeviceManager.js` | BLE デバイスのスキャン・接続・通知受信管理 |
| `Monitor_ProbeDeviceUnit.js` | 個別 BLE デバイス単位の管理 |
| `Monitor_ProbeManager.js` | プローブ（デバイス）全体の状態管理 |
| `Monitor_ProbeDealerModel/Monitor/View.js` | ディーラー席のモデル・表示・制御 |
| `Monitor_ProbePlayerModel/Monitor/View.js` | プレイヤー席のモデル・表示・制御 |
| `Monitor_MonitorManager.js` | `monitor_screen` への描画管理 |
| `Monitor_ViewManager.js` | `monitor_screen` 内パネルのレイアウト・ドラッグ管理 |
| `Monitor_GuideManager.js` | 配信用ガイドオーバーレイの表示・設定管理 |
| `Monitor_CardListView.js` | カードリスト表示ユーティリティ |
| `Monitor_HandRange.js` | ハンドレンジ表示ユーティリティ |
| `Monitor_Carddeck.js` | デッキ管理 |
| `Monitor_Cardslot.js` | カードスロット管理 |
| `Monitor_HtmlBase.js` | HTML 操作基底クラス |
| `Monitor_ProbeModelBase.js` | プローブモデル基底クラス |
| `Monitor_ProbeViewBase.js` | プローブビュー基底クラス |
| `PokerModel.js` | ポーカーゲーム状態モデル |
| `winrate.js` | 勝率計算ロジック |
| `HtmlUtil.js` | HTML 操作ユーティリティ |
| `style*.css` | 各エリア・コンポーネント向けスタイルシート |

### Assets/

| ディレクトリ | 内容 |
|-------------|------|
| `UI/` | カード画像（`cards_pc-*.png`：ブラウザ表示用、`cards_m5-*.jpg`：M5Stack 表示用）、テーブル・プレイヤー・ディーラーボタン画像 |
| `Settings/` | CardScanner デバイス向けデフォルト設定ファイル（席ごとに `Seat01` 〜 `Seat10`、`Dealer01` 〜 `Dealer03` のディレクトリで管理） |

---

## Core Components

### Monitor 内の UI 領域と責務

`index.html` は以下の 2 つの最上位 UI 領域を持ちます。

#### `monitor_manage`（管理・制御エリア）

**設定・操作に関するすべての UI を集約するエリアです。**  
配信画面には表示されず、オペレーター専用の操作インターフェイスとして機能します。

> ※ 現在の HTML ソースではクラス名が `monitor_mamage`（タイポ）になっています。

| サブエリア | 役割 |
|-----------|------|
| `poker_browser` | ポーカーの進行管理・プレイヤー/ボードの状態表示と制御を行う中核 UI。デバイス接続状態・ホールカード・ベッティングラウンドの手動操作もここで行う |
| `settings_area` | アプリケーション設定 UI の集約エリア。現在はガイドオーバーレイ設定（`GuideManager`）が配置されている。**今後追加される設定機能はすべてここに配置する** |
| `develop` | デバッグ・開発用の補助 UI。デバイスのスキャン・テスト配布・状態ダンプなどのデバッグボタンを配置する |

#### `monitor_screen`（描画専用エリア）

**動画配信向けに最終的に表示される描画専用エリアです。**  
画面キャプチャや OBS などの配信ソフトでこのエリアをクロップして使用することを想定しています。  
このエリアは**描画のみを担当し、ユーザー操作 UI は一切含みません**。

| サブエリア | 役割 |
|-----------|------|
| `GUIDE_OVERLAY` | ガイドオーバーレイ（配信レイアウト調整用の補助矩形を表示。`GuideManager` が管理） |
| `CONTAINER_MONITORPLAYER_PANEL` | プレイヤーごとの情報パネル（名前・ポジション・勝率・アクション・ホールカード・統計） |
| `CONTAINER_MONITORDEALER_PANEL` | ボード情報パネル（ハンド番号・ブラインド・フロップ/ターン/リバーカード） |

### JS モジュール構成

すべての JS モジュールは `Monitor` 名前空間の IIFE パターン `(function(ns){...})(Monitor = Monitor || {})` に従います。

```
Monitor_Engine
├── ProbeDeviceManager   ← BLE デバイス管理
├── ProbeManager         ← プローブ状態集約
├── ViewManager          ← monitor_screen パネル管理
├── MonitorManager       ← monitor_screen 描画管理
└── GuideManager         ← ガイドオーバーレイ + 設定 UI
```

### 設定の永続化

アプリ設定は `localStorage` のキー `monitor_settings` に JSON 形式で保存されます。

```json
{
  "guide": {
    "enabled": false,
    "guides": []
  }
}
```

> 将来的な設定カテゴリの追加を想定した拡張可能な構造になっています。

---

## Data Flow

```
[CardScanner デバイス]
     │
     │ RFID でカードを読み取り
     │ BLE Notify (TX Characteristic) でブラウザへ送信
     ▼
[Monitor_ProbeDeviceUnit]
     │ onNotified()
     ▼
[Monitor_ProbeManager]
     │ notifiedFromProbe()
     ▼
[Monitor_ProbeDealerModel / Monitor_ProbePlayerModel]
     │ モデル状態を更新
     ▼
[Monitor_ProbeDealerMonitor / Monitor_ProbePlayerMonitor]
     │ monitor_screen の表示パネルへ反映
     ▼
[monitor_screen] → 配信ソフト（OBS 等）でキャプチャして配信
```

また、オペレーターが `poker_browser` 上で手動操作（ベッティングラウンド進行・アクション入力など）を行うと、同様にモデルが更新されて `monitor_screen` に反映されます。

---

## Development Rules

1. **UI と ロジックの分離**  
   - モデル（状態管理）・ビュー（HTML 描画）・モニター（`monitor_screen` 反映）の 3 層に分けて実装します。
   - `*Model.js` に状態、`*View.js` にプローブ管理 UI の描画、`*Monitor.js` に `monitor_screen` への反映を担当させます。

2. **設定 UI は `settings_area` に集約**  
   - アプリに新しい設定機能を追加する場合、その設定 UI は必ず `monitor_manage` 内の `settings_area` に配置します。
   - `settings_area` 以外の場所に設定 UI を分散させないでください。

3. **`monitor_screen` は描画専用**  
   - `monitor_screen` 内にはユーザーが操作するボタン・フォーム等の UI 要素を置きません。
   - 配信キャプチャ対象エリアとして、表示専用の要素のみを配置します。

4. **JS モジュールの命名規則**  
   - `Monitor_` プレフィックスを付けた IIFE パターンで実装します。
   - 新しいマネージャは `Monitor_Engine.js` でインスタンス化し、`setup()` または `init()` を呼び出します。

5. **定数は `Monitor_Defines.js` に集約**  
   - HTML 要素の ID・クラス名・BLE UUID などのマジックストリングは `Monitor_Defines.js` に定義します。

6. **設定の永続化は `monitor_settings` キーに統一**  
   - `localStorage` を使用する場合はキー `monitor_settings` を使用し、カテゴリ単位でプロパティを追加します。

---

## Future Extensions

- **設定エリアへの機能追加**  
  `settings_area` は複数の設定機能を折りたたみ形式で追加していくことを想定しています。  
  例：表示レイアウト設定・プレイヤー名設定・統計表示設定 など。

- **追加デバイス対応**  
  現在は `Seat01` 〜 `Seat09` および `Dealer01` 〜 `Dealer03` をサポートしています（`Monitor_Defines.js`）。  
  席数の増減やデバイス種別の追加は `Defines` の定義変更で対応可能な構造になっています。

- **統計機能の拡張**  
  `PokerModel.js` および `Monitor_ProbePlayerModel.js` にはハンド統計（VPIP 等）の基盤があり、  
  追加の統計指標への拡張が想定されています。

- **配信レイアウトのプリセット管理**  
  現在のガイドオーバーレイ設定は `localStorage` に保存されています。  
  将来的にはレイアウトプリセットの保存・切り替え機能を `settings_area` に追加することが考えられます。

- **WebSocket 対応**  
  現在はBLE経由でブラウザと直接通信していますが、  
  中継サーバーを介した WebSocket 通信へ切り替えることで、複数ブラウザへの同時配信なども可能になります。  
  ※（これは将来的な拡張案であり、現時点では実装されていません）
