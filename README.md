# 北大珈琲研究会 ウェブサイト

GitHub Pages（無料・常時HTTPS）で公開する静的サイトです。ブログ機能は GitHub Pages に組み込みの Jekyll を使っているので、**ビルド作業やサーバーの管理は不要**です。ファイルを書き換えて push すれば数分で反映されます。

| ページ | ファイル |
|---|---|
| ホーム（最新の記録＋頒布中の豆） | `index.html` |
| 焙煎豆（一覧＋取り置きフォーム） | `beans.html` ／ 豆のデータは `_data/beans.yml` |
| 記録（ブログ一覧） | `blog/index.html` ／ 記事は `_posts/` |
| 私たち | `about.md` |
| お問い合わせ | `contact.html` |
| プライバシーポリシー／特商法表記 | `privacy.md` ／ `legal.md` |
| デザイン案 B・C | `proposals/` |

---

## 1. 公開する（最初に一度だけ）

1. リポジトリの **Settings → Pages** を開く
2. **Source** を「Deploy from a branch」、Branch を `main` ／ `/ (root)` にして Save
3. 数分後、`https://gmgngnm.github.io/hu_coffee/` で見られるようになる
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

## 3. 日々の更新

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
画像は `assets/img/` に置いて `![説明](/hu_coffee/assets/img/ファイル名.jpg)` で貼れます。スマホの写真はそのままだと重いので、横1600px程度に縮めてから入れてください。

### 豆を入れ替える
`_data/beans.yml` を編集。`status` を `available`（頒布中）／`soon`（次回焙煎）／`soldout`（売り切れ）に変えるだけで、豆ページ・ホーム・注文フォームがまとめて切り替わります。

## 4. 公開前に埋めるところ

- [ ] `_posts/` の見本記事3本を、実際の記事に差し替える（または削除）
- [ ] `_data/beans.yml` の見本の豆を、実際の豆・価格に差し替える
- [ ] `about.md` のデータシート（活動日・部員数・設立）
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

`http://localhost:4000/hu_coffee/` で見られます。

## 技術メモ

- GitHub Pages ではHTTPヘッダーを設定できないので、Content-Security-Policy は `<meta>` で出しています（`_includes/head.html`）。インラインの `<script>` / `style=""` は CSP で弾かれるので、JSは `assets/js/`、スタイルは `assets/css/main.css` に書いてください。
- 暗い画面設定（ダークモード）の端末では、自動で夜用の配色になります。
- 北海道大学の公式ロゴ・校章は使っていません（使用には大学の許可が必要です）。
