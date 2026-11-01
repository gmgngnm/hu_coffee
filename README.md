# 北大珈琲研究会 ウェブサイト

GitHub Pages（無料・常時HTTPS）で公開する静的サイトです。ブログ機能は Jekyll で、組み立てと公開は GitHub Actions が自動でやります。**サーバーの管理は不要**です。

更新のしかたは2通りあります。
- **管理画面（おすすめ）**：`https://gmgngnm.github.io/hu_coffee/admin/` に GitHub アカウントでログインして、記事・豆・研究会の情報を書き換える（Decap CMS）
- **ファイルを直接編集**：GitHub の画面やエディタで書き換えて push する

どちらでも、保存してから2〜3分でサイトに反映されます。

| ページ | ファイル |
|---|---|
| ホーム（最新の記録＋頒布中の豆） | `index.html` |
| 焙煎豆（一覧＋取り置きフォーム） | `beans.html` ／ 豆のデータは `_data/beans.yml` |
| 記録（ブログ一覧） | `blog/index.html` ／ 記事は `_posts/` |
| 私たち | `about.md` |
| お問い合わせ | `contact.html` |
| プライバシーポリシー／特商法表記 | `privacy.md` ／ `legal.md` |
| 研究会の情報（活動日など） | `_data/club.yml` |
| 管理画面 | `admin/`（設定は `admin/config.yml`） |
| 管理画面のログイン中継 | `cms-auth/`（Cloudflare に置く。サイトには含まれない） |
| Instagram の取得 | `scripts/fetch_instagram.py` ／ `.github/workflows/pages.yml` |
| ロゴ・アイコン | `assets/img/`（ヘッダーは `logo.png` と手書きの `hu_coffee-sign.png`、`favicon-32.png` などがアイコン） |
| デザイン案 B・C | `proposals/` |

---

## 1. 公開する（最初に一度だけ）

1. リポジトリの **Settings → Pages** を開く
2. **Source** を「**GitHub Actions**」にする（Instagram の取得をビルドに組み込んでいるため、「Deploy from a branch」ではなくこちら）
3. **Actions** タブの「サイトを公開」→「Run workflow」で一度動かす。数分後、`https://gmgngnm.github.io/hu_coffee/` で見られるようになる
4. 同じ画面の **Enforce HTTPS** にチェック（常時SSL化。標準でオンのはず）

> 独自ドメイン（例：`hucoffee.jp`）を使う場合は、同じ画面の Custom domain に入力し、`_config.yml` の `url` をそのドメインに、`baseurl` を `""` に変える。

## 2. 外部サービスをつなぐ（`_config.yml` を編集）

どれも空欄のままでもサイトは動きます（その機能だけ止まる）。

### Google アナリティクス
1. <https://analytics.google.com/> でプロパティを作成し、ウェブストリームを追加
2. 「測定ID」（`G-` から始まる）をコピー
3. `_config.yml` の `google_analytics: ""` に貼る

