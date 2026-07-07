# CLAUDE.md — WYYYES GTM 세일즈 파이프라인

딜러 영입 + 인플루언서 협업을 관리하는 팀 공용 웹앱. **팀이 실사용 중인 프로덕션**이므로 실데이터를 함부로 수정/삭제하지 말 것 (테스트 후 반드시 원상복구).

## 아키텍처

- **빌드 없는 정적 SPA**: `index.html` + `app.js`(단일 IIFE) + `styles.css` + `config.js`(팀 설정: OWNERS/CHANNELS/CATEGORIES)
- **백엔드**: Supabase (Postgres + Auth + Realtime). RLS로 authenticated 롤만 접근 — 공용 계정 1개로 팀 전체 로그인
- **배포**: GitHub Pages (Actions 방식, `.github/workflows/pages.yml`). main push → 자동 배포 (~20초)
- 민감정보 없음 원칙: 이 repo는 public. anon(publishable) key만 커밋 가능, 그 외 시크릿 금지

## 파일 가이드

| 경로 | 내용 |
|---|---|
| `app.js` | 전체 앱 로직. 탭별 렌더러: renderDashboard/renderBoard(renderBoardInto)/renderTable/renderCal/renderRetention/renderDeliv/renderHist/renderMy |
| `schema.sql` | 신규 설치용 전체 스키마 |
| `migrations/*.sql` | 운영 DB에 적용한 DDL 이력 (새 DDL은 여기에 파일 추가 후 Supabase SQL Editor에서 실행) |
| `scripts/import_*.py` | 최초 구글시트 이관 (1회성, 참고용) |
| `scripts/sync_dealer_metrics.py` | 딜러 실활동 지표 동기화 (로컬 wyyyes CLI 필요 — 이 저장소 관리자의 맥에서만 실행 가능) |
| `scripts/sync_deliverable_metrics.py` | 협업 결과물 지표 수집 (유튜브 HTML/innertube, 인스타는 로그인된 Chrome 필요) |

## 도메인 규칙

- **단계(stage)는 유형별**: 딜러 `발굴→컨택→응답→협의→승인→판매`, 인플루언서 `발굴→컨택→응답→협의→계약→진행→완료`, 공통 `보류/제외`. 전체 보기는 합집합(`ALL_STAGES`)
- 단계 변경 시 `stage_changed_at` 갱신, 보류/제외 이동 시 `closed_reason` 프롬프트, 모든 변경은 `activities`에 로그 (actor = 상단 "내 이름")
- `leads.extra`(jsonb): `metrics`(동기화 지표), `collab_type/planned_rate/actual_rate`(인플루언서). extra를 갱신할 땐 **기존 키 보존(spread)** 필수
- `archived_at` 있으면 히스토리 탭 전용 (모든 작업 뷰/집계에서 제외)
- 이름 중복은 하드 차단 (공백·대소문자 무시), 링크 중복은 confirm
- 투입 금액 = 결과물 1건 × 인플루언서 단가 (실제 우선, 없으면 계획; `parseWon`이 "10만원" 등 한글 단위 파싱)

## 개발 컨벤션

- 수정 후 `node --check app.js` → 로컬 서버(`python3 -m http.server 8124 --directory .`)로 실제 로그인·동작 확인 → 변경 단위별 커밋 → push
- 배포 확인: `curl -s "https://ianbang-jpg.github.io/wyyyes-sales-pipeline/app.js?nc=$(date +%s)" | grep -c <새 코드 마커>`
- **push 트리거 배포가 간헐 실패**하면 `gh workflow run pages.yml` 로 새 run 트리거 (기존 run rerun은 아티팩트 중복 오류로 실패함)
- GitHub Pages 캐시 max-age=600 — 사용자에겐 하드 리프레시(Cmd+Shift+R) 안내
- UI 텍스트는 한국어, WYYYES 브랜드 (다크 네이비 `--navy` + 레드 `--primary`, 브랜드 로고 `assets/`)
- 키보드: ESC 닫기, `n` 신규 등록, `/` 검색 — 새 모달/오버레이 추가 시 ESC 핸들러와 lockScroll에 연결할 것
