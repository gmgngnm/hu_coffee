# 北大珈琲研究会サイトの作業メモ

GitHub Actions（`.github/workflows/pages.yml`）で `actions/jekyll-build-pages` を使って組み立て、Pages に出す。
ビルドの前に `scripts/fetch_instagram.py` が Instagram の最新投稿を `_data/instagram.json` と
`assets/img/instagram/`（git には入れない）に取ってくる。
使えるプラグインは GitHub Pages が許すもの（jekyll-feed / seo-tag / sitemap）だけ。

管理画面は Decap CMS（`admin/`）。ログインは `cms-auth/worker.js`（Cloudflare Worker）が中継する。
管理画面で編集するデータは Decap が扱える形にしてある（`_data/beans.yml` は `beans:` の下にリスト、
価格は `{size, price}` のリスト、焙煎記録は `{label, value}` のリスト）。形を変えるなら `admin/config.yml` も直す。

- 画面の文言・コミットは日本語。部員（Web初心者）が読むので README は平易に
- CSP を meta で出している。インライン script・style 属性は書かない
- 配色は明るい麻袋の地に、エルムの緑と珈琲の赤。ダークモードは利用者の希望で持たない
- 見た目を変えたら PC／スマホ幅（390px と 320px）で撮って確かめる。横にはみ出していないかも測る
- 手元ビルド: `JEKYLL_NO_BUNDLER_REQUIRE=true BUNDLE_GEMFILE=/nonexistent jekyll build`
  （Gemfile の github-pages gem を入れずに済ませるため）
- フォームは Formspree、テストでは `page.route` で差し替えて実際には送らない
- 管理画面のテストは `decap-server`（local_backend）で。unpkg に届かない環境では npm の decap-cms の dist を `page.route` で返す