### フォーム（お問い合わせ・取り置き）— Formspree
GitHub Pages はサーバーを持たないので、フォームの送信は [Formspree](https://formspree.io/)（無料枠：月50件）に任せています。
1. 研究会の共用メールアドレスで Formspree に登録
2. フォームを2つ作る（「お問い合わせ」「取り置き」）
3. それぞれの URL `https://formspree.io/f/xxxxabcd` の `xxxxabcd` を `_config.yml` の `formspree_contact` ／ `formspree_order` に貼る
4. Formspree の設定で「reCAPTCHA」または「Formshield」をオンにするとスパムが減る

### 管理画面（Decap CMS）— ログインの準備

管理画面は GitHub アカウントでログインし、保存するとこのリポジトリに直接コミットされます。GitHub のログインには「Client Secret」という秘密の鍵が要り、それを公開サイトには置けないので、**Cloudflare Workers（無料）に小さな中継役を置きます**（`cms-auth/worker.js`）。

1. **Cloudflare で Worker を作る**
   1. <https://dash.cloudflare.com/> に登録 → Workers & Pages → Create → 「Hello World」で作成。名前は `hu-coffee-cms-auth`
   2. 「Edit code」で中身をすべて消し、`cms-auth/worker.js` の内容を貼って Deploy
   3. Worker の URL（`https://hu-coffee-cms-auth.○○.workers.dev`）を控える
2. **GitHub で OAuth App を作る**
   1. GitHub 右上のアイコン → Settings → Developer settings → OAuth Apps → New OAuth App
   2. Homepage URL：`https://gmgngnm.github.io/hu_coffee/`
   3. Authorization callback URL：`（1-3 の URL）/callback`
   4. 作成後に表示される **Client ID** を控え、「Generate a new client secret」で **Client Secret** も控える（一度しか表示されない）
3. **Worker に鍵を登録する**：Worker の Settings → Variables and Secrets に
   - `GITHUB_CLIENT_ID`（種類 Text）＝ Client ID
   - `GITHUB_CLIENT_SECRET`（種類 **Secret**）＝ Client Secret
   - `ALLOWED_ORIGIN`（種類 Text）＝ `https://gmgngnm.github.io`
4. `admin/config.yml` の `base_url:` を 1-3 の URL に書き換えて push
5. **書く人を招待する**：リポジトリの Settings → Collaborators から、部員の GitHub アカウントを追加（書き込み権限が要る）

> 独自ドメインにしたら、OAuth App の Homepage URL、`ALLOWED_ORIGIN`、`admin/config.yml` の `site_url` などもそのドメインに変える。

### Instagram の最新投稿を表示する

ホームに最新6件を写真で並べます。6時間ごとと、サイトを更新するたびに GitHub Actions が取りに行きます。
アクセス用の鍵（トークン）は GitHub の Secret にだけ置き、ページには出しません。設定するまではホームの Instagram 欄は出ないだけで、ほかは普通に動きます。

1. Instagram アプリで、`@hu_coffee` を **プロアカウント（クリエイターまたはビジネス）** に切り替える（無料。設定 → アカウントの種類とツール）
2. <https://developers.facebook.com/> に登録してアプリを作成。用途に「Instagram でメッセージとコンテンツを管理」を選ぶ
3. 「Instagram ログインによる API 設定」で `@hu_coffee` を追加し、**アクセストークンを生成**してコピー（Meta の画面は名前がときどき変わります）
4. GitHub のリポジトリ → Settings → Secrets and variables → Actions → New repository secret で、名前 `IG_TOKEN`、値にトークンを貼る
5. **トークンの期限（60日）を自動で延ばす**ために、もう一つ Secret を作る
   1. GitHub 右上のアイコン → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token
   2. Repository access：`hu_coffee` だけ ／ Permissions：**Secrets を Read and write** ／ 期限は1年など
   3. 出てきたトークンを、名前 `GH_PAT` の Secret として登録
   4. これを入れないと、60日ごとに手順3〜4をやり直す必要があります。`GH_PAT` 自体の期限が来たら作り直す
6. Actions タブの「サイトを公開」→「Run workflow」で反映

## 3. 日々の更新

管理画面（`/admin/`）を使えば、以下はすべて画面上でできます。直接ファイルを書き換える場合のやり方を書いておきます。

### ブログ記事を書く
`_posts/` に `年-月-日-英数字の名前.md` というファイルを作る。GitHub の画面上の「Add file → Create new file」からでも書けます。

```markdown
---
title: 記事のタイトル
author: 書いた人（任意）
tags: [焙煎, イベント]
---
最初の段落が一覧に「抜粋」として出ます。

## 見出し
本文はMarkdownで書けます。
```

焙煎記録の記事なら、`roast:` を足すと記事の冒頭に記録表が出ます（`_posts/2026-10-25-roast-guatemala.md` を参照）。
画像は `assets/img/uploads/` に置いて `![説明](/assets/img/uploads/ファイル名.jpg)` で貼れます（`/hu_coffee` はサイト側で自動で補います）。スマホの写真はそのままだと重いので、横1600px程度に縮めてから入れてください。

### 豆を入れ替える
`_data/beans.yml` を編集（管理画面では「サイトの情報 → 焙煎豆」）。`status` を `available`（頒布中）／`soon`（次回焙煎）／`soldout`（売り切れ）に変えるだけで、豆ページ・ホーム・注文フォームがまとめて切り替わります。

## 4. 公開前に埋めるところ

- [ ] `_posts/` の見本記事3本を、実際の記事に差し替える（または削除）
- [ ] `_data/beans.yml` の見本の豆を、実際の豆・価格に差し替える
- [ ] 研究会の情報（活動日・部員数・設立）— 管理画面の「サイトの情報 → 研究会の情報」。空欄の項目はページに出ない
- [ ] `legal.md` の【】部分
- [ ] `_config.yml` の GA・Formspree の ID
- [ ] デザイン案を決めたら `proposals/` フォルダは削除してよい

## 5. 豆を売る前に確認しておきたいこと

- **大学の許可**：学内での物品販売・金銭の授受は、大学の学生団体向けルールで届け出が要ることがあります。学生支援の窓口に確認を。
- **食品衛生**：焙煎豆の製造・販売は、内容によって保健所への営業許可や届出が必要になる場合があります。札幌市の保健所に事前に相談するのが確実です。
- **特定商取引法**：ウェブで申し込みを受ける販売は「通信販売」にあたるため、`legal.md` の表記が必要です。
- **GitHub Pages の規約**：GitHub Pages は「主に商取引のためのサイト」には使えません。今の形（活動紹介が中心で、取り置きを受け付けるだけ）なら問題ありませんが、本格的にネット販売（カード決済・発送）をするなら、[BASE](https://thebase.com/) や [STORES](https://stores.jp/) で別にショップを作り、このサイトからリンクする形をおすすめします。

## 6. 手元で確認したいとき

```bash
bundle install
bundle exec jekyll serve
```

`http://localhost:4000/hu_coffee/` で見られます。管理画面を手元で試すときは、別のターミナルで `npx decap-server` を起動してから `http://localhost:4000/hu_coffee/admin/` を開くと、ログインなしでローカルのファイルを編集できます。

## 技術メモ

- GitHub Pages ではHTTPヘッダーを設定できないので、Content-Security-Policy は `<meta>` で出しています（`_includes/head.html`）。インラインの `<script>` / `style=""` は CSP で弾かれるので、JSは `assets/js/`、スタイルは `assets/css/main.css` に書いてください。
- 暗い画面設定（ダークモード）の端末では、自動で夜用の配色になります。
- トーンカラーは2色：エルムの森の緑 `#0d5a2c`（ヘッダー・フッター）と、珈琲の実の赤 `#9b1c2e`（ボタン・印）。`assets/css/main.css` の先頭で変えられます。
- 管理画面（`admin/`）は Decap CMS を unpkg から読み込むので、サイト本体の CSP はかけていません。
- 北海道大学の公式ロゴ・校章は使っていません（使用には大学の許可が必要です）。
