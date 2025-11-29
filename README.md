# Arithmetic N-Back

計算式 N-back アプリ
スマートフォン向けに最適化した UI です。
[GitHub Pages](https://nao5151.github.io/arithmetic-n-back/)

## ルール

1. 画面に 1 問ずつ計算式が表示されます  
   例：`7 + 5`, `9 - 3`
2. 式を暗算し答えを覚えます
3. 同時に「n 個前の答え」を入力します
4. プレイ時間内これを繰り返します

### ゲーム進行

- スタート → 準備フェーズ → プレイ → 結果
- 準備フェーズ: 最初の n 問は採点対象外、1 問 3 秒ずつ表示して答えを覚えるだけ
- プレイ: 各入力は 1 桁で即判定、正解は緑/誤答は赤で短時間フィードバック
- 途中離脱（スタート画面に戻る）は可、ポーズやリトライボタンなし

## 設定

| 項目       | 値            |
| ---------- | ------------- |
| n-back     | 2〜5          |
| プレイ時間 | 30 秒 / 60 秒 |

## 対応環境

- iOS Safari 最新版
- 縦画面のみ対応

## 出題仕様とスコア

- 出題: 1 桁の正の整数（1〜9）どうしの足し算。同じ数字の組み合わせ（3+3 など）は出さない。直前のどちらかの値も繰り返さない（例: 1+3 の次に 1+X や Y+3 は出さない）、連続する答えも避ける
- 2 桁の答えは下一桁を答える（例: 4+6 → 0）
- 問題間隔: 準備 3 秒/問、本番は入力後すぐ次へ
- 精度: 正解数 / 問題数（% 表示、整数丸め）。最新 10 件の履歴をローカル保存

## 操作メモ

- 入力欄は数字キーボードを表示（フォーカスを維持してモバイルでキーボードを開いたままにする）
- ライト/ダークは OS 設定に追従

## 技術スタック

| 技術       | 内容         |
| ---------- | ------------ |
| Framework  | React        |
| Language   | TypeScript   |
| Build Tool | Vite         |
| Styling    | CSS          |
| Testing    | Vitest       |
| Hosting    | GitHub Pages |

## ディレクトリ構成

```
src/
├─ main.tsx                  # ルートレンダラー
├─ App.tsx                   # 画面の切り替え制御
├─ App.css / global.css      # スタイル一式
├─ components/               # UI コンポーネント
│   ├─ Game.tsx              # プレイ画面
│   ├─ Start.tsx             # スタート/設定画面
│   └─ Result.tsx            # 結果画面
├─ contexts/                 # React コンテキスト
│   ├─ GameContext.tsx       # ゲーム状態の提供
│   └─ SettingsContext.tsx   # 設定の永続管理
├─ hooks/                    # ゲーム用カスタムフック
│   ├─ useGameState.ts       # ゲーム進行のオーケストレーション
│   ├─ useAnswering.ts       # 入力/判定/フィードバック管理
│   ├─ useWarmupFlow.ts      # ウォームアップ進行管理
│   ├─ usePlayTimer.ts       # プレイ時間のカウントダウン
│   ├─ useGameHistory.ts     # プレイ履歴の保存/取得
│   └─ gameTypes.ts          # ゲーム関連の型定義
└─ core/
    ├─ nback.ts              # N-back ロジック (純粋関数)
    └─ nback.test.ts         # ロジックのテスト
```

## 開発方法

```bash
npm install
npm run dev
```

本番ビルド：

```bash
npm run build
```
