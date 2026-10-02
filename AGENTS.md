# マージパレット: エージェント向け作業指示

このファイルは、クローン先のCodexなどがプロジェクト固有の作業ルールを把握するための入口です。グローバルにインストールされたスキルは前提にしません。

## 最初に読むもの

1. `HANDOFF.md`: プロジェクト全体、microCMSスキーマ、Pages公開、未検証事項の正本。
2. `assets/microcms/README.md`: テーマ画像・CSV・romanテーマ差し替えの正本。
3. `.github/workflows/deploy.yml`: CI／GitHub Pagesの実際のデプロイ設定。

## 範囲と設計原則

- 作業対象はこの `merge-palette` リポジトリだけです。`mythical-evolution-2048` と `tile-merge-game-frameworks` は参照元であり、変更しません。
- アプリはSvelte 5 + Viteの4×4合成パズルです。ルール・盤面・最高スコアはテーマ共通で、テーマは見た目だけを変えます。
- microCMSは `themes` のリストAPIだけを使います。テーマ1件が `tiles` の繰り返しフィールド内に12タイルを持つ現行スキーマを維持してください。旧来の `theme-stages` API、`slug` フィールドは復活させません。
- タイルは値 `2`〜`4096` を一意に12件揃え、画像は512×512px、色は `#RRGGBB` です。不正なテーマは意図的に画面へ出しません。

## 秘密情報

- `.env.local`、microCMSキー、GitHub Secretsの実値を作成・表示・コミットしないでください。
- クライアントから読むキーは公開されるため、`themes` の公開コンテンツGETだけを許可します。書込み、下書き、公開終了コンテンツ、マネジメントAPI権限は付与しません。

## 開発と検証

- Node.jsは `.nvmrc` / `.tool-versions` の **24.13.0** を使います。
- 依存関係は `npm ci` で導入します。
- 変更後は、該当しない理由がない限り `npm run check`、`npm test`、`npm run build` を実行します。
- テーマ取得・切替を変更した場合は、URL起動時に通信しないこと、デフォルト表示へのフォールバック、テーマ切替で盤面とスコアが変わらないことを確認します。

## 公開と素材

- `main` へのpushで `.github/workflows/deploy.yml` がGitHub Pagesをデプロイします。Secrets未設定時もデフォルト表示でビルドできる状態を保ちます。
- `assets/microcms/upload/` はmicroCMSへ登録する完成PNGです。見た目の変更を求められない限り再生成・削除しません。
- 素材生成スクリプトはPython標準ライブラリだけで動作しますが、再生成後は512×512pxのサイズとCSVとの対応を確認します。
