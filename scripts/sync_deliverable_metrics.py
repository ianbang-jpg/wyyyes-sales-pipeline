#!/usr/bin/env python3
"""협업 결과물 지표 자동 수집 — 링크에서 조회수/좋아요/댓글수 읽어 Supabase에 반영.

이 맥에서 실행:
  python3 sync_deliverable_metrics.py [--dry-run]

플랫폼별 수집 방식:
  - 유튜브: watch 페이지 HTML 파싱 (조회수 확실, 좋아요/댓글은 가능한 경우)
  - 인스타그램/릴스: 로그인된 Chrome 세션(browser-harness)으로 열어서 파싱
"""
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request
from datetime import datetime

SUPABASE_URL = "https://zcbcphrrsicfkiihppst.supabase.co"
SUPABASE_KEY = "sb_publishable_ucs2pLjEL2mjvHifKjtUKQ_51x6Acfw"
TEAM_EMAIL = "team@wyyyes.app"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"


def team_password():
    if os.environ.get("SUPABASE_TEAM_PASSWORD"):
        return os.environ["SUPABASE_TEAM_PASSWORD"]
    p = os.path.expanduser("~/.wyyyes-pipeline.env")
    if os.path.exists(p):
        for line in open(p):
            if line.startswith("SUPABASE_TEAM_PASSWORD="):
                return line.split("=", 1)[1].strip()
    sys.exit("SUPABASE_TEAM_PASSWORD 필요")


def sb(method, path, body=None, token=None):
    headers = {"apikey": SUPABASE_KEY, "Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(SUPABASE_URL + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers=headers, method=method)
    with urllib.request.urlopen(req) as r:
        raw = r.read()
        return json.loads(raw) if raw else None


def parse_compact_num(s):
    """'1.5만', '12K', '3,456' 등 → int"""
    if s is None:
        return None
    s = str(s).replace(",", "").strip()
    m = re.match(r"^([\d.]+)\s*(만|천|억|[KkMm])?", s)
    if not m or not m.group(1):
        return None
    n = float(m.group(1))
    unit = {"만": 1e4, "천": 1e3, "억": 1e8, "K": 1e3, "k": 1e3, "M": 1e6, "m": 1e6}.get(m.group(2) or "", 1)
    return int(n * unit)


def fetch_youtube(url):
    """watch HTML에서 조회수/좋아요/댓글 파싱 (조회수는 안정적, 나머지는 best-effort)"""
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ko"})
    try:
        html = urllib.request.urlopen(req, timeout=15).read().decode("utf-8", "ignore")
    except Exception as e:
        return {"error": str(e)[:80]}
    out = {}
    m = re.search(r'"viewCount"\s*:\s*"(\d+)"', html)
    if m:
        out["views"] = int(m.group(1))
    # 좋아요: accessibility 라벨 or likeCount
    m = re.search(r'"likeCount"\s*:\s*"?(\d[\d,]*)"?', html)
    if not m:
        m = re.search(r'좋아요 ([\d,.만천억KM]+)개', html)
    if m:
        out["likes"] = parse_compact_num(m.group(1))
    # 댓글수
    m = re.search(r'"commentCount"\s*:\s*\{[^}]*?"simpleText"\s*:\s*"([\d,.만천KM]+)', html)
    if not m:
        m = re.search(r'"commentCount"\s*:\s*"?(\d[\d,]*)"?', html)
    if m:
        out["comments"] = parse_compact_num(m.group(1))
    return out


def fetch_instagram_batch(urls):
    """로그인된 Chrome으로 각 링크를 열어 og:description/본문에서 파싱"""
    if not urls:
        return {}
    script = """
import time, json, re
results = {}
first = True
for url in %s:
    try:
        if first:
            new_tab(url); first = False
        else:
            goto_url(url)
        wait_for_load(); time.sleep(3)
        data = js('''
(() => {
  const og = document.querySelector('meta[property="og:description"]')?.content || "";
  const body = document.body.innerText.slice(0, 3000);
  return JSON.stringify({og, body});
})()
''')
        results[url] = json.loads(data)
    except Exception as e:
        results[url] = {"error": str(e)[:80]}
print("@@RESULT@@" + json.dumps(results, ensure_ascii=False))
""" % json.dumps(urls)
    p = subprocess.run(["browser-harness"], input=script, capture_output=True, text=True)
    for line in p.stdout.splitlines():
        if line.startswith("@@RESULT@@"):
            return json.loads(line[len("@@RESULT@@"):])
    print("  인스타 수집 실패:", p.stderr[:150], file=sys.stderr)
    return {}


def parse_instagram(raw):
    """og:description 예: '1,234 likes, 56 comments - ...' / '좋아요 1,234개, 댓글 56개 - ...'"""
    out = {}
    og = raw.get("og", "")
    body = raw.get("body", "")
    m = re.search(r"([\d,.만천KM]+)\s*likes?", og, re.I) or re.search(r"좋아요\s*([\d,.만천KM]+)개?", og + " " + body)
    if m:
        out["likes"] = parse_compact_num(m.group(1))
    m = re.search(r"([\d,.만천KM]+)\s*comments?", og, re.I) or re.search(r"댓글\s*([\d,.만천KM]+)개?", og + " " + body)
    if m:
        out["comments"] = parse_compact_num(m.group(1))
    m = re.search(r"([\d,.만천KM]+)\s*views", og, re.I) or re.search(r"조회(?:수)?\s*([\d,.만천억KM]+)회?", body)
    if m:
        out["views"] = parse_compact_num(m.group(1))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    token = sb("POST", "/auth/v1/token?grant_type=password",
               {"email": TEAM_EMAIL, "password": team_password()})["access_token"]
    rows = sb("GET", "/rest/v1/deliverables?select=id,url,title", token=token)
    print(f"결과물 {len(rows)}건")

    insta_urls = [r["url"] for r in rows if "instagram.com" in r["url"]]
    insta_raw = fetch_instagram_batch(insta_urls)

    updated = 0
    for r in rows:
        url = r["url"]
        if "youtube.com" in url or "youtu.be" in url:
            metrics = fetch_youtube(url)
        elif "instagram.com" in url:
            metrics = parse_instagram(insta_raw.get(url, {}))
        else:
            print(f"  - #{r['id']} 지원하지 않는 플랫폼: {url[:50]}")
            continue

        if "error" in metrics or not metrics:
            print(f"  ✗ #{r['id']} {r.get('title') or url[:40]}: 수집 실패 {metrics.get('error', '(지표 없음)')}")
            continue

        label = " · ".join(f"{k} {v:,}" for k, v in metrics.items())
        print(f"  ✓ #{r['id']} {r.get('title') or url[:40]}: {label}")
        updated += 1
        if not args.dry_run:
            patch = {**metrics, "metrics_synced_at": datetime.now().astimezone().isoformat(timespec="seconds")}
            sb("PATCH", f"/rest/v1/deliverables?id=eq.{r['id']}", patch, token=token)

    print(f"\n{updated}건 갱신" + (" (dry-run)" if args.dry_run else " 완료"))


if __name__ == "__main__":
    main()
