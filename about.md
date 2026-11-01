---
layout: default
title: 私たちについて
nav: about
description: 北大珈琲研究会の活動内容、一年の流れ、入会案内。
---
<div class="wrap">
<header class="page-hero">
  <div class="page-hero__text">
    <p class="label">WHO WE ARE ／ ABOUT</p>
    <h1 class="page-title">私たちについて</h1>
    <p class="lead">スペシャルティコーヒーを、大学生にもっと身近に。<br>学部も学年もばらばらのメンバーで、毎週コーヒーを淹れています。</p>
  </div>
  <figure class="snap snap--solo">
    <img src="{{ '/assets/img/uploads/2026-10-30-room.jpg' | relative_url }}" width="698" height="370" alt="グループに分かれてドリップしている例会の様子">
  </figure>
</header>

<div class="about-grid page-sec">
<section class="prose" markdown="1">

## 活動の柱

### 焙煎する
生豆を仕入れ、部の焙煎機で焼きます。投入温度、火力、煎り止めのタイミングを毎回記録し、次の焙煎に活かします。

### 味をはかる
焼いた豆は数日おいてカッピング（評価のための試飲）をします。香り、酸、甘さ、後味を点数とことばで残し、焙煎記録と並べて読み返します。

### 淹れる
同じ豆でも、挽き目・湯温・注ぎ方で味は大きく変わります。条件を一つずつ変えて飲み比べるのが、いちばん盛り上がる時間です。

### 届ける
学祭や学内イベントでの出店や、手づくりの道具・焙煎豆の販売をしています。飲んだ人の感想が、次の焙煎のいちばんの材料になります。

</section>

<aside class="datasheet" aria-label="研究会の概要">
  <p class="datasheet__head">研究会の概要</p>
  <dl>
    <div><dt>名称</dt><dd>北大珈琲研究会</dd></div>
    <div><dt>拠点</dt><dd>北海道大学 札幌キャンパス</dd></div>
    {%- assign c = site.data.club -%}
    {% if c.activity_days != "" %}<div><dt>活動日</dt><dd>{{ c.activity_days }}</dd></div>{% endif %}
    {% if c.room != "" %}<div><dt>部室</dt><dd>{{ c.room }}</dd></div>{% endif %}
    {% if c.members != "" %}<div><dt>部員数</dt><dd>{{ c.members }}</dd></div>{% endif %}
    {% if c.founded != "" %}<div><dt>設立</dt><dd>{{ c.founded }}</dd></div>{% endif %}
    <div><dt>連絡先</dt><dd><a href="{{ '/contact/' | relative_url }}">お問い合わせフォーム</a><br><a href="https://www.instagram.com/{{ site.instagram }}/" target="_blank" rel="noopener noreferrer">Instagram @{{ site.instagram }}</a></dd></div>
  </dl>
</aside>
</div>

<section class="year-flow">
  <div class="sec-head"><h2>一年の流れ</h2></div>
  <ol class="timeline">
    <li><b>4–5月</b><span>新歓。試飲会と、はじめての焙煎体験。</span></li>
    <li><b>6月</b><span>北大祭に出店。</span></li>
    <li><b>7–9月</b><span>水出し・アイスコーヒーの研究。夏休みは焙煎の練習。</span></li>
    <li><b>10–11月</b><span>新豆の季節。産地ごとの飲み比べ。</span></li>
    <li><b>12–2月</b><span>試験期間も部室のコーヒーは切らさない。冬のブレンド作り。</span></li>
  </ol>
</section>

<section class="join note-box">
  <h2>入会・見学</h2>
  <p>経験はまったく要りません。コーヒーが苦手だけど気になる、という人も歓迎です。学部・学年・大学院生かどうかは問いません。見学はお問い合わせフォームか Instagram の DM からどうぞ。</p>
  <p><a class="btn" href="{{ '/contact/' | relative_url }}">見学を申し込む</a></p>
</section>
</div>
