(function () {
  // 狭い画面ではタブが横スクロールになる。いまのページのタブが隠れないよう寄せておく。
  var cur = document.querySelector(".tab.is-current");
  if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest", inline: "center" });

  // Formspree へはページ遷移せずに送る。JS が無い環境では普通の POST で送られる。
  document.querySelectorAll("form[data-ajax]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var result = form.querySelector(".form__result");
      if (!form.action || !/^https:\/\/formspree\.io\//.test(form.action)) return;
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      show(result, "送信しています…", null);
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          show(result, "送信しました。折り返しメールでご連絡します。", true);
        })
        .catch(function () {
          show(result, "送信できませんでした。時間をおいて再度お試しいただくか、Instagram の DM でご連絡ください。", false);
        })
        .finally(function () { btn.disabled = false; });
    });
  });

  function show(el, msg, ok) {
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("is-ok", ok === true);
    el.classList.toggle("is-ng", ok === false);
  }
})();
