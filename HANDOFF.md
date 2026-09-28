# マージパレット 引き継ぎ書

最終更新: 2026-09-28

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

Node.js 24.13.0 を利用します。`.nvmrc` / `.tool-versions` と Pages の CI で同じバージョンを使用します。asdf または nvm で指定バージョンを導入してください。

```bash
npm ci
npm run dev
npm run check
npm test
npm run build
```

検証済みの結果は以下です。

- `npm run check`: エラー・警告なし
- `npm test`: 4件成功
- `npm run build`: 成功

## microCMS設定（テーマごとに1コンテンツ）

`.env.example` をコピーして、ローカル専用の `.env.local` を作成します。APIキーをチャット、Git、Issue、スクリーンショットに掲載しないでください。

```bash
cp .env.example .env.local
```

```dotenv
VITE_MICROCMS_SERVICE_DOMAIN=サービスID
VITE_MICROCMS_API_KEY=公開GET専用キー
```

このアプリはブラウザからCMSを直接読むため、`VITE_` のキーは配信されたJavaScriptから参照できます。キーは `themes` の公開コンテンツのGETだけを許可し、下書き・公開終了コンテンツや書き込み・マネジメントAPIの権限は付けません。

### API: `themes`（リスト形式）

テーマ1件につきコンテンツ1件を作成します。以前の `theme-stages` API と `slug` フィールドは使いません。テーマ識別にはmicroCMSがコンテンツに自動付与する `id` を使います。独自の `id` フィールドを追加する必要はありません。意味のあるIDにしたい場合はmicroCMSのコンテンツID変更機能で `mythical` などにできます。変更後は保存済みのテーマ選択が解除されるので、公開後のID変更は避けます。

| フィールドID | 管理画面の表示名 | 種類 | 必須 | 用途 |
| --- | --- | --- | --- | --- |
| `name` | テーマ名 | テキスト | はい | テーマ選択と見出しに表示 |
| `thumbnail` | テーマの表紙画像 | 画像 | いいえ | テーマ選択カード用 |
| `sortOrder` | 表示順 | 数字 | いいえ | 小さい数字が先 |
| `tiles` | タイル一覧 | 繰り返し | はい | 1テーマのタイルをまとめて入力 |

先に `themes` APIの「カスタムフィールド」画面で、**カスタムフィールド名「タイル」、カスタムフィールドID `tile`** を作成します。そこに次のフィールドを追加し、それぞれ必須にします。次にAPIスキーマの `tiles` を「繰り返し」にして、利用するカスタムフィールドとして `tile` だけを選びます。繰り返しフィールドの最小数は12に設定できます。

| フィールドID | 管理画面の表示名 | 種類 | 入力例 |
| --- | --- | --- | --- |
| `value` | 合成値（2の累乗） | 数字 | `2` |
| `label` | タイル名 | テキスト | スライム |
| `image` | タイル画像 | 画像 | 1枚 |
| `backgroundColor` | タイル背景色 | テキスト | `#7C7696` |

登録用画像、`roman` の拡大版、入力表と差し替え順序は [`assets/microcms/README.md`](assets/microcms/README.md) にあります。

1テーマにつき、`value` が `2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096` の12件を入れて公開します。重複・欠落・画像欠落・色形式不正、または画像サイズが512×512pxでないテーマは選択肢に表示されません。表紙画像は任意ですが、登録する場合は同じサイズが必要です。`8192` 以降を追加しても構いません。タイルの順序は自由で、アプリは `value` で対応付けます。

「複数画像」フィールドなら画像をまとめてアップロードできますが、各画像と `value`・`label`・`backgroundColor` の対応を順番だけで管理することになります。名前や色も個別に設定する現在のゲームでは、カスタムフィールドの繰り返しが適切です。画像を先にメディア管理へまとめてアップロードしてから、各タイルの `image` 欄で選択できます。

microCMSのAPIプレビューで `GET /api/v1/themes` を確認し、各コンテンツに `id`、`name`、`tiles` 配列があり、配列の要素に `fieldId: "tile"` と上記4項目があることを確認してください。

参考: [カスタムフィールド](https://document.microcms.io/manual/custom-field)、[繰り返しフィールド](https://document.microcms.io/manual/repeat-field)、[複数画像](https://document.microcms.io/manual/image-list)、[コンテンツIDの設定](https://document.microcms.io/manual/content-id-setting)。

## GitHub公開

リモートは作成済みで、`main` ブランチが `origin/main` を追跡しています。別環境では次で取得します。

```bash
git clone git@github.com:ariaria2021/merge-palette.git
cd merge-palette
```

HTTPSを利用する場合は、GitHubの認証方式に応じた資格情報が必要です。SSH鍵が設定済みなら、上記のSSH URLでアクセストークンを使わずにpushできます。

GitHub Pagesでは、Node.js 24.13.0で `npm ci` と `npm run build` を実行し、生成された `dist` を公開します。ビルド環境には `VITE_MICROCMS_SERVICE_DOMAIN` と `VITE_MICROCMS_API_KEY` をSecretsとして設定します。ただし静的サイトでは後者がクライアントへ公開されるため、上記のGET専用制限が必須です。

## 主なファイル

- `src/App.svelte`: ゲーム状態、キーボード／スワイプ操作、テーマ読み込み
- `src/lib/game.ts`: フレームワーク非依存の2048ロジック
- `src/lib/microcms.ts`: microCMSの直接取得
- `src/lib/themes.ts`: CMSデータの検証・テーマ選択
- `src/components/ThemePicker.svelte`: テーマ選択モーダル
- `src/lib/themes.test.ts`: CMSテーマ検証のテスト

## Pages 用設定

`.github/workflows/deploy.yml` は main への push または手動実行を入口に、`npm ci` → 型検査 → 既存テスト → build → dist の Pages 公開を実行します。公開時はリポジトリの Settings → Pages → Source を GitHub Actions に設定し、github-pages 環境にブランチ制約がある場合は main を許可します。

CMS を利用する場合はリポジトリの Actions Secrets に `VITE_MICROCMS_SERVICE_DOMAIN` と `VITE_MICROCMS_API_KEY` を設定します。未設定でも数字テーマでビルドできます。公開キーの GET 専用制約は上記のとおりです。

### 初期のローカル検証（2026-09-25）

- Node 24.13.0 で npm ci、型検査（エラー・警告0）、既存テスト3件、build が成功。
- Chromium のスマホエミュレーションで矢印キー・スワイプ、CMS未設定時の数字テーマ、テーマ選択時の盤面維持、最高スコアの再読込後の保持、リセットを確認。ページ例外0件。
- ワークフローの YAML 構造を確認。GitHub Actions 上の実行、実CMSの接続、実機スマホの確認は未実施。
