/* WYYYES 세일즈 파이프라인 SPA */
(() => {
  const CFG = window.APP_CONFIG || {};
  const STAGES = ["발굴", "컨택", "응답확인", "협의중", "온보딩", "승인", "보류", "제외"];
  const OPEN_STAGES = ["발굴", "컨택", "응답확인", "협의중", "온보딩", "승인"];
  const CONTACTING = ["컨택", "응답확인", "협의중", "온보딩"];
  const TYPE_LABEL = { dealer: "딜러", influencer: "인플루언서" };

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
  };

  const me = () => localStorage.getItem("sp_me") || CFG.OWNERS?.[0] || "팀";

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add("hidden"), 2500);
  }

  const fmtDate = (d) => (d ? String(d).slice(0, 10) : "");
  const fmtDateTime = (d) => {
    if (!d) return "";
    const t = new Date(d);
    return `${t.getFullYear()}.${String(t.getMonth() + 1).padStart(2, "0")}.${String(t.getDate()).padStart(2, "0")} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  };
  const fmtNum = (n) => (n == null ? "" : Number(n).toLocaleString());

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

  async function enterApp() {
    $("#app").classList.remove("hidden");
    initControls();
    await loadLeads();
    subscribeRealtime();
  }

  // ── 데이터 ──
  async function loadLeads() {
    const { data, error } = await sb.from("leads").select("*").order("updated_at", { ascending: false });
    if (error) { toast("불러오기 실패: " + error.message); return; }
    state.leads = data || [];
    renderAll();
  }

  function subscribeRealtime() {
    sb.channel("leads-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => loadLeads())
      .subscribe();
  }

  async function logActivity(leadId, action, detail) {
    await sb.from("activities").insert({ lead_id: leadId, action, detail, actor: me() });
  }

  // ── 컨트롤 초기화 ──
  function initControls() {
    // 내 이름
    const meSel = $("#me-select");
    meSel.innerHTML = (CFG.OWNERS || []).map((o) => `<option>${esc(o)}</option>`).join("");
    meSel.value = me();
    meSel.addEventListener("change", () => localStorage.setItem("sp_me", meSel.value));

    // 탭
    $$(".tab-btn").forEach((btn) =>
      btn.addEventListener("click", () => {
        state.tab = btn.dataset.tab;
        $$(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
        $$(".tab-panel").forEach((p) => p.classList.toggle("hidden", p.id !== "tab-" + state.tab));
        renderAll();
      })
    );

    // 폼 옵션
    $("#form-stage").innerHTML = STAGES.map((s) => `<option>${s}</option>`).join("");
    $("#form-owner").innerHTML = `<option value=""></option>` + (CFG.OWNERS || []).map((o) => `<option>${esc(o)}</option>`).join("");
    $("#channel-options").innerHTML = (CFG.CHANNELS || []).map((c) => `<option value="${esc(c)}">`).join("");
    $("#table-stage-filter").innerHTML += STAGES.map((s) => `<option>${s}</option>`).join("");
    ["#table-owner-filter", "#board-owner-filter"].forEach((sel) => {
      $(sel).innerHTML += (CFG.OWNERS || []).map((o) => `<option>${esc(o)}</option>`).join("");
    });

    // 필터 이벤트
    ["#dash-type-filter", "#board-type-filter", "#board-owner-filter", "#board-show-closed",
     "#table-search", "#table-type-filter", "#table-stage-filter", "#table-channel-filter", "#table-owner-filter"]
      .forEach((sel) => $(sel).addEventListener("input", renderAll));

    // 유형별 필드 토글
    $("#form-type").addEventListener("change", toggleTypeFields);

    // 버튼
    $("#add-btn").addEventListener("click", () => openModal(null));
    $("#export-btn").addEventListener("click", exportCsv);
    $("#modal-cancel").addEventListener("click", closeModal);
    $("#modal-backdrop").addEventListener("click", (e) => { if (e.target.id === "modal-backdrop") closeModal(); });
    $("#modal-delete").addEventListener("click", deleteLead);
    $("#lead-form").addEventListener("submit", saveLead);
    $("#drawer-close").addEventListener("click", closeDrawer);
    $("#drawer-backdrop").addEventListener("click", (e) => { if (e.target.id === "drawer-backdrop") closeDrawer(); });
    $("#drawer-edit").addEventListener("click", () => { const id = state.drawerId; closeDrawer(); openModal(id); });
    $("#memo-form").addEventListener("submit", addMemo);

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
    const isInf = $("#form-type").value === "influencer";
    $$(".influencer-only").forEach((el) => el.classList.toggle("hidden", !isInf));
    $$(".dealer-only").forEach((el) => el.classList.toggle("hidden", isInf));
  }

  // ── 렌더링 ──
  function renderAll() {
    if (state.tab === "dashboard") renderDashboard();
    if (state.tab === "board") renderBoard();
    if (state.tab === "table") renderTable();
  }

  function renderDashboard() {
    const typeF = $("#dash-type-filter").value;
    const leads = state.leads.filter((l) => !typeF || l.type === typeF);
    const active = leads.filter((l) => OPEN_STAGES.includes(l.stage));

    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const kpis = [
      { label: "전체 (제외 포함)", value: leads.length, sub: `활성 ${active.length}건` },
      { label: "이번 주 신규", value: leads.filter((l) => l.created_at >= weekAgo).length, sub: "최근 7일 등록" },
      { label: "컨택 진행중", value: leads.filter((l) => CONTACTING.includes(l.stage)).length, sub: "컨택~온보딩 단계" },
      { label: "승인 완료", value: leads.filter((l) => l.stage === "승인").length, sub: "누적" },
    ];
    $("#kpi-row").innerHTML = kpis.map((k) => `
      <div class="kpi">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
        <div class="kpi-sub">${k.sub}</div>
      </div>`).join("");

    // 퍼널
    const maxCnt = Math.max(1, ...STAGES.map((s) => leads.filter((l) => l.stage === s).length));
    $("#funnel").innerHTML = STAGES.map((s) => {
      const cnt = leads.filter((l) => l.stage === s).length;
      return barRow(s, cnt, maxCnt, `stage-${s}`);
    }).join("");

    // 담당자별
    $("#by-owner").innerHTML = groupBars(active, (l) => l.owner || "(미지정)");
    // 채널별
    $("#by-channel").innerHTML = groupBars(active, (l) => l.channel || "(미지정)");

    // 최근 활동
    sb.from("activities").select("*, leads(name)").order("created_at", { ascending: false }).limit(12)
      .then(({ data }) => {
        $("#recent-activities").innerHTML = (data || []).map((a) => `
          <div class="tl-item">
            <div class="tl-dot"></div>
            <div class="tl-body">
              <div><b>${esc(a.leads?.name || "")}</b> — ${esc(a.action)}${a.detail ? ": " + esc(a.detail) : ""}</div>
              <div class="tl-meta">${esc(a.actor || "")} · ${fmtDateTime(a.created_at)}</div>
            </div>
          </div>`).join("") || `<span class="muted">아직 활동 기록이 없어요.</span>`;
      });
  }

  function groupBars(leads, keyFn) {
    const counts = {};
    leads.forEach((l) => { const k = keyFn(l); counts[k] = (counts[k] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = Math.max(1, ...entries.map(([, c]) => c));
    return entries.map(([k, c]) => barRow(k, c, max)).join("") || `<span class="muted">데이터 없음</span>`;
  }

  function barRow(label, cnt, max) {
    return `
      <div class="bar-row">
        <div class="bar-label">${esc(label)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(cnt / max) * 100}%"></div></div>
        <div class="bar-count">${cnt}</div>
      </div>`;
  }

  // ── 칸반 ──
  function renderBoard() {
    const typeF = $("#board-type-filter").value;
    const ownerF = $("#board-owner-filter").value;
    const showClosed = $("#board-show-closed").checked;
    const cols = showClosed ? STAGES : OPEN_STAGES;
    const leads = state.leads.filter((l) =>
      (!typeF || l.type === typeF) && (!ownerF || l.owner === ownerF));

    $("#board").innerHTML = cols.map((stage) => {
      const cards = leads.filter((l) => l.stage === stage);
      return `
        <div class="board-col" data-stage="${stage}">
          <div class="board-col-head">
            <span><span class="stage-chip stage-${stage}">${stage}</span></span>
            <span class="cnt">${cards.length}</span>
          </div>
          <div class="board-cards">
            ${cards.map((l) => `
              <div class="lead-card" draggable="true" data-id="${l.id}">
                <div class="lc-name">
                  <span class="type-badge type-${l.type}">${TYPE_LABEL[l.type]}</span>
                  ${esc(l.name)}
                </div>
                <div class="lc-meta">
                  ${l.channel ? `<span>${esc(l.channel)}</span>` : ""}
                  ${l.followers ? `<span>👥 ${fmtNum(l.followers)}</span>` : ""}
                  ${l.owner ? `<span>${esc(l.owner)}</span>` : ""}
                </div>
              </div>`).join("")}
          </div>
        </div>`;
    }).join("");

    // 드래그 & 드롭
    $$(".lead-card").forEach((card) => {
      card.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", card.dataset.id));
      card.addEventListener("click", () => openDrawer(card.dataset.id));
    });
    $$(".board-col").forEach((col) => {
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
        lead.stage = stage;
        renderBoard();
        const { error } = await sb.from("leads").update({ stage }).eq("id", id);
        if (error) { lead.stage = prev; renderBoard(); toast("변경 실패: " + error.message); return; }
        logActivity(id, "단계 변경", `${prev} → ${stage}`);
        toast(`${lead.name}: ${prev} → ${stage}`);
      });
    });
  }

  // ── 테이블 ──
  function renderTable() {
    const q = $("#table-search").value.trim().toLowerCase();
    const typeF = $("#table-type-filter").value;
    const stageF = $("#table-stage-filter").value;
    const chF = $("#table-channel-filter").value;
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
      (!ownerF || l.owner === ownerF) &&
      (!q || [l.name, l.main_products, l.notes, l.shop_detail, l.nickname].join(" ").toLowerCase().includes(q))
    );

    const { sortKey, sortDir } = state;
    rows.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "stage") { va = STAGES.indexOf(va); vb = STAGES.indexOf(vb); }
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
        <td class="td-name">${esc(l.name)}</td>
        <td><span class="type-badge type-${l.type}">${TYPE_LABEL[l.type]}</span></td>
        <td><span class="stage-chip stage-${l.stage}">${l.stage}</span></td>
        <td>${esc(l.channel || "")}</td>
        <td>${fmtNum(l.followers)}</td>
        <td>${esc(l.main_products || "")}</td>
        <td>${fmtDate(l.contact_date)}</td>
        <td>${esc(l.owner || "")}</td>
        <td class="muted">${fmtDate(l.updated_at)}</td>
      </tr>`).join("");

    $$("#leads-table tbody tr").forEach((tr) =>
      tr.addEventListener("click", () => openDrawer(tr.dataset.id)));
  }

  // ── 등록/수정 모달 ──
  function openModal(id) {
    state.editingId = id;
    const form = $("#lead-form");
    form.reset();
    $("#modal-title").textContent = id ? "수정" : "신규 등록";
    $("#modal-delete").classList.toggle("hidden", !id);
    if (id) {
      const l = state.leads.find((x) => x.id === id);
      if (!l) return;
      for (const key of ["type", "stage", "name", "link", "channel", "channel_type", "followers",
        "shop_detail", "main_products", "contact_point", "contact_date", "nickname", "approved_at", "notes", "owner"]) {
        if (form.elements[key]) form.elements[key].value = l[key] ?? "";
      }
      form.elements["extra_collab_type"].value = l.extra?.collab_type ?? "";
    } else {
      form.elements["owner"].value = me();
    }
    toggleTypeFields();
    $("#modal-backdrop").classList.remove("hidden");
    form.elements["name"].focus();
  }

  function closeModal() {
    $("#modal-backdrop").classList.add("hidden");
    state.editingId = null;
  }

  async function saveLead(e) {
    e.preventDefault();
    const f = $("#lead-form").elements;
    const payload = {
      type: f["type"].value,
      stage: f["stage"].value,
      name: f["name"].value.trim(),
      link: f["link"].value.trim() || null,
      channel: f["channel"].value.trim() || null,
      channel_type: f["channel_type"].value,
      followers: f["followers"].value ? Number(f["followers"].value) : null,
      shop_detail: f["shop_detail"].value.trim() || null,
      main_products: f["main_products"].value.trim() || null,
      contact_point: f["contact_point"].value.trim() || null,
      contact_date: f["contact_date"].value || null,
      nickname: f["nickname"].value.trim() || null,
      approved_at: f["approved_at"].value || null,
      owner: f["owner"].value || null,
      notes: f["notes"].value.trim() || null,
      extra: { collab_type: f["extra_collab_type"].value.trim() || undefined },
    };

    if (state.editingId) {
      const prev = state.leads.find((l) => l.id === state.editingId);
      const { error } = await sb.from("leads").update(payload).eq("id", state.editingId);
      if (error) { toast("저장 실패: " + error.message); return; }
      if (prev && prev.stage !== payload.stage) logActivity(state.editingId, "단계 변경", `${prev.stage} → ${payload.stage}`);
      else logActivity(state.editingId, "정보 수정", null);
      toast("저장했어요");
    } else {
      const { data, error } = await sb.from("leads").insert(payload).select().single();
      if (error) { toast("등록 실패: " + error.message); return; }
      logActivity(data.id, "신규 등록", `${payload.stage} 단계로 등록`);
      toast("등록했어요");
    }
    closeModal();
    loadLeads();
  }

  async function deleteLead() {
    const l = state.leads.find((x) => x.id === state.editingId);
    if (!l || !confirm(`"${l.name}" 항목을 삭제할까요? 히스토리도 함께 삭제됩니다.`)) return;
    const { error } = await sb.from("leads").delete().eq("id", state.editingId);
    if (error) { toast("삭제 실패: " + error.message); return; }
    toast("삭제했어요");
    closeModal();
    loadLeads();
  }

  // ── 상세 드로어 ──
  async function openDrawer(id) {
    const l = state.leads.find((x) => x.id === id);
    if (!l) return;
    state.drawerId = id;
    $("#drawer-name").innerHTML = `<span class="type-badge type-${l.type}">${TYPE_LABEL[l.type]}</span> ${esc(l.name)}`;
    const info = [
      ["단계", `<span class="stage-chip stage-${l.stage}">${l.stage}</span>`],
      ["링크", l.link ? `<a href="${esc(l.link)}" target="_blank" rel="noopener">${esc(l.link)}</a>` : ""],
      ["발굴 채널", esc(l.channel)],
      ["온/오프라인", esc(l.channel_type)],
      ["팔로워", fmtNum(l.followers)],
      ["샵 상세", esc(l.shop_detail)],
      ["주요 상품", esc(l.main_products)],
      ["컨택포인트", esc(l.contact_point)],
      ["컨택일", fmtDate(l.contact_date)],
      ["협업 유형", esc(l.extra?.collab_type)],
      ["닉네임", esc(l.nickname)],
      ["승인일", fmtDate(l.approved_at)],
      ["담당자", esc(l.owner)],
      ["비고", esc(l.notes)],
      ["등록일", fmtDateTime(l.created_at)],
    ].filter(([, v]) => v);
    $("#drawer-info").innerHTML = info.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
    $("#drawer-backdrop").classList.remove("hidden");
    loadDrawerTimeline(id);
  }

  async function loadDrawerTimeline(id) {
    const { data } = await sb.from("activities").select("*").eq("lead_id", id).order("created_at", { ascending: false });
    $("#drawer-timeline").innerHTML = (data || []).map((a) => `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-body">
          <div><b>${esc(a.action)}</b>${a.detail ? " — " + esc(a.detail) : ""}</div>
          <div class="tl-meta">${esc(a.actor || "")} · ${fmtDateTime(a.created_at)}</div>
        </div>
      </div>`).join("") || `<span class="muted">기록 없음</span>`;
  }

  function closeDrawer() {
    $("#drawer-backdrop").classList.add("hidden");
    state.drawerId = null;
  }

  async function addMemo(e) {
    e.preventDefault();
    const input = $("#memo-input");
    const text = input.value.trim();
    if (!text || !state.drawerId) return;
    input.value = "";
    await logActivity(state.drawerId, "메모", text);
    loadDrawerTimeline(state.drawerId);
  }

  // ── CSV 내보내기 ──
  function exportCsv() {
    const cols = ["type", "name", "stage", "channel", "channel_type", "followers", "shop_detail",
      "main_products", "contact_point", "contact_date", "nickname", "approved_at", "owner", "notes", "link", "created_at"];
    const header = ["유형", "이름", "단계", "발굴채널", "온오프", "팔로워", "샵상세", "주요상품",
      "컨택포인트", "컨택일", "닉네임", "승인일", "담당자", "비고", "링크", "등록일"];
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
