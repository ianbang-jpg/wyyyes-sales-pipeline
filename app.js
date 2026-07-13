/* WYYYES GTM 세일즈 파이프라인 SPA */
(() => {
  const CFG = window.APP_CONFIG || {};
  // 유형별 파이프라인 단계 (전체 보기는 합집합)
  const STAGE_FLOW = {
    dealer: ["발굴", "컨택", "응답", "협의", "승인", "판매"],
    influencer: ["발굴", "컨택", "응답", "협의", "계약", "진행", "완료"],
  };
  const ALL_STAGES = ["발굴", "컨택", "응답", "협의", "승인", "계약", "판매", "진행", "완료"];
  const CLOSED_STAGES = ["보류", "제외"];
  const IN_PROGRESS = ["컨택", "응답", "협의", "승인", "계약", "진행"];
  const DONE_STAGES = ["판매", "완료"];
  const stagesFor = (type) => STAGE_FLOW[type] || ALL_STAGES;
  const TYPE_LABEL = { dealer: "딜러", influencer: "인플루언서" };
  const OWNERS = [...(CFG.OWNERS || [])].sort((a, b) => a.localeCompare(b));
  const OWNER_PALETTE = ["#1a56c4", "#c9186e", "#15803c", "#b45a09", "#6d3bd6", "#0e7a9e", "#c62828", "#4d7c0f"];
  const ownerColor = (name) => {
    const i = OWNERS.indexOf(name);
    return i >= 0 ? OWNER_PALETTE[i % OWNER_PALETTE.length] : "#8b93a5";
  };

  // 채널 브랜드 심볼 (Simple Icons)
  const CHANNEL_ICONS = {
    "인스타그램": { color: "#E4405F", path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" },
    "트위터/X": { color: "#0f1419", path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" },
    "유튜브": { color: "#FF0000", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ── 설정 확인 ──
  if (!CFG.SUPABASE_URL || !CFG.SUPABASE_ANON_KEY) {
    $("#setup-screen").classList.remove("hidden");
    return;
  }
  const sb = supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);

  // ── 상태 ──
  const state = {
    leads: [],
    tab: "dashboard",
    editingId: null,
    drawerId: null,
    sortKey: "updated_at",
    sortDir: "desc",
    selectMode: false,
    selected: new Set(),
    calMonth: null, // Date (해당 월 1일)
    retSortKey: "idle",
    retSortDir: "desc",
    deliverables: [],
    archivedLeads: [],
    profiles: {}, // owner -> {avatar, memo}
  };

  const me = () => localStorage.getItem("sp_me") || CFG.OWNERS?.[0] || "팀";

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.toggle("error", /실패|오류|없어요/.test(msg));
    el.classList.remove("hidden");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add("hidden"), 2500);
  }

  // 모달/드로어 열림 시 배경 스크롤 잠금
  const lockScroll = (on) => document.body.classList.toggle("no-scroll", on);

  const fmtDate = (d) => (d ? String(d).slice(0, 10) : "");
  const fmtDateTime = (d) => {
    if (!d) return "";
    const t = new Date(d);
    return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  };
  const fmtNum = (n) => (n == null ? "" : Number(n).toLocaleString());
  function fmtRel(d) {
    if (!d) return "";
    const diff = Date.now() - new Date(d).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "방금 전";
    if (min < 60) return `${min}분 전`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}시간 전`;
    const day = Math.floor(hr / 24);
    if (day === 1) return "어제";
    if (day < 7) return `${day}일 전`;
    return fmtDate(d);
  }

  // 팔로워 구간 (드롭다운 선택, "이상"은 ↑로 표기)
  const FOLLOWER_BUCKETS = [100, 500, 1000, 2000, 3000, 5000, 10000, 50000, 100000, 500000, 1000000];
  const bucketName = (t) => (t >= 10000 ? `${t / 10000}만` : t.toLocaleString());
  function followerLabel(n) {
    if (n == null) return "";
    let floor = null;
    for (const t of FOLLOWER_BUCKETS) if (n >= t) floor = t;
    return floor == null ? "100↓" : `${bucketName(floor)}↑`;
  }
  const followerFloor = (n) => {
    if (n == null) return "";
    let floor = "";
    for (const t of FOLLOWER_BUCKETS) if (n >= t) floor = t;
    return String(floor);
  };
  const followerOptions = (selectedVal) =>
    `<option value=""></option>` + FOLLOWER_BUCKETS.map((t) =>
      `<option value="${t}" ${String(t) === String(selectedVal) ? "selected" : ""}>${bucketName(t)}↑</option>`).join("");

  const todayStr = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  };
  const daysIn = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 864e5);
  const ROT_DAYS = 14; // 이 일수 이상 같은 단계에 머물면 경고색

  // 단계 체류일 배지 (활성 단계만, 성사/종료 제외)
  function rotBadge(l) {
    if (CLOSED_STAGES.includes(l.stage) || DONE_STAGES.includes(l.stage)) return "";
    const days = daysIn(l.stage_changed_at || l.updated_at);
    if (days < 1) return "";
    return `<span class="rot-badge ${days >= ROT_DAYS ? "rotting" : ""}" title="현재 단계 체류일">${days}일</span>`;
  }

  // 다음 액션 표시줄
  function naLine(l) {
    if (!l.next_action) return "";
    const due = l.next_action_due;
    const t = todayStr();
    const over = due && due < t;
    const isToday = due === t;
    return `<div class="na-line">📌 ${esc(l.next_action)}${due
      ? ` <span class="na-due ${over ? "overdue" : isToday ? "due-today" : ""}">${over ? "기한 지남 · " : isToday ? "오늘 · " : ""}${fmtDate(due)}</span>` : ""}</div>`;
  }

  const starBtn = (l) => `<button class="star-btn ${l.starred ? "on" : ""}" data-star="${l.id}" title="중요 표시">${l.starred ? "★" : "☆"}</button>`;

  async function toggleStar(id) {
    const l = state.leads.find((x) => x.id === id);
    if (!l) return;
    const { error } = await sb.from("leads").update({ starred: !l.starred }).eq("id", id);
    if (error) { toast("실패: " + error.message); return; }
    l.starred = !l.starred;
    if (state.drawerId === id) $("#drawer-star").textContent = l.starred ? "★" : "☆", $("#drawer-star").classList.toggle("on", l.starred);
    renderAll();
  }

  // 단가 파싱: 100000, "10만원", "1.5만" 등 → 원 단위 숫자
  function parseWon(v) {
    if (v == null || v === "") return null;
    if (typeof v === "number") return v;
    const s2 = String(v).replace(/[,원\s]/g, "");
    const m = s2.match(/^([\d.]+)(만|천|억)?$/);
    if (!m) return null;
    const unit = { "만": 1e4, "천": 1e3, "억": 1e8 }[m[2]] || 1;
    return Math.round(parseFloat(m[1]) * unit);
  }
  // 협업 건당 투입 비용: 실제 단가 우선, 없으면 계획 단가
  function leadRate(l) {
    return parseWon(l?.extra?.actual_rate) ?? parseWon(l?.extra?.planned_rate);
  }

  // 온/오프라인 칩
  const ctChip = (v) => (v ? `<span class="ct-chip ct-${v}">${v === "온라인" ? "온" : "오프"}</span>` : "");
  const catChip = (v) => (v ? `<span class="cat-chip cat-${esc(v)}">${esc(v)}</span>` : "");

  // 채널 → 브랜드 심볼 (미등록 채널은 텍스트 그대로)
  function chIcon(channel) {
    const ic = CHANNEL_ICONS[channel];
    if (!ic) return esc(channel);
    return `<svg class="ch-icon" viewBox="0 0 24 24" role="img" aria-label="${esc(channel)}"><title>${esc(channel)}</title><path fill="${ic.color}" d="${ic.path}"/></svg>`;
  }
  function chIconLabel(channel) {
    if (!CHANNEL_ICONS[channel]) return esc(channel);
    return `${chIcon(channel)} ${esc(channel)}`;
  }

  // ── 인증 ──
  async function boot() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) enterApp();
    else $("#login-screen").classList.remove("hidden");
  }

  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#login-btn");
    btn.disabled = true;
    $("#login-error").classList.add("hidden");
    const { error } = await sb.auth.signInWithPassword({
      email: CFG.TEAM_EMAIL,
      password: $("#login-password").value,
    });
    btn.disabled = false;
    if (error) {
      $("#login-error").textContent = "비밀번호가 올바르지 않아요.";
      $("#login-error").classList.remove("hidden");
      return;
    }
    $("#login-screen").classList.add("hidden");
    enterApp();
  });

  $("#logout-btn").addEventListener("click", async () => {
    await sb.auth.signOut();
    location.reload();
  });

  async function loadProfiles() {
    const { data } = await sb.from("profiles").select("*");
    state.profiles = {};
    (data || []).forEach((p) => { state.profiles[p.owner] = p; });
    updateTopbarAvatar();
    renderAll();
  }

  // 아바타: 이미지가 있으면 사진, 없으면 담당자 색 이니셜 원
  function avatarHtml(owner) {
    const p = state.profiles[owner];
    if (p && p.avatar) return `<img src="${p.avatar}" alt="${esc(owner)}">`;
    return `<span class="avatar-initial" style="background:${ownerColor(owner)}">${esc((owner || "?")[0])}</span>`;
  }

  function updateTopbarAvatar() {
    $("#topbar-avatar").innerHTML = avatarHtml(me());
  }

  const ownerBadge = (owner) => owner
    ? `<span class="owner-badge"><span class="avatar avatar-sm">${avatarHtml(owner)}</span>${esc(owner)}</span>`
    : "";

  async function enterApp() {
    $("#app").classList.remove("hidden");
    initControls();
    loadProfiles();
    loadDeliverables();
    // #me=이름 해시 → 해당 팀원의 내 페이지로 진입
    const m = location.hash.match(/^#me=(.+)$/);
    if (m) {
      const name = decodeURIComponent(m[1]);
      if (OWNERS.includes(name)) {
        localStorage.setItem("sp_me", name);
        $("#me-select").value = name;
        state.tab = "my";
        $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === "my"));
        $$(".tab-panel").forEach((p) => p.classList.toggle("hidden", p.id !== "tab-my"));
      }
    }
    await loadLeads();
    subscribeRealtime();
  }

  // ── 데이터 ──
  async function loadLeads() {
    const { data, error } = await sb.from("leads").select("*").order("updated_at", { ascending: false });
    if (error) { toast("불러오기 실패: " + error.message); return; }
    state.leads = (data || []).filter((l) => !l.archived_at);
    state.archivedLeads = (data || []).filter((l) => l.archived_at);
    renderAll();
  }
  const allLeads = () => [...state.leads, ...state.archivedLeads];

  function subscribeRealtime() {
    sb.channel("leads-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => loadLeads())
      .subscribe();
  }

  async function logActivity(leadId, action, detail) {
    await sb.from("activities").insert({ lead_id: leadId, action, detail, actor: me() });
  }

  // 버튼식 필터 그룹 (data-value에 선택값 저장)
  function initBtnGroup(sel, options) {
    const el = $(sel);
    el.dataset.value = "";
    el.innerHTML = options.map((o) =>
      `<button type="button" data-value="${esc(o.value)}" class="${o.value === "" ? "active" : ""}">${esc(o.label)}</button>`).join("");
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-value]");
      if (!b) return;
      el.dataset.value = b.dataset.value;
      [...el.children].forEach((c) => c.classList.toggle("active", c === b));
      renderAll();
    });
  }
  const fVal = (sel) => {
    const el = $(sel);
    return el.classList.contains("btn-group") ? (el.dataset.value || "") : el.value;
  };

  // ── 컨트롤 초기화 ──
  function initControls() {
    // 내 이름
    const meSel = $("#me-select");
    meSel.innerHTML = OWNERS.map((o) => `<option>${esc(o)}</option>`).join("");
    meSel.value = me();
    meSel.addEventListener("change", () => { localStorage.setItem("sp_me", meSel.value); updateTopbarAvatar(); renderAll(); });

    // 탭
    $$(".tab-btn").forEach((btn) =>
      btn.addEventListener("click", () => activateTab(btn.dataset.tab)));

    // 일괄 선택 모드
    $("#board-select-mode").addEventListener("click", (e) => {
      state.selectMode = !state.selectMode;
      e.currentTarget.classList.toggle("active", state.selectMode);
      if (!state.selectMode) state.selected.clear();
      updateBulkBar();
      renderAll();
    });
    $("#bulk-clear").addEventListener("click", () => { state.selected.clear(); updateBulkBar(); renderBoard(); });
    $("#bulk-category").innerHTML += (CFG.CATEGORIES || []).map((c) => `<option>${esc(c)}</option>`).join("");
    $("#bulk-stage").innerHTML += [...ALL_STAGES, ...CLOSED_STAGES].map((st) => `<option>${st}</option>`).join("");
    $("#bulk-category").addEventListener("change", async (e) => {
      const v = e.target.value; e.target.value = "";
      if (!v) return;
      await bulkApply({ category: v }, "정보 수정", `카테고리 → ${v} (일괄)`, `카테고리를 '${v}'(으)로 변경`);
    });
    $("#bulk-stage").addEventListener("change", async (e) => {
      const v = e.target.value; e.target.value = "";
      if (!v) return;
      const patch = { stage: v, stage_changed_at: new Date().toISOString() };
      if (CLOSED_STAGES.includes(v)) {
        const reason = window.prompt(`'${v}' 사유를 입력해주세요 (선택):`, "");
        if (reason !== null && reason.trim()) patch.closed_reason = reason.trim();
      }
      await bulkApply(patch, "단계 변경", `→ ${v} (일괄)`, `'${v}' 단계로 이동`);
    });
    $("#bulk-archive").addEventListener("click", async () => {
      const ids = [...state.selected];
      if (!ids.length) { toast("선택된 카드가 없어요"); return; }
      state.selected.clear();
      updateBulkBar();
      await setArchived(ids, true);
    });
    $("#bulk-delete").addEventListener("click", async () => {
      const ids = [...state.selected];
      if (!ids.length) { toast("선택된 카드가 없어요"); return; }
      if (!confirm(`선택한 ${ids.length}건을 삭제할까요? 히스토리도 함께 삭제됩니다.`)) return;
      const { error } = await sb.from("leads").delete().in("id", ids);
      if (error) { toast("삭제 실패: " + error.message); return; }
      toast(`${ids.length}건 삭제했어요`);
      state.selected.clear();
      updateBulkBar();
      loadLeads();
    });
    initMarquee();

    // 결과물 탭
    initBtnGroup("#deliv-platform-filter", [
      { value: "", label: "전체" }, { value: "youtube", label: "유튜브" },
      { value: "instagram", label: "인스타" }, { value: "x", label: "X" }, { value: "etc", label: "기타" },
    ]);
    $("#deliv-add-btn").addEventListener("click", openDelivModal);
    $("#deliv-modal-close").addEventListener("click", closeDelivModal);
    $("#deliv-cancel").addEventListener("click", closeDelivModal);
    $("#deliv-modal-backdrop").addEventListener("click", (e) => { if (e.target.id === "deliv-modal-backdrop") closeDelivModal(); });
    $("#deliv-form").addEventListener("submit", saveDeliv);

    // 캘린더 내비게이션
    const calShift = (n) => {
      const m = state.calMonth || new Date();
      state.calMonth = new Date(m.getFullYear(), m.getMonth() + n, 1);
      renderCal();
    };
    $("#cal-prev").addEventListener("click", () => calShift(-1));
    $("#cal-next").addEventListener("click", () => calShift(1));
    $("#cal-today").addEventListener("click", () => { state.calMonth = null; renderCal(); });
    $("#daypop-close").addEventListener("click", closeDayPop);
    $("#daypop-backdrop").addEventListener("click", (e) => { if (e.target.id === "daypop-backdrop") closeDayPop(); });
    $("#daypop-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = $("#daypop-input");
      const text = input.value.trim();
      if (!text || !dayPopDate) return;
      input.value = "";
      const { error } = await sb.from("calendar_notes").insert({ note_date: dayPopDate, text, author: me() });
      if (error) { toast("메모 저장 실패: " + error.message); return; }
      await renderCal();
      renderDayPopNotes();
      toast("메모를 추가했어요");
    });

    // 보류/제외 표시 토글
    $("#board-show-closed").addEventListener("click", (e) => {
      e.currentTarget.classList.toggle("active");
      renderAll();
    });

    // 프로필 이미지 업로드 (128px 리사이즈 → data URL)
    $("#my-avatar-btn").addEventListener("click", () => $("#my-avatar-input").click());
    $("#my-avatar-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const img = new Image();
      img.onload = async () => {
        const size = 128;
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        const s0 = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s0) / 2, (img.height - s0) / 2, s0, s0, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        URL.revokeObjectURL(img.src);
        const owner = me();
        const { error } = await sb.from("profiles").upsert({ owner, avatar: dataUrl, updated_at: new Date().toISOString() });
        if (error) { toast("이미지 저장 실패: " + error.message); return; }
        state.profiles[owner] = { ...(state.profiles[owner] || {}), owner, avatar: dataUrl };
        updateTopbarAvatar();
        $("#my-avatar").innerHTML = avatarHtml(owner);
        toast("프로필 이미지를 변경했어요");
      };
      img.src = URL.createObjectURL(file);
      e.target.value = "";
    });

    // 내 메모장 자동 저장 (blur 시)
    $("#my-memo").addEventListener("change", async (e) => {
      const owner = me();
      const memo = e.target.value;
      const { error } = await sb.from("profiles").upsert({ owner, memo, updated_at: new Date().toISOString() });
      if (error) { toast("메모 저장 실패: " + error.message); return; }
      state.profiles[owner] = { ...(state.profiles[owner] || {}), owner, memo };
      toast("메모를 저장했어요");
    });

    // 내 전용 링크 복사
    $("#my-link-btn").addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}#me=${encodeURIComponent(me())}`;
      try {
        await navigator.clipboard.writeText(url);
        toast("전용 링크를 복사했어요 — 북마크해두세요!");
      } catch {
        window.prompt("아래 링크를 복사하세요:", url);
      }
    });

    // 폼 옵션 (단계는 유형에 따라 toggleTypeFields에서 채움)
    $("#form-owner").innerHTML = `<option value=""></option>` + OWNERS.map((o) => `<option>${esc(o)}</option>`).join("");
    $("#form-category").innerHTML = `<option value=""></option>` + (CFG.CATEGORIES || []).map((c) => `<option>${esc(c)}</option>`).join("");
    $("#channel-options").innerHTML = (CFG.CHANNELS || []).map((c) => `<option value="${esc(c)}">`).join("");
    $("#table-stage-filter").innerHTML += [...ALL_STAGES, ...CLOSED_STAGES].map((s) => `<option>${s}</option>`).join("");
    const typeOpts = [{ value: "", label: "전체" }, { value: "dealer", label: "딜러" }, { value: "influencer", label: "인플루언서" }];
    ["#dash-type-filter", "#board-type-filter", "#table-type-filter"].forEach((sel) => initBtnGroup(sel, typeOpts));
    ["#dash-category-filter", "#board-category-filter", "#table-category-filter"].forEach((sel) => {
      $(sel).innerHTML += (CFG.CATEGORIES || []).map((c) => `<option>${esc(c)}</option>`).join("");
    });
    ["#table-owner-filter", "#board-owner-filter", "#dash-owner-filter", "#ret-owner-filter", "#deliv-owner-filter", "#hist-owner-filter"].forEach((sel) => {
      $(sel).innerHTML += OWNERS.map((o) => `<option>${esc(o)}</option>`).join("");
    });

    // 필터 이벤트
    ["#dash-owner-filter", "#dash-category-filter", "#board-owner-filter", "#board-category-filter", "#board-search",
     "#table-search", "#table-stage-filter", "#table-channel-filter", "#table-category-filter", "#table-owner-filter",
     "#ret-owner-filter", "#deliv-owner-filter", "#deliv-search", "#hist-search", "#hist-owner-filter"]
      .forEach((sel) => $(sel).addEventListener("input", renderAll));

    // 유형별 필드 토글
    $("#form-type").addEventListener("change", toggleTypeFields);

    // 버튼
    $("#add-btn").addEventListener("click", () => openModal(null));
    $("#bulkreg-btn").addEventListener("click", openBulkReg);
    $("#bulkreg-close").addEventListener("click", closeBulkReg);
    $("#bulkreg-cancel").addEventListener("click", closeBulkReg);
    $("#bulkreg-backdrop").addEventListener("click", (e) => { if (e.target.id === "bulkreg-backdrop") closeBulkReg(); });
    $("#bulkreg-addrow").addEventListener("click", () => brAddRows(1));
    $("#bulkreg-file-btn").addEventListener("click", () => $("#bulkreg-file").click());
    const downloadTemplate = (type) => {
      const esc2 = (v) => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      const tpl = type === "dealer"
        ? { label: "딜러",
            head: ["이름", "유형", "단계", "카테고리", "발굴 채널", "온·오프라인", "링크", "팔로워", "사업자 여부", "지역", "주요 상품", "컨택포인트", "컨택일", "닉네임", "승인일", "비고"],
            ex: ["예시딜러 (지우고 사용)", "딜러", "컨택", "피규어", "인스타그램", "온라인", "https://instagram.com/...", "1만", "사업자", "서울", "원피스 피규어", "인스타 DM", "2026-07-01", "", "",
              "단계: 발굴/컨택/응답/협의/승인/판매 · 온·오프라인: 온라인/오프라인 · 사업자 여부: 사업자/개인"] }
        : { label: "인플루언서",
            head: ["이름", "유형", "단계", "카테고리", "발굴 채널", "링크", "팔로워", "주요 상품", "컨택포인트", "컨택일", "협업 유형", "계획 단가", "실제 단가", "비고"],
            ex: ["예시인플루언서 (지우고 사용)", "인플루언서", "협의", "카드", "유튜브", "https://youtube.com/@...", "10만", "포켓몬 카드", "이메일", "2026-07-01", "브레이크 라이브", "30만원", "",
              "단계: 발굴/컨택/응답/협의/계약/진행/완료 · 단가: 숫자 또는 '30만원'"] };
      const csv = "\uFEFF" + [tpl.head, tpl.ex].map((r) => r.map(esc2).join(",")).join("\r\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      a.download = `일괄등록_${tpl.label}_템플릿.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    };
    $("#bulkreg-tpl-dealer").addEventListener("click", () => downloadTemplate("dealer"));
    $("#my-import-btn")?.addEventListener("click", () => { openBulkReg(); $("#bulkreg-file").click(); });
    $("#bulkreg-tpl-influencer").addEventListener("click", () => downloadTemplate("influencer"));
    $("#bulkreg-file").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) brHandleFile(file);
      e.target.value = "";
    });
    $("#bulkreg-save").addEventListener("click", saveBulkReg);
    $("#bulkreg-table").addEventListener("input", brUpdateCount);
    $("#bulkreg-table").addEventListener("paste", (e) => {
      if (e.target.classList.contains("br-name")) brPaste(e);
    });
    $("#bulkreg-table").addEventListener("change", (e) => {
      if (e.target.classList.contains("br-type")) {
        const tr = e.target.closest("tr");
        tr.querySelector(".br-stage").innerHTML = brStageOptions(e.target.value, "발굴");
      }
      if (e.target.classList.contains("br-del")) return;
    });
    $("#bulkreg-table").addEventListener("click", (e) => {
      const del = e.target.closest(".br-del");
      if (del) { del.closest("tr").remove(); brUpdateCount(); }
    });
    $("#export-btn").addEventListener("click", exportCsv);
    $("#modal-cancel").addEventListener("click", closeModal);
    $("#modal-close").addEventListener("click", closeModal);
    $("#modal-backdrop").addEventListener("click", (e) => { if (e.target.id === "modal-backdrop") closeModal(); });
    $("#modal-delete").addEventListener("click", () => deleteLead());
    $("#lead-form").addEventListener("submit", saveLead);
    $("#drawer-close").addEventListener("click", closeDrawer);
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-star]");
      if (!b) return;
      e.stopPropagation(); e.preventDefault();
      toggleStar(b.dataset.star);
    }, true);
    $("#drawer-star").addEventListener("click", () => { if (state.drawerId) toggleStar(state.drawerId); });
    $("#drawer-info").addEventListener("change", onDrawerFieldChange);
    $("#drawer-name-input").addEventListener("change", (e) => onDrawerFieldChange({ target: e.target }));
    $("#drawer-name-input").dataset.field = "name";
    $("#drawer-archive").addEventListener("click", async () => {
      const l = allLeads().find((x) => x.id === state.drawerId);
      if (!l) return;
      const ok = await setArchived([l.id], !l.archived_at);
      if (ok) closeDrawer();
    });
    $("#drawer-delete").addEventListener("click", () => {
      const id = state.drawerId;
      deleteLead(id).then((ok) => { if (ok) closeDrawer(); });
    });
    $("#drawer-backdrop").addEventListener("click", (e) => { if (e.target.id === "drawer-backdrop") closeDrawer(); });
    $("#memo-form").addEventListener("submit", addMemo);

    // 리텐션 테이블 정렬
    $$("#ret-table th").forEach((th) =>
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (state.retSortKey === key) state.retSortDir = state.retSortDir === "asc" ? "desc" : "asc";
        else { state.retSortKey = key; state.retSortDir = "desc"; }
        renderRetention();
      })
    );

    // 필터 초기화
    $$(".filter-reset").forEach((btn) =>
      btn.addEventListener("click", () => {
        const bar = btn.closest(".filter-bar");
        bar.querySelectorAll("select").forEach((el) => { el.value = ""; });
        bar.querySelectorAll('input[type="search"]').forEach((el) => { el.value = ""; });
        bar.querySelectorAll(".btn-group").forEach((g) => {
          g.dataset.value = "";
          [...g.children].forEach((c) => c.classList.toggle("active", c.dataset.value === ""));
        });
        bar.querySelectorAll(".toggle-btn.active").forEach((t) => {
          if (t.id !== "board-select-mode") t.classList.remove("active");
        });
        renderAll();
      }));

    // 키보드 단축키
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!$("#daypop-backdrop").classList.contains("hidden")) { closeDayPop(); return; }
        if (!$("#bulkreg-backdrop").classList.contains("hidden")) { closeBulkReg(); return; }
        if (!$("#deliv-modal-backdrop").classList.contains("hidden")) { closeDelivModal(); return; }
        if (!$("#modal-backdrop").classList.contains("hidden")) { closeModal(); return; }
        if (!$("#drawer-backdrop").classList.contains("hidden")) { closeDrawer(); return; }
        return;
      }
      // 입력 중이거나 모달이 열려 있으면 무시
      const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
      const modalOpen = ["#modal-backdrop", "#drawer-backdrop", "#daypop-backdrop", "#deliv-modal-backdrop", "#bulkreg-backdrop"]
        .some((sel2) => !$(sel2).classList.contains("hidden"));
      if (typing || modalOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") {
        const search = { board: "#board-search", table: "#table-search", deliv: "#deliv-search" }[state.tab];
        if (search) { e.preventDefault(); $(search).focus(); }
      } else if (e.key === "n") {
        e.preventDefault();
        openModal(null);
      }
    });

    // 테이블 정렬
    $$("#leads-table th").forEach((th) =>
      th.addEventListener("click", () => {
        const key = th.dataset.sort;
        if (state.sortKey === key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        else { state.sortKey = key; state.sortDir = "asc"; }
        renderTable();
      })
    );
  }

  function toggleTypeFields() {
    const type = $("#form-type").value;
    const isInf = type === "influencer";
    $$(".influencer-only").forEach((el) => el.classList.toggle("hidden", !isInf));
    $$(".dealer-only").forEach((el) => el.classList.toggle("hidden", isInf));
    // 유형에 맞는 단계 옵션으로 갱신 (가능하면 현재 값 유지)
    const sel = $("#form-stage");
    const cur = sel.value;
    const opts = [...stagesFor(type), ...CLOSED_STAGES];
    sel.innerHTML = opts.map((s) => `<option>${s}</option>`).join("");
    sel.value = opts.includes(cur) ? cur : "발굴";
  }

  function activateTab(tab) {
    state.tab = tab;
    $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    $$(".tab-panel").forEach((p) => p.classList.toggle("hidden", p.id !== "tab-" + tab));
    renderAll();
  }

  // ── 렌더링 ──
  function renderAll() {
    if (state.tab === "dashboard") renderDashboard();
    if (state.tab === "my") renderMy();
    if (state.tab === "board") renderBoard();
    if (state.tab === "table") renderTable();
    if (state.tab === "cal") renderCal();
    if (state.tab === "ret") renderRetention();
    if (state.tab === "deliv") renderDeliv();
    if (state.tab === "hist") renderHist();
  }

  function renderDashboard() {
    const typeF = fVal("#dash-type-filter");
    const ownerF = $("#dash-owner-filter").value;
    const catF = fVal("#dash-category-filter");
    const leads = state.leads.filter((l) =>
      (!typeF || l.type === typeF) && (!ownerF || l.owner === ownerF) && (!catF || l.category === catF));
    const active = leads.filter((l) => !CLOSED_STAGES.includes(l.stage));
    const followup = active
      .filter((l) => Date.now() - new Date(l.updated_at).getTime() > 7 * 864e5)
      .sort((a, b) => a.updated_at.localeCompare(b.updated_at));

    // 기간 경계 (주 시작 = 월요일)
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(dayStart);
    weekStart.setDate(dayStart.getDate() - ((dayStart.getDay() + 6) % 7));
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const kpis = [
      { label: "전체 (제외 포함)", value: leads.length, sub: `활성 ${active.length}건` },
      { label: "이번 주 신규", value: leads.filter((l) => new Date(l.created_at) >= weekStart).length, sub: "월요일 기준" },
      { label: "진행중", value: leads.filter((l) => IN_PROGRESS.includes(l.stage)).length, sub: "컨택~실행 단계" },
      { label: "성사", value: leads.filter((l) => DONE_STAGES.includes(l.stage)).length, sub: "판매·완료 누적" },
      { label: "팔로업 필요", value: followup.length, sub: "7일+ 업데이트 없음" },
    ];
    $("#kpi-row").innerHTML = kpis.map((k) => `
      <div class="kpi">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-sub">${k.sub}</div>
      </div>`).join("");

    // 퍼널 (유형 선택 시 해당 흐름 + 누적 도달률)
    const flow = typeF ? stagesFor(typeF) : ALL_STAGES;
    const funnelStages = [...flow, ...CLOSED_STAGES];
    const positioned = leads.filter((l) => flow.includes(l.stage));
    const reach = flow.map((_, i) => positioned.filter((l) => flow.indexOf(l.stage) >= i).length);
    const maxCnt = Math.max(1, ...funnelStages.map((s) => leads.filter((l) => l.stage === s).length));
    $("#funnel").innerHTML = funnelStages.map((s) => {
      const cnt = leads.filter((l) => l.stage === s).length;
      const i = flow.indexOf(s);
      let suffix = "";
      if (typeF && i > 0 && reach[0] > 0) {
        suffix = ` <span class="bar-pct" title="누적 도달 ${reach[i]}건">${Math.round((reach[i] / reach[0]) * 100)}%</span>`;
      }
      return barRow(`<span class="stage-chip stage-${s}">${s}</span>`, cnt, maxCnt, suffix);
    }).join("");

    // 담당자별 / 카테고리별 / 채널별
    $("#by-owner").innerHTML = groupBars(active, (l) => l.owner || "(미지정)");
    $("#by-category").innerHTML = groupBars(active, (l) => l.category || "(미지정)");
    $("#by-channel").innerHTML = groupBars(active, (l) => l.channel || "(미지정)", chIconLabel);

    // 주간 비교 / 기간별 활동 (히스토리 로그 기반)
    renderPeriodSections(leads, { dayStart, weekStart, prevWeekStart, monthStart });

    // 다음 액션 카드 (기한 지남 → 오늘 → 예정)
    const today = todayStr();
    const withNa = active.filter((l) => l.next_action);
    const naSorted = [
      ...withNa.filter((l) => l.next_action_due && l.next_action_due < today).sort((a, b) => a.next_action_due.localeCompare(b.next_action_due)),
      ...withNa.filter((l) => l.next_action_due === today),
      ...withNa.filter((l) => !l.next_action_due || l.next_action_due > today)
        .sort((a, b) => String(a.next_action_due || "9999").localeCompare(String(b.next_action_due || "9999"))),
    ];
    $("#next-actions").innerHTML = naSorted.slice(0, 8).map((l) => {
      const due = l.next_action_due;
      const over = due && due < today;
      const isToday = due === today;
      return `
        <div class="fu-item" data-id="${l.id}">
          <span class="fu-name">${esc(l.name)} <span class="muted">— ${esc(l.next_action)}</span></span>
          ${due ? `<span class="na-due ${over ? "overdue" : isToday ? "due-today" : ""}">${over ? "기한 지남" : isToday ? "오늘" : fmtDate(due)}</span>` : ""}
        </div>`;
    }).join("") || `<span class="muted">등록된 다음 액션이 없어요. 카드를 열어 "다음 액션"을 채워보세요.</span>`;
    $$("#next-actions .fu-item").forEach((el) =>
      el.addEventListener("click", () => openDrawer(el.dataset.id)));

    // 팔로업 필요 리스트 (오래된 순)
    $("#followup-list").innerHTML = followup.slice(0, 8).map((l) => {
      const days = Math.floor((Date.now() - new Date(l.updated_at).getTime()) / 864e5);
      return `
        <div class="fu-item" data-id="${l.id}">
          <span class="fu-name">${esc(l.name)}</span>
          <span class="stage-chip stage-${l.stage}">${l.stage}</span>
          <span class="fu-days">${days}일 전</span>
        </div>`;
    }).join("") || `<span class="muted">7일 이상 방치된 건이 없어요 👍</span>`;
    $$("#followup-list .fu-item").forEach((el) =>
      el.addEventListener("click", () => openDrawer(el.dataset.id)));

    // 최근 활동
    sb.from("activities").select("*, leads(name)").order("created_at", { ascending: false }).limit(12)
      .then(({ data }) => {
        $("#recent-activities").innerHTML = (data || []).map((a) => `
          <div class="tl-item">
            <div class="tl-dot"></div>
            <div class="tl-body">
              <div><b>${esc(a.leads?.name || "")}</b> — ${esc(a.action)}${a.detail ? ": " + esc(a.detail) : ""}</div>
              <div class="tl-meta" title="${fmtDateTime(a.created_at)}">${esc(a.actor || "")} · ${fmtRel(a.created_at)}</div>
            </div>
          </div>`).join("") || `<span class="muted">아직 활동 기록이 없어요.</span>`;
      });
  }

  // ── 주간 비교 + 일/주/월 활동 집계 ──
  async function renderPeriodSections(leads, P) {
    const leadIds = new Set(leads.map((l) => l.id));
    const since = P.monthStart < P.prevWeekStart ? P.monthStart : P.prevWeekStart;
    const { data } = await sb.from("activities")
      .select("action, detail, created_at, lead_id")
      .gte("created_at", since.toISOString());
    const acts = (data || []).filter((a) => leadIds.has(a.lead_id));

    const inRange = (d, from, to) => { const t = new Date(d); return t >= from && (!to || t < to); };
    // 단계 변경 로그의 도착 단계 추출 ("발굴 → 컨택", "컨택 → 제외 (사유)" 모두 대응)
    const moveTarget = (a) => { const m = /→ (\S+)/.exec(a.detail || ""); return m ? m[1] : null; };
    const enteredCnt = (stages, from, to) =>
      acts.filter((a) => a.action === "단계 변경" && inRange(a.created_at, from, to) && stages.includes(moveTarget(a))).length;
    const metrics = (from, to) => ({
      created: leads.filter((l) => inRange(l.created_at, from, to)).length,
      moves: acts.filter((a) => a.action === "단계 변경" && inRange(a.created_at, from, to)).length,
      contact: enteredCnt(["컨택"], from, to),
      reply: enteredCnt(["응답"], from, to),
      nego: enteredCnt(["협의"], from, to),
      commit: enteredCnt(["승인", "계약"], from, to),
      done: enteredCnt(["판매", "완료"], from, to),
      closed: enteredCnt(["보류", "제외"], from, to),
    });
    // 주간 비교용 세부 퍼널 (bad: 증가가 나쁜 신호)
    const FUNNEL_ROWS = [
      { k: "created", label: "신규 등록" },
      { k: "contact", label: "컨택 진입" },
      { k: "reply", label: "응답 확보" },
      { k: "nego", label: "협의 진입" },
      { k: "commit", label: "승인·계약" },
      { k: "done", label: "성사 (판매·완료)" },
      { k: "closed", label: "보류·제외", bad: true },
    ];

    // 전주 vs 이번 주 (세부 퍼널)
    const prev = metrics(P.prevWeekStart, P.weekStart);
    const cur = metrics(P.weekStart, null);
    $("#week-compare").innerHTML = `
      <table class="cmp-table">
        <thead><tr><th></th><th>전주</th><th>이번 주</th><th>증감</th></tr></thead>
        <tbody>${FUNNEL_ROWS.map(({ k, label, bad }) => {
          const d = cur[k] - prev[k];
          const upCls = bad ? "down" : "up";
          const downCls = bad ? "up" : "down";
          const delta = d > 0 ? `<span class="delta ${upCls}">▲ ${d}</span>`
            : d < 0 ? `<span class="delta ${downCls}">▼ ${-d}</span>` : `<span class="delta">–</span>`;
          return `<tr><td>${label}</td><td>${prev[k]}</td><td class="cmp-cur">${cur[k]}</td><td>${delta}</td></tr>`;
        }).join("")}</tbody>
      </table>
      <p class="muted cmp-note">단계 진입 수는 이 툴의 히스토리 기준 (월요일 시작)</p>`;

    // 일간 / 주간 / 월간 (세부 퍼널)
    const day = metrics(P.dayStart, null);
    const month = metrics(P.monthStart, null);
    $("#period-stats").innerHTML = `
      <table class="cmp-table">
        <thead><tr><th></th><th>오늘</th><th>이번 주</th><th>이번 달</th></tr></thead>
        <tbody>${FUNNEL_ROWS.map(({ k, label }) =>
          `<tr><td>${label}</td><td>${day[k]}</td><td class="cmp-cur">${cur[k]}</td><td>${month[k]}</td></tr>`).join("")}</tbody>
      </table>
      <p class="muted cmp-note">단계 진입 수는 이 툴에서 기록된 히스토리 기준</p>`;
  }

  function groupBars(leads, keyFn, labelFn = esc) {
    const counts = {};
    leads.forEach((l) => { const k = keyFn(l); counts[k] = (counts[k] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = Math.max(1, ...entries.map(([, c]) => c));
    return entries.map(([k, c]) => barRow(labelFn(k), c, max)).join("") || `<span class="muted">데이터 없음</span>`;
  }

  // 게이지 색: 비율이 높을수록 초록, 낮을수록 무채색
  function barColor(ratio) {
    const sat = Math.round(6 + ratio * 60);
    const light = Math.round(63 - ratio * 25);
    return `hsl(146, ${sat}%, ${light}%)`;
  }

  // labelHtml은 호출부에서 이스케이프/생성된 HTML
  function barRow(labelHtml, cnt, max, suffix = "") {
    const ratio = max ? cnt / max : 0;
    return `
      <div class="bar-row">
        <div class="bar-label">${labelHtml}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${ratio * 100}%; background:${barColor(ratio)}"></div></div>
        <div class="bar-count">${cnt}${suffix}</div>
      </div>`;
  }

  // ── 칸반 ──
  // ── 일괄 선택/처리 ──
  function updateBulkBar() {
    $("#bulk-bar").classList.toggle("hidden", !state.selectMode);
    $("#bulk-count").textContent = `${state.selected.size}개 선택`;
  }

  function toggleSelect(id) {
    if (state.selected.has(id)) state.selected.delete(id);
    else state.selected.add(id);
    updateBulkBar();
    const card = document.querySelector(`#board .lead-card[data-id="${id}"]`);
    if (card) {
      card.classList.toggle("card-selected", state.selected.has(id));
      const cb = card.querySelector(".card-check");
      if (cb) cb.checked = state.selected.has(id);
    }
  }

  async function bulkApply(patch, action, detail, label) {
    const ids = [...state.selected];
    if (!ids.length) { toast("선택된 카드가 없어요"); return; }
    const { error } = await sb.from("leads").update(patch).in("id", ids);
    if (error) { toast("실패: " + error.message); return; }
    await sb.from("activities").insert(ids.map((id) => ({ lead_id: id, action, detail, actor: me() })));
    toast(`${ids.length}건 ${label}했어요`);
    state.selected.clear();
    updateBulkBar();
    loadLeads();
  }

  // 빈 공간 드래그로 범위 선택 (마퀴)
  let marqueeSuppressClick = false;
  function initMarquee() {
    const board = $("#board");
    let startX = 0, startY = 0, rect = null, active = false;

    board.addEventListener("mousedown", (e) => {
      if (!state.selectMode || e.button !== 0) return;
      if (e.target.closest(".col-add, .star-btn, button")) return;
      startX = e.pageX; startY = e.pageY; active = false;

      const onMove = (ev) => {
        if (!active && Math.hypot(ev.pageX - startX, ev.pageY - startY) < 5) return;
        if (!active) {
          active = true;
          rect = document.createElement("div");
          rect.className = "marquee";
          document.body.appendChild(rect);
        }
        const x = Math.min(startX, ev.pageX), y = Math.min(startY, ev.pageY);
        const w = Math.abs(ev.pageX - startX), h = Math.abs(ev.pageY - startY);
        Object.assign(rect.style, { left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
        // 실시간 하이라이트
        board.querySelectorAll(".lead-card").forEach((card) => {
          const b = card.getBoundingClientRect();
          const bx = b.left + scrollX, by = b.top + scrollY;
          const hit = bx < x + w && bx + b.width > x && by < y + h && by + b.height > y;
          card.classList.toggle("marquee-hover", hit);
        });
        ev.preventDefault();
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        if (!active) return;
        board.querySelectorAll(".lead-card.marquee-hover").forEach((card) => {
          card.classList.remove("marquee-hover");
          state.selected.add(card.dataset.id);
        });
        rect.remove(); rect = null;
        updateBulkBar();
        renderBoard();
        marqueeSuppressClick = true;
        setTimeout(() => { marqueeSuppressClick = false; }, 100);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }

  // ── 협업 결과물 ──
  async function loadDeliverables() {
    const { data } = await sb.from("deliverables").select("*").order("posted_at", { ascending: false, nullsFirst: false });
    state.deliverables = data || [];
    if (state.tab === "deliv") renderDeliv();
    if (state.tab === "hist") renderHist();
  }

  function delivPlatform(url) {
    const u = String(url || "").toLowerCase();
    if (/youtube\.com|youtu\.be/.test(u)) return "youtube";
    if (/instagram\.com/.test(u)) return "instagram";
    if (/(^|\.)x\.com|twitter\.com/.test(u)) return "x";
    return "etc";
  }
  const DELIV_LABEL = { youtube: "유튜브", instagram: "인스타그램", x: "X", etc: "링크" };

  function ytThumb(url) {
    const m = String(url).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
    return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
  }

  function renderDeliv() {
    const pf = fVal("#deliv-platform-filter");
    const ownerF = $("#deliv-owner-filter").value;
    const q = $("#deliv-search").value.trim().toLowerCase();
    const leadById = Object.fromEntries(allLeads().map((l) => [l.id, l]));
    const rows = state.deliverables.filter((d) => {
      const lead = leadById[d.lead_id];
      return (!pf || delivPlatform(d.url) === pf) && (!ownerF || (lead && lead.owner === ownerF)) &&
        (!q || [d.title, d.url, lead?.name].join(" ").toLowerCase().includes(q));
    });

    // KPI
    const monthStart = todayStr().slice(0, 7);
    const thisMonth = rows.filter((d) => (d.posted_at || d.created_at || "").slice(0, 7) === monthStart).length;
    const uniqInf = new Set(rows.map((d) => d.lead_id)).size;
    const totalViews = rows.reduce((s2, d) => s2 + (d.views || 0), 0);
    const costOf = (d) => leadRate(leadById[d.lead_id]) || 0;
    const totalCost = rows.reduce((s2, d) => s2 + costOf(d), 0);
    const monthCost = rows.filter((d) => (d.posted_at || d.created_at || "").slice(0, 7) === monthStart)
      .reduce((s2, d) => s2 + costOf(d), 0);
    $("#deliv-kpi").innerHTML = [
      { label: "총 결과물", value: rows.length, sub: "등록된 콘텐츠" },
      { label: "이번 달 게시", value: thisMonth, sub: "게시일 기준" },
      { label: "참여 인플루언서", value: uniqInf, sub: "결과물 보유" },
      { label: "총 조회수", value: fmtNum(totalViews), sub: "수집된 지표 합계" },
      { label: "총 투입 금액", value: `${fmtNum(totalCost)}원`, sub: `이번 달 ${fmtNum(monthCost)}원` },
    ].map((x) => `
      <div class="kpi">
        <div class="kpi-label">${x.label}</div>
        <div class="kpi-value">${x.value}</div>
        <div class="kpi-sub">${x.sub}</div>
      </div>`).join("");

    // 투입 금액: 저번 달 vs 이번 달
    const t2 = new Date();
    const curKey = `${t2.getFullYear()}-${String(t2.getMonth() + 1).padStart(2, "0")}`;
    const p2 = new Date(t2.getFullYear(), t2.getMonth() - 1, 1);
    const prevKey = `${p2.getFullYear()}-${String(p2.getMonth() + 1).padStart(2, "0")}`;
    const sumMonth = (mk) => rows.filter((d) => (d.posted_at || d.created_at || "").slice(0, 7) === mk)
      .reduce((s2, d) => s2 + costOf(d), 0);
    const prevSpend = sumMonth(prevKey);
    const curSpend = sumMonth(curKey);
    const dd = curSpend - prevSpend;
    const deltaHtml = dd > 0 ? `<span class="delta up">▲ ${fmtNum(dd)}원</span>`
      : dd < 0 ? `<span class="delta down">▼ ${fmtNum(-dd)}원</span>` : `<span class="delta">–</span>`;
    $("#deliv-monthly").innerHTML = `
      <div class="spend-top">
        <div><div class="kpi-label">저번 달 (${Number(prevKey.slice(5))}월)</div><div class="spend-val">${fmtNum(prevSpend)}원</div></div>
        <div><div class="kpi-label">이번 달 (${Number(curKey.slice(5))}월)</div><div class="spend-val">${fmtNum(curSpend)}원</div></div>
        <div><div class="kpi-label">증감</div><div class="spend-val">${deltaHtml}</div></div>
      </div>`;

    // 갤러리
    $("#deliv-grid").innerHTML = rows.map((d) => {
      const lead = leadById[d.lead_id];
      const pfType = delivPlatform(d.url);
      const thumb = pfType === "youtube" ? ytThumb(d.url) : null;
      const pfIcon = pfType === "youtube" ? chIcon("유튜브")
        : pfType === "instagram" ? chIcon("인스타그램")
        : pfType === "x" ? chIcon("트위터/X") : "🔗";
      return `
        <div class="deliv-card">
          <a href="${esc(d.url)}" target="_blank" rel="noopener" class="deliv-thumb ${pfType}">
            ${thumb ? `<img src="${thumb}" alt="" loading="lazy">` : `<span class="deliv-thumb-icon">${pfIcon}</span>`}
            <span class="deliv-pf">${pfIcon} ${DELIV_LABEL[pfType]}</span>
          </a>
          <div class="deliv-body">
            <div class="deliv-title">${esc(d.title || d.url.replace(/^https?:\/\//, "").slice(0, 40))}</div>
            <div class="deliv-meta">
              <span class="deliv-inf" data-id="${d.lead_id}">${esc(lead?.name || "(삭제된 카드)")}</span>
              ${lead ? `<span class="stage-chip stage-${lead.stage}">${lead.stage}</span>` : ""}
            </div>
            ${(d.views || d.likes || d.comments || d.shares) ? `
            <div class="deliv-stats">
              ${d.views ? `<span title="조회수">👁 ${fmtNum(d.views)}</span>` : ""}
              ${d.likes ? `<span title="좋아요">❤️ ${fmtNum(d.likes)}</span>` : ""}
              ${d.comments ? `<span title="댓글수">💬 ${fmtNum(d.comments)}</span>` : ""}
              ${d.shares ? `<span title="공유·리그램 수 (수동 입력)">↗ ${fmtNum(d.shares)}</span>` : ""}
            </div>` : ""}
            <div class="deliv-sub muted">
              ${d.posted_at ? `게시 ${fmtDate(d.posted_at)}` : ""} ${d.author ? `· ${esc(d.author)}` : ""}
              ${d.metrics_synced_at ? `· 지표 ${fmtDate(d.metrics_synced_at).slice(5)}` : ""}
              <button class="note-del deliv-edit" data-edit="${d.id}" title="수정" style="margin-left:auto">✏️</button>
              <button class="note-del deliv-del" data-del="${d.id}" title="삭제">✕</button>
            </div>
          </div>
        </div>`;
    }).join("") || `<div class="muted deliv-empty">등록된 결과물이 없어요. 우측 상단 "+ 결과물 등록"으로 링크를 추가해보세요.</div>`;

    $$("#deliv-grid .deliv-inf").forEach((el) =>
      el.addEventListener("click", () => openDrawer(el.dataset.id)));
    $$("#deliv-grid .deliv-edit").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const d = state.deliverables.find((x) => String(x.id) === btn.dataset.edit);
        if (d) openDelivModal(d);
      }));
    $$("#deliv-grid .deliv-del").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm("이 결과물을 삭제할까요?")) return;
        const { error } = await sb.from("deliverables").delete().eq("id", btn.dataset.del);
        if (error) { toast("삭제 실패: " + error.message); return; }
        toast("삭제했어요");
        loadDeliverables();
      }));
  }

  let delivEditId = null;
  function delivCandidates(edit = null) {
    return state.leads.filter((l) =>
      l.type === "influencer" && (["진행", "완료"].includes(l.stage) || (edit && l.id === edit.lead_id)));
  }
  function openDelivModal(edit = null) {
    delivEditId = edit ? edit.id : null;
    $("#deliv-modal-title").textContent = edit ? "협업 결과물 수정" : "협업 결과물 등록";
    const infs = delivCandidates(edit).sort((a, b) => a.name.localeCompare(b.name));
    $("#deliv-lead-options").innerHTML =
      infs.map((l) => `<option value="${esc(l.name)}">${l.stage}${l.owner ? " · " + esc(l.owner) : ""}</option>`).join("");
    $("#deliv-form").reset();
    if (edit) {
      const lead = state.leads.find((l) => l.id === edit.lead_id);
      $("#deliv-lead-input").value = lead ? lead.name : "";
      $("#deliv-url").value = edit.url;
      $("#deliv-title").value = edit.title || "";
      $("#deliv-date").value = edit.posted_at || "";
      $("#deliv-shares").value = edit.shares ?? "";
    } else {
      $("#deliv-date").value = todayStr();
    }
    $("#deliv-modal-backdrop").classList.remove("hidden");
    lockScroll(true);
  }
  function closeDelivModal() { $("#deliv-modal-backdrop").classList.add("hidden"); lockScroll(false); }

  async function saveDeliv(e) {
    e.preventDefault();
    const nameInput = $("#deliv-lead-input").value.trim();
    const edit = delivEditId ? state.deliverables.find((x) => x.id === delivEditId) : null;
    const norm2 = (x) => String(x || "").replace(/\s+/g, "").toLowerCase();
    const lead = delivCandidates(edit).find((l) => norm2(l.name) === norm2(nameInput));
    if (!lead) { alert(`"${nameInput}" — 진행·완료 단계 인플루언서 중에 없어요. 목록에서 선택해주세요.`); return; }
    const leadId = lead.id;
    const url = $("#deliv-url").value.trim();
    if (!url) return;
    const sharesV = $("#deliv-shares").value;
    const payload = {
      lead_id: leadId, url,
      title: $("#deliv-title").value.trim() || null,
      posted_at: $("#deliv-date").value || null,
      shares: sharesV === "" ? null : Number(sharesV),
    };
    if (delivEditId) {
      const { error } = await sb.from("deliverables").update(payload).eq("id", delivEditId);
      if (error) { toast("저장 실패: " + error.message); return; }
      logActivity(leadId, "결과물 수정", payload.title || url.slice(0, 80));
      toast("결과물을 수정했어요");
    } else {
      payload.author = me();
      const { error } = await sb.from("deliverables").insert(payload);
      if (error) { toast("등록 실패: " + error.message); return; }
      logActivity(leadId, "결과물 등록", url.slice(0, 80));
      toast("결과물을 등록했어요");
    }
    closeDelivModal();
    loadDeliverables();
  }

  // ── 리텐션 (승인/판매 딜러 활동 추적) ──
  const RET_STAGES = ["승인", "판매"];

  function renderRetention() {
    const ownerF = $("#ret-owner-filter").value;
    const rows = state.leads.filter((l) =>
      l.type === "dealer" && RET_STAGES.includes(l.stage) && (!ownerF || l.owner === ownerF));

    const idleDays = (l) => {
      const m = l.extra?.metrics;
      if (!m || !m.last_live_at) return Infinity; // 기록 없음 = 최상위 주의
      return daysIn(m.last_live_at);
    };
    const getters = {
      name: (l) => l.name,
      stage: (l) => l.stage,
      owner: (l) => l.owner || "",
      approved: (l) => l.extra?.metrics?.approved_at || l.approved_at || "",
      live_count: (l) => l.extra?.metrics?.live_count ?? -1,
      last_live: (l) => l.extra?.metrics?.last_live_at || "",
      idle: idleDays,
      sold: (l) => l.extra?.metrics?.acc_sold_amount ?? -1,
      synced: (l) => l.extra?.metrics?.synced_at || "",
    };
    const { retSortKey: k, retSortDir: dir } = state;
    const get = getters[k] || getters.idle;
    rows.sort((a, b) => {
      const va = get(a), vb = get(b);
      const cmp = typeof va === "number" && typeof vb === "number"
        ? (va === vb ? 0 : va > vb ? 1 : -1)
        : String(va).localeCompare(String(vb));
      return dir === "asc" ? cmp : -cmp;
    });
    $$("#ret-table th").forEach((th) => {
      th.classList.toggle("sorted-asc", th.dataset.sort === k && dir === "asc");
      th.classList.toggle("sorted-desc", th.dataset.sort === k && dir === "desc");
    });

    // 요약 KPI
    const withM = rows.filter((l) => l.extra?.metrics);
    const live7 = withM.filter((l) => idleDays(l) <= 7).length;
    const idle30 = rows.filter((l) => idleDays(l) === Infinity || idleDays(l) >= 30).length;
    const totalSold = withM.reduce((s, l) => s + (l.extra.metrics.acc_sold_amount || 0), 0);
    $("#ret-kpi").innerHTML = [
      { label: "추적 대상", value: rows.length, sub: "승인·판매 단계 딜러" },
      { label: "최근 7일 라이브", value: live7, sub: "활동 중" },
      { label: "30일+ 미방송", value: idle30, sub: "리텐션 주의 ⚠️" },
      { label: "누적 판매 합계", value: `${fmtNum(Math.round(totalSold / 10000))}만`, sub: "원 (동기화 기준)" },
    ].map((x) => `
      <div class="kpi">
        <div class="kpi-label">${x.label}</div>
        <div class="kpi-value">${x.value}</div>
        <div class="kpi-sub">${x.sub}</div>
      </div>`).join("");

    // 테이블
    $("#ret-table tbody").innerHTML = rows.map((l) => {
      const m = l.extra?.metrics;
      const idle = idleDays(l);
      const idleHtml = m
        ? (m.last_live_at
          ? `<span class="ret-idle ${idle >= 30 ? "bad" : idle >= 14 ? "warn" : "ok"}">${idle}일</span>`
          : `<span class="ret-idle bad">기록 없음</span>`)
        : `<span class="muted">—</span>`;
      return `
        <tr data-id="${l.id}">
          <td class="td-name">${esc(l.name)}${m?.wyyyes_nickname ? ` <span class="muted">@${esc(m.wyyyes_nickname)}</span>` : ""}</td>
          <td><span class="stage-chip stage-${l.stage}">${l.stage}</span></td>
          <td>${ownerBadge(l.owner)}</td>
          <td>${m?.approved_at ? fmtDate(m.approved_at) : fmtDate(l.approved_at)}</td>
          <td>${m ? `${fmtNum(m.live_count)}회` : `<span class="muted">미동기화</span>`}</td>
          <td>${m?.last_live_at ? fmtDate(m.last_live_at) : ""}</td>
          <td>${idleHtml}</td>
          <td class="ret-sold">${m ? fmtNum(m.acc_sold_amount) + "원" : ""}</td>
          <td class="muted">${m?.synced_at ? fmtDate(m.synced_at) : ""}</td>
        </tr>`;
    }).join("") || `<tr><td colspan="9" class="muted" style="text-align:center;padding:30px">승인·판매 단계의 딜러가 없어요.</td></tr>`;

    $$("#ret-table tbody tr[data-id]").forEach((tr) =>
      tr.addEventListener("click", () => openDrawer(tr.dataset.id)));
  }

  // ── 아카이브 ──
  async function setArchived(ids, on) {
    const { error } = await sb.from("leads")
      .update({ archived_at: on ? new Date().toISOString() : null }).in("id", ids);
    if (error) { toast("실패: " + error.message); return false; }
    await sb.from("activities").insert(ids.map((id) => ({
      lead_id: id, action: on ? "아카이브" : "복원", detail: null, actor: me() })));
    toast(`${ids.length}건 ${on ? "아카이브했어요 — 히스토리 탭에서 볼 수 있어요" : "복원했어요"}`);
    loadLeads();
    return true;
  }

  function renderHist() {
    const q = $("#hist-search").value.trim().toLowerCase();
    const ownerF = $("#hist-owner-filter").value;
    const rows = state.archivedLeads
      .filter((l) => (!ownerF || l.owner === ownerF) && (!q || l.name.toLowerCase().includes(q)))
      .sort((a, b) => String(b.archived_at).localeCompare(String(a.archived_at)));
    $("#hist-count").textContent = `${rows.length}건`;
    $("#hist-table tbody").innerHTML = rows.map((l) => `
      <tr data-id="${l.id}">
        <td class="td-name">${esc(l.name)}</td>
        <td><span class="type-badge type-${l.type}">${TYPE_LABEL[l.type]}</span></td>
        <td>${catChip(l.category)}</td>
        <td><span class="stage-chip stage-${l.stage}">${l.stage}</span></td>
        <td>${ownerBadge(l.owner)}</td>
        <td class="muted" title="${fmtDateTime(l.archived_at)}">${fmtRel(l.archived_at)}</td>
        <td><button class="hist-restore" data-restore="${l.id}">↩️ 복원</button></td>
      </tr>`).join("") ||
      `<tr><td colspan="7" class="muted" style="text-align:center;padding:36px">아카이브된 항목이 없어요. 완료된 건은 카드 상세 하단의 "📦 아카이브"로 정리할 수 있어요.</td></tr>`;

    $$("#hist-table tbody tr[data-id]").forEach((tr) =>
      tr.addEventListener("click", () => openDrawer(tr.dataset.id)));
    $$("#hist-table .hist-restore").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        setArchived([btn.dataset.restore], false);
      }));
  }

  // ── 캘린더 ──
  const CAL_EXCLUDED = ["발굴", "보류", "제외"];
  const CAL_FIELDS = [
    { key: "contact_date", icon: "📞", label: "컨택일" },
    { key: "approved_at", icon: "✅", label: "승인일" },
    { key: "next_action_due", icon: "📌", label: "액션 기한" },
  ];

  const CAL_MAX_ITEMS = 3; // 셀당 표시 개수 (초과분은 '더 보기')
  const dateKeyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  function calEvents() {
    const events = {}; // "YYYY-MM-DD" -> [{lead, icon, label}]
    state.leads.filter((l) => !CAL_EXCLUDED.includes(l.stage)).forEach((l) => {
      CAL_FIELDS.forEach((f) => {
        const d = l[f.key];
        if (!d) return;
        (events[d] = events[d] || []).push({ lead: l, icon: f.icon, label: f.label });
      });
    });
    return events;
  }

  async function renderCal() {
    const base = state.calMonth || new Date();
    const year = base.getFullYear(), month = base.getMonth();
    $("#cal-title").textContent = `${year}년 ${month + 1}월`;

    // 담당자 범례
    $("#cal-legend").innerHTML = OWNERS.map((o) =>
      `<span class="cal-owner"><span class="cal-dot" style="background:${ownerColor(o)}"></span>${esc(o)}</span>`).join("");

    const events = calEvents();

    // 월간 그리드 (일요일 시작)
    const first = new Date(year, month, 1);
    const gridStart = new Date(first);
    gridStart.setDate(1 - first.getDay());
    const gridEnd = new Date(gridStart);
    gridEnd.setDate(gridStart.getDate() + 41);

    // 이 그리드 범위의 메모 로드
    const { data: notes } = await sb.from("calendar_notes").select("*")
      .gte("note_date", dateKeyOf(gridStart)).lte("note_date", dateKeyOf(gridEnd))
      .order("created_at");
    state.calNotes = {};
    (notes || []).forEach((n) => { (state.calNotes[n.note_date] = state.calNotes[n.note_date] || []).push(n); });

    const today = todayStr();
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const key = dateKeyOf(d);
      const evs = events[key] || [];
      const dayNotes = state.calNotes[key] || [];
      const other = d.getMonth() !== month;

      const items = [
        ...dayNotes.map((n) => `
          <div class="cal-ev cal-memo" data-date="${key}" title="📝 ${esc(n.text)} (${esc(n.author || "")})">📝 ${esc(n.text)}</div>`),
        ...evs.map((ev) => `
          <div class="cal-ev" data-id="${ev.lead.id}" style="--oc:${ownerColor(ev.lead.owner)}"
               title="${esc(ev.lead.name)} · ${ev.label} · ${esc(ev.lead.owner || "담당자 미지정")}">
            ${ev.icon} ${esc(ev.lead.name)}
          </div>`),
      ];
      const shown = items.slice(0, CAL_MAX_ITEMS);
      const hidden = items.length - shown.length;

      cells.push(`
        <div class="cal-cell ${other ? "cal-other" : ""} ${key === today ? "cal-today" : ""}" data-date="${key}">
          <div class="cal-date ${d.getDay() === 0 ? "sun" : d.getDay() === 6 ? "sat" : ""}">${d.getDate()}</div>
          ${shown.join("")}
          ${hidden > 0 ? `<div class="cal-more" data-date="${key}">+${hidden} 더 보기</div>` : ""}
        </div>`);
    }
    $("#calendar").innerHTML =
      `<div class="cal-grid cal-weekdays">${["일", "월", "화", "수", "목", "금", "토"].map((d, i) =>
        `<div class="cal-wd ${i === 0 ? "sun" : i === 6 ? "sat" : ""}">${d}</div>`).join("")}</div>` +
      `<div class="cal-grid">${cells.join("")}</div>`;

    $$("#calendar .cal-ev[data-id]").forEach((el) =>
      el.addEventListener("click", (e) => { e.stopPropagation(); openDrawer(el.dataset.id); }));
    $$("#calendar .cal-ev.cal-memo, #calendar .cal-more").forEach((el) =>
      el.addEventListener("click", (e) => { e.stopPropagation(); openDayPop(el.dataset.date); }));
    $$("#calendar .cal-cell").forEach((el) =>
      el.addEventListener("click", () => openDayPop(el.dataset.date)));
  }

  // ── 날짜 팝오버 (전체 목록 + 메모) ──
  let dayPopDate = null;
  function openDayPop(dateKey) {
    dayPopDate = dateKey;
    const [y, m, d] = dateKey.split("-").map(Number);
    const wd = ["일", "월", "화", "수", "목", "금", "토"][new Date(y, m - 1, d).getDay()];
    $("#daypop-title").textContent = `${m}월 ${d}일 (${wd})`;

    const evs = (calEvents()[dateKey] || []);
    $("#daypop-events").innerHTML = evs.map((ev) => `
      <div class="fu-item" data-id="${ev.lead.id}">
        <span class="cal-dot" style="background:${ownerColor(ev.lead.owner)}"></span>
        <span class="fu-name">${ev.icon} ${esc(ev.lead.name)} <span class="muted">— ${ev.label} · ${esc(ev.lead.owner || "")}</span></span>
        <span class="stage-chip stage-${ev.lead.stage}">${ev.lead.stage}</span>
      </div>`).join("") || `<span class="muted">이 날짜의 일정이 없어요.</span>`;
    $$("#daypop-events .fu-item").forEach((el) =>
      el.addEventListener("click", () => { closeDayPop(); openDrawer(el.dataset.id); }));

    renderDayPopNotes();
    $("#daypop-backdrop").classList.remove("hidden");
    lockScroll(true);
    $("#daypop-input").focus();
  }

  function renderDayPopNotes() {
    const notes = state.calNotes?.[dayPopDate] || [];
    $("#daypop-notes").innerHTML = notes.map((n) => `
      <div class="fu-item daypop-note">
        <span class="fu-name">${esc(n.text)}</span>
        <span class="muted">${esc(n.author || "")}</span>
        <button class="note-del" data-note="${n.id}" title="삭제">✕</button>
      </div>`).join("") || `<span class="muted">메모 없음</span>`;
    $$("#daypop-notes .note-del").forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const { error } = await sb.from("calendar_notes").delete().eq("id", btn.dataset.note);
        if (error) { toast("삭제 실패: " + error.message); return; }
        await renderCal();
        renderDayPopNotes();
      }));
  }

  function closeDayPop() {
    $("#daypop-backdrop").classList.add("hidden");
    lockScroll(false);
    dayPopDate = null;
  }

  // ── 일괄 등록 ──
  const BR_TYPE = { "딜러": "dealer", "인플루언서": "influencer", "dealer": "dealer", "influencer": "influencer" };

  function brStageOptions(type, selected) {
    return [...stagesFor(type), ...CLOSED_STAGES].map((st) =>
      `<option ${st === selected ? "selected" : ""}>${st}</option>`).join("");
  }

  function brRowHtml() {
    return `
      <tr>
        <td><input class="br-name" placeholder="이름"></td>
        <td><select class="br-type"><option value="dealer">딜러</option><option value="influencer">인플루언서</option></select></td>
        <td><select class="br-stage">${brStageOptions("dealer", "발굴")}</select></td>
        <td><select class="br-cat"><option value=""></option>${(CFG.CATEGORIES || []).map((c) => `<option>${esc(c)}</option>`).join("")}</select></td>
        <td><input class="br-channel" list="channel-options"></td>
        <td><select class="br-owner"><option value=""></option>${OWNERS.map((o) => `<option ${o === me() ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></td>
        <td><input class="br-link" placeholder="https://…"></td>
        <td><select class="br-followers">${followerOptions("")}</select></td>
        <td><input class="br-notes"></td>
        <td><button type="button" class="br-del note-del" title="행 삭제">✕</button></td>
      </tr>`;
  }

  function brAddRows(n = 1) {
    const tb = $("#bulkreg-table tbody");
    for (let i = 0; i < n; i++) tb.insertAdjacentHTML("beforeend", brRowHtml());
  }

  function brUpdateCount() {
    const n = [...$$("#bulkreg-table .br-name")].filter((i) => i.value.trim()).length;
    $("#bulkreg-count").textContent = n ? `${n}명 등록 대기` : "";
  }

  function openBulkReg() {
    $("#bulkreg-table tbody").innerHTML = "";
    brAddRows(5);
    brUpdateCount();
    $("#bulkreg-backdrop").classList.remove("hidden");
    lockScroll(true);
    $("#bulkreg-table .br-name").focus();
  }
  function closeBulkReg() { $("#bulkreg-backdrop").classList.add("hidden"); lockScroll(false); }

  // 한 행 채우기 (cols = [이름, 유형, 단계, 카테고리, 채널, 담당자, 링크, 팔로워, 비고])
  function brSetRow(tr, cols) {
    const val = (i) => (cols[i] === undefined || cols[i] === null) ? "" : String(cols[i]).trim();
    const set = (sel, v) => { const el = tr.querySelector(sel); if (el && v !== "") el.value = v; };
    set(".br-name", val(0));
    if (val(1)) {
      const t = BR_TYPE[val(1)] || "dealer";
      tr.querySelector(".br-type").value = t;
      tr.querySelector(".br-stage").innerHTML = brStageOptions(t, "발굴");
    }
    if (val(2)) {
      const type = tr.querySelector(".br-type").value;
      if ([...stagesFor(type), ...CLOSED_STAGES].includes(val(2))) tr.querySelector(".br-stage").value = val(2);
    }
    if (val(3) && (CFG.CATEGORIES || []).includes(val(3))) tr.querySelector(".br-cat").value = val(3);
    set(".br-channel", val(4));
    if (val(5) && OWNERS.includes(val(5))) tr.querySelector(".br-owner").value = val(5);
    set(".br-link", val(6));
    if (val(7)) {
      const fv = followerFloor(parseWon(val(7)));
      if (fv) tr.querySelector(".br-followers").value = fv;
    }
    set(".br-notes", val(8));
  }

  // 여러 행 채우기 — 헤더 행이 있으면 열 이름으로 매핑, 없으면 위치 순서
  const BR_HEADER_ALIASES = [
    ["이름", "셀러명", "채널명", "인플루언서", "name"],
    ["유형", "type", "구분"],
    ["단계", "상태", "stage", "status"],
    ["카테고리", "category"],
    ["채널", "발굴채널", "발굴 채널", "channel", "플랫폼"],
    ["담당자", "owner", "담당"],
    ["링크", "link", "url", "주소"],
    ["팔로워", "팔로워수", "팔로워 수", "followers", "관심고객"],
    ["비고", "메모", "notes", "특이사항"],
  ];

  // 그리드에 없는 확장 컬럼 — 파일 헤더에 있으면 행에 담아뒀다가 등록 시 함께 저장
  function normDateStr(v) {
    const s = String(v || "").trim();
    let m = s.match(/^(\d{4})[.\-\/]\s?(\d{1,2})[.\-\/]\s?(\d{1,2})/);
    if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    m = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})$/); // 엑셀 m/d/yy
    if (m) { const y = m[3].length === 2 ? "20" + m[3] : m[3]; return `${y}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`; }
    m = s.match(/^(\d{1,2})[.\/](\d{1,2})$/); // 월/일 → 올해
    if (m) return `${new Date().getFullYear()}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
    return null;
  }
  const BR_EXTRA_FIELDS = [
    { key: "channel_type", aliases: ["온오프라인", "온·오프라인", "온/오프라인", "channel_type"],
      parse: (v) => ["온라인", "오프라인"].includes(v) ? v : null },
    { key: "business", aliases: ["사업자", "사업자여부", "사업자 여부", "business"],
      parse: (v) => ["사업자", "개인"].includes(v) ? v : null },
    { key: "region", aliases: ["지역", "region"], parse: (v) => v },
    { key: "main_products", aliases: ["주요상품", "주요 상품", "상품", "main_products"], parse: (v) => v },
    { key: "contact_point", aliases: ["컨택포인트", "컨택 포인트", "연락처", "contact_point"], parse: (v) => v },
    { key: "contact_date", aliases: ["컨택일", "컨택 일자", "contact_date"], parse: normDateStr },
    { key: "nickname", aliases: ["닉네임", "와이스닉네임", "와이스 닉네임", "nickname"], parse: (v) => v },
    { key: "approved_at", aliases: ["승인일", "approved_at"], parse: normDateStr },
    { key: "collab_type", aliases: ["협업유형", "협업 유형", "collab_type"], parse: (v) => v },
    { key: "planned_rate", aliases: ["계획단가", "계획 단가", "planned_rate"], parse: (v) => parseWon(v) },
    { key: "actual_rate", aliases: ["실제단가", "실제 단가", "actual_rate"], parse: (v) => parseWon(v) },
  ];

  function brFillRows(rows, startTr = null) {
    if (!rows.length) return 0;
    const normH = (x) => String(x || "").replace(/[\s*()]/g, "").toLowerCase();
    // 헤더 감지: 첫 행에 '이름' 계열 별칭이 있으면 헤더로 취급
    const first = rows[0].map(normH);
    const isHeader = BR_HEADER_ALIASES[0].some((a) => first.includes(normH(a)));
    let colMap = null; // 표준 열 인덱스 → 원본 열 인덱스
    let extraMap = []; // [{field, idx}]
    let dataRows = rows;
    if (isHeader) {
      colMap = BR_HEADER_ALIASES.map((aliases) =>
        first.findIndex((hcell) => aliases.some((a) => normH(a) === hcell)));
      extraMap = BR_EXTRA_FIELDS
        .map((f) => ({ f, idx: first.findIndex((hcell) => f.aliases.some((a) => normH(a) === hcell)) }))
        .filter((x) => x.idx >= 0);
      dataRows = rows.slice(1);
    }
    const tb = $("#bulkreg-table tbody");
    let tr = startTr;
    let filled = 0;
    dataRows.forEach((row) => {
      const cols = colMap ? colMap.map((i) => (i >= 0 ? row[i] : "")) : row;
      if (!String(cols[0] || "").trim()) return; // 이름 없는 행 무시
      if (!tr) { brAddRows(1); tr = tb.lastElementChild; }
      brSetRow(tr, cols);
      const extra = {};
      extraMap.forEach(({ f, idx }) => {
        const raw = String(row[idx] ?? "").trim();
        if (!raw) return;
        const v = f.parse(raw);
        if (v !== null && v !== undefined && v !== "") extra[f.key] = v;
      });
      tr.dataset.brExtra = JSON.stringify(extra); // 덮어써서 이전 값 제거
      filled++;
      tr = tr.nextElementSibling;
    });
    brUpdateCount();
    return filled;
  }

  // TSV 붙여넣기 → 행 자동 채우기
  function brPaste(e) {
    const text = (e.clipboardData || window.clipboardData).getData("text");
    if (!/[\t\n]/.test(text)) return; // 단일 값이면 기본 동작
    e.preventDefault();
    const rows = text.split(/\r?\n/).filter((ln) => ln.trim()).map((ln) => ln.split("\t"));
    brFillRows(rows, e.target.closest("tr"));
  }

  // ── 파일 업로드 (CSV/TSV/XLSX) ──
  function parseCsvText(text) {
    // 구분자 감지 (첫 줄 기준)
    const firstLine = text.slice(0, text.indexOf("\n") + 1 || text.length);
    const delim = (firstLine.match(/\t/g) || []).length >= (firstLine.match(/,/g) || []).length ? "\t" : ",";
    const rows = [];
    let row = [], cell = "", inQ = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQ) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; }
          else inQ = false;
        } else cell += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === delim) { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); cell = "";
        if (row.some((c2) => c2.trim())) rows.push(row);
        row = [];
      } else cell += ch;
    }
    row.push(cell);
    if (row.some((c2) => c2.trim())) rows.push(row);
    return rows;
  }

  function decodeKorean(buf) {
    // UTF-8 우선, 깨짐(�) 많으면 EUC-KR 재시도 (엑셀 CSV 대응)
    const utf8 = new TextDecoder("utf-8").decode(buf);
    const bad = (utf8.match(/\uFFFD/g) || []).length;
    if (bad === 0) return utf8;
    try {
      return new TextDecoder("euc-kr").decode(buf);
    } catch { return utf8; }
  }

  let sheetJsLoading = null;
  function loadSheetJs() {
    if (window.XLSX) return Promise.resolve();
    if (!sheetJsLoading) {
      sheetJsLoading = new Promise((resolve, reject) => {
        const sc = document.createElement("script");
        sc.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
        sc.onload = resolve;
        sc.onerror = () => reject(new Error("엑셀 파서 로드 실패"));
        document.head.appendChild(sc);
      });
    }
    return sheetJsLoading;
  }

  async function brHandleFile(file) {
    try {
      const buf = await file.arrayBuffer();
      let rows;
      if (/\.xlsx?$/i.test(file.name)) {
        await loadSheetJs();
        const wb = window.XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
      } else {
        rows = parseCsvText(decodeKorean(buf));
      }
      // 첫 번째 빈 행부터 채우기
      const firstEmpty = [...$("#bulkreg-table tbody").children]
        .find((tr) => !tr.querySelector(".br-name").value.trim()) || null;
      const n = brFillRows(rows, firstEmpty);
      toast(n ? `${n}행을 불러왔어요 — 내용 확인 후 등록해주세요` : "불러올 행이 없어요 (이름 열 확인)");
    } catch (err) {
      toast("파일 읽기 실패: " + err.message);
    }
  }

  // 파일에서 온 확장 컬럼(dataset.brExtra) → insert 필드로 변환
  function brRowExtra(tr) {
    let e;
    try { e = JSON.parse(tr.dataset.brExtra || "{}"); } catch { return {}; }
    const out = {};
    for (const k of ["channel_type", "business", "region", "main_products", "contact_point", "contact_date", "nickname", "approved_at"])
      if (e[k] != null) out[k] = e[k];
    if (tr.querySelector(".br-type").value === "influencer") {
      const extra = {};
      for (const k of ["collab_type", "planned_rate", "actual_rate"]) if (e[k] != null) extra[k] = e[k];
      if (Object.keys(extra).length) out.extra = extra;
    }
    return out;
  }

  async function saveBulkReg() {
    const rows = [...$("#bulkreg-table tbody").children]
      .map((tr) => ({
        name: tr.querySelector(".br-name").value.trim(),
        type: tr.querySelector(".br-type").value,
        stage: tr.querySelector(".br-stage").value,
        category: tr.querySelector(".br-cat").value || null,
        channel: tr.querySelector(".br-channel").value.trim() || null,
        owner: tr.querySelector(".br-owner").value || null,
        link: tr.querySelector(".br-link").value.trim() || null,
        followers: tr.querySelector(".br-followers").value ? Number(tr.querySelector(".br-followers").value) : null,
        notes: tr.querySelector(".br-notes").value.trim() || null,
        channel_type: "온라인",
        ...brRowExtra(tr),
      }))
      .filter((r) => r.name);
    if (!rows.length) { toast("등록할 행이 없어요 — 이름을 입력해주세요"); return; }

    // 중복 검사 (기존 + 배치 내)
    const norm2 = (x) => String(x || "").replace(/\s+/g, "").toLowerCase();
    const existing = new Set(allLeads().map((l) => norm2(l.name)));
    const seen = new Set();
    const dups = [];
    rows.forEach((r) => {
      const k = norm2(r.name);
      if (existing.has(k) || seen.has(k)) dups.push(r.name);
      seen.add(k);
    });
    if (dups.length) {
      alert(`⚠️ 이미 등록됐거나 배치 안에서 중복된 이름이 있어요:\n${dups.join(", ")}\n\n해당 행을 정리한 뒤 다시 등록해주세요.`);
      return;
    }

    const { data, error } = await sb.from("leads").insert(rows).select("id, stage");
    if (error) { toast("등록 실패: " + error.message); return; }
    await sb.from("activities").insert((data || []).map((r) => ({
      lead_id: r.id, action: "신규 등록", detail: `${r.stage} 단계로 등록 (일괄)`, actor: me() })));
    toast(`${rows.length}명을 등록했어요`);
    closeBulkReg();
    loadLeads();
  }

  // ── 내 페이지 ──
  function renderMy() {
    const name = me();
    $("#my-title").textContent = name;
    $("#my-avatar").innerHTML = avatarHtml(name);
    // 메모 (입력 중에는 덮어쓰지 않음)
    const memoEl = $("#my-memo");
    if (document.activeElement !== memoEl) memoEl.value = state.profiles[name]?.memo || "";
    const mine = state.leads.filter((l) => l.owner === name);
    const active = mine.filter((l) => !CLOSED_STAGES.includes(l.stage));
    const today = todayStr();
    const withNa = active.filter((l) => l.next_action);
    const overdue = withNa.filter((l) => l.next_action_due && l.next_action_due < today);
    const followup = active
      .filter((l) => Date.now() - new Date(l.updated_at).getTime() > 7 * 864e5)
      .sort((a, b) => a.updated_at.localeCompare(b.updated_at));

    const kpis = [
      { label: "내 담당", value: mine.length, sub: `활성 ${active.length}건` },
      { label: "진행중", value: mine.filter((l) => IN_PROGRESS.includes(l.stage)).length, sub: "컨택~실행 단계" },
      { label: "다음 액션", value: withNa.length, sub: overdue.length ? `기한 지남 ${overdue.length}건 ⚠️` : "기한 지남 없음" },
      { label: "팔로업 필요", value: followup.length, sub: "7일+ 업데이트 없음" },
      { label: "성사", value: mine.filter((l) => DONE_STAGES.includes(l.stage)).length, sub: "판매·완료 누적" },
    ];
    $("#my-kpi").innerHTML = kpis.map((k) => `
      <div class="kpi">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-sub">${k.sub}</div>
      </div>`).join("");

    // 내 다음 액션 (기한 지남 → 오늘 → 예정)
    const naSorted = [
      ...withNa.filter((l) => l.next_action_due && l.next_action_due < today).sort((a, b) => a.next_action_due.localeCompare(b.next_action_due)),
      ...withNa.filter((l) => l.next_action_due === today),
      ...withNa.filter((l) => !l.next_action_due || l.next_action_due > today)
        .sort((a, b) => String(a.next_action_due || "9999").localeCompare(String(b.next_action_due || "9999"))),
    ];
    $("#my-actions").innerHTML = naSorted.slice(0, 10).map((l) => {
      const due = l.next_action_due;
      const over = due && due < today;
      const isToday = due === today;
      return `
        <div class="fu-item" data-id="${l.id}">
          <span class="fu-name">${esc(l.name)} <span class="muted">— ${esc(l.next_action)}</span></span>
          ${due ? `<span class="na-due ${over ? "overdue" : isToday ? "due-today" : ""}">${over ? "기한 지남" : isToday ? "오늘" : fmtDate(due)}</span>` : ""}
        </div>`;
    }).join("") || `<span class="muted">등록된 다음 액션이 없어요.</span>`;

    // 내 팔로업
    $("#my-followup").innerHTML = followup.slice(0, 10).map((l) => {
      const days = Math.floor((Date.now() - new Date(l.updated_at).getTime()) / 864e5);
      return `
        <div class="fu-item" data-id="${l.id}">
          <span class="fu-name">${esc(l.name)}</span>
          <span class="stage-chip stage-${l.stage}">${l.stage}</span>
          <span class="fu-days">${days}일 전</span>
        </div>`;
    }).join("") || `<span class="muted">7일 이상 방치된 건이 없어요 👍</span>`;

    $$("#my-actions .fu-item, #my-followup .fu-item").forEach((el) =>
      el.addEventListener("click", () => openDrawer(el.dataset.id)));

    // 협업/광고 투입 금액 (내 담당 인플루언서)
    const myInfIds = new Set(mine.filter((l) => l.type === "influencer").map((l) => l.id));
    const leadById2 = Object.fromEntries(state.leads.map((l) => [l.id, l]));
    const myDelivs = (state.deliverables || []).filter((d) => myInfIds.has(d.lead_id));
    const cost2 = (d) => leadRate(leadById2[d.lead_id]) || 0;
    const spendTotal = myDelivs.reduce((s2, d) => s2 + cost2(d), 0);
    const curMonth = today.slice(0, 7);
    const spendMonth = myDelivs.filter((d) => (d.posted_at || d.created_at || "").slice(0, 7) === curMonth)
      .reduce((s2, d) => s2 + cost2(d), 0);
    const byM = {};
    myDelivs.forEach((d) => {
      const k2 = (d.posted_at || d.created_at || "").slice(0, 7);
      if (k2) byM[k2] = (byM[k2] || 0) + cost2(d);
    });
    const mRows = Object.entries(byM).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 4);
    $("#my-spend").innerHTML = `
      <div class="spend-top">
        <div><div class="kpi-label">전체</div><div class="spend-val">${fmtNum(spendTotal)}원</div></div>
        <div><div class="kpi-label">이번 달</div><div class="spend-val">${fmtNum(spendMonth)}원</div></div>
        <div><div class="kpi-label">결과물</div><div class="spend-val">${myDelivs.length}건</div></div>
      </div>
      ${mRows.length ? `<table class="cmp-table spend-table"><tbody>${mRows.map(([k2, c]) =>
        `<tr><td>${k2.slice(0, 4)}.${k2.slice(5)}</td><td style="text-align:right">${fmtNum(c)}원</td></tr>`).join("")}</tbody></table>` : ""}
      <p class="muted cmp-note">내 담당 인플루언서 결과물 × 단가 (실제 우선, 없으면 계획)</p>`;

    // 내 보드 (활성 단계만, 유형 합집합)
    renderBoardInto("#my-board", active, ALL_STAGES);
  }

  function renderBoard() {
    const typeF = fVal("#board-type-filter");
    const ownerF = $("#board-owner-filter").value;
    const catF = fVal("#board-category-filter");
    const showClosed = $("#board-show-closed").classList.contains("active");
    const q = $("#board-search").value.trim().toLowerCase();
    const flow = stagesFor(fVal("#board-type-filter"));
    const cols = showClosed ? [...flow, ...CLOSED_STAGES] : flow;
    const leads = state.leads.filter((l) =>
      (!typeF || l.type === typeF) && (!ownerF || l.owner === ownerF) && (!catF || l.category === catF) &&
      (!q || [l.name, l.main_products, l.notes, l.region, l.nickname, l.next_action].join(" ").toLowerCase().includes(q)));
    renderBoardInto("#board", leads, cols);
  }

  // 칸반 렌더 공용 (보드 탭 / 내 페이지)
  function renderBoardInto(containerSel, leads, cols) {
    const root = $(containerSel);
    const selectable = containerSel === "#board" && state.selectMode;
    root.innerHTML = cols.map((stage) => {
      const cards = leads.filter((l) => l.stage === stage)
        .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
      return `
        <div class="board-col" data-stage="${stage}">
          <div class="board-col-head">
            <span><span class="stage-chip stage-${stage}">${stage}</span></span>
            <span class="col-head-right">
              <span class="cnt">${cards.length}</span>
              <button type="button" class="col-add" data-add-stage="${stage}" title="이 단계로 바로 등록">+</button>
            </span>
          </div>
          <div class="board-cards">
            ${cards.length === 0 ? `<div class="col-empty">비어 있음</div>` : ""}
            ${cards.map((l) => `
              <div class="lead-card ${selectable && state.selected.has(l.id) ? "card-selected" : ""}" draggable="${selectable ? "false" : "true"}" data-id="${l.id}">
                <div class="lc-top">
                  ${selectable ? `<input type="checkbox" class="card-check" ${state.selected.has(l.id) ? "checked" : ""}>` : ""}
                  ${starBtn(l)}
                  <span class="type-badge type-${l.type}">${TYPE_LABEL[l.type]}</span>
                  <span class="lc-owner">${ownerBadge(l.owner)}</span>
                </div>
                <div class="lc-title">${esc(l.name)}</div>
                <div class="lc-meta">
                  ${l.channel ? `<span class="lc-chip">${chIcon(l.channel)}</span>` : ""}
                  ${ctChip(l.channel_type)}
                  ${catChip(l.category)}
                  ${l.followers ? `<span class="lc-chip">👥 ${followerLabel(l.followers)}</span>` : ""}
                </div>
                ${(() => {
                  const dls = (state.deliverables || []).filter((d) => d.lead_id === l.id);
                  if (!dls.length) return "";
                  return `<div class="lc-deliv">${dls.slice(0, 4).map((d) => {
                    const p = delivPlatform(d.url);
                    const ic = p === "youtube" ? chIcon("유튜브") : p === "instagram" ? chIcon("인스타그램") : p === "x" ? chIcon("트위터/X") : "🔗";
                    return `<a href="${esc(d.url)}" target="_blank" rel="noopener" class="lc-deliv-link" title="${esc(d.title || d.url)}" onclick="event.stopPropagation()">${ic}</a>`;
                  }).join("")}${dls.length > 4 ? `<span class="muted">+${dls.length - 4}</span>` : ""}</div>`;
                })()}
                ${l.extra?.metrics ? `<div class="lc-metrics">🎥 ${l.extra.metrics.live_count}회${l.extra.metrics.last_live_at ? ` · ${fmtDate(l.extra.metrics.last_live_at).slice(5)}` : ""} · 💰 ${fmtNum(l.extra.metrics.acc_sold_amount)}원</div>` : ""}
                ${naLine(l)}
                ${l.notes ? `<div class="lc-notes">${esc(l.notes)}</div>` : ""}
              </div>`).join("")}
          </div>
        </div>`;
    }).join("");

    // 단계별 바로 등록 (+)
    root.querySelectorAll(".col-add").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const stage = btn.dataset.addStage;
        let type = containerSel === "#board" ? fVal("#board-type-filter") : "";
        if (!type) {
          const inD = STAGE_FLOW.dealer.includes(stage);
          const inI = STAGE_FLOW.influencer.includes(stage);
          type = inD && !inI ? "dealer" : inI && !inD ? "influencer" : "";
        }
        openModal(null, { stage, type });
      }));

    // 드래그 & 드롭 / 선택 모드
    root.querySelectorAll(".lead-card").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", card.dataset.id);
        requestAnimationFrame(() => card.classList.add("dragging"));
      });
      card.addEventListener("dragend", () => card.classList.remove("dragging"));
      card.addEventListener("click", () => {
        if (selectable) {
          if (marqueeSuppressClick) return;
          toggleSelect(card.dataset.id);
          return;
        }
        openDrawer(card.dataset.id);
      });
    });
    root.querySelectorAll(".board-col").forEach((col) => {
      col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("drag-over"); });
      col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
      col.addEventListener("drop", async (e) => {
        e.preventDefault();
        col.classList.remove("drag-over");
        const id = e.dataTransfer.getData("text/plain");
        const stage = col.dataset.stage;
        const lead = state.leads.find((l) => l.id === id);
        if (!lead || lead.stage === stage) return;
        const prev = lead.stage;
        const patch = { stage, stage_changed_at: new Date().toISOString() };
        if (CLOSED_STAGES.includes(stage)) {
          const reason = window.prompt(`'${stage}' 사유를 입력해주세요 (선택):`, lead.closed_reason || "");
          if (reason !== null && reason.trim()) patch.closed_reason = reason.trim();
        }
        lead.stage = stage;
        renderAll();
        const { error } = await sb.from("leads").update(patch).eq("id", id);
        if (error) { lead.stage = prev; renderAll(); toast("변경 실패: " + error.message); return; }
        Object.assign(lead, patch);
        logActivity(id, "단계 변경", `${prev} → ${stage}${patch.closed_reason ? ` (${patch.closed_reason})` : ""}`);
        toast(`${lead.name}: ${prev} → ${stage}`);
      });
    });
  }

  // ── 테이블 ──
  function renderTable() {
    const q = $("#table-search").value.trim().toLowerCase();
    const typeF = fVal("#table-type-filter");
    const stageF = $("#table-stage-filter").value;
    const chF = $("#table-channel-filter").value;
    const catF = fVal("#table-category-filter");
    const ownerF = $("#table-owner-filter").value;

    // 채널 필터 옵션 동기화 (현재 데이터 기준)
    const chSel = $("#table-channel-filter");
    const channels = [...new Set(state.leads.map((l) => l.channel).filter(Boolean))];
    const existing = [...chSel.options].map((o) => o.value);
    channels.forEach((c) => { if (!existing.includes(c)) chSel.insertAdjacentHTML("beforeend", `<option>${esc(c)}</option>`); });

    let rows = state.leads.filter((l) =>
      (!typeF || l.type === typeF) &&
      (!stageF || l.stage === stageF) &&
      (!chF || l.channel === chF) &&
      (!catF || l.category === catF) &&
      (!ownerF || l.owner === ownerF) &&
      (!q || [l.name, l.main_products, l.notes, l.region, l.nickname].join(" ").toLowerCase().includes(q))
    );

    const { sortKey, sortDir } = state;
    rows.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "starred") { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      if (sortKey === "stage") {
        const order = [...ALL_STAGES, ...CLOSED_STAGES];
        va = order.indexOf(va); vb = order.indexOf(vb);
      }
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

    $$("#leads-table th").forEach((th) => {
      th.classList.toggle("sorted-asc", th.dataset.sort === sortKey && sortDir === "asc");
      th.classList.toggle("sorted-desc", th.dataset.sort === sortKey && sortDir === "desc");
    });

    $("#table-count").textContent = `${rows.length}건`;
    $("#leads-table tbody").innerHTML = rows.map((l) => `
      <tr data-id="${l.id}">
        <td class="td-star">${starBtn(l)}</td>
        <td class="td-name">${esc(l.name)}</td>
        <td><span class="type-badge type-${l.type}">${TYPE_LABEL[l.type]}</span></td>
        <td>${catChip(l.category)}</td>
        <td><span class="stage-chip stage-${l.stage}">${l.stage}</span></td>
        <td class="td-ch">${l.channel ? chIcon(l.channel) : ""} ${ctChip(l.channel_type)}</td>
        <td>${followerLabel(l.followers)}</td>
        <td>${esc(l.region || "")}</td>
        <td>${esc(l.main_products || "")}</td>
        <td class="td-notes" title="${esc(l.notes || "")}">${esc(l.notes || "")}</td>
        <td class="td-na">${naLine(l)}</td>
        <td>${fmtDate(l.contact_date)}</td>
        <td>${ownerBadge(l.owner)}</td>
        <td class="muted">${fmtDate(l.updated_at)}</td>
      </tr>`).join("");

    $$("#leads-table tbody tr").forEach((tr) =>
      tr.addEventListener("click", () => openDrawer(tr.dataset.id)));
  }

  // ── 등록/수정 모달 ──
  function openModal(id, preset = null) {
    state.editingId = id;
    const form = $("#lead-form");
    form.reset();
    $("#modal-title").textContent = id ? "수정" : "신규 등록";
    $("#modal-delete").classList.toggle("hidden", !id);
    if (id) {
      const l = state.leads.find((x) => x.id === id);
      if (!l) return;
      form.elements["type"].value = l.type;
      toggleTypeFields(); // 유형에 맞는 단계 옵션 구성 후 값 주입
      for (const key of ["stage", "category", "name", "link", "channel", "channel_type", "business", "region",
        "main_products", "contact_point", "contact_date", "next_action", "next_action_due",
        "nickname", "approved_at", "notes", "owner"]) {
        if (form.elements[key]) form.elements[key].value = l[key] ?? "";
      }
      form.elements["followers"].innerHTML = followerOptions(followerFloor(l.followers));
      form.elements["extra_collab_type"].value = l.extra?.collab_type ?? "";
    } else {
      form.elements["followers"].innerHTML = followerOptions("");
      form.elements["owner"].value = me();
      if (preset && preset.type) form.elements["type"].value = preset.type;
      toggleTypeFields();
      if (preset && preset.stage) form.elements["stage"].value = preset.stage;
    }
    $("#modal-backdrop").classList.remove("hidden");
    lockScroll(true);
    form.elements["name"].focus();
  }

  function closeModal() {
    $("#modal-backdrop").classList.add("hidden");
    lockScroll(false);
    state.editingId = null;
  }

  function findDupName(name, exceptId) {
    const norm = (x) => String(x || "").replace(/\s+/g, "").toLowerCase();
    return state.leads.find((x) => x.id !== exceptId && norm(x.name) === norm(name));
  }

  async function saveLead(e) {
    e.preventDefault();
    const f = $("#lead-form").elements;
    // 이름 중복 차단 (담당자 무관)
    const dupName = findDupName(f["name"].value, state.editingId);
    if (dupName) {
      alert(`⚠️ 이미 등록된 이름이에요.\n"${dupName.name}" — ${dupName.owner || "담당자 미지정"} 담당 · ${TYPE_LABEL[dupName.type]} · ${dupName.stage}\n\n중복 등록 방지를 위해 저장하지 않았어요.`);
      return;
    }
    const payload = {
      type: f["type"].value,
      stage: f["stage"].value,
      category: f["category"].value || null,
      name: f["name"].value.trim(),
      link: f["link"].value.trim() || null,
      channel: f["channel"].value.trim() || null,
      channel_type: f["channel_type"].value,
      followers: f["followers"].value ? Number(f["followers"].value) : null,
      business: f["business"].value || null,
      region: f["region"].value.trim() || null,
      next_action: f["next_action"].value.trim() || null,
      next_action_due: f["next_action_due"].value || null,
      main_products: f["main_products"].value.trim() || null,
      contact_point: f["contact_point"].value.trim() || null,
      contact_date: f["contact_date"].value || null,
      nickname: f["nickname"].value.trim() || null,
      approved_at: f["approved_at"].value || null,
      owner: f["owner"].value || null,
      notes: f["notes"].value.trim() || null,
      extra: {
        ...(state.editingId ? (state.leads.find((x) => x.id === state.editingId)?.extra || {}) : {}),
        collab_type: f["extra_collab_type"].value.trim() || undefined,
        planned_rate: f["extra_planned_rate"].value ? Number(f["extra_planned_rate"].value) : undefined,
        actual_rate: f["extra_actual_rate"].value ? Number(f["extra_actual_rate"].value) : undefined,
      },
    };

    if (state.editingId) {
      const prev = state.leads.find((l) => l.id === state.editingId);
      if (prev && prev.stage !== payload.stage) payload.stage_changed_at = new Date().toISOString();
      const { error } = await sb.from("leads").update(payload).eq("id", state.editingId);
      if (error) { toast("저장 실패: " + error.message); return; }
      if (prev && prev.stage !== payload.stage) logActivity(state.editingId, "단계 변경", `${prev.stage} → ${payload.stage}`);
      else logActivity(state.editingId, "정보 수정", null);
      toast("저장했어요");
    } else {
      // 링크 중복은 경고 후 선택 (다른 계정일 수 있음)
      const dupLink = payload.link && state.leads.find((x) => x.link && x.link === payload.link);
      if (dupLink && !confirm(`같은 링크가 이미 등록돼 있어요: "${dupLink.name}" (${dupLink.owner || "담당자 미지정"} 담당)\n그래도 등록할까요?`)) return;
      const { data, error } = await sb.from("leads").insert(payload).select().single();
      if (error) { toast("등록 실패: " + error.message); return; }
      logActivity(data.id, "신규 등록", `${payload.stage} 단계로 등록`);
      toast("등록했어요");
    }
    closeModal();
    loadLeads();
  }

  async function deleteLead(id = state.editingId) {
    const l = allLeads().find((x) => x.id === id);
    if (!l || !confirm(`"${l.name}" 항목을 삭제할까요? 히스토리도 함께 삭제됩니다.`)) return false;
    const { error } = await sb.from("leads").delete().eq("id", id);
    if (error) { toast("삭제 실패: " + error.message); return false; }
    toast("삭제했어요");
    closeModal();
    loadLeads();
    return true;
  }

  // ── 상세 드로어 (인라인 편집) ──
  const FIELD_LABELS = {
    stage: "단계", category: "카테고리", link: "링크", channel: "발굴 채널",
    channel_type: "온/오프라인", followers: "팔로워", shop_detail: "샵 상세",
    business: "사업자 여부", region: "지역", main_products: "주요 상품",
    next_action: "다음 액션", next_action_due: "액션 기한", closed_reason: "보류/제외 사유", contact_point: "컨택포인트", contact_date: "컨택일",
    collab_type: "협업 유형", planned_rate: "계획 단가", actual_rate: "실제 단가",
    nickname: "닉네임", approved_at: "승인일",
    owner: "담당자", notes: "비고", name: "이름",
  };

  function drawerFieldHtml(l, key) {
    const EXTRA_KEYS = ["collab_type", "planned_rate", "actual_rate"];
    const raw = EXTRA_KEYS.includes(key) ? (l.extra?.[key] ?? "") : (l[key] ?? "");
    const val = esc(raw);
    switch (key) {
      case "stage": {
        const opts = [...stagesFor(l.type), ...CLOSED_STAGES];
        return `<select data-field="stage">${opts.map((s) =>
          `<option ${s === l.stage ? "selected" : ""}>${s}</option>`).join("")}</select>`;
      }
      case "category":
        return `<select data-field="category"><option value=""></option>${(CFG.CATEGORIES || []).map((c) =>
          `<option ${c === raw ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>`;
      case "owner":
        return `<select data-field="owner"><option value=""></option>${OWNERS.map((o) =>
          `<option ${o === raw ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
      case "channel_type":
        return `<select data-field="channel_type">${["온라인", "오프라인"].map((c) =>
          `<option ${c === raw ? "selected" : ""}>${c}</option>`).join("")}</select>`;
      case "channel":
        return `<input data-field="channel" list="channel-options" value="${val}">`;
      case "followers":
        return `<select data-field="followers">${followerOptions(followerFloor(l.followers))}</select>`;
      case "business":
        return `<select data-field="business"><option value=""></option>${["사업자", "개인"].map((b) =>
          `<option ${b === raw ? "selected" : ""}>${b}</option>`).join("")}</select>`;
      case "contact_date": case "approved_at": case "next_action_due":
        return `<input data-field="${key}" type="date" value="${val}">`;
      case "link":
        return `<div class="link-field"><input data-field="link" type="url" value="${val}">` +
          (raw ? `<a href="${val}" target="_blank" rel="noopener" title="새 탭에서 열기">↗</a>` : "") + `</div>`;
      case "notes":
        return `<textarea data-field="notes" rows="3">${val}</textarea>`;
      default:
        return `<input data-field="${key}" value="${val}">`;
    }
  }

  async function openDrawer(id) {
    const l = allLeads().find((x) => x.id === id);
    if (!l) return;
    $("#drawer-archive").textContent = l.archived_at ? "↩️ 복원" : "📦 아카이브";
    state.drawerId = id;
    $("#drawer-type").innerHTML = `<span class="type-badge type-${l.type}">${TYPE_LABEL[l.type]}</span>`;
    $("#drawer-name-input").value = l.name;
    $("#drawer-star").textContent = l.starred ? "★" : "☆";
    $("#drawer-star").classList.toggle("on", !!l.starred);
    const keys = ["stage",
      ...(CLOSED_STAGES.includes(l.stage) ? ["closed_reason"] : []),
      "next_action", "next_action_due",
      "category", "owner", "link", "channel", "channel_type", "followers",
      "business", "region", "main_products", "contact_point", "contact_date",
      ...(l.type === "influencer" ? ["collab_type", "planned_rate", "actual_rate"] : []),
      "nickname", "approved_at", "notes"];
    const myDeliv = (state.deliverables || []).filter((d) => d.lead_id === l.id);
    const delivRowHtml = myDeliv.length ? `
      <dt>협업 결과물</dt>
      <dd class="drawer-deliv">${myDeliv.map((d) => {
        const p = delivPlatform(d.url);
        const ic = p === "youtube" ? chIcon("유튜브") : p === "instagram" ? chIcon("인스타그램") : p === "x" ? chIcon("트위터/X") : "🔗";
        return `<a href="${esc(d.url)}" target="_blank" rel="noopener">${ic} ${esc(d.title || d.url.replace(/^https?:\/\//, "").slice(0, 30))} ↗</a>`;
      }).join("<br>")}</dd>` : "";
    const mt = l.extra?.metrics;
    const metricsHtml = mt ? `
      <dt>실활동 지표</dt>
      <dd class="drawer-metrics">
        🎥 라이브 ${mt.live_count}회${mt.last_live_at ? ` · 마지막 ${fmtDate(mt.last_live_at)}` : ""}<br>
        💰 누적 판매 ${fmtNum(mt.acc_sold_amount)}원
        ${mt.user_id ? `<br><a href="https://asgard-kp-admin.volla.local/appService/users/${esc(mt.user_id)}" target="_blank" rel="noopener" class="muted">어드민에서 보기 ↗</a>` : ""}
        <br><span class="drawer-metrics-sync">동기화 ${fmtDateTime(mt.synced_at)} · @${esc(mt.wyyyes_nickname || "")}</span>
      </dd>` : "";
    $("#drawer-info").innerHTML =
      keys.map((k) => `<dt>${FIELD_LABELS[k]}</dt><dd>${drawerFieldHtml(l, k)}</dd>`).join("") +
      delivRowHtml +
      metricsHtml +
      `<dt>등록일</dt><dd class="muted">${fmtDateTime(l.created_at)}</dd>`;
    $("#drawer-backdrop").classList.remove("hidden");
    lockScroll(true);
    loadDrawerTimeline(id);
  }

  // 드로어 필드 변경 → 즉시 저장
  async function onDrawerFieldChange(e) {
    const el = e.target.closest("[data-field]");
    if (!el || !state.drawerId) return;
    const l = allLeads().find((x) => x.id === state.drawerId);
    if (!l) return;
    const key = el.dataset.field;
    const val = el.value.trim();

    let patch;
    if (["collab_type", "planned_rate", "actual_rate"].includes(key))
      patch = { extra: { ...(l.extra || {}), [key]: val || undefined } };
    else if (key === "followers") patch = { followers: val ? Number(val) : null };
    else if (key === "stage") {
      if (!val || val === l.stage) return;
      patch = { stage: val, stage_changed_at: new Date().toISOString() };
      if (CLOSED_STAGES.includes(val)) {
        const reason = window.prompt(`'${val}' 사유를 입력해주세요 (선택):`, l.closed_reason || "");
        if (reason !== null && reason.trim()) patch.closed_reason = reason.trim();
      }
    }
    else if (key === "name") {
      if (!val) { el.value = l.name; return; }
      const dupName = findDupName(val, l.id);
      if (dupName) {
        alert(`⚠️ 이미 등록된 이름이에요: "${dupName.name}" (${dupName.owner || "담당자 미지정"} 담당)`);
        el.value = l.name;
        return;
      }
      patch = { name: val };
    }
    else patch = { [key]: val || null };

    const prevStage = l.stage;
    const { error } = await sb.from("leads").update(patch).eq("id", l.id);
    if (error) { toast("저장 실패: " + error.message); return; }
    Object.assign(l, patch);
    el.classList.add("flash-ok");
    setTimeout(() => el.classList.remove("flash-ok"), 700);
    if (key === "stage") {
      logActivity(l.id, "단계 변경", `${prevStage} → ${val}${patch.closed_reason ? ` (${patch.closed_reason})` : ""}`).then(() => loadDrawerTimeline(l.id));
      toast(`${l.name}: ${prevStage} → ${val}`);
      openDrawer(l.id); // 종료 사유 필드 표시 갱신
    } else {
      logActivity(l.id, "정보 수정", FIELD_LABELS[key] || key).then(() => loadDrawerTimeline(l.id));
      toast("저장했어요");
    }
    renderAll();
  }

  async function loadDrawerTimeline(id) {
    const { data } = await sb.from("activities").select("*").eq("lead_id", id).order("created_at", { ascending: false });
    $("#drawer-timeline").innerHTML = (data || []).map((a) => `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-body">
          <div><b>${esc(a.action)}</b>${a.detail ? " — " + esc(a.detail) : ""}</div>
          <div class="tl-meta" title="${fmtDateTime(a.created_at)}">${esc(a.actor || "")} · ${fmtRel(a.created_at)}</div>
        </div>
      </div>`).join("") || `<span class="muted">기록 없음</span>`;
  }

  function closeDrawer() {
    $("#drawer-backdrop").classList.add("hidden");
    lockScroll(false);
    state.drawerId = null;
  }

  async function addMemo(e) {
    e.preventDefault();
    const input = $("#memo-input");
    const text = input.value.trim();
    if (!text || !state.drawerId) return;
    input.value = "";
    await logActivity(state.drawerId, $("#memo-type").value || "메모", text);
    loadDrawerTimeline(state.drawerId);
  }

  // ── CSV 내보내기 ──
  function exportCsv() {
    const cols = ["type", "name", "category", "stage", "closed_reason", "next_action", "next_action_due",
      "channel", "channel_type", "followers", "business", "region",
      "shop_detail", "main_products", "contact_point", "contact_date", "nickname", "approved_at", "owner", "notes", "link", "created_at"];
    const header = ["유형", "이름", "카테고리", "단계", "종료사유", "다음액션", "액션기한",
      "발굴채널", "온오프", "팔로워", "사업자", "지역",
      "샵상세(구)", "주요상품", "컨택포인트", "컨택일", "닉네임", "승인일", "담당자", "비고", "링크", "등록일"];
    const rows = state.leads.map((l) =>
      cols.map((c) => {
        let v = c === "type" ? TYPE_LABEL[l.type] : l[c];
        v = v == null ? "" : String(v);
        return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(","));
    const csv = "﻿" + [header.join(","), ...rows].join("\n"); // BOM: 엑셀 한글 깨짐 방지
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `sales_pipeline_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  boot();
})();
