#!/usr/bin/env python3
"""
Instagram の最新投稿の URL を取ってきて、サイトのビルドに使えるよう保存する。
GitHub Actions（.github/workflows/pages.yml）から、サイトを作るたびに呼ばれる。

  _data/instagram.json  投稿の一覧。ホームはこの URL を公式の埋め込みで表示する

トークンはブラウザに出さず、Actions の Secret（IG_TOKEN）からだけ読む。
失敗してもサイトのビルドは止めない（その場合は Instagram 欄が出ないだけ）。
"""
import json, os, sys, urllib.parse, urllib.request, pathlib

API = os.environ.get("IG_API", "https://graph.instagram.com")
TOKEN = os.environ.get("IG_TOKEN", "").strip()
LIMIT = int(os.environ.get("IG_LIMIT", "6"))
ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "_data" / "instagram.json"


def get(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read()


def warn(msg):
    # Actions の画面で黄色い注意として出る
    print(f"::warning::{msg}")


def refresh_token():
    """長期トークンは60日で切れる。使うたびに延長しておき、新しい値を返す。"""
    q = urllib.parse.urlencode({"grant_type": "ig_refresh_token", "access_token": TOKEN})
    try:
        data = json.loads(get(f"{API}/refresh_access_token?{q}"))
    except Exception as e:  # 発行から24時間以内は延長できない。次の回に任せる
        warn(f"Instagram のトークンを延長できませんでした（{e}）")
        return None
    new = data.get("access_token")
    if new:
        print(f"::add-mask::{new}")
    return new


def main():
    if not TOKEN:
        print("IG_TOKEN が未設定なので、Instagram の取得は飛ばします。")
        return
    fields = "id,caption,permalink,timestamp"
    q = urllib.parse.urlencode({"fields": fields, "limit": LIMIT, "access_token": TOKEN})
    try:
        items = json.loads(get(f"{API}/me/media?{q}")).get("data", [])
    except Exception as e:
        warn(f"Instagram の投稿を取得できませんでした（{e}）。トークンの期限切れかもしれません。")
        return

    posts = []
    for it in items[:LIMIT]:
        if not it.get("permalink"):
            continue
        posts.append({
            "permalink": it["permalink"],
            "caption": (it.get("caption") or "").strip().split("\n")[0][:80],
            "timestamp": it.get("timestamp", ""),
        })

    DATA.write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Instagram の投稿を {len(posts)} 件保存しました。")

    new = refresh_token()
    out = os.environ.get("IG_NEW_TOKEN_FILE")
    if new and out:
        pathlib.Path(out).write_text(new)



if __name__ == "__main__":
    main()
