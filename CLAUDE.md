# 北大珈琲研究会サイトの作業メモ

GitHub Actions（`.github/workflows/pages.yml`）で `actions/jekyll-build-pages` を使って組み立て、Pages に出す。
ビルドの前に `scripts/fetch_instagram.py` が Instagram の最新投稿の URL を `_data/instagram.json` に取ってくる。
ホームはその3件（無ければ `_data/instagram_pick.yml` の手選び）を公式の埋め込み（embed.js）で出す。
そのためホームだけ CSP に instagram.com と style の inline を足している（`_includes/head.html`）。
使えるプラグインは GitHub Pages が許すもの（jekyll-feed / seo-tag / sitemap）だけ。

管理画面は Decap CMS（`admin/`）。ログインは `cms-auth/worker.js`（Cloudflare Worker）が中継する。
SHOP（`shop.html`）は商品を `_data/products.yml`、焙煎豆を `_data/beans.yml` から出す。決済は外部（BASE/STORES）で、
このサイトは購入ページへのリンクだけを持つ（取り置きフォームは廃止）。`/beans/` は `/shop/` への転送だけ残している。
各ページの頭は `.page-hero`（左に手書き風の見出し、右に貼った写真1枚）でホームとそろえる。
管理画面で編集するデータは Decap が扱える形にしてある（`_data/beans.yml` は `beans:` の下にリスト、
価格は `{size, price}` のリスト、焙煎記録は `{label, value}` のリスト）。形を変えるなら `admin/config.yml` も直す。

- 画面の文言・コミットは日本語。部員（Web初心者）が読むので README は平易に
- CSP を meta で出している。インライン script・style 属性は書かない
- 配色は明るい麻袋の地に、エルムの緑と珈琲の赤。ダークモードは利用者の希望で持たない
- 文字は Noto Sans JP（見出しも400の細め、等幅フォントや大文字の字間広めラベルは使わない）。
  タブは手書き風の英字（Nothing You Could Do）、ホームの挨拶は手書き風（Zen Kurenaido）
- 見た目を変えたら PC／スマホ幅（390px と 320px）で撮って確かめる。横にはみ出していないかも測る
- 手元ビルド: `JEKYLL_NO_BUNDLER_REQUIRE=true BUNDLE_GEMFILE=/nonexistent jekyll build`
  （Gemfile の github-pages gem を入れずに済ませるため）
- フォームは Formspree、テストでは `page.route` で差し替えて実際には送らない
- 管理画面のテストは `decap-server`（local_backend）で。unpkg に届かない環境では npm の decap-cms の dist を `page.route` で返す
