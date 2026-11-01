/**
 * Decap CMS の GitHub ログインを中継する Cloudflare Worker。
 *
 * GitHub のログイン（OAuth）では、最後に「Client Secret」を使ってトークンを受け取る。
 * Secret は公開サイトに置けないので、この小さなサーバーにだけ持たせる。
 *
 * 環境変数（Cloudflare の Settings → Variables and Secrets）
 *   GITHUB_CLIENT_ID      GitHub OAuth App の Client ID
 *   GITHUB_CLIENT_SECRET  同じく Client Secret（「Secret」の種類で登録する）
 *   ALLOWED_ORIGIN        管理画面のオリジン。例: https://gmgngnm.github.io
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/auth") return start(url, env);
    if (url.pathname === "/callback") return callback(request, url, env);
    return new Response("Decap CMS auth for hu_coffee", { status: 200 });
  },
};

function start(url, env) {
  // 公開リポジトリなら public_repo で足りる。非公開に変えたときのために repo も許す
  const asked = url.searchParams.get("scope") || "public_repo";
  const scope = ["repo", "public_repo"].includes(asked) ? asked : "public_repo";
  const state = crypto.randomUUID();
  const gh = new URL("https://github.com/login/oauth/authorize");
  gh.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  gh.searchParams.set("redirect_uri", `${url.origin}/callback`);
  gh.searchParams.set("scope", scope);
  gh.searchParams.set("state", state);
  // state を Cookie にも置き、戻ってきたときに照合する（他人に仕掛けられたログインを弾くため）
  return new Response(null, {
    status: 302,
    headers: {
      Location: gh.toString(),
      "Set-Cookie": `decap_state=${state}; Path=/callback; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

async function callback(request, url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)decap_state=([^;]+)/);
  if (!code || !state || !cookie || cookie[1] !== state) {
    return page("error", { error: "ログインの確認に失敗しました。もう一度お試しください。" }, env);
  }
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "hu-coffee-cms-auth" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.access_token) {
    return page("error", { error: data.error_description || "トークンを受け取れませんでした。" }, env);
  }
  return page("success", { token: data.access_token, provider: "github" }, env);
}

// Decap が待っている決まった手順（postMessage）でトークンを管理画面へ渡す。
// 渡す相手は ALLOWED_ORIGIN だけに限る。
function page(status, content, env) {
  const msg = `authorization:github:${status}:${JSON.stringify(content)}`;
  const html = `<!doctype html><meta charset="utf-8"><title>ログイン中…</title>
<p>ログインしています…このウィンドウは自動で閉じます。</p>
<script>
(function () {
  var allowed = ${JSON.stringify(env.ALLOWED_ORIGIN || "")};
  var msg = ${JSON.stringify(msg)};
  if (!window.opener) { document.body.textContent = "管理画面から開き直してください。"; return; }
  window.addEventListener("message", function (e) {
    if (e.origin !== allowed) return;
    window.opener.postMessage(msg, allowed);
    setTimeout(function () { window.close(); }, 300);
  });
  window.opener.postMessage("authorizing:github", allowed);
})();
</script>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": "decap_state=; Path=/callback; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
    },
  });
}
