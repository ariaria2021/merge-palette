# microCMS 登録用画像

3テーマの登録用画像があります。各テーマにタイル12枚と表紙1枚を用意しました。`upload/` のPNGはすべて512×512pxです。通常のタイルは背景透過、`roman` の表紙は白い図形を見やすくするため暗い紫の背景付きです。`source/` には「光の結晶」「夜空のしるし」のSVG原稿と、`roman` の元の小さなPNGを保存しています。

| コンテンツIDの例 | テーマ名 | 登録用フォルダ | 表紙画像 |
| --- | --- | --- | --- |
| `crystal` | 光の結晶 | `upload/crystal/` | `crystal-thumbnail.png` |
| `night-sky` | 夜空のしるし | `upload/night-sky/` | `night-sky-thumbnail.png` |
| 既存コンテンツ | roman | `upload/roman/` | `roman-thumbnail.png` |

[光の結晶・夜空のしるし一覧](contact-sheet.png)で両テーマの24タイルを確認できます。`registration.csv` にはこの2テーマ分の `value`（合成値）、`label`（タイル名）、画像ファイル名、`backgroundColor`（タイル背景色）を記載しています。CSVはExcelでも日本語が読めるUTF-8 BOM付きです。

登録順序:

1. `upload/` 内のPNGをmicroCMSのメディア管理へまとめてアップロードする。
2. `themes` にテーマごとにコンテンツ1件を作り、`name` と `thumbnail` を設定する。表中のIDは例で、microCMSのコンテンツIDを自動生成のまま使ってもよい。
3. コンテンツ内の `tiles` にカスタムフィールド `tile` を12件追加し、`registration.csv` の各行から `value`、`label`、`image`、`backgroundColor` を入力する。
4. 公開後、APIプレビューで12件が返ることを確かめる。

「光の結晶」「夜空のしるし」はこのリポジトリ向けに図形をコードで描いた画像です。写真・キャラクター・アイコン・書体・外部画像は利用していません。`generate.py` がこの2テーマのSVG原稿と登録表を生成します。

## roman のドット絵を512pxにそろえる

[roman一覧見本](roman-contact-sheet.png)は、白いローマ数字を残し、黒い画素を透過してゲーム盤と同じ表示倍率で並べたものです。[登録用ZIP](roman-upload.zip)にタイル12枚と表紙1枚を入れています。タイル12枚は透明な512×512pxの中央に、表紙1枚は暗い紫の512×512pxの中央に、白い画素を無補間の整数倍で配置しました。元画像に含まれる0～1の黒に近い画素は透過へ、254～255の白に近い画素は白へ統一しています。元画像13枚は `source/roman-original/` に保存し、`upscale_roman.py` で再生成できます。元画像の白黒配置が変わらないことをスクリプトで検証しています。

[roman入力表](roman-registration.csv)は現在公開中の `roman` コンテンツのタイル名、合成値、背景色に合わせています。画像は差し替え済みで、名前や色は変更していません。

microCMSでの作業順序:

1. `roman-upload.zip` を展開し、13枚のPNGをメディア管理へアップロードする。ZIPファイルそのものは画像欄に登録しない。
2. `themes` の既存 `roman` コンテンツで、表紙の `thumbnail` と、`tiles` 内の12件の `image` を同じファイル名の新しいPNGに差し替えて公開する。`value` と `label` は `roman-registration.csv` で照合する。
3. APIプレビューで `roman` の13画像すべてが `width: 512`、`height: 512` になったことを確認する。
4. 差し替えが終わってから、`themes` APIの `thumbnail` と、カスタムフィールド `tile` の `image` に、画像サイズ制限 **幅512px・高さ512px** を設定する。既存の小さい画像が残ったまま制限すると、コンテンツの編集・保存時にエラーになる可能性がある。
5. アプリを再読み込みし、`roman` と `crystal` が選択肢に表示されることを確認する。

アプリ側でも各画像の `width` / `height` を検証します。`roman` と `crystal` は全画像を512×512pxにそろえ、APIとローカル画面で表示を確認済みです。

microCMSの[画像フィールド設定](https://document.microcms.io/manual/image)には指定サイズと一致しない画像を拒否する機能があります。
