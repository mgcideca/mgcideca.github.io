/* Points & leaderboard maths. Pure functions — no database access. */
(function () {
  const LB = (window.LB = window.LB || {});

  LB.clusterOfEvent = (code) => (LB.eventByCode(code) || {}).cluster || "OTHER";

  LB.seasonFor = (dateStr, settings) => {
    const s = (settings.seasons || []).find((s) => dateStr >= s.start && dateStr <= s.end);
    return s ? s.id : "off";
  };
  LB.inSeason = (dateStr, seasonId, settings) => seasonId === "all" || LB.seasonFor(dateStr, settings) === seasonId;
  LB.currentSeasonId = (settings) => {
    const id = LB.seasonFor(LB.today(), settings);
    return id === "off" ? "all" : id;
  };

  LB.today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  LB.pct = (r) => (r.maxTotal ? Math.round((r.total / r.maxTotal) * 1000) / 10 : 0);

  const byTime = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.createdAt || 0) - (b.createdAt || 0));

  // A roleplay is a personal best if it beats every earlier roleplay by that member (not their first).
  LB.markPersonalBests = function (roleplays) {
    const by = {};
    roleplays.forEach((r) => (by[r.memberUid] = by[r.memberUid] || []).push(r));
    const pb = {};
    Object.values(by).forEach((list) => {
      list.sort(byTime);
      let best = -1;
      list.forEach((r, i) => {
        const p = LB.pct(r);
        pb[r.id] = i > 0 && p > best;
        if (p > best) best = p;
      });
    });
    return pb;
  };

  LB.roleplayPoints = (r, isPB, settings) => {
    const P = settings.points;
    return P.rpAttend + LB.pct(r) / P.rpScoreDiv + (isPB ? P.rpPbBonus : 0);
  };

  LB.computeRows = function ({ profiles, roleplays, examStats, settings, season = "all", cluster = "all", includeHidden = false }) {
    const P = settings.points;
    const pb = LB.markPersonalBests(roleplays);
    const rows = {};
    const row = (uid) =>
      rows[uid] ||
      (rows[uid] = { uid, rpPoints: 0, examPoints: 0, rpList: [], answered: 0, correct: 0, pbCount: 0 });

    roleplays.forEach((r) => {
      if (!LB.inSeason(r.date, season, settings)) return;
      if (cluster !== "all" && LB.clusterOfEvent(r.event) !== cluster) return;
      const x = row(r.memberUid);
      x.rpList.push({ p: LB.pct(r), date: r.date, createdAt: r.createdAt });
      x.rpPoints += LB.roleplayPoints(r, pb[r.id], settings);
      if (pb[r.id]) x.pbCount++;
    });
    examStats.forEach((s) => {
      if (season !== "all" && s.season !== season) return;
      const x = row(s.uid);
      if (cluster === "all") {
        x.answered += s.answered || 0;
        x.correct += s.correct || 0;
      } else {
        const c = (s.byCluster || {})[cluster];
        if (c) { x.answered += c.a || 0; x.correct += c.c || 0; }
      }
    });

    return Object.values(rows)
      .filter((x) => profiles[x.uid] && (includeHidden || profiles[x.uid].showOnBoards !== false))
      .map((x) => {
        const prof = profiles[x.uid];
        x.name = prof.displayName;
        x.grade = prof.grade;
        x.event = prof.event;
        x.examPoints = x.correct * P.examPerCorrect;
        x.total = x.rpPoints + x.examPoints;
        x.rpList.sort(byTime);
        x.rpCount = x.rpList.length;
        x.rpAvg = x.rpCount ? x.rpList.reduce((a, b) => a + b.p, 0) / x.rpCount : 0;
        x.rpBest = x.rpCount ? Math.max(...x.rpList.map((r) => r.p)) : 0;
        x.examAcc = x.answered ? (x.correct / x.answered) * 100 : 0;
        const k = Math.min(3, Math.floor(x.rpCount / 2));
        if (k > 0) {
          const avg = (arr) => arr.reduce((a, b) => a + b.p, 0) / arr.length;
          x.firstAvg = avg(x.rpList.slice(0, k));
          x.recentAvg = avg(x.rpList.slice(-k));
          x.improved = x.recentAvg - x.firstAvg;
        } else {
          x.improved = 0;
        }
        return x;
      });
  };

  LB.BOARDS = {
    grind: {
      label: "Total points",
      blurb: "Every roleplay and practice question adds to your total.",
      eligible: (x) => x.total > 0,
      value: (x) => x.total,
      tiebreak: (x) => x.rpCount
    },
    roleplay: {
      label: "Roleplay average",
      blurb: "Average judged score across your roleplays.",
      eligible: (x, s) => x.rpCount >= s.mins.rpAvg,
      value: (x) => x.rpAvg,
      tiebreak: (x) => x.rpCount
    },
    exam: {
      label: "Exam accuracy",
      blurb: "Share of practice questions answered correctly on the first try.",
      eligible: (x, s) => x.answered >= s.mins.examAcc,
      value: (x) => x.examAcc,
      tiebreak: (x) => x.answered
    },
    improved: {
      label: "Most improved",
      blurb: "Your recent roleplay average compared with your first roleplays.",
      eligible: (x, s) => x.rpCount >= s.mins.improvedMin,
      value: (x) => x.improved,
      tiebreak: (x) => x.rpCount
    }
  };

  // Returns { ranked: [...rows with .rank], ineligible: [...] }
  LB.rankBoard = function (rows, boardId, settings) {
    const b = LB.BOARDS[boardId];
    const ranked = rows
      .filter((x) => b.eligible(x, settings))
      .sort((a, c) => b.value(c) - b.value(a) || b.tiebreak(c) - b.tiebreak(a) || a.name.localeCompare(c.name));
    let prev = null, rank = 0;
    ranked.forEach((x, i) => {
      const v = Math.round(b.value(x) * 10) / 10;
      if (v !== prev) { rank = i + 1; prev = v; }
      x.rank = rank;
    });
    return { ranked, ineligible: rows.filter((x) => !b.eligible(x, settings)) };
  };


  // "0-3, 4-7, 8-11, 12" -> [[0,3],[4,7],[8,11],[12,12]]
  LB.parseBands = function (str) {
    const out = String(str || "").split(",").map((part) => {
      const m = part.trim().match(/^(\d+)\s*(?:-|–|to)?\s*(\d+)?$/);
      if (!m) return null;
      const lo = Number(m[1]), hi = m[2] !== undefined ? Number(m[2]) : lo;
      return [Math.min(lo, hi), Math.max(lo, hi)];
    }).filter(Boolean);
    return out.length ? out : [[0, 10]];
  };
  LB.bandMax = (str) => { const b = LB.parseBands(str); return b[b.length - 1][1]; };
  LB.bandIndex = (score, bands) => { const i = bands.findIndex(([lo, hi]) => score >= lo && score <= hi); return i < 0 ? (score > bands[bands.length - 1][1] ? bands.length - 1 : 0) : i; };
  LB.rubricMax = (t) => t.piCount * LB.bandMax(t.piBands) + t.criteria.reduce((a, c) => a + LB.bandMax(c.bands), 0);

  // Section averages (% of available points): PIs, Solution, Career competencies, Overall impression
  LB.sectionBreakdown = function (roleplays) {
    const map = {};
    const add = (sec, x) => { const m = (map[sec] = map[sec] || { name: sec, score: 0, max: 0 }); m.score += x.score; m.max += x.max; };
    roleplays.forEach((r) => {
      (r.pis || []).forEach((x) => add("Performance indicators", x));
      (r.criteria || []).forEach((x) => add(x.section || "Other", x));
    });
    return Object.values(map).map((m) => ({ name: m.name, avg: m.max ? (m.score / m.max) * 100 : 0 }));
  };
  LB.criteriaBreakdown = function (roleplays) {
    const map = {};
    roleplays.forEach((r) => (r.criteria || []).forEach((x) => {
      if (!x.max) return;
      const m = (map[x.name] = map[x.name] || { name: x.name, section: x.section, sum: 0, n: 0 });
      m.sum += (x.score / x.max) * 100; m.n++;
    }));
    return Object.values(map).map((m) => ({ name: m.name, section: m.section, avg: m.sum / m.n, n: m.n }));
  };

  // Aggregate PI performance for "weak spots"
  LB.piBreakdown = function (roleplays) {
    const map = {};
    roleplays.forEach((r) =>
      (r.pis || []).forEach((p) => {
        if (!p.name || !p.max) return;
        const key = p.name.trim().toLowerCase();
        const m = (map[key] = map[key] || { name: p.name.trim(), sum: 0, n: 0 });
        m.sum += (p.score / p.max) * 100;
        m.n++;
      })
    );
    return Object.values(map).map((m) => ({ name: m.name, avg: m.sum / m.n, n: m.n }));
  };
})();
