// gtag の初期化。CSP でインラインスクリプトを禁じているため別ファイルにしている。
(function () {
  var id = document.currentScript && document.currentScript.dataset.gaId;
  if (!id) return;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id);
})();
