#!/usr/bin/env python3
"""
Instagram の最新投稿を取ってきて、サイトのビルドに使えるよう保存する。
GitHub Actions（.github/workflows/pages.yml）から、サイトを作るたびに呼ばれる。

  _data/instagram.json        投稿の一覧（ホームの表示に使う）
  assets/img/instagram/*.jpg  画像（Instagram の画像URLは期限切れになるので手元に置く）

トークンはブラウザに出さず、Actions の Secret（IG_TOKEN）からだけ読む。
失敗してもサイトのビルドは止めない（その場合は Instagram 欄が出ないだけ）。
"""
import json, os, sys, urllib.parse, urllib.request, pathlib

API = os.environ.get("IG_API", "https://graph.instagram.com")
TOKEN = os.environ.get("IG_TOKEN", "").strip()
LIMIT = int(os.environ.get("IG_LIMIT", "6"))
ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "_data" / "instagram.json"
IMG_DIR = ROOT / "assets" / "img" / "instagram"


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
    fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
    q = urllib.parse.urlencode({"fields": fields, "limit": LIMIT, "access_token": TOKEN})
    try:
        items = json.loads(get(f"{API}/me/media?{q}")).get("data", [])
    except Exception as e:
        warn(f"Instagram の投稿を取得できませんでした（{e}）。トークンの期限切れかもしれません。")
        return

    IMG_DIR.mkdir(parents=True, exist_ok=True)
    posts = []
    for it in items[:LIMIT]:
        # 動画はサムネイル、写真・カルーセルは1枚目の画像を使う
        src = it.get("thumbnail_url") if it.get("media_type") == "VIDEO" else it.get("media_url")
        if not src or not it.get("id", "").isdigit():
            continue
        path = IMG_DIR / f"{it['id']}.jpg"
        try:
            path.write_bytes(get(src))
            shrink(path)
        except Exception as e:
            warn(f"画像を保存できませんでした: {it.get('permalink')}（{e}）")
            continue
        caption = (it.get("caption") or "").strip().split("\n")[0]
        posts.append({
            "image": f"/assets/img/instagram/{it['id']}.jpg",
            "caption": caption[:80],
            "permalink": it.get("permalink", ""),
            "timestamp": it.get("timestamp", ""),
            "video": it.get("media_type") == "VIDEO",
        })

    DATA.write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Instagram の投稿を {len(posts)} 件保存しました。")

    new = refresh_token()
    out = os.environ.get("IG_NEW_TOKEN_FILE")
    if new and out:
        pathlib.Path(out).write_text(new)


def shrink(path):
    """表示は小さいので、横640pxに縮めてページを軽くする。Pillow が無ければそのまま。"""
    try:
        from PIL import Image
    except ImportError:
        return
    with Image.open(path) as im:
        im = im.convert("RGB")
        im.thumbnail((640, 640))
        im.save(path, "JPEG", quality=82, optimize=True)


if __name__ == "__main__":
    main()
