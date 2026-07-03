# WYYYES GTM 세일즈 파이프라인

외부 판매자(딜러) 영입 · 인플루언서 협업 현황을 한곳에서 관리하는 팀 공용 웹앱.
정적 SPA(GitHub Pages) + Supabase(무료) 구성으로 서버 운영 부담이 없습니다.

## 기능

- **대시보드**: KPI(전체/주간 신규/진행중/성사/팔로업 필요), 유형별 퍼널+누적 도달률, 팔로업 필요 리스트, 담당자·카테고리·채널별 분포, 최근 활동
- **보드(칸반)**: 단계별 카드 보기, 드래그로 단계 변경(히스토리 자동 기록)
- **테이블**: 검색·필터(유형/단계/채널/담당자)·정렬, 행 클릭 → 상세
- **상세 드로어**: 항목 정보 + 히스토리 타임라인 + 메모
- **CSV 내보내기**, 실시간 동기화(다른 팀원 화면 자동 갱신)

파이프라인 단계 (유형별, 전체 보기는 합집합):
- 딜러: `발굴 → 컨택 → 응답 → 협의 → 승인 → 판매`
- 인플루언서: `발굴 → 컨택 → 응답 → 협의 → 계약 → 진행 → 완료`
- 공통 종료: `보류`, `제외`

카테고리: 피규어 / 포켓몬카드 / 트레이딩카드 / 스포츠카드 / 아트토이 / 레고 / 기타 (`config.js`에서 수정)

## 최초 셋업 (1회)

### 1. Supabase 프로젝트

1. [supabase.com](https://supabase.com) 가입 → **New project** (무료 플랜)
2. **SQL Editor** → `schema.sql` 내용 전체 붙여넣고 **Run**
3. **Authentication → Users → Add user**로 공용 계정 생성
   - 예: 이메일 `team@wyyyes.app` / 비밀번호 = 팀 공용 비밀번호
   - "Auto Confirm User" 체크
4. **Project Settings → API**에서 `Project URL`, `anon public` 키 복사

### 2. config.js 입력

```js
SUPABASE_URL: "https://xxxx.supabase.co",
SUPABASE_ANON_KEY: "eyJ...",
TEAM_EMAIL: "team@wyyyes.app",   // 3번에서 만든 계정 이메일
OWNERS: ["Eric", "Ian"],          // 팀원 이름 목록
```

> anon key는 RLS(로그인한 사용자만 접근) 전제로 공개돼도 안전한 키입니다.
> 데이터 접근에는 반드시 공용 비밀번호 로그인이 필요합니다.

### 3. 배포 (GitHub Pages)

```bash
# 이 폴더를 새 repo로
git init && git add -A && git commit -m "sales pipeline v1"
gh repo create wyyyes-sales-pipeline --public --source . --push
gh api repos/{owner}/wyyyes-sales-pipeline/pages -X POST \
  -f 'source[branch]=main' -f 'source[path]=/'
```

또는 GitHub 웹에서 repo 생성 → Settings → Pages → Deploy from branch(main, /) 설정.

## 기존 시트 데이터 이관 (1회성)

```bash
SUPABASE_URL=https://xxxx.supabase.co \
SUPABASE_KEY=<service_role 키>  \
python3 scripts/import_sheet.py "신규 피규어 딜러 발굴_Eric_260701.xlsx" --owner Eric
```

- `--dry-run`을 붙이면 업로드 없이 파싱 결과만 확인
- service_role 키는 Project Settings → API에 있음 (**절대 커밋 금지**)
- 단계 매핑: 승인O→승인, 확인O→응답확인, 컨택O→컨택, 제외O→제외, 그 외→발굴

## 로컬 실행

```bash
python3 -m http.server 8000   # 이 폴더에서
# → http://localhost:8000
```

## 구조

| 파일 | 역할 |
|---|---|
| `index.html` / `app.js` / `styles.css` | SPA (빌드 스텝 없음, Supabase JS CDN) |
| `config.js` | 팀 환경 설정 (URL, 키, 담당자 목록) |
| `schema.sql` | DB 스키마 + RLS 정책 (Supabase SQL Editor용) |
| `scripts/import_sheet.py` | 기존 구글시트 xlsx 이관 스크립트 |

새 팀원 추가는 `config.js`의 `OWNERS`에 이름만 추가하면 됩니다.
인플루언서 전용 필드가 더 필요하면 `extra`(jsonb) 컬럼을 활용하세요 (스키마 변경 불필요).
