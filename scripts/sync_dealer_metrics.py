#!/usr/bin/env python3
"""딜러 실활동 지표 동기화 — 로컬 wyyyes CLI → Supabase leads.extra.metrics

이 맥에서만 실행 (어드민 JWT가 로컬에만 있음).

사용법:
  SUPABASE_TEAM_PASSWORD=<팀 비밀번호> python3 sync_dealer_metrics.py [--dry-run]
  (비밀번호는 ~/.wyyyes-pipeline.env 의 SUPABASE_TEAM_PASSWORD=... 로도 설정 가능)

동작:
  1. Supabase에서 딜러 카드 조회 (닉네임 우선, 없으면 카드 이름으로 매칭 시도)
  2. wyyyes CLI sellers-with-metrics 전체 목록과 닉네임 매칭
  3. 매칭된 딜러의 종료 라이브 수·마지막 라이브 일시 조회
  4. leads.extra.metrics 에 적재 → 앱 드로어/카드에 표시됨
"""
import argparse
import json
import os
import subprocess
import sys
import urllib.request

SUPABASE_URL = "https://zcbcphrrsicfkiihppst.supabase.co"
SUPABASE_KEY = "sb_publishable_ucs2pLjEL2mjvHifKjtUKQ_51x6Acfw"
TEAM_EMAIL = "team@wyyyes.app"
WY = os.path.expanduser("~/bin/wyyyes")

ENV = dict(os.environ)
with open(os.path.expanduser("~/.wyyyes-cli/config")) as f:
    for line in f:
        if line.startswith("WYYYES_API_KEY="):
            ENV["WYYYES_API_KEY"] = line.split("=", 1)[1].strip()


def team_password():
    if os.environ.get("SUPABASE_TEAM_PASSWORD"):
        return os.environ["SUPABASE_TEAM_PASSWORD"]
    p = os.path.expanduser("~/.wyyyes-pipeline.env")
    if os.path.exists(p):
        for line in open(p):
            if line.startswith("SUPABASE_TEAM_PASSWORD="):
                return line.split("=", 1)[1].strip()
    sys.exit("SUPABASE_TEAM_PASSWORD 환경변수 또는 ~/.wyyyes-pipeline.env 필요")


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


def cli(args):
    p = subprocess.run([WY] + args, env=ENV, capture_output=True, text=True)
    try:
        return json.loads(p.stdout)
    except Exception:
        print(f"  CLI 실패: {' '.join(args[:3])} → {p.stderr[:120]}", file=sys.stderr)
        return None


norm = lambda s: str(s or "").replace(" ", "").lower()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    token = sb("POST", "/auth/v1/token?grant_type=password",
               {"email": TEAM_EMAIL, "password": team_password()})["access_token"]

    leads = sb("GET", "/rest/v1/leads?select=id,name,nickname,extra,stage&type=eq.dealer", token=token)
    print(f"딜러 카드 {len(leads)}건")

    # 전체 딜러 메트릭 (최대 5000)
    data = cli(["data-extraction", "sellers-with-metrics", "--limit", "5000"])
    sellers = data.get("result") if isinstance(data, dict) else None
    if isinstance(sellers, dict):
        sellers = sellers.get("items") or sellers.get("list") or []
    if not sellers:
        sys.exit("sellers-with-metrics 조회 실패")
    by_nick = {norm(s.get("nickname")): s for s in sellers if s.get("nickname")}
    print(f"wyyyes 딜러 {len(by_nick)}명 로드")

    matched = 0
    for l in leads:
        seller = by_nick.get(norm(l.get("nickname"))) or by_nick.get(norm(l.get("name")))
        if not seller:
            continue
        matched_by = "nickname" if norm(l.get("nickname")) in by_nick else "name"

        # 종료 라이브 수 + 마지막 라이브
        lives = cli(["lives", "list", "--seller-id", str(seller["sellerId"]),
                     "--status", "10", "--limit", "1"])
        live_count = 0
        last_live_at = None
        if lives:
            live_count = (lives.get("page") or {}).get("total", 0)
            items = lives.get("result") or []
            if isinstance(items, dict):
                items = items.get("items") or []
            if items:
                last_live_at = items[0].get("startAt")

        metrics = {
            "seller_id": seller["sellerId"],
            "user_id": seller.get("_id"),
            "wyyyes_nickname": seller.get("nickname"),
            "matched_by": matched_by,
            "is_live_dealer": seller.get("isLiveDealer"),
            "approved_at": seller.get("contractUpgradeAt"),
            "live_count": live_count,
            "last_live_at": last_live_at,
            "acc_sold_amount": seller.get("accTotalSoldAmount", 0),
            "synced_at": __import__("datetime").datetime.now().astimezone().isoformat(timespec="seconds"),
        }
        print(f"  ✓ {l['name']} ({matched_by}) → 라이브 {live_count}회, 누적 {metrics['acc_sold_amount']:,}원")
        matched += 1
        if not args.dry_run:
            extra = {**(l.get("extra") or {}), "metrics": metrics}
            sb("PATCH", f"/rest/v1/leads?id=eq.{l['id']}", {"extra": extra}, token=token)

    print(f"\n매칭 {matched}건 / 미매칭 {len(leads) - matched}건" + (" (dry-run, 저장 안 함)" if args.dry_run else " — 저장 완료"))


if __name__ == "__main__":
    main()
