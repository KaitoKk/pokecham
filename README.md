# pokecham

対戦中に相手のポケモン名を音声入力すると、対戦向けの基本情報を即座に表示する Web 補助ツール。

## 概要

- 音声入力でポケモン名を認識（Chrome の SpeechRecognition API 使用）
- 名前の表記ゆれ・誤認識を正規化して検索
- タイプ / 種族値 / 特性 / タイプ相性を即表示
- 自分・相手の 2 枠同時表示（デュアルカード）
- 参照履歴を localStorage に保存

## 技術スタック

- React 19 + Vite
- JavaScript（TypeScript は今後検討）
- パッケージマネージャー: pnpm
- データソース: PokéAPI + Smogon Usage Stats（Gen1〜9 全1189体）

## 動作環境

音声入力は **Chrome / Edge 系ブラウザ** を推奨。
Safari・Firefox では音声認識が利用できない場合があります。
手動入力フォームは全ブラウザで動作します。

## ローカルでの起動方法

### 前提

- Node.js 18 以上
- pnpm がインストール済み（未インストールの場合: `npm install -g pnpm`）

### 手順

```bash
# リポジトリをクローン
git clone <repository-url>
cd pokecham

# 依存パッケージをインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

ブラウザで `http://localhost:5173` を開く。

### ビルド

```bash
pnpm build
```

`dist/` ディレクトリに静的ファイルが出力されます。

### プレビュー（ビルド後の確認）

```bash
pnpm preview
```

## データスクリプト

ポケモンデータは `src/data/pokemon.json` にバンドル済みのため、通常は実行不要です。
データを再取得・更新する場合のみ以下を使用します。

```bash
# PokéAPI からポケモン基本データを取得
pnpm fetch-data

# Smogon データで補完（種族値・特性の補足）
pnpm enrich-showdown

# 欠損データを補完
pnpm fill-missing
```

## ディレクトリ構成

```
src/
  components/   # UI コンポーネント
  hooks/        # カスタムフック（音声認識・履歴・テーマ等）
  utils/        # 検索・正規化ユーティリティ
  services/     # Smogon データ取得
  data/         # ポケモンデータ JSON・型定義
scripts/        # データ前処理スクリプト（Node.js）
```

## 現在の実装状況

- [x] 音声入力 / 手動入力
- [x] 名前正規化（ひらがな・全角・表記ゆれ対応）
- [x] 候補一覧の提示と選択
- [x] タイプ / 種族値 / 特性の表示
- [x] タイプ相性表示
- [x] 自分・相手の 2 枠同時表示
- [x] 参照履歴
- [x] ダーク / ライトテーマ切替
- [ ] IndexedDB によるオフライン対応
- [ ] フォーマット別表示
