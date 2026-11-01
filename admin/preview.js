// プレビュー欄にもサイトと同じ CSS を当てて、仕上がりに近い見た目で書けるようにする
(function () {
  if (!window.CMS) return;
  var base = location.pathname.replace(/admin\/?.*$/, "");
  CMS.registerPreviewStyle("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500&display=swap");
  CMS.registerPreviewStyle(base + "assets/css/main.css");
  // サイトの body は表紙の緑なので、プレビューでは紙の色に戻す
  CMS.registerPreviewStyle("body{background:#e6d6b6 !important;padding:24px}", { raw: true });
})();
