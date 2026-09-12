# マージパレット 引き継ぎ書

最終更新: 2026-09-12

## プロジェクト概要

Svelte 5 + Vite で作った、テーマ切替型の2048パズルです。ゲームのルールと最高スコアは共通で、microCMSから取得するテーマによりタイルの画像・名称・背景色を切り替えます。

- アプリ名: マージパレット
- リモートリポジトリ: `https://github.com/ariaria2021/merge-palette`
- ローカルディレクトリ: `merge-palette`
- 配信先想定: GitHub Pages（Viteの `base` は `/merge-palette/`）
- 既存の `mythical-evolution-2048` と `tile-merge-game-frameworks` は参考元であり、このプロジェクトから変更しない。

## 現在の実装

- Svelte 5 / TypeScript / Vite
- 矢印キー・スワイプで操作する4×4の2048
- 最高スコアとテーマ選択を `localStorage` に保存
- ヘッダーの「テーマ」ボタンからテーマを即時切替。盤面とスコアは保持
- CMS未設定・通信失敗・不正データ時はローカルの「数字」テーマで継続
- 図鑑、絵本、解放状態、解放通知は意図的に実装していない

## 開発手順

Node.js 24系を利用します。asdf利用環境では、必要に応じて次を先頭に付けてください。

```bash
PATH=/home/ariari/.asdf/installs/nodejs/24.15.0/bin:$PATH
```

```bash
npm install
npm run dev
npm run check
npm test
npm run build
```

検証済みの結果は以下です。

- `npm run check`: エラー・警告なし
- `npm test`: 3件成功
- `npm run build`: 成功

## microCMS設定

`.env.example` をコピーして、ローカル専用の `.env.local` を作成します。キーはチャット、Git、Issue、スクリーンショットへ掲載しません。

```bash
cp .env.example .env.local
```

設定値:

```dotenv
VITE_MICROCMS_SERVICE_DOMAIN=サービスID
VITE_MICROCMS_API_KEY=公開GET専用キー
```

このアプリはブラウザからCMSを直接読むため、`VITE_` のキーは配信されたJavaScriptから参照できます。キーには次だけを与えます。

- `themes` と `theme-stages` の公開コンテンツに対する GET

付与しない権限:

- POST / PUT / PATCH / DELETE
- 下書きコンテンツ・公開終了コンテンツの取得
- マネジメントAPI

### API: `themes`（リスト形式）

| フィールドID | 種類 | 必須 | 用途 |
| --- | --- | --- | --- |
| `slug` | テキスト | はい | 永続化に使う一意の英小文字ID（例: `mythical`） |
| `name` | テキスト | はい | テーマ表示名・サブタイトル |
| `thumbnail` | 画像 | 任意 | テーマ選択カードの画像 |
| `sortOrder` | 数値 | 任意 | 一覧順。小さい値が先 |

### API: `theme-stages`（リスト形式）

| フィールドID | 種類 | 必須 | 用途 |
| --- | --- | --- | --- |
| `theme` | コンテンツ参照 | はい | `themes` の対象テーマ |
| `value` | 数値 | はい | 2のべき乗のタイル値 |
| `label` | テキスト | はい | タイル上の表示名 |
| `image` | 画像 | はい | タイル画像 |
| `backgroundColor` | テキスト | はい | `#RRGGBB` 形式の背景色 |

各テーマは `2, 4, 8, ... 4096` の12件をすべて公開します。不足、値の重複、画像欠落、色形式不正があるテーマはアプリの選択肢に出ません。`8192` 以上のタイルを後から追加してもよく、未登録値は数値だけで表示されます。

## GitHub公開

リモートは作成済みで、`main` ブランチが `origin/main` を追跡しています。別環境では次で取得します。

```bash
git clone git@github.com:ariaria2021/merge-palette.git
cd merge-palette
```

HTTPSを利用する場合は、GitHubの認証方式に応じた資格情報が必要です。SSH鍵が設定済みなら、上記のSSH URLでアクセストークンを使わずにpushできます。

GitHub Pagesでは、Node.js 24で `npm ci` と `npm run build` を実行し、生成された `dist` を公開します。ビルド環境には `VITE_MICROCMS_SERVICE_DOMAIN` と `VITE_MICROCMS_API_KEY` をSecretsとして設定します。ただし静的サイトでは後者がクライアントへ公開されるため、上記のGET専用制限が必須です。

## 主なファイル

- `src/App.svelte`: ゲーム状態、キーボード／スワイプ操作、テーマ読み込み
- `src/lib/game.ts`: フレームワーク非依存の2048ロジック
- `src/lib/microcms.ts`: microCMSの直接取得
- `src/lib/themes.ts`: CMSデータの検証・テーマ選択
- `src/components/ThemePicker.svelte`: テーマ選択モーダル
- `src/lib/themes.test.ts`: CMSテーマ検証のテスト

## 次に行うこと

1. GitHub CLIを認証してリモート作成・初回プッシュする。
2. microCMSの2 APIと公開GET専用キーを作る。
3. 最初のテーマ（例: 神獣）に12件のタイルとサムネイルを登録・公開する。
4. `.env.local` でローカル表示を確認する。
5. GitHub Pagesのデプロイ設定とSecretsを追加し、公開URLでテーマ取得を確認する。
