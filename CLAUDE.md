# 北大珈琲研究会サイトの作業メモ

GitHub Pages の組み込み Jekyll（3.10 系）でそのまま配信する。Actions もビルド手順も無い。
使えるプラグインは GitHub Pages が許すもの（jekyll-feed / seo-tag / sitemap）だけ。

- 画面の文言・コミットは日本語。部員（Web初心者）が読むので README は平易に
- CSP を meta で出している。インライン script・style 属性は書かない
- 見た目を変えたら明るい／暗いテーマ、PC／スマホ幅（390px）の両方で撮って確かめる
- 手元ビルド: `JEKYLL_NO_BUNDLER_REQUIRE=true BUNDLE_GEMFILE=/nonexistent jekyll build`
  （Gemfile の github-pages gem を入れずに済ませるため）
- フォームは Formspree、テストでは `page.route` で差し替えて実際には送らない
