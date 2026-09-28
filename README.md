# マージパレット

テーマを切り替えて遊べる、Svelte製の4×4合成パズルです。合成ルールと最高スコアは共通で、microCMSのテーマごとにタイル画像・表示名・配色を変えられます。

GitHub Pagesは、有効化後に [マージパレット](https://ariaria2021.github.io/merge-palette/) として公開されます。

## はじめかた

Node.js 24.13.0を用意し、依存関係を導入します。バージョンは `.nvmrc` と `.tool-versions` に固定されています。

```bash
git clone git@github.com:ariaria2021/merge-palette.git
cd merge-palette
npm ci
npm run dev
```

microCMSを使わなくても、ローカルの「数字」テーマでゲームを起動できます。CMSテーマを読む場合だけ、以下を作成します。

```bash
cp .env.example .env.local
```

`.env.local` にはサービスIDと、`themes` APIの公開GETだけを許可したキーを設定します。実値はGitやIssue、チャットに保存しません。

## 確認コマンド

```bash
npm run check
npm test
npm run build
```

## 詳細ドキュメント

- [引き継ぎ書](HANDOFF.md): microCMSのスキーマ、Secrets、GitHub Pages、検証状況
- [microCMS登録用素材](assets/microcms/README.md): 3テーマのPNG、CSV、登録手順
- [エージェント向け作業指示](AGENTS.md): 別環境のCodexを含む、プロジェクト固有の制約と確認事項

`main` へのpushはGitHub Actionsで型検査、テスト、ビルド、GitHub Pagesデプロイを実行します。
