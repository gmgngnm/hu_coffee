(function () {
  // 狭い画面ではタブが横スクロールになる。いまのページのタブが隠れないよう寄せておく。
  var cur = document.querySelector(".tab.is-current");
  if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest", inline: "center" });

  // 出店予定のうち、もう終わったものを隠す（サイトは数時間おきにしか組み立て直さないため）。
  var events = document.querySelectorAll(".event[data-end]");
  if (events.length) {
    var now = Date.now(), left = 0;
    events.forEach(function (li) {
      if (Date.parse(li.dataset.end) <= now) li.hidden = true; else left++;
    });
    if (!left) {
      var list = document.querySelector(".events"), empty = document.querySelector(".events__empty");
      if (list) list.hidden = true;
      if (empty) empty.hidden = false;
    }
  }

  // 出店予定の月カレンダー。予定のある日に印を付け、押すとその予定まで移動する。
  var cal = document.querySelector(".cal");
  if (cal) {
    var evs = [];
    try { evs = JSON.parse(cal.dataset.events || "[]"); } catch (e) { evs = []; }
    var grid = cal.querySelector(".cal__grid"), title = cal.querySelector(".cal__title");
    var today = new Date(), view = new Date(today.getFullYear(), today.getMonth(), 1);
    var key = function (d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
    // 何日にもまたがる予定は、その日すべてに印を付ける
    var byDay = {};
    // 日付は文字列（日本時間）の年月日をそのまま使う。Date に通すと、端末の時差で前日にずれることがある
    var ymd = function (iso) { var p = iso.slice(0, 10).split("-"); return new Date(+p[0], p[1] - 1, +p[2]); };
    evs.forEach(function (ev, i) {
      var d = ymd(ev.start), last = ymd(ev.end);
      // 終わりが 0:00 ちょうど（終日の予定）なら、その日は含めない
      if (/T00:00:00/.test(ev.end) && last > d) last.setDate(last.getDate() - 1);
      for (; d <= last; d.setDate(d.getDate() + 1)) (byDay[key(d)] = byDay[key(d)] || []).push(i);
    });
    var items = document.querySelectorAll(".event");
    var draw = function () {
      title.textContent = view.getFullYear() + "年 " + (view.getMonth() + 1) + "月";
      grid.textContent = "";
      "日月火水木金土".split("").forEach(function (w, i) {
        var h = document.createElement("span");
        h.className = "cal__w" + (i === 0 ? " is-sun" : i === 6 ? " is-sat" : "");
        h.textContent = w;
        grid.appendChild(h);
      });
      var first = view.getDay(), days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
      for (var b = 0; b < first; b++) grid.appendChild(document.createElement("span"));
      for (var n = 1; n <= days; n++) {
        var d = new Date(view.getFullYear(), view.getMonth(), n), hit = byDay[key(d)];
        var c = document.createElement(hit ? "button" : "span");
        c.className = "cal__d" + (key(d) === key(today) ? " is-today" : "") + (hit ? " has-event" : "") +
          (d.getDay() === 0 ? " is-sun" : d.getDay() === 6 ? " is-sat" : "");
        c.textContent = n;
        if (hit) {
          c.type = "button";
          c.title = hit.map(function (i) { return evs[i].title; }).join("、");
          c.setAttribute("aria-label", n + "日：" + c.title);
          c.dataset.index = hit[0];
          c.addEventListener("click", function () {
            var li = items[this.dataset.index];
            if (!li) return;
            li.scrollIntoView({ behavior: "smooth", block: "center" });
            li.classList.remove("is-flash"); void li.offsetWidth; li.classList.add("is-flash");
          });
        }
        grid.appendChild(c);
      }
    };
    cal.querySelectorAll(".cal__nav").forEach(function (btn) {
      btn.addEventListener("click", function () {
        view.setMonth(view.getMonth() + Number(this.dataset.step));
        draw();
      });
    });
    draw();
    cal.hidden = false;
  }

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
