/* MGCI DECA Training League — UI */
(function () {
  const LB = window.LB;
  const CFG = window.LB_CONFIG || {};
  const S = {
    be: null, me: null, settings: null, data: null, dataAt: 0, quiz: null, renderTok: 0,
    ui: { practiceTab: "exams", authMode: "signin", authEmail: "", board: "grind", season: null, cluster: "all", execTab: "roleplay", adminTab: "settings", qCluster: "all", qSearch: "", draft: null }
  };

  /* ---------------- helpers ---------------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n, d = 1) => (Number.isFinite(n) ? (Math.round(n * 10 ** d) / 10 ** d).toLocaleString("en-CA", { maximumFractionDigits: d }) : "–");
  const fmtDate = (d) => (d ? new Date(d + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "");
  const daysUntil = (d) => Math.round((new Date(d + "T12:00:00") - new Date(LB.today() + "T12:00:00")) / 864e5);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const isExec = () => S.me && S.me.approved && (S.me.role === "exec" || S.me.role === "admin");
  const isAdmin = () => S.me && S.me.approved && S.me.role === "admin";
  const firstName = (n) => String(n || "").split(" ")[0];
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + "s"}`;
  const ordinal = (n) => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
  const seasonName = (id) => (id === "all" ? "All time" : (S.settings.seasons.find((s) => s.id === id) || { name: "Off-season" }).name);
  const evCode = (code) => (LB.eventByCode(code) ? code : code || "–");
  const evName = (code) => (LB.eventByCode(code) || {}).name || "";
  const memberMeta = (x) => [x.grade ? `Grade ${x.grade}` : "", x.event || ""].filter(Boolean).join(", ");
  const bandName = (i) => LB.BAND_NAMES[i] || "";

  function toast(msg, kind = "ok") {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.className = "toast show " + kind;
    t.textContent = msg;
    clearTimeout(t._h);
    t._h = setTimeout(() => (t.className = "toast"), 2800);
  }
  // In-page confirm dialog (window.confirm is blocked in some embedded viewers)
  function ask(message, okLabel = "Confirm") {
    return new Promise((resolve) => {
      const wrap = document.createElement("div");
      wrap.className = "modal-back";
      wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><p>${esc(message).replace(/\n/g, "<br>")}</p><div class="actions end"><button class="btn secondary" data-m="0">Cancel</button><button class="btn" data-m="1">${esc(okLabel)}</button></div></div>`;
      const done = (v) => { wrap.remove(); document.removeEventListener("keydown", key, true); resolve(v); };
      const key = (e) => { if (e.key === "Escape") { e.stopPropagation(); done(false); } };
      wrap.addEventListener("click", (e) => { e.stopPropagation(); const b = e.target.closest("[data-m]"); if (b) done(b.dataset.m === "1"); else if (e.target === wrap) done(false); });
      document.addEventListener("keydown", key, true);
      document.body.appendChild(wrap);
      wrap.querySelector('[data-m="1"]').focus();
    });
  }
  function download(name, text, type = "application/json") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  async function loadData(force) {
    if (!force && S.data && Date.now() - S.dataAt < 5 * 60e3) return S.data;
    const [profiles, roleplays, examStats] = await Promise.all([
      S.be.listProfiles(), S.be.listRoleplays(), S.be.listExamStats()
    ]);
    S.data = { profiles, roleplays, examStats };
    S.dataAt = Date.now();
    return S.data;
  }
  const invalidate = () => { S.data = null; };
  const nameOf = (uid) => (S.data && S.data.profiles[uid] ? S.data.profiles[uid].displayName : "Unknown");

  /* ---------------- shell ---------------- */
  function demoBar() {
    if (S.be.mode !== "demo") return "";
    const order = ["admin", "exec", "member"];
    const users = S.be.demoUsers().sort((a, b) => (a.role === b.role ? a.displayName.localeCompare(b.displayName) : order.indexOf(a.role) - order.indexOf(b.role)));
    const opts = users.map((u) => `<option value="${esc(u.uid)}" ${S.me && S.me.uid === u.uid ? "selected" : ""}>${esc(u.displayName)} (${esc(u.role)}${u.approved ? "" : ", pending"})</option>`).join("");
    return `<div class="demo-bar">
      <span>Demo with sample members. Changes stay in this browser.</span>
      <label>Viewing as <select data-change="switchUser">${S.me ? "" : '<option value="">Signed out</option>'}${opts}</select></label>
      <button class="link" data-action="resetDemo">Reset demo</button>
    </div>`;
  }
  function shell(content, active) {
    const links = [["home", "Home"], ["leaderboards", "Leaderboards"], ["practice", "Practice"], ["me", "My Progress"]];
    if (isExec()) links.push(["exec", "Exec tools"]);
    if (isAdmin()) links.push(["admin", "Admin"]);
    const signedIn = S.me && !S.me.blocked && !S.me.error;
    const showNav = signedIn && S.me.approved;
    return `${demoBar()}
    <header class="masthead">
      <div class="mast-inner">
        <a class="wordmark" href="#home"><b>${esc(CFG.chapterName || "DECA")}</b><span>Training League</span></a>
        ${showNav ? `<nav class="nav" aria-label="Main">${links.map(([r, l]) => `<a href="#${r}" ${active === r ? 'aria-current="page"' : ""}>${l}</a>`).join("")}</nav>` : `<span class="nav"></span>`}
        ${signedIn ? `<div class="account"><span class="account-name">${esc(S.me.displayName)}</span>${S.me.role !== "member" ? `<span class="role">${esc(S.me.role === "admin" ? "Admin" : "Exec")}</span>` : ""}<button class="link" data-action="signOut">Sign out</button></div>` : ""}
      </div>
    </header>
    <main class="page">${content}</main>
    <footer class="colophon">${esc(CFG.chapterName || "DECA")} chapter training site. Not affiliated with DECA Inc. or DECA Ontario.</footer>`;
  }
  const pageTitle = (title, sub, tools = "") => `<header class="page-title"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div>${tools ? `<div class="tools">${tools}</div>` : ""}</header>`;
  const tabs = (list, current, action) => `<div class="tabs" role="tablist">${list.map(([id, l]) => `<button role="tab" aria-selected="${current === id}" data-action="${action}" data-id="${id}">${l}</button>`).join("")}</div>`;

  /* ---------------- router ---------------- */
  const PAGES = { home: pageHome, leaderboards: pageBoards, practice: pagePractice, me: pageMe, exec: pageExec, admin: pageAdmin };

  async function render() {
    const root = document.getElementById("app");
    const tok = ++S.renderTok;
    if (!S.me) { root.innerHTML = shell(pageLogin(), ""); return; }
    if (S.me.blocked) { root.innerHTML = shell(pageBlocked(), ""); return; }
    if (S.me.error) { root.innerHTML = shell(`<div class="notice error"><h2>The site couldn't load your account</h2><p>${esc(S.me.error)}</p><p>Refresh the page. If it keeps happening, check that the Firestore rules were deployed (see README).</p></div>`, ""); return; }
    if (!S.me.approved) { root.innerHTML = shell(pagePending(), ""); return; }
    let r = (location.hash.replace(/^#\/?/, "") || "home").split("?")[0];
    if (!PAGES[r] || (r === "exec" && !isExec()) || (r === "admin" && !isAdmin())) r = "home";
    let done = false;
    setTimeout(() => { if (!done && tok === S.renderTok) root.innerHTML = shell(`<div class="loading">Loading</div>`, r); }, 180);
    try {
      const html = await PAGES[r]();
      done = true;
      if (tok !== S.renderTok) return;
      root.innerHTML = shell(html, r);
      afterRender(r);
    } catch (e) {
      done = true;
      console.error(e);
      if (tok === S.renderTok) root.innerHTML = shell(`<div class="notice error"><h2>This page didn't load</h2><p>${esc(e.message || e)}</p><button class="btn" data-action="reload">Try again</button></div>`, r);
    }
  }
  function afterRender(r) {
    if (r === "exec" && S.ui.execTab === "roleplay") updateSheetTotals();
    if (r === "practice" && S.quiz && !S.quiz.done) { const el = document.querySelector(".quiz"); if (el) el.focus({ preventScroll: true }); }
  }

  /* ---------------- sign in ---------------- */
  function authForm() {
    const mode = S.ui.authMode;
    const email = esc(S.ui.authEmail || "");
    if (mode === "signup") {
      return `<form data-form="signup" class="form auth" novalidate>
        <h2>Create an account</h2>
        <label>Full name<input name="name" autocomplete="name" maxlength="40" required></label>
        <label>Email<input type="email" name="email" autocomplete="email" value="${email}" required></label>
        <label>Password<input type="password" name="password" autocomplete="new-password" minlength="6" required><small>At least 6 characters.</small></label>
        <label>Confirm password<input type="password" name="confirm" autocomplete="new-password" required></label>
        <div class="actions"><button class="btn">Create account</button></div>
        <p class="fine">After you sign up, tell a chapter exec the email you used so they can approve your account.</p>
        <p class="switch">Already have an account? <button type="button" class="link" data-action="authMode" data-id="signin">Sign in</button></p>
      </form>`;
    }
    if (mode === "reset") {
      return `<form data-form="reset" class="form auth" novalidate>
        <h2>Reset your password</h2>
        <p class="muted">Enter the email you signed up with. We'll send you a link to choose a new password.</p>
        <label>Email<input type="email" name="email" autocomplete="email" value="${email}" required></label>
        <div class="actions"><button class="btn">Send reset link</button></div>
        <p class="switch"><button type="button" class="link" data-action="authMode" data-id="signin">Back to sign in</button></p>
      </form>`;
    }
    return `<form data-form="signin" class="form auth" novalidate>
      <h2>Sign in</h2>
      <label>Email<input type="email" name="email" autocomplete="email" value="${email}" required></label>
      <label>Password<input type="password" name="password" autocomplete="current-password" required></label>
      <div class="actions"><button class="btn">Sign in</button><button type="button" class="link" data-action="authMode" data-id="reset">Forgot your password?</button></div>
      ${S.be.mode === "demo" ? `<p class="fine">Demo: sign in as <button type="button" class="link" data-action="demoFill">maya.thompson@example.com</button> with any password, or create a new account to see the approval step.</p>` : ""}
      <p class="switch">New to the league? <button type="button" class="link" data-action="authMode" data-id="signup">Create an account</button></p>
    </form>`;
  }
  function pageLogin() {
    const P = S.settings.points;
    return `<section class="entry">
      <div class="entry-main">
        <h1 class="entry-title">${esc(CFG.chapterName || "DECA")}<br>Training League</h1>
        <p class="entry-lede">Practise roleplays with execs, work through past exams, and see where you stand before Provincials.</p>
        ${authForm()}
      </div>
      <dl class="entry-rules">
        <div><dt>Roleplays</dt><dd>Book a slot on the signup sheet. An exec scores you on the official judge's form and leaves feedback. Each one earns ${fmt(P.rpAttend)} points plus your score.</dd></div>
        <div><dt>Exam practice</dt><dd>Mini exams or full 100-question exams by cluster. Questions you answer for the first time count toward points and accuracy.</dd></div>
        <div><dt>Leaderboards</dt><dd>Separate boards for total points, roleplay average, exam accuracy and most improved, reset each season.</dd></div>
      </dl>
    </section>`;
  }
  function pagePending() {
    return `<section class="entry single">
      <div class="entry-main">
        <h1 class="entry-title small">Waiting for approval</h1>
        <p class="entry-lede">Tell a chapter exec the email you signed up with, <b>${esc(S.me.email || "")}</b>. Once they approve it, you'll have full access.</p>
        <form data-form="profile" class="form narrow">
          <p class="fine">Set up your profile while you wait.</p>
          ${profileFields(S.me)}
          <div class="actions"><button class="btn">Save profile</button><button type="button" class="link" data-action="reload">Check approval again</button></div>
        </form>
      </div>
    </section>`;
  }
  function pageBlocked() {
    return `<section class="entry single"><div class="entry-main"><h1 class="entry-title small">Use your school account</h1>
      <p class="entry-lede">${esc(S.me.email || "That account")} can't use this site. Create an account with an email ending in ${esc((CFG.allowedEmailDomains || []).join(" or "))}.</p>
      <button class="btn" data-action="clearBlocked">Back to sign in</button></div></section>`;
  }
  function profileFields(p) {
    const grades = ["9", "10", "11", "12"];
    return `<label>Display name<input name="displayName" maxlength="40" required value="${esc(p.displayName || "")}"><small>Shown on the leaderboards.</small></label>
      <div class="row2">
        <label>Grade<select name="grade"><option value="">Not set</option>${grades.map((g) => `<option ${String(p.grade) === g ? "selected" : ""}>${g}</option>`).join("")}</select></label>
        <label>Main event<select name="event"><option value="">Not set</option>${eventOptions(p.event)}</select></label>
      </div>
      <label class="check"><input type="checkbox" name="showOnBoards" ${p.showOnBoards !== false ? "checked" : ""}> Show me on the leaderboards</label>`;
  }
  function eventOptions(selected) {
    const groups = { principles: "Principles", series: "Individual Series", tdm: "Team Decision Making" };
    return Object.entries(groups).map(([t, label]) =>
      `<optgroup label="${label}">${LB.EVENTS.filter((e) => e.type === t && e.code !== "OTHER").map((e) => `<option value="${e.code}" ${selected === e.code ? "selected" : ""}>${e.code}, ${esc(e.name)}</option>`).join("")}</optgroup>`
    ).join("") + `<option value="OTHER" ${selected === "OTHER" ? "selected" : ""}>Other or mixed practice</option>`;
  }
  function clusterOptions(selected, withAll = true, allLabel = "All clusters") {
    return (withAll ? `<option value="all">${allLabel}</option>` : "") + LB.CLUSTERS.map((c) => `<option value="${c.id}" ${selected === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("");
  }
  function seasonOptions(selected) {
    return S.settings.seasons.map((s) => `<option value="${esc(s.id)}" ${selected === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("") + `<option value="all" ${selected === "all" ? "selected" : ""}>All time</option>`;
  }

  /* ---------------- standings table (shared) ---------------- */
  function standingsTable(ranked, board, opts = {}) {
    const B = LB.BOARDS[board];
    const cols = {
      grind: { head: ["Roleplays", "Exam Qs", "Points"], cells: (x) => [x.rpCount, x.answered, fmt(x.total)] },
      roleplay: { head: ["Roleplays", "Best", "Average"], cells: (x) => [x.rpCount, fmt(x.rpBest) + "%", fmt(x.rpAvg) + "%"] },
      exam: { head: ["Questions", "Correct", "Accuracy"], cells: (x) => [x.answered, x.correct, fmt(x.examAcc) + "%"] },
      improved: { head: ["First", "Recent", "Change"], cells: (x) => [fmt(x.firstAvg) + "%", fmt(x.recentAvg) + "%", `<span class="${x.improved >= 0 ? "up" : "down"}">${x.improved >= 0 ? "+" : "−"}${fmt(Math.abs(x.improved))}</span>`] }
    }[board];
    const rows = opts.limit ? ranked.slice(0, opts.limit) : ranked;
    if (!rows.length) return `<p class="empty">${opts.empty || "No one qualifies yet."}</p>`;
    return `<table class="standings ${opts.compact ? "compact" : ""}">
      <caption class="sr">${esc(B.label)}</caption>
      <thead><tr><th class="rank" scope="col"><span class="sr">Rank</span></th><th scope="col">Member</th>${cols.head.map((h, i) => `<th scope="col" class="num ${i === cols.head.length - 1 ? "key" : "sub"}">${h}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((x) => `<tr class="${x.uid === S.me.uid ? "is-me" : ""} ${x.rank === 1 ? "is-first" : ""}">
        <td class="rank">${x.rank}</td>
        <td class="member"><span class="name">${esc(x.name)}${x.uid === S.me.uid ? ' <span class="you">You</span>' : ""}</span><span class="meta">${esc(memberMeta(x))}</span></td>
        ${cols.cells(x).map((c, i) => `<td class="num ${i === cols.head.length - 1 ? "key" : "sub"}">${c}</td>`).join("")}
      </tr>`).join("")}</tbody>
    </table>`;
  }

  /* ---------------- HOME ---------------- */
  async function pageHome() {
    const d = await loadData();
    const s = S.settings;
    const season = LB.currentSeasonId(s);
    const seasonObj = s.seasons.find((x) => x.id === season);
    const all = LB.computeRows({ ...d, settings: s, season, includeHidden: true });
    const visible = all.filter((x) => d.profiles[x.uid].showOnBoards !== false);
    const { ranked } = LB.rankBoard(visible, "grind", s);
    const mine = all.find((x) => x.uid === S.me.uid);
    const myRank = ranked.find((x) => x.uid === S.me.uid);
    const hidden = d.profiles[S.me.uid] && d.profiles[S.me.uid].showOnBoards === false;
    const left = seasonObj ? daysUntil(seasonObj.end) : null;
    const upcoming = (s.keyDates || []).filter((k) => daysUntil(k.date) >= 0).sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, 4);
    const activity = [
      ...d.roleplays.map((r) => ({ t: "rp", uid: r.memberUid, date: r.date, at: r.createdAt || 0, event: r.event, team: r.teamId }))
    ].filter((a) => d.profiles[a.uid] && d.profiles[a.uid].showOnBoards !== false)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.at - a.at)).slice(0, 6);

    const rankLine = myRank ? `<p class="you-rank"><span class="big">${ordinal(myRank.rank)}</span><span>of ${ranked.length} in total points</span></p>`
      : `<p class="you-rank empty-rank"><span>${hidden ? "You're hidden from the leaderboards. Change this in My Progress." : "Not ranked yet. One roleplay or practice exam gets you on the board."}</span></p>`;

    return `
    ${pageTitle(esc(seasonName(season)), seasonObj ? `Ends ${fmtDate(seasonObj.end)}, ${plural(left, "day")} left` : "Between seasons")}
    <div class="home">
      <section class="panel standings-panel">
        <div class="panel-head"><h2>Total points</h2><a href="#leaderboards">All leaderboards</a></div>
        ${standingsTable(ranked, "grind", { limit: 10, compact: true, empty: "No activity yet this season." })}
      </section>
      <aside class="home-side">
        <section class="side-block you-block">
          <h2>Your season</h2>
          ${rankLine}
          <dl class="figures">
            <div><dt>Points</dt><dd>${mine ? fmt(mine.total) : "0"}</dd></div>
            <div><dt>Roleplay avg</dt><dd>${mine && mine.rpCount ? fmt(mine.rpAvg) + "%" : "–"}</dd></div>
            <div><dt>Exam accuracy</dt><dd>${mine && mine.answered ? fmt(mine.examAcc, 0) + "%" : "–"}</dd></div>
          </dl>
          <div class="actions"><a class="btn" href="${esc(s.signupSheetUrl)}" target="_blank" rel="noopener">Book a roleplay</a><a class="btn secondary" href="#practice" data-action="practiceTab" data-id="exams">Practise an exam</a></div>
        </section>
        <section class="side-block">
          <h2>Coming up</h2>
          ${upcoming.length ? `<ul class="dates">${upcoming.map((k) => { const n = daysUntil(k.date); return `<li><time datetime="${esc(k.date)}">${fmtDate(k.date)}</time><span>${esc(k.label)}</span><span class="when">${n === 0 ? "Today" : n === 1 ? "Tomorrow" : `${n} days`}</span></li>`; }).join("")}</ul>` : `<p class="muted">No dates set.</p>`}
        </section>
        <section class="side-block">
          <h2>Recent roleplays</h2>
          ${activity.length ? `<ul class="feed">${activity.map((a) => `<li><span><b>${esc(d.profiles[a.uid].displayName)}</b> did ${a.team ? "a team" : /^[AEFHILMNORSX]/.test(evCode(a.event)) ? "an" : "a"} ${esc(evCode(a.event))} roleplay</span><time>${fmtDate(a.date)}</time></li>`).join("")}</ul>` : `<p class="muted">Nothing logged yet.</p>`}
        </section>
      </aside>
    </div>`;
  }

  /* ---------------- STANDINGS ---------------- */
  async function pageBoards() {
    const d = await loadData();
    const s = S.settings;
    const { board, cluster } = S.ui;
    const season = S.ui.season || LB.currentSeasonId(s);
    const rows = LB.computeRows({ ...d, settings: s, season, cluster });
    const { ranked } = LB.rankBoard(rows, board, s);
    const B = LB.BOARDS[board];
    const meRow = rows.find((x) => x.uid === S.me.uid);
    const meRanked = ranked.find((x) => x.uid === S.me.uid);
    const P = s.points;

    let note = "";
    if (!meRanked) {
      if (d.profiles[S.me.uid] && d.profiles[S.me.uid].showOnBoards === false) note = `You're hidden from the leaderboards. You can change this in My Progress.`;
      else if (board === "roleplay") note = `${plural(Math.max(0, s.mins.rpAvg - (meRow ? meRow.rpCount : 0)), "more roleplay")} and you'll appear here.`;
      else if (board === "exam") note = `${plural(Math.max(0, s.mins.examAcc - (meRow ? meRow.answered : 0)), "more new question")} and you'll appear here.`;
      else if (board === "improved") note = `${plural(Math.max(0, s.mins.improvedMin - (meRow ? meRow.rpCount : 0)), "more roleplay")} and you'll appear here.`;
      else note = `Do a roleplay or a practice exam to get on the board.`;
    }
    const minText = { roleplay: `Needs ${s.mins.rpAvg} or more roleplays.`, exam: `Needs ${s.mins.examAcc} or more first-attempt questions.`, improved: `Needs ${s.mins.improvedMin} or more roleplays.`, grind: "" }[board];

    return `
    ${pageTitle("Leaderboards", "", `<label class="inline">Season <select data-change="boardSeason">${seasonOptions(season)}</select></label><label class="inline">Cluster <select data-change="boardCluster">${clusterOptions(cluster)}</select></label><button class="btn secondary small" data-action="refresh">Refresh</button>`)}
    ${tabs(Object.entries(LB.BOARDS).map(([id, b]) => [id, b.label]), board, "board")}
    <p class="board-blurb">${esc(B.blurb)} ${minText}</p>
    ${note ? `<p class="notice">${esc(note)}</p>` : ""}
    <section class="panel">${standingsTable(ranked, board, { empty: `No one qualifies for this board yet${cluster !== "all" ? " in this cluster" : ""}.` })}</section>
    <section class="explainer">
      <h2>How total points are calculated</h2>
      <dl class="rules">
        <div><dt>Roleplay</dt><dd>${fmt(P.rpAttend)} points, plus your score divided by ${fmt(P.rpScoreDiv)}. An 85% roleplay is worth ${fmt(P.rpAttend + 85 / P.rpScoreDiv)}.</dd></div>
        <div><dt>Personal best</dt><dd>${fmt(P.rpPbBonus)} bonus points when you beat your best roleplay score.</dd></div>
        <div><dt>Exam practice</dt><dd>${fmt(P.examPerCorrect)} points for each question you get right on your first try. Repeats don't count.</dd></div>
      </dl>
    </section>`;
  }

  /* ---------------- PRACTICE ---------------- */
  async function pagePractice() {
    if (S.quiz) return S.quiz.done ? quizResults() : quizView();
    const head = `${pageTitle("Practice")}${tabs([["exams", "Exam practice"], ["roleplays", "Book a roleplay"]], S.ui.practiceTab, "practiceTab")}`;
    return head + (S.ui.practiceTab === "roleplays" ? await practiceRoleplays() : await practiceExams());
  }
  async function practiceRoleplays() {
    const d = await loadData();
    const s = S.settings;
    const mine = d.roleplays.filter((r) => r.memberUid === S.me.uid).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.createdAt || 0) - (a.createdAt || 0))).slice(0, 4);
    const upcoming = (s.keyDates || []).filter((k) => daysUntil(k.date) >= 0).sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, 3);
    const P = s.points;
    return `<div class="split">
      <section class="panel pad">
        <h2>How roleplays work</h2>
        <ol class="steps">
          <li><b>Sign up for a time.</b> Add your name to an open slot on the roleplay signup sheet, at lunch or online.</li>
          <li><b>Do the roleplay with an exec.</b> They give you a case for your event and score you on the 2026 DECA judge's evaluation form.</li>
          <li><b>Read your feedback.</b> Your score, the level you reached on each line of the form and the judge's comments appear in My Progress.</li>
        </ol>
        <p class="muted">Each roleplay earns ${fmt(P.rpAttend)} points plus your score divided by ${fmt(P.rpScoreDiv)}, and ${fmt(P.rpPbBonus)} more when you beat your personal best.</p>
        <div class="actions"><a class="btn" href="${esc(s.signupSheetUrl)}" target="_blank" rel="noopener">Open the signup sheet</a></div>
      </section>
      <aside>
        <section class="side-block">
          <h2>Your recent roleplays</h2>
          ${mine.length ? `<table class="plain"><tbody>${mine.map((r) => `<tr><td>${fmtDate(r.date)}</td><td><b>${esc(evCode(r.event))}</b></td><td class="num">${fmt(LB.pct(r))}%</td></tr>`).join("")}</tbody></table><p class="fine"><a href="#me">See all your feedback in My Progress</a></p>` : `<p class="muted">You haven't done a roleplay yet. Your first one gets you on the roleplay leaderboards.</p>`}
        </section>
        <section class="side-block">
          <h2>Coming up</h2>
          ${upcoming.length ? `<ul class="dates">${upcoming.map((k) => { const n = daysUntil(k.date); return `<li><time datetime="${esc(k.date)}">${fmtDate(k.date)}</time><span>${esc(k.label)}</span><span class="when">${n === 0 ? "Today" : n === 1 ? "Tomorrow" : `${n} days`}</span></li>`; }).join("")}</ul>` : `<p class="muted">No dates set.</p>`}
        </section>
      </aside>
    </div>`;
  }
  async function practiceExams() {
    const [questions, seen, attempts, d] = await Promise.all([S.be.listQuestions(), S.be.getSeen(), S.be.listMyAttempts(), loadData()]);
    const counts = {};
    questions.forEach((q) => { counts[q.cluster] = (counts[q.cluster] || 0) + 1; });
    const unseenAll = questions.filter((q) => !seen.has(q.id)).length;
    const byC = {};
    d.examStats.filter((x) => x.uid === S.me.uid).forEach((x) => Object.entries(x.byCluster || {}).forEach(([c, v]) => { byC[c] = byC[c] || { a: 0, c: 0 }; byC[c].a += v.a; byC[c].c += v.c; }));
    const recent = attempts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 6);

    return `
    <p class="board-blurb">Questions you haven't seen before count toward points and accuracy. Repeats are for review.</p>
    <div class="split">
      <section class="panel pad">
        <h2>New exam</h2>
        <form data-form="startQuiz" class="form">
          <label>Cluster<select name="cluster"><option value="all">All clusters (${questions.length} questions)</option>${LB.CLUSTERS.map((c) => `<option value="${c.id}" ${!counts[c.id] ? "disabled" : ""}>${esc(c.name)} (${counts[c.id] || 0})</option>`).join("")}</select></label>
          <fieldset><legend>Length</legend>
            <div class="seg">${[10, 20, 50, 100].map((n, i) => `<label><input type="radio" name="len" value="${n}" ${i === 0 ? "checked" : ""}><span>${n === 100 ? "100, full exam" : n}</span></label>`).join("")}</div>
          </fieldset>
          <label class="check"><input type="checkbox" name="unseenFirst" checked> Start with questions I haven't seen</label>
          <div class="actions"><button class="btn">Start exam</button><span class="fine">${unseenAll} of ${questions.length} questions are new to you. Press 1 to 4 to answer and Enter to continue.</span></div>
        </form>
      </section>
      <aside>
        <section class="side-block">
          <h2>Accuracy by cluster</h2>
          ${Object.keys(byC).length ? meters(Object.entries(byC).sort((a, b) => b[1].a - a[1].a).map(([c, v]) => ({ name: LB.clusterName(c), note: `${v.c} of ${v.a}`, pct: v.a ? (v.c / v.a) * 100 : 0 }))) : `<p class="muted">Your accuracy shows up here after your first exam.</p>`}
        </section>
        <section class="side-block">
          <h2>Recent exams</h2>
          ${recent.length ? `<table class="plain"><tbody>${recent.map((a) => `<tr><td>${fmtDate(a.date)}</td><td>${esc(a.cluster === "all" ? "Mixed" : LB.clusterName(a.cluster))}</td><td class="num">${a.correct}/${a.total}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">None yet.</p>`}
        </section>
      </aside>
    </div>`;
  }
  const meters = (items, digits = 0) => `<ul class="meters">${items.map((m) => `<li><span class="m-name">${esc(m.name)}${m.note ? `<small>${esc(m.note)}</small>` : ""}</span><span class="m-bar"><i style="width:${Math.max(0, Math.min(100, m.pct)).toFixed(1)}%"></i></span><span class="m-val">${fmt(m.pct, digits)}%</span></li>`).join("")}</ul>`;

  function quizView() {
    const z = S.quiz;
    const q = z.qs[z.idx];
    const a = z.answers[z.idx];
    const L = ["A", "B", "C", "D", "E"];
    const answered = z.answers.filter(Boolean).length;
    const correctSoFar = z.answers.filter((x) => x && x.correct).length;
    return `<section class="quiz" tabindex="-1" aria-live="polite">
      <div class="quiz-top">
        <span>Question ${z.idx + 1} of ${z.qs.length}</span>
        <span>${esc(LB.clusterName(q.cluster))}</span>
        <span>${correctSoFar} of ${answered} correct</span>
      </div>
      <div class="progress" aria-hidden="true"><i style="width:${((z.idx + (a ? 1 : 0)) / z.qs.length) * 100}%"></i></div>
      <p class="q-status">${z.seen.has(q.id) ? "Seen before, so this one is review only" : "New question, counts toward your points"}</p>
      <h2 class="q">${esc(q.q)}</h2>
      <div class="opts">${q.options.map((o, i) => {
        let cls = "";
        if (a) cls = i === q.answer ? "correct" : i === a.choice ? "wrong" : "dim";
        return `<button class="opt ${cls}" data-action="answer" data-i="${i}" ${a ? "disabled" : ""}><span class="key">${L[i]}</span><span>${esc(o)}</span></button>`;
      }).join("")}</div>
      ${a ? `<div class="explain ${a.correct ? "good" : "bad"}"><b>${a.correct ? "Correct." : `The answer is ${L[q.answer]}.`}</b> ${esc(q.explanation || "")}</div>` : ""}
      <div class="quiz-foot">
        <button class="link" data-action="quitQuiz">End and save</button>
        ${a ? `<button class="btn" data-action="nextQ">${z.idx + 1 < z.qs.length ? "Next question" : "See results"}</button>` : ""}
      </div>
    </section>`;
  }
  function quizResults() {
    const z = S.quiz;
    const r = z.result;
    const p = r.total ? (r.correct / r.total) * 100 : 0;
    const L = ["A", "B", "C", "D", "E"];
    const wrong = z.answers.map((a, i) => ({ a, q: z.qs[i] })).filter((x) => x.a && !x.a.correct);
    return `<section class="results">
      <div class="result-head">
        <p class="result-score"><span class="big">${r.correct}/${r.total}</span><span>${fmt(p, 0)}% correct</span></p>
        <div>
          <h1>${fmt(r.points)} points earned</h1>
          <p class="muted">${r.firstCount === r.total ? "All questions were new, so they all counted." : `${plural(r.firstCount, "new question")} counted. ${r.total - r.firstCount} were review.`}</p>
          <div class="actions"><button class="btn" data-action="newQuiz">Start another exam</button><a class="btn secondary" href="#leaderboards" data-action="closeQuiz">View leaderboards</a></div>
        </div>
      </div>
      ${wrong.length ? `<h2>Questions you missed</h2><ol class="review">${wrong.map(({ a, q }) => `<li><p class="rq">${esc(q.q)}</p><p><span class="down">You chose ${L[a.choice]}:</span> ${esc(q.options[a.choice])}</p><p><span class="up">Answer ${L[q.answer]}:</span> ${esc(q.options[q.answer])}</p>${q.explanation ? `<p class="muted">${esc(q.explanation)}</p>` : ""}</li>`).join("")}</ol>` : `<p class="notice">No misses. Try a longer exam or a different cluster.</p>`}
    </section>`;
  }
  async function startQuiz(form) {
    const fd = new FormData(form);
    const cluster = fd.get("cluster");
    const len = Number(fd.get("len"));
    const unseenFirst = !!fd.get("unseenFirst");
    const [questions, seen] = await Promise.all([S.be.listQuestions(), S.be.getSeen()]);
    const pool = questions.filter((q) => cluster === "all" || q.cluster === cluster).filter((q) => Array.isArray(q.options) && q.options.length >= 2);
    if (!pool.length) return toast("That cluster has no questions yet.", "bad");
    const qs = unseenFirst ? [...shuffle(pool.filter((q) => !seen.has(q.id))), ...shuffle(pool.filter((q) => seen.has(q.id)))].slice(0, len) : shuffle(pool).slice(0, len);
    S.quiz = { qs, idx: 0, answers: [], seen, cluster, done: false };
    render();
  }
  function answerQ(i) {
    const z = S.quiz;
    if (!z || z.answers[z.idx]) return;
    const q = z.qs[z.idx];
    if (i < 0 || i >= q.options.length) return;
    z.answers[z.idx] = { qid: q.id, choice: i, correct: i === Number(q.answer), first: !z.seen.has(q.id), cluster: q.cluster };
    render();
  }
  async function finishQuiz() {
    const z = S.quiz;
    const ans = z.answers.filter(Boolean);
    if (!ans.length) { S.quiz = null; render(); return; }
    const first = ans.filter((a) => a.first);
    const byCluster = {};
    first.forEach((a) => { const b = (byCluster[a.cluster] = byCluster[a.cluster] || { a: 0, c: 0 }); b.a++; if (a.correct) b.c++; });
    const date = LB.today();
    const attempt = {
      date, season: LB.seasonFor(date, S.settings), cluster: z.cluster, total: ans.length, correct: ans.filter((a) => a.correct).length,
      firstCount: first.length, firstCorrect: first.filter((a) => a.correct).length, byCluster, createdAt: Date.now()
    };
    try { await S.be.recordExam(attempt, first.map((a) => a.qid)); }
    catch (e) { console.error(e); toast("Your results weren't saved: " + e.message, "bad"); return; }
    z.qs = z.qs.slice(0, ans.length);
    z.done = true;
    z.result = { ...attempt, points: attempt.firstCorrect * S.settings.points.examPerCorrect };
    invalidate();
    render();
  }

  /* ---------------- MY PROGRESS ---------------- */
  async function pageMe() {
    const d = await loadData();
    const s = S.settings;
    const [feedback, attempts] = await Promise.all([S.be.getFeedback(S.me.uid), S.be.listMyAttempts()]);
    const myRps = d.roleplays.filter((r) => r.memberUid === S.me.uid).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : (b.createdAt || 0) - (a.createdAt || 0)));
    const pb = LB.markPersonalBests(d.roleplays);
    const season = LB.currentSeasonId(s);
    const rowS = LB.computeRows({ ...d, settings: s, season, includeHidden: true }).find((x) => x.uid === S.me.uid);
    const rowA = LB.computeRows({ ...d, settings: s, season: "all", includeHidden: true }).find((x) => x.uid === S.me.uid);
    const sections = LB.sectionBreakdown(myRps);
    const crit = LB.criteriaBreakdown(myRps).sort((a, b) => a.avg - b.avg);
    const pis = LB.piBreakdown(myRps).sort((a, b) => a.avg - b.avg);
    const trend = myRps.slice().reverse().map((r) => LB.pct(r));
    const prof = d.profiles[S.me.uid] || S.me;

    return `
    ${pageTitle("My Progress", "Your judge feedback, where you lose points, and your exam history.")}
    <dl class="figures wide">
      <div><dt>${esc(seasonName(season))} points</dt><dd>${rowS ? fmt(rowS.total) : "0"}</dd></div>
      <div><dt>All-time points</dt><dd>${rowA ? fmt(rowA.total) : "0"}</dd></div>
      <div><dt>Roleplay average</dt><dd>${rowA && rowA.rpCount ? fmt(rowA.rpAvg) + "%" : "–"}</dd><small>${plural(myRps.length, "roleplay")}${rowA && rowA.pbCount ? `, ${plural(rowA.pbCount, "personal best")}` : ""}</small></div>
      <div><dt>Exam accuracy</dt><dd>${rowA && rowA.answered ? fmt(rowA.examAcc) + "%" : "–"}</dd><small>${plural(rowA ? rowA.answered : 0, "question")}</small></div>
    </dl>

    <div class="split">
      <section class="panel pad">
        <h2>Where your roleplay points go</h2>
        ${myRps.length ? `${meters(sections.map((x) => ({ name: x.name, pct: x.avg })))}
          <h3>Lowest-scoring criteria</h3>${meters(crit.slice(0, 4).map((c) => ({ name: c.name, note: c.section, pct: c.avg })))}
          ${pis.length ? `<h3>Lowest-scoring PIs</h3>${meters(pis.slice(0, 5).map((p) => ({ name: p.name, note: p.n > 1 ? `${p.n} times` : "", pct: p.avg })))}` : ""}`
          : `<p class="muted">After your first roleplay you'll see which parts of the judge's form you score lowest on.</p>`}
      </section>
      <aside>
        <section class="side-block">
          <h2>Score trend</h2>
          ${trend.length >= 2 ? sparkline(trend) : `<p class="muted">Shows up after two roleplays.</p>`}
        </section>
        <section class="side-block">
          <h2>Profile</h2>
          <form data-form="profile" class="form">${profileFields(prof)}<div class="actions"><button class="btn">Save profile</button></div></form>
        </section>
      </aside>
    </div>

    <section class="block">
      <div class="block-head"><h2>Roleplays</h2><a href="${esc(s.signupSheetUrl)}" target="_blank" rel="noopener">Book another roleplay</a></div>
      ${myRps.length ? `<div class="rp-list">${myRps.map((r) => rpCard(r, feedback[r.id], pb[r.id])).join("")}</div>` : `<p class="empty">No roleplays yet. Sign up on the roleplay sheet to do one with an exec.</p>`}
    </section>

      <section class="block">
        <h2>Exams</h2>
        ${attempts.length ? `<table class="plain"><thead><tr><th>Date</th><th>Cluster</th><th class="num">Score</th><th class="num">Points</th></tr></thead><tbody>${attempts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 15).map((a) => `<tr><td>${fmtDate(a.date)}</td><td>${esc(a.cluster === "all" ? "Mixed" : LB.clusterName(a.cluster))}</td><td class="num">${a.correct}/${a.total}</td><td class="num">${fmt(a.firstCorrect * s.points.examPerCorrect)}</td></tr>`).join("")}</tbody></table>` : `<p class="muted">No practice exams yet. <a href="#practice" data-action="practiceTab" data-id="exams">Start one</a>.</p>`}
      </section>`;
  }
  function rpCard(r, fb, isPB) {
    const p = LB.pct(r);
    const groups = {};
    (r.criteria || []).forEach((x) => (groups[x.section] = groups[x.section] || []).push(x));
    const row = (label, x) => `<tr><td>${esc(label)}</td><td class="lvl lvl-${x.band ?? ""}">${esc(bandName(x.band))}</td><td class="num">${x.score}/${x.max}</td></tr>`;
    return `<details class="rp">
      <summary>
        <time>${fmtDate(r.date)}</time>
        <span class="rp-ev"><b>${esc(evCode(r.event))}</b> ${esc(r.area || evName(r.event))}${r.teamId ? ", team" : ""}</span>
        ${isPB ? `<span class="pb">Personal best</span>` : ""}
        <span class="rp-score">${fmt(p)}%</span>
      </summary>
      <div class="rp-body">
        ${fb ? `<blockquote class="feedback"><p>${esc(fb)}</p><cite>${esc(nameOf(r.judgeUid))}</cite></blockquote>` : `<p class="muted">Judged by ${esc(nameOf(r.judgeUid))}.</p>`}
        <table class="plain breakdown">
          <tbody><tr class="sec"><th colspan="3">Performance indicators</th></tr>
          ${(r.pis || []).map((x, i) => row(x.name || `PI ${i + 1}`, x)).join("")}
          ${Object.entries(groups).map(([sec, items]) => `<tr class="sec"><th colspan="3">${esc(sec)}</th></tr>${items.map((x) => row(x.name, x)).join("")}`).join("")}
          <tr class="total"><td>Total</td><td></td><td class="num">${r.total}/${r.maxTotal}</td></tr></tbody>
        </table>
      </div>
    </details>`;
  }
  function sparkline(vals) {
    const w = 360, h = 120, padX = 10, padY = 18;
    const min = Math.max(0, Math.floor((Math.min(...vals) - 8) / 10) * 10), max = Math.min(100, Math.ceil((Math.max(...vals) + 4) / 10) * 10);
    const x = (i) => padX + (i * (w - padX * 2)) / Math.max(1, vals.length - 1);
    const y = (v) => h - padY - ((v - min) / Math.max(1, max - min)) * (h - padY * 2);
    const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const last = vals.length - 1;
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="Roleplay scores in order: ${vals.map((v) => Math.round(v)).join(", ")}">
      <line x1="${padX}" x2="${w - padX}" y1="${y(min)}" y2="${y(min)}" class="base"/>
      <text x="${padX}" y="${y(min) + 14}" class="axis">${min}%</text>
      <polyline points="${pts}" class="line"/>
      ${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${i === last ? 4.5 : 3}" class="${i === last ? "last" : ""}"/>`).join("")}
      <text x="${x(last)}" y="${y(vals[last]) - 10}" text-anchor="end" class="val">${fmt(vals[last])}%</text>
    </svg>`;
  }

  /* ---------------- EXEC ---------------- */
  async function pageExec() {
    const tab = S.ui.execTab;
    const [d, users] = await Promise.all([loadData(), S.be.listUsers()]);
    const pending = users.filter((u) => !u.approved);
    const list = [["roleplay", "Score a roleplay"], ["approvals", `Approvals${pending.length ? ` <span class="count">${pending.length}</span>` : ""}`], ["questions", "Question bank"], ["recent", "Recent and calibration"]];
    let body = "";
    if (tab === "roleplay") body = execRoleplay(users);
    else if (tab === "approvals") body = execApprovals(pending);
    else if (tab === "questions") body = await execQuestions();
    else body = execRecent(d);
    return `${pageTitle("Exec tools")}${tabs(list, tab, "execTab")}${body}`;
  }
  function memberOptions(users, selected) {
    return users.filter((u) => u.approved).sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""))
      .map((u) => `<option value="${esc(u.uid)}" data-event="${esc(u.event || "")}" ${selected === u.uid ? "selected" : ""}>${esc(u.displayName)}${u.event ? ` (${esc(u.event)})` : ""}</option>`).join("");
  }
  function execRoleplay(users) {
    return `<form data-form="logRoleplay" class="scoresheet" autocomplete="off">
      <section class="panel pad sheet-meta">
        <div class="row3">
          <label>Participant<select name="member" required data-change="rpMember"><option value="">Choose a member</option>${memberOptions(users)}</select></label>
          <label>Event<select name="event" required data-change="rpEvent"><option value="">Choose an event</option>${eventOptions("")}</select></label>
          <label id="partnerWrap" class="hidden">Partner<select name="partner"><option value="">No partner</option>${memberOptions(users)}</select></label>
        </div>
        <div class="row3">
          <label>Instructional area<input name="area" maxlength="80" placeholder="e.g. Communication Skills"></label>
          <label>Date<input type="date" name="date" value="${LB.today()}" required></label>
          <label>Format<select name="mode"><option value="online">Online</option><option value="in-person">In person</option></select></label>
        </div>
      </section>
      <div id="rubric"><p class="empty">Choose an event to load its judge's evaluation form.</p></div>
      <section class="panel pad">
        <label>Feedback for the participant<textarea name="feedback" rows="3" placeholder="What worked, and the one thing to fix before the next roleplay"></textarea><small>Only the participant and execs can read this.</small></label>
      </section>
      <div class="sheet-foot"><span id="rbTotal" class="sheet-total">Total score</span><button class="btn">Save roleplay</button></div>
    </form>`;
  }
  function chipRow(field, bandsStr) {
    const bands = LB.parseBands(bandsStr);
    return bands.map((b, bi) => {
      const nums = [];
      for (let v = b[0]; v <= b[1]; v++) nums.push(v);
      return `<td class="band" data-label="${bandName(bi)}"><span class="chips">${nums.map((v) => `<button type="button" class="chip" data-action="pick" data-field="${field}" data-v="${v}" aria-label="${bandName(bi)} ${v}">${v}</button>`).join("")}</span></td>`;
    }).join("") + (bands.length < 4 ? `<td class="band"></td>`.repeat(4 - bands.length) : "");
  }
  function rubricHtml(type) {
    const t = S.settings.rubrics[type] || S.settings.rubrics.series;
    const piMax = LB.bandMax(t.piBands);
    let n = 0;
    const sections = [];
    t.criteria.forEach((c, j) => { let sec = sections.find((x) => x.name === c.section); if (!sec) sections.push((sec = { name: c.section, items: [] })); sec.items.push({ ...c, j }); });
    const secMax = (items) => items.reduce((a, c) => a + LB.bandMax(c.bands), 0);
    let h = `<input type="hidden" name="rbType" value="${esc(type)}">
      <section class="panel sheet-wrap">
      <div class="sheet-title"><h2>${esc(t.label)} judge's evaluation form</h2><span class="fine">${LB.rubricMax(t)} points</span></div>
      <details class="paste"><summary>Paste the PIs from the roleplay</summary><textarea data-paste-pis rows="4" placeholder="One performance indicator per line"></textarea></details>
      <table class="sheet">
      <thead><tr><th>Rate the participant's ability to</th>${LB.BAND_NAMES.map((b) => `<th>${b}</th>`).join("")}<th class="num">Score</th></tr></thead>
      <tbody>
      <tr class="sec"><th colspan="5">Performance indicators</th><td class="num sec-sum" data-sec="pi" data-max="${t.piCount * piMax}"></td></tr>`;
    for (let i = 0; i < t.piCount; i++) {
      n++;
      h += `<tr class="item" data-row="piScore${i}"><td class="crit"><div class="crit-in"><span class="no">${n}</span><input name="piName${i}" placeholder="Performance indicator" aria-label="Performance indicator ${i + 1}"></div></td>${chipRow("piScore" + i, t.piBands)}<td class="num val"><input type="hidden" name="piScore${i}" class="rb-score" data-max="${piMax}" data-sec="pi"><output>–</output></td></tr>`;
    }
    sections.forEach((sec, si) => {
      h += `<tr class="sec"><th colspan="5">${esc(sec.name)}</th><td class="num sec-sum" data-sec="s${si}" data-max="${secMax(sec.items)}"></td></tr>`;
      sec.items.forEach((c) => {
        n++;
        h += `<tr class="item" data-row="crScore${c.j}"><td class="crit"><div class="crit-in"><span class="no">${n}</span><span class="crit-text"><b>${esc(c.name)}</b>${c.desc ? `<small>${esc(c.desc)}</small>` : ""}</span></div></td>${chipRow("crScore" + c.j, c.bands)}<td class="num val"><input type="hidden" name="crScore${c.j}" class="rb-score" data-max="${LB.bandMax(c.bands)}" data-sec="s${si}"><output>–</output></td></tr>`;
      });
    });
    return h + `</tbody></table></section>`;
  }
  function updateSheetTotals() {
    const el = document.getElementById("rbTotal");
    if (!el) return;
    const inputs = [...document.querySelectorAll(".rb-score")];
    if (!inputs.length) { el.textContent = "Total score"; return; }
    let tot = 0, max = 0, left = 0;
    const secs = {};
    inputs.forEach((i) => {
      const m = Number(i.dataset.max);
      max += m;
      const sec = (secs[i.dataset.sec] = secs[i.dataset.sec] || 0);
      if (i.value === "") { left++; return; }
      tot += Number(i.value);
      secs[i.dataset.sec] = sec + Number(i.value);
    });
    document.querySelectorAll(".sec-sum").forEach((c) => (c.textContent = `${secs[c.dataset.sec] || 0}/${c.dataset.max}`));
    el.innerHTML = `Total <b>${tot}</b> of ${max}${left ? `<span class="fine">${plural(left, "row")} left to score</span>` : `<span class="fine">${fmt((tot / max) * 100)}%</span>`}`;
  }
  function pickScore(field, v) {
    const input = document.querySelector(`[name="${field}"]`);
    if (!input) return;
    input.value = v;
    const row = input.closest("tr");
    row.classList.remove("missing");
    row.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(Number(c.dataset.v) === v)));
    row.querySelector("output").textContent = v;
    updateSheetTotals();
  }
  async function saveRoleplay(form) {
    const fd = new FormData(form);
    const member = fd.get("member"), event = fd.get("event"), partner = fd.get("partner");
    if (!member || !event) return toast("Choose a participant and an event.", "bad");
    const type = fd.get("rbType");
    const t = S.settings.rubrics[type] || S.settings.rubrics.series;
    const missing = [...form.querySelectorAll(".rb-score")].filter((i) => i.value === "");
    if (missing.length) {
      missing.forEach((i) => i.closest("tr").classList.add("missing"));
      missing[0].closest("tr").scrollIntoView({ block: "center", behavior: "smooth" });
      return toast(`Score every row before saving. ${plural(missing.length, "row")} left.`, "bad");
    }
    const item = (bandsStr, v) => { const bands = LB.parseBands(bandsStr); const max = bands[bands.length - 1][1]; const score = Math.max(0, Math.min(max, Math.round(Number(v) || 0))); return { score, max, band: LB.bandIndex(score, bands) }; };
    const pis = [];
    for (let i = 0; i < t.piCount; i++) pis.push({ name: String(fd.get("piName" + i) || "").trim().slice(0, 140), ...item(t.piBands, fd.get("piScore" + i)) });
    const criteria = t.criteria.map((c, j) => ({ section: c.section, name: c.name, ...item(c.bands, fd.get("crScore" + j)) }));
    const total = [...pis, ...criteria].reduce((a, x) => a + x.score, 0);
    const maxTotal = [...pis, ...criteria].reduce((a, x) => a + x.max, 0);
    const base = { event, area: String(fd.get("area") || "").trim().slice(0, 80), date: fd.get("date") || LB.today(), mode: fd.get("mode"), pis, criteria, total, maxTotal, judgeUid: S.me.uid };
    const members = [member];
    if ((LB.eventByCode(event) || {}).type === "tdm" && partner && partner !== member) members.push(partner);
    const teamId = members.length > 1 ? "t_" + Date.now().toString(36) : null;
    const btn = form.querySelector(".sheet-foot .btn");
    btn.disabled = true;
    try {
      await S.be.addRoleplays(members.map((m) => ({ ...base, memberUid: m, teamId })), String(fd.get("feedback") || "").trim().slice(0, 2000));
      invalidate();
      toast(`Roleplay saved: ${total}/${maxTotal}${members.length > 1 ? " for both partners" : ""}.`);
      render();
    } catch (e) { console.error(e); toast("The roleplay wasn't saved: " + e.message, "bad"); btn.disabled = false; }
  }
  function execApprovals(pending) {
    return `<section class="block">
      <p class="muted">When a member tells you the email they signed up with, find it here and approve it. Approved members can see the leaderboards and the question bank.</p>
      ${pending.length ? `<table class="plain"><thead><tr><th>Email</th><th>Name</th><th>Grade</th><th></th></tr></thead><tbody>${pending.map((u) => `<tr><td><b>${esc(u.email || "")}</b></td><td>${esc(u.displayName || "Not set")}</td><td>${esc(u.grade || "")}</td><td class="num"><button class="btn small" data-action="approve" data-id="${esc(u.uid)}">Approve</button>${isAdmin() ? ` <button class="del" data-action="delMember" data-id="${esc(u.uid)}">Remove</button>` : ""}</td></tr>`).join("")}</tbody></table>` : `<p class="empty">No one is waiting for approval.</p>`}
    </section>`;
  }
  async function execQuestions() {
    const qs = await S.be.listQuestions();
    const { qCluster, qSearch } = S.ui;
    const filtered = qs.filter((q) => (qCluster === "all" || q.cluster === qCluster) && (!qSearch || (q.q || "").toLowerCase().includes(qSearch.toLowerCase())));
    const L = ["A", "B", "C", "D"];
    return `<div class="split even">
      <section class="panel pad">
        <h2>Add a question</h2>
        <form data-form="addQuestion" class="form">
          <label>Cluster<select name="cluster" required>${clusterOptions("", false)}</select></label>
          <label>Question<textarea name="q" rows="2" required></textarea></label>
          <fieldset><legend>Options (select the correct one)</legend>
          ${L.map((l, i) => `<label class="opt-input"><input type="radio" name="answer" value="${i}" ${i === 0 ? "checked" : ""} aria-label="${l} is correct"><span>${l}</span><input name="opt${i}" ${i < 2 ? "required" : ""} placeholder="${i >= 2 ? "Optional" : ""}"></label>`).join("")}
          </fieldset>
          <label>Explanation<input name="explanation" placeholder="Optional"></label>
          <label>Source<input name="source" placeholder="e.g. 2025 Marketing Cluster Exam"></label>
          <div class="actions"><button class="btn">Add question</button></div>
        </form>
      </section>
      <section class="panel pad">
        <h2>Import from a spreadsheet</h2>
        <p class="muted">Save a sheet as CSV with the columns <code>cluster, question, A, B, C, D, answer, explanation, source</code>. Cluster is one of ${LB.CLUSTERS.map((c) => c.id).join(", ")} or its full name, and answer is a letter from A to D.</p>
        <form data-form="importCsv" class="form">
          <input type="file" accept=".csv,text/csv" data-change="csvFile" aria-label="CSV file">
          <textarea name="csv" rows="7" placeholder="Or paste CSV rows here"></textarea>
          <div class="actions"><button class="btn">Import questions</button><button type="button" class="link" data-action="csvTemplate">Download a template</button></div>
        </form>
        <p class="notice small">Past DECA exams are copyrighted by DECA Inc. and MBA Research. Only approved members can see the bank, but check with your advisor before uploading official exams.</p>
      </section>
    </div>
    <section class="block">
      <div class="block-head"><h2>Question bank <span class="muted">${filtered.length} of ${qs.length}</span></h2>
        <div class="tools"><select data-change="qCluster" aria-label="Cluster">${clusterOptions(qCluster)}</select><input type="search" placeholder="Search questions" value="${esc(qSearch)}" data-change="qSearch" aria-label="Search questions"></div></div>
      ${filtered.length ? `<ol class="qlist">${filtered.slice(0, 200).map((q) => `<li><div><p>${esc(q.q)}</p><p class="muted">${esc(LB.clusterName(q.cluster))}. Answer ${L[q.answer] || "?"}: ${esc((q.options || [])[q.answer] || "")}${q.source ? `. ${esc(q.source)}` : ""}</p></div><button class="del" data-action="delQ" data-id="${esc(q.id)}">Delete</button></li>`).join("")}</ol>${filtered.length > 200 ? `<p class="muted">Showing the first 200. Search to narrow the list.</p>` : ""}` : `<p class="empty">No questions match.</p>`}
    </section>`;
  }
  function execRecent(d) {
    const all = d.roleplays;
    const chapterAvg = all.length ? all.reduce((a, r) => a + LB.pct(r), 0) / all.length : 0;
    const judges = {};
    all.forEach((r) => { const j = (judges[r.judgeUid] = judges[r.judgeUid] || { n: 0, sum: 0 }); j.n++; j.sum += LB.pct(r); });
    const recent = all.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 30);
    return `<div class="split even">
      <section class="block">
        <h2>Judge calibration</h2>
        <p class="muted">Average score each exec gives, compared with the chapter average of ${fmt(chapterAvg)}% across ${plural(all.length, "roleplay")}. A gap of 5 or more is worth talking about, for example by all scoring the same recorded roleplay.</p>
        <table class="plain"><thead><tr><th>Judge</th><th class="num">Scored</th><th class="num">Average</th><th class="num">Gap</th></tr></thead><tbody>
          ${Object.entries(judges).sort((a, b) => b[1].n - a[1].n).map(([uid, j]) => { const avg = j.sum / j.n, diff = avg - chapterAvg; return `<tr><td>${esc(nameOf(uid))}</td><td class="num">${j.n}</td><td class="num">${fmt(avg)}%</td><td class="num ${Math.abs(diff) >= 5 ? (diff > 0 ? "up" : "down") : ""}">${diff >= 0 ? "+" : "−"}${fmt(Math.abs(diff))}</td></tr>`; }).join("")}
        </tbody></table>
      </section>
      <section class="block">
        <h2>Recent roleplays</h2>
        ${recent.length ? `<table class="plain"><thead><tr><th>Date</th><th>Participant</th><th>Event</th><th class="num">Score</th><th>Judge</th><th></th></tr></thead><tbody>${recent.map((r) => `<tr><td>${fmtDate(r.date)}</td><td>${esc(nameOf(r.memberUid))}</td><td>${esc(evCode(r.event))}</td><td class="num">${r.total}/${r.maxTotal}</td><td>${esc(firstName(nameOf(r.judgeUid)))}</td><td class="num"><button class="del" data-action="delRp" data-id="${esc(r.id)}">Delete</button></td></tr>`).join("")}</tbody></table>` : `<p class="muted">None yet.</p>`}
      </section>
    </div>`;
  }

  /* ---------------- ADMIN ---------------- */
  async function pageAdmin() {
    const tab = S.ui.adminTab;
    let body = "";
    if (tab === "settings") body = adminSettings();
    else if (tab === "members") body = adminMembers(await S.be.listUsers());
    else body = adminExport();
    return `${pageTitle("Admin", "Point changes apply to past activity too, because leaderboards are recalculated from the raw scores.")}${tabs([["settings", "Settings"], ["members", "Members and roles"], ["export", "Backups"]], tab, "adminTab")}${body}`;
  }
  function adminSettings() {
    const s = S.ui.draft || JSON.parse(JSON.stringify(S.settings));
    const P = s.points, M = s.mins;
    const num = (name, val, step = "any") => `<input type="number" name="${name}" value="${esc(val)}" step="${step}" min="0" required>`;
    return `<form data-form="settings" class="form settings">
      <section class="panel pad">
        <h2>General</h2>
        <label>Roleplay signup sheet<input type="url" name="signupSheetUrl" value="${esc(s.signupSheetUrl)}"></label>
        <label class="check"><input type="checkbox" name="requireApproval" ${s.requireApproval ? "checked" : ""}> New accounts need exec approval. Keep this on to protect the question bank.</label>
      </section>
      <section class="panel pad">
        <h2>Points</h2>
        <div class="row3">
          <label>Points per roleplay${num("rpAttend", P.rpAttend)}</label>
          <label>Divide the score by${num("rpScoreDiv", P.rpScoreDiv)}<small>With 10, an 85% roleplay adds 8.5.</small></label>
          <label>Personal best bonus${num("rpPbBonus", P.rpPbBonus)}</label>
        </div>
        <div class="row3"><label>Per first-try correct exam answer${num("examPerCorrect", P.examPerCorrect)}</label></div>
        <h3>Minimums for the skill boards</h3>
        <div class="row3">
          <label>Roleplay average: roleplays${num("minRp", M.rpAvg, 1)}</label>
          <label>Exam accuracy: questions${num("minExam", M.examAcc, 1)}</label>
          <label>Most improved: roleplays${num("minImp", M.improvedMin, 1)}</label>
        </div>
      </section>
      <section class="panel pad">
        <div class="block-head"><h2>Seasons</h2><button type="button" class="btn secondary small" data-action="addSeason">Add season</button></div>
        <p class="muted">The leaderboards open on whichever season today falls in.</p>
        <div class="rows">${s.seasons.map((x, i) => `<div class="row-edit"><input type="hidden" name="sid${i}" value="${esc(x.id)}"><label>Name<input name="sname${i}" value="${esc(x.name)}" required></label><label>Starts<input type="date" name="sstart${i}" value="${esc(x.start)}" required></label><label>Ends<input type="date" name="send${i}" value="${esc(x.end)}" required></label><button type="button" class="del" data-action="delSeason" data-i="${i}">Remove</button></div>`).join("")}</div>
      </section>
      <section class="panel pad">
        <div class="block-head"><h2>Key dates</h2><button type="button" class="btn secondary small" data-action="addDate">Add date</button></div>
        <div class="rows">${(s.keyDates || []).map((k, i) => `<div class="row-edit two"><label>Label<input name="klabel${i}" value="${esc(k.label)}" required></label><label>Date<input type="date" name="kdate${i}" value="${esc(k.date)}" required></label><button type="button" class="del" data-action="delDate" data-i="${i}">Remove</button></div>`).join("")}</div>
      </section>
      <section class="panel pad">
        <h2>Judge's evaluation forms</h2>
        <p class="muted">Set up to match the 2026 DECA forms. Score ranges are written Novice, Developing, Proficient, Exemplary, for example <code>0-3, 4-7, 8-11, 12</code>. Each criterion is one line: <code>Section | Name | ranges | description</code>.</p>
        <div class="rubric-edits">${Object.entries(s.rubrics).map(([k, r]) => `<div class="rubric-edit"><h3>${esc(r.label || k)}</h3>
          <div class="row2"><label>Number of PIs${num("rb_" + k + "_count", r.piCount, 1)}</label><label>PI score ranges<input name="rb_${k}_bands" value="${esc(r.piBands)}" required></label></div>
          <label>Criteria<textarea name="rb_${k}_criteria" rows="8" spellcheck="false">${esc(r.criteria.map((c) => [c.section, c.name, c.bands, c.desc || ""].join(" | ")).join("\n"))}</textarea></label>
          <p class="fine">Total ${LB.rubricMax(r)} points</p></div>`).join("")}</div>
      </section>
      <div class="sheet-foot"><span>${S.ui.draft ? "Unsaved changes" : ""}</span><span class="actions">${S.ui.draft ? `<button type="button" class="link" data-action="discardDraft">Discard changes</button>` : ""}<button class="btn">Save settings</button></span></div>
    </form>`;
  }
  function readSettingsForm(form) {
    const fd = new FormData(form);
    const s = JSON.parse(JSON.stringify(S.ui.draft || S.settings));
    const n = (k) => Number(fd.get(k));
    s.signupSheetUrl = String(fd.get("signupSheetUrl") || "").trim();
    s.requireApproval = !!fd.get("requireApproval");
    s.points = { rpAttend: n("rpAttend"), rpScoreDiv: Math.max(0.1, n("rpScoreDiv")), rpPbBonus: n("rpPbBonus"), examPerCorrect: n("examPerCorrect") };
    s.mins = { rpAvg: Math.round(n("minRp")), examAcc: Math.round(n("minExam")), improvedMin: Math.max(2, Math.round(n("minImp"))) };
    s.seasons = s.seasons.map((x, i) => ({ id: fd.get("sid" + i) || x.id, name: String(fd.get("sname" + i) || "").trim(), start: fd.get("sstart" + i), end: fd.get("send" + i) }));
    s.keyDates = (s.keyDates || []).map((k, i) => ({ label: String(fd.get("klabel" + i) || "").trim(), date: fd.get("kdate" + i) }));
    Object.keys(s.rubrics).forEach((k) => {
      const r = s.rubrics[k];
      r.piCount = Math.max(1, Math.min(12, Math.round(n("rb_" + k + "_count"))));
      r.piBands = String(fd.get("rb_" + k + "_bands") || r.piBands).trim();
      const lines = String(fd.get("rb_" + k + "_criteria") || "").split("\n").map((l) => l.trim()).filter(Boolean);
      r.criteria = lines.map((l) => { const [section, name, bands, desc] = l.split("|").map((x) => (x || "").trim()); return { section: section || "Other", name: name || "Criterion", bands: bands || "0-1, 2-3, 4-5, 6", desc: desc || "" }; });
    });
    return s;
  }
  function adminMembers(users) {
    users.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
    return `<section class="panel">
      <table class="plain members"><thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Approved</th><th></th></tr></thead><tbody>
      ${users.map((u) => { const self = u.uid === S.me.uid; return `<tr><td><b>${esc(u.displayName || "Not set")}</b><br><span class="muted">${esc(memberMeta(u))}</span></td><td>${esc(u.email || "")}</td>
        <td><select data-change="setRole" data-id="${esc(u.uid)}" ${self ? "disabled" : ""} aria-label="Role">${[["member", "Member"], ["exec", "Exec"], ["admin", "Admin"]].map(([r, l]) => `<option value="${r}" ${u.role === r ? "selected" : ""}>${l}</option>`).join("")}</select></td>
        <td><input type="checkbox" data-change="setApproved" data-id="${esc(u.uid)}" ${u.approved ? "checked" : ""} ${self ? "disabled" : ""} aria-label="Approved"></td>
        <td class="num">${self ? "" : `<button class="del" data-action="delMember" data-id="${esc(u.uid)}">Remove</button>`}</td></tr>`; }).join("")}
      </tbody></table>
    </section>
    <p class="muted">Removing an account deletes the login and profile. Their logged roleplays stay in the database but no longer show on the leaderboards.</p>`;
  }
  function adminExport() {
    return `<section class="panel pad">
      <h2>Backups</h2>
      <p class="muted">Download everything (settings, members, roleplays, feedback, questions and exam totals) as one backup file, or this season's leaderboard as a spreadsheet. Download a backup at the end of each season.</p>
      <div class="actions"><button class="btn" data-action="exportJson">Download backup</button><button class="btn secondary" data-action="exportCsv">Download leaderboard (CSV)</button></div>
      ${S.be.mode === "demo" ? `<p class="fine">Downloads may be blocked inside the demo preview. They work on the live site.</p>` : ""}
    </section>`;
  }

  /* ---------------- CSV ---------------- */
  function parseCsv(text) {
    const rows = []; let row = [], cur = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim() !== ""));
  }
  function csvToQuestions(text) {
    const rows = parseCsv(text);
    const out = [], errors = [];
    rows.forEach((r, i) => {
      const [cl, q, a, b, c, d, ans, expl, src] = r.map((x) => (x || "").trim());
      if (i === 0 && /^cluster$/i.test(cl)) return;
      const cluster = (LB.CLUSTERS.find((x) => x.id.toLowerCase() === (cl || "").toLowerCase() || x.name.toLowerCase() === (cl || "").toLowerCase()) || {}).id;
      const options = [a, b, c, d].filter((x) => x);
      const answer = "ABCD".indexOf((ans || "").toUpperCase().charAt(0));
      if (!cluster) return errors.push(`Row ${i + 1}: "${cl}" isn't a cluster`);
      if (!q || options.length < 2) return errors.push(`Row ${i + 1}: needs a question and at least two options`);
      if (answer < 0 || answer >= options.length) return errors.push(`Row ${i + 1}: answer must be a letter from A to ${"ABCD"[options.length - 1]}`);
      out.push({ cluster, q, options, answer, explanation: expl || "", source: src || "" });
    });
    return { out, errors };
  }
  const csvCell = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

  /* ---------------- events ---------------- */
  async function onClick(e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const a = el.dataset.action, id = el.dataset.id;
    const run = async (fn, okMsg) => { try { await fn(); if (okMsg) toast(okMsg); } catch (err) { console.error(err); toast(err.message || String(err), "bad"); } };
    switch (a) {
      case "authMode": { const f = el.closest("form"); const em = f && f.querySelector('[name="email"]'); if (em) S.ui.authEmail = em.value; S.ui.authMode = id; return render(); }
      case "demoFill": { const f = el.closest("form"); f.querySelector('[name="email"]').value = "maya.thompson@example.com"; f.querySelector('[name="password"]').value = "demo"; return; }
      case "signOut": S.quiz = null; S.ui.authMode = "signin"; return run(() => S.be.signOut());
      case "reload": invalidate(); if (S.be.mode === "live") location.reload(); else render(); return;
      case "clearBlocked": S.me = null; return render();
      case "resetDemo": if (await ask("Reset the demo back to the sample data?", "Reset demo")) { S.quiz = null; S.ui.draft = null; invalidate(); S.be.resetDemo(); } return;
      case "refresh": invalidate(); return render();
      case "board": S.ui.board = id; return render();
      case "execTab": S.ui.execTab = id; return render();
      case "adminTab": S.ui.adminTab = id; return render();
      case "practiceTab": S.ui.practiceTab = id; if (location.hash.replace(/^#\/?/, "") === "practice") render(); return;
      case "pick": return pickScore(el.dataset.field, Number(el.dataset.v));
      case "answer": return answerQ(Number(el.dataset.i));
      case "nextQ": if (S.quiz.idx + 1 < S.quiz.qs.length) { S.quiz.idx++; render(); } else finishQuiz(); return;
      case "quitQuiz": return finishQuiz();
      case "newQuiz": S.quiz = null; return render();
      case "closeQuiz": S.quiz = null; return;
      case "approve": return run(async () => { await S.be.setUserFields(id, { approved: true }); invalidate(); render(); }, "Member approved.");
      case "delMember": if (!(await ask(S.be.mode === "live" ? "Remove this member from the site? To free up their email so it can sign up again, also delete it in Firebase under Authentication, then Users." : "Remove this account?", "Remove"))) return; return run(async () => { await S.be.deleteMember(id); invalidate(); render(); }, "Account removed.");
      case "delRp": if (!(await ask("Delete this roleplay? For team roleplays, each partner's record is deleted separately.", "Delete"))) return; return run(async () => { await S.be.deleteRoleplay(id); invalidate(); render(); }, "Roleplay deleted.");
      case "delQ": if (!(await ask("Delete this question?", "Delete"))) return; return run(async () => { await S.be.deleteQuestion(id); render(); }, "Question deleted.");
      case "csvTemplate": return download("question-template.csv", "cluster,question,A,B,C,D,answer,explanation,source\nMKT,Which is NOT one of the four Ps?,Product,Price,Promotion,Profit,D,\"The four Ps are Product, Price, Place and Promotion.\",Sample\n", "text/csv");
      case "addSeason": case "delSeason": case "addDate": case "delDate": {
        const s = readSettingsForm(el.closest("form"));
        if (a === "addSeason") { const last = s.seasons[s.seasons.length - 1]; s.seasons.push({ id: "s" + Date.now().toString(36), name: "New season", start: last ? last.end : LB.today(), end: last ? last.end : LB.today() }); }
        if (a === "delSeason") s.seasons.splice(Number(el.dataset.i), 1);
        if (a === "addDate") s.keyDates.push({ label: "New date", date: LB.today() });
        if (a === "delDate") s.keyDates.splice(Number(el.dataset.i), 1);
        S.ui.draft = s;
        return render();
      }
      case "discardDraft": S.ui.draft = null; return render();
      case "exportJson": return run(async () => download(`deca-league-backup-${LB.today()}.json`, JSON.stringify(await S.be.exportAll(), null, 2)));
      case "exportCsv": return run(async () => {
        const d = await loadData(true);
        const season = LB.currentSeasonId(S.settings);
        const rows = LB.computeRows({ ...d, settings: S.settings, season, includeHidden: true }).sort((x, y) => y.total - x.total);
        const head = ["name", "grade", "event", "points", "roleplay_points", "exam_points", "roleplays", "roleplay_avg", "roleplay_best", "exam_answered", "exam_correct", "exam_accuracy", "improvement"];
        const lines = [head.join(",")].concat(rows.map((x) => [x.name, x.grade, x.event, x.total, x.rpPoints, x.examPoints, x.rpCount, x.rpAvg, x.rpBest, x.answered, x.correct, x.examAcc, x.improved].map((v) => csvCell(typeof v === "number" ? Math.round(v * 10) / 10 : v)).join(",")));
        download(`leaderboard-${season}-${LB.today()}.csv`, lines.join("\n"), "text/csv");
      });
    }
  }

  async function onSubmit(e) {
    const form = e.target.closest("form[data-form]");
    if (!form) return;
    e.preventDefault();
    const fd = new FormData(form);
    const kind = form.dataset.form;
    try {
      if (kind === "signin" || kind === "signup" || kind === "reset") {
        const btn = form.querySelector(".btn");
        const email = String(fd.get("email") || "").trim();
        S.ui.authEmail = email;
        if (!email) return toast("Enter your email address.", "bad");
        btn.disabled = true;
        try {
          if (kind === "signin") {
            if (!fd.get("password")) { btn.disabled = false; return toast("Enter your password.", "bad"); }
            await S.be.signIn(email, String(fd.get("password")));
          } else if (kind === "signup") {
            if (fd.get("password") !== fd.get("confirm")) { btn.disabled = false; return toast("The two passwords don't match.", "bad"); }
            await S.be.signUp(String(fd.get("name") || ""), email, String(fd.get("password") || ""));
          } else {
            await S.be.resetPassword(email);
            S.ui.authMode = "signin";
            toast(S.be.mode === "demo" ? "The demo doesn't send emails. On the live site, a reset link goes to that address." : `If an account uses ${email}, a reset link is on its way. Check your spam folder too.`);
            render();
          }
        } catch (err) { btn.disabled = false; toast(err.message || String(err), "bad"); }
        return;
      }
      if (kind === "profile") {
        const displayName = String(fd.get("displayName") || "").trim().slice(0, 40);
        if (!displayName) return toast("Enter a display name.", "bad");
        const fields = { displayName, grade: String(fd.get("grade") || ""), event: String(fd.get("event") || ""), showOnBoards: !!fd.get("showOnBoards") };
        await S.be.updateMyProfile(fields);
        Object.assign(S.me, fields);
        invalidate();
        toast("Profile saved.");
        render();
      } else if (kind === "startQuiz") await startQuiz(form);
      else if (kind === "logRoleplay") await saveRoleplay(form);
      else if (kind === "addQuestion") {
        const options = [0, 1, 2, 3].map((i) => String(fd.get("opt" + i) || "").trim());
        let answer = Number(fd.get("answer"));
        if (!options[answer]) return toast("The option marked correct is empty.", "bad");
        const kept = options.map((o, i) => ({ o, i })).filter((x) => x.o);
        answer = kept.findIndex((x) => x.i === answer);
        await S.be.addQuestions([{ cluster: fd.get("cluster"), q: String(fd.get("q")).trim(), options: kept.map((x) => x.o), answer, explanation: String(fd.get("explanation") || "").trim(), source: String(fd.get("source") || "").trim() }]);
        toast("Question added.");
        render();
      } else if (kind === "importCsv") {
        const { out, errors } = csvToQuestions(String(fd.get("csv") || ""));
        if (!out.length) return toast(errors.length ? errors.slice(0, 2).join(". ") : "There's nothing to import.", "bad");
        if (errors.length && !(await ask(`${plural(out.length, "question")} can be imported. ${plural(errors.length, "row")} can't:\n\n${errors.slice(0, 8).join("\n")}\n\nImport the ${plural(out.length, "question")} that worked?`, "Import"))) return;
        await S.be.addQuestions(out);
        toast(`Imported ${plural(out.length, "question")}.`);
        render();
      } else if (kind === "settings") {
        const s = readSettingsForm(form);
        const bad = s.seasons.find((x) => !x.start || !x.end || x.start > x.end);
        if (bad) return toast(`${bad.name} ends before it starts.`, "bad");
        await S.be.saveSettings(s);
        S.settings = LB.mergeSettings(s);
        S.ui.draft = null;
        toast("Settings saved.");
        render();
      }
    } catch (err) { console.error(err); toast(err.message || String(err), "bad"); }
  }

  async function onChange(e) {
    const el = e.target.closest("[data-change]");
    if (!el) return;
    const k = el.dataset.change;
    if (k === "switchUser") { S.quiz = null; S.ui.draft = null; invalidate(); if (el.value) S.be.switchUser(el.value); return; }
    if (k === "boardSeason") { S.ui.season = el.value; return render(); }
    if (k === "boardCluster") { S.ui.cluster = el.value; return render(); }
    if (k === "qCluster") { S.ui.qCluster = el.value; return render(); }
    if (k === "qSearch") { S.ui.qSearch = el.value; return render(); }
    if (k === "rpEvent") {
      const ev = LB.eventByCode(el.value);
      document.getElementById("rubric").innerHTML = ev ? rubricHtml(ev.type) : `<p class="empty">Choose an event to load its judge's evaluation form.</p>`;
      document.getElementById("partnerWrap").classList.toggle("hidden", !(ev && ev.type === "tdm"));
      updateSheetTotals();
      return;
    }
    if (k === "rpMember") {
      const opt = el.selectedOptions[0];
      const evSel = el.form.querySelector('[name="event"]');
      if (opt && opt.dataset.event && !evSel.value && LB.eventByCode(opt.dataset.event)) { evSel.value = opt.dataset.event; evSel.dispatchEvent(new Event("change", { bubbles: true })); }
      return;
    }
    if (k === "csvFile") {
      const f = el.files && el.files[0];
      if (f) { el.form.querySelector('[name="csv"]').value = await f.text(); toast(`${f.name} loaded. Select Import questions.`); }
      return;
    }
    if (k === "setRole" || k === "setApproved") {
      const fields = k === "setRole" ? { role: el.value } : { approved: el.checked };
      try { await S.be.setUserFields(el.dataset.id, fields); invalidate(); toast("Member updated."); } catch (err) { toast(err.message, "bad"); render(); }
    }
  }
  function onInput(e) {
    const t = e.target;
    if (t.matches && t.matches("[data-paste-pis]")) {
      const lines = t.value.split(/\r?\n/).map((l) => l.replace(/^\s*\d+[.)]\s*/, "").trim()).filter(Boolean);
      document.querySelectorAll('[name^="piName"]').forEach((inp, i) => { if (lines[i] !== undefined) inp.value = lines[i]; });
    }
  }
  function onKey(e) {
    if (!S.quiz || S.quiz.done || !location.hash.includes("practice")) return;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) || document.querySelector(".modal-back")) return;
    const z = S.quiz;
    const k = e.key.toLowerCase();
    const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
    if (!z.answers[z.idx] && k in map) { e.preventDefault(); answerQ(map[k]); }
    else if (z.answers[z.idx] && (k === "enter" || k === "arrowright")) { e.preventDefault(); if (z.idx + 1 < z.qs.length) { z.idx++; render(); } else finishQuiz(); }
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    document.addEventListener("change", onChange);
    document.addEventListener("input", onInput);
    document.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", () => { if (!location.hash.includes("practice") && S.quiz && S.quiz.done) S.quiz = null; render(); window.scrollTo(0, 0); });
    if (!window.LB_CONFIG) {
      document.getElementById("app").innerHTML = `<main class="page"><div class="notice error"><h2>The site's settings file has a mistake</h2><p><code>docs/js/config.js</code> couldn't be read, usually because of a typo such as a missing comma, a missing quotation mark, or <code>firebaseConfig =</code> where it should say <code>firebase:</code>.</p><p>Open the file on GitHub, fix the mistake, and commit. The site will work again a few minutes later.</p></div></main>`;
      return;
    }
    S.be = LB.createBackend();
    S.settings = LB.mergeSettings(null);
    try { await S.be.init(); }
    catch (e) {
      console.error(e);
      document.getElementById("app").innerHTML = `<main class="page"><div class="notice error"><h2>The site couldn't connect to the database</h2><p>${esc(e.message || e)}</p><p>Check the Firebase settings in <code>js/config.js</code>.</p></div></main>`;
      return;
    }
    S.be.onAuth(async (me) => {
      S.me = me;
      invalidate();
      if (me && !me.blocked && !me.error) { try { S.settings = await S.be.getSettings(); } catch (e) { S.settings = LB.mergeSettings(null); } }
      if (S.ui.season === null || (me && !S.settings.seasons.some((s) => s.id === S.ui.season) && S.ui.season !== "all")) S.ui.season = LB.currentSeasonId(S.settings);
      render();
    });
  }
  LB.boot = boot;
})();
