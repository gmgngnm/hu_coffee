(function () {
  // 狭い画面ではタブが横スクロールになる。いまのページのタブが隠れないよう寄せておく。
  var cur = document.querySelector(".tab.is-current");
  if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest", inline: "center" });

  // 取り置きフォームの合計金額。送信内容には含めない（金額は受け取り時に確定するため）。
  var total = document.querySelector("[data-total]");
  if (total) {
    var selects = document.querySelectorAll("select[data-price]");
    var update = function () {
      var sum = 0;
      selects.forEach(function (s) { sum += Number(s.value) * Number(s.dataset.price); });
      total.textContent = "¥" + sum.toLocaleString("ja-JP");
    };
    selects.forEach(function (s) { s.addEventListener("change", update); });
    update();
  }

  // Formspree へはページ遷移せずに送る。JS が無い環境では普通の POST で送られる。
  document.querySelectorAll("form[data-ajax]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      var result = form.querySelector(".form__result");
      if (!form.action || !/^https:\/\/formspree\.io\//.test(form.action)) { e.preventDefault(); return; }

      if (selects && form.contains(selects[0])) {
        var any = Array.prototype.some.call(selects, function (s) { return Number(s.value) > 0; });
        if (!any) { e.preventDefault(); show(result, "豆を1袋以上選んでください。", false); return; }
      }
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      show(result, "送信しています…", null);

      var data = new FormData(form);
      // 0袋の行はメールを読みにくくするだけなので落とす
      Array.prototype.slice.call(form.querySelectorAll("select[data-price]")).forEach(function (s) {
        if (s.value === "0") data.delete(s.name);
      });
      fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          if (total) total.textContent = "¥0";
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
