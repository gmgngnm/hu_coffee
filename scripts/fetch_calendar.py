#!/usr/bin/env python3
"""
Google カレンダーの出店予定を取ってきて、ホームの「出店予定」欄に使えるよう保存する。
GitHub Actions（.github/workflows/pages.yml）から、サイトを作るたびに呼ばれる。

  入力  環境変数 GCAL_ICS_URL … カレンダーの「iCal 形式の非公開 URL」（Actions の Secret に置く）
  出力  _data/calendar.json   … これからの予定（ホームはこれを表示する）

Google の API キーや追加のライブラリは使わない（iCal を自前で読む）。
取れなかったときは前回の内容を消さずに終わる（Instagram と同じく、サイトの公開は止めない）。
"""
import datetime as dt
import json
import os
import pathlib
import re
import sys
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

JST = ZoneInfo("Asia/Tokyo")
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "_data" / "calendar.json"
LIMIT = int(os.environ.get("GCAL_LIMIT", "6"))
WDAY = "月火水木金土日"


def warn(msg):
    print(f"::warning::{msg}")


def unfold(text):
    # iCal は長い行を「改行＋空白」で折り返す
    return re.sub(r"\r?\n[ \t]", "", text).splitlines()


def unescape(v):
    for a, b in ((r"\n", "\n"), (r"\N", "\n"), (r"\,", ","), (r"\;", ";"), (r"\\", "\\")):
        v = v.replace(a, b)
    return v


def parse_dt(params, value):
    """(日時, 終日か) を返す。日時は JST にそろえる"""
    if params.get("VALUE") == "DATE" or re.fullmatch(r"\d{8}", value):
        d = dt.datetime.strptime(value, "%Y%m%d")
        return d.replace(tzinfo=JST), True
    if value.endswith("Z"):
        d = dt.datetime.strptime(value, "%Y%m%dT%H%M%SZ").replace(tzinfo=dt.timezone.utc)
    else:
        tz = params.get("TZID")
        try:
            zone = ZoneInfo(tz) if tz else JST
        except Exception:
            zone = JST
        d = dt.datetime.strptime(value[:15], "%Y%m%dT%H%M%S").replace(tzinfo=zone)
    return d.astimezone(JST), False


def events(lines):
    ev = None
    for line in lines:
        if line == "BEGIN:VEVENT":
            ev = {}
        elif line == "END:VEVENT":
            if ev is not None:
                yield ev
            ev = None
        elif ev is not None and ":" in line:
            head, value = line.split(":", 1)
            name, *ps = head.split(";")
            params = dict(p.split("=", 1) for p in ps if "=" in p)
            ev[name.upper()] = (params, value)


def gcal_add_link(title, start, end, allday, location, details):
    if allday:
        dates = f"{start:%Y%m%d}/{end:%Y%m%d}"
    else:
        dates = f"{start:%Y%m%dT%H%M%S}/{end:%Y%m%dT%H%M%S}"
    q = {"action": "TEMPLATE", "text": title, "dates": dates, "ctz": "Asia/Tokyo"}
    if location:
        q["location"] = location
    if details:
        q["details"] = details
    return "https://calendar.google.com/calendar/render?" + urllib.parse.urlencode(q)


def main():
    url = os.environ.get("GCAL_ICS_URL", "").strip()
    src = os.environ.get("GCAL_ICS_FILE", "").strip()  # 手元で試すとき用
    if not url and not src:
        print("GCAL_ICS_URL が未設定なので、出店予定の取得は飛ばします。")
        return
    try:
        if src:
            text = pathlib.Path(src).read_text(encoding="utf-8")
        else:
            with urllib.request.urlopen(url, timeout=30) as r:
                text = r.read().decode("utf-8")
    except Exception as e:
        warn(f"Google カレンダーを読み込めませんでした（{e}）。URL が変わっていないか確認してください。")
        return
    if "BEGIN:VCALENDAR" not in text:
        warn("カレンダーの形式が違うようです。「iCal 形式の非公開 URL」を登録してください。")
        return

    now = dt.datetime.now(JST)
    found, skipped_repeat = [], 0
    for ev in events(unfold(text)):
        if "DTSTART" not in ev or ev.get("STATUS", ({}, ""))[1].upper() == "CANCELLED":
            continue
        if "RRULE" in ev:
            # 出店は単発の予定のはずなので、繰り返しの予定（例会など）は載せない
            skipped_repeat += 1
            continue
        start, allday = parse_dt(*ev["DTSTART"])
        if "DTEND" in ev:
            end, _ = parse_dt(*ev["DTEND"])
        else:
            end = start + (dt.timedelta(days=1) if allday else dt.timedelta(hours=1))
        if end <= now:
            continue
        title = unescape(ev.get("SUMMARY", ({}, "（無題）"))[1]).strip()
        location = unescape(ev.get("LOCATION", ({}, ""))[1]).strip()
        desc = unescape(ev.get("DESCRIPTION", ({}, ""))[1]).strip()
        desc = re.sub(r"<[^>]+>", "", desc)  # Google は説明欄に HTML を入れることがある
        last = end - dt.timedelta(days=1) if allday else end
        days = (last.date() - start.date()).days
        if allday:
            time = "終日"
        else:
            time = f"{start:%-H:%M}–{end:%-H:%M}"
        found.append({
            "start": start.isoformat(),
            "end": end.isoformat(),
            "month": f"{start.month}月",
            "day": str(start.day),
            "wday": WDAY[start.weekday()],
            "until": f"〜{last.month}/{last.day}（{WDAY[last.weekday()]}）" if days > 0 else "",
            "time": time,
            "title": title,
            "location": location,
            "note": desc.split("\n")[0][:80],
            "add_url": gcal_add_link(title, start, end, allday, location, desc[:500]),
        })
    found.sort(key=lambda e: e["start"])
    OUT.write_text(json.dumps(found[:LIMIT], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"出店予定を {len(found[:LIMIT])} 件保存しました。" + (f"（繰り返しの予定 {skipped_repeat} 件は対象外）" if skipped_repeat else ""))


if __name__ == "__main__":
    sys.exit(main())
