/* Data layer. Two interchangeable backends with the same methods:
   - LocalBackend: demo mode, everything in this browser's localStorage
   - FirebaseBackend: real mode, Google sign-in + Cloud Firestore            */
(function () {
  const LB = (window.LB = window.LB || {});
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const domainAllowed = (email) => {
    const domains = ((window.LB_CONFIG || {}).allowedEmailDomains || []).map((d) => d.toLowerCase());
    return !domains.length || domains.some((d) => String(email || "").toLowerCase().endsWith("@" + d));
  };
  const checkSignup = (name, email, pw) => {
    if (!String(name || "").trim()) throw new Error("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""))) throw new Error("Enter a valid email address.");
    if (!domainAllowed(email)) throw new Error(`Use an email ending in ${(window.LB_CONFIG.allowedEmailDomains || []).join(" or ")}.`);
    if (String(pw || "").length < 6) throw new Error("Use a password with at least 6 characters.");
  };
  // The feedback sheet is private (member + execs). Any filled-in field counts.
  const hasText = (v) => (typeof v === "string" ? v.trim().length > 0 : Array.isArray(v) ? v.some(hasText) : v && typeof v === "object" ? Object.values(v).some(hasText) : false);
  const hasFeedback = (fb) => !!fb && hasText(fb);
  const cleanFeedback = (fb) => JSON.parse(JSON.stringify(fb || {}));
  const readFeedback = (f) => ({ text: "", improve: "", situation: "", intro: "", conclusion: "", creative: "", questions: [], notes: { pi: [], cr: [] }, sections: {}, ...f, memberUid: undefined });
  const uid8 = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  // History object shared by both backends. docs: { qid: {at, ok, last} | time }
  const makeHistory = (docs, bookmarks) => {
    const h = { seen: new Set(), ok: new Map(), last: new Map(), bookmarks: new Set(bookmarks) };
    Object.entries(docs).forEach(([id, v]) => {
      if (id.charAt(0) === "_") return;
      h.seen.add(id);
      if (v && typeof v === "object") {
        if (v.ok === 0 || v.ok === 1) h.ok.set(id, v.ok);
        if (v.last === 0 || v.last === 1) h.last.set(id, v.last);
        else if (v.ok === 0 || v.ok === 1) h.last.set(id, v.ok);
      }
    });
    return h;
  };

  LB.mergeSettings = function (saved) {
    const d = clone(LB.DEFAULT_SETTINGS);
    if (!saved) return d;
    const out = { ...d, ...saved };
    out.points = { ...d.points, ...(saved.points || {}) };
    delete out.points.piRush; // PI Rush was removed
    out.mins = { ...d.mins, ...(saved.mins || {}) };
    out.rubrics = { ...d.rubrics };
    Object.entries(saved.rubrics || {}).forEach(([k, r]) => { if (r && Array.isArray(r.criteria) && r.piBands) out.rubrics[k] = r; }); // ignore pre-2026 sheets
    return out;
  };

  /* ======================= DEMO ======================= */
  class LocalBackend {
    constructor() {
      this.mode = "demo";
      this.key = "mgci_deca_lb_demo_v6";
      this.mem = null;
    }
    async init() {
      try {
        const raw = localStorage.getItem(this.key);
        this.mem = raw ? JSON.parse(raw) : null;
      } catch (e) { this.mem = null; }
      if (!this.mem) { this.mem = LB.buildDemoSeed(); this._save(); }
    }
    _save() { try { localStorage.setItem(this.key, JSON.stringify(this.mem)); } catch (e) { /* storage unavailable: keep in memory */ } }
    _list(coll) { return Object.entries(this.mem[coll]).map(([id, v]) => ({ id, ...clone(v) })); }
    _me() {
      const uid = this.mem.currentUid;
      if (!uid || !this.mem.users[uid]) return null;
      return { uid, ...clone(this.mem.users[uid]), ...clone(this.mem.profiles[uid] || {}) };
    }
    onAuth(cb) { this._cb = cb; cb(this._me()); }
    // Demo accounts have no real passwords: any password works for an existing email.
    async signIn(email) {
      const uid = Object.keys(this.mem.users).find((k) => (this.mem.users[k].email || "").toLowerCase() === String(email || "").trim().toLowerCase());
      if (!uid) throw new Error("No account uses that email. Check it, or create an account.");
      this.mem.currentUid = uid; this._save(); this._cb && this._cb(this._me());
    }
    async signUp(name, email, pw) {
      checkSignup(name, email, pw);
      email = String(email).trim().toLowerCase();
      if (Object.values(this.mem.users).some((u) => (u.email || "").toLowerCase() === email)) throw new Error("An account already uses that email. Sign in instead.");
      const uid = "u_" + uid8();
      const approved = LB.mergeSettings(this.mem.settings).requireApproval ? false : true;
      this.mem.users[uid] = { email, role: "member", approved, createdAt: Date.now() };
      this.mem.profiles[uid] = { displayName: String(name).trim().slice(0, 40), grade: "", event: "", showOnBoards: true, createdAt: Date.now() };
      this.mem.currentUid = uid; this._save(); this._cb && this._cb(this._me());
    }
    async resetPassword() { /* demo: nothing to send */ }
    async signOut() { this.mem.currentUid = null; this._save(); this._cb && this._cb(null); }
    // demo-only helpers
    demoUsers() { return Object.keys(this.mem.users).map((uid) => ({ uid, ...this.mem.users[uid], ...this.mem.profiles[uid] })); }
    switchUser(uid) { this.mem.currentUid = uid; this._save(); this._cb && this._cb(this._me()); }
    resetDemo() { localStorage.removeItem(this.key); this.mem = LB.buildDemoSeed(); this._save(); this._cb && this._cb(this._me()); }

    async getSettings() { return LB.mergeSettings(this.mem.settings); }
    async saveSettings(s) { this.mem.settings = clone(s); this._save(); }

    async listProfiles() { const o = {}; Object.entries(this.mem.profiles).forEach(([k, v]) => { if (this.mem.users[k] && this.mem.users[k].approved) o[k] = clone(v); }); return o; }
    async updateMyProfile(fields) { const uid = this.mem.currentUid; this.mem.profiles[uid] = { ...this.mem.profiles[uid], ...fields }; this._save(); }
    async listUsers() { return Object.keys(this.mem.users).map((uid) => ({ uid, ...clone(this.mem.users[uid]), ...clone(this.mem.profiles[uid] || {}) })); }
    async setUserFields(uid, fields) { this.mem.users[uid] = { ...this.mem.users[uid], ...fields }; this._save(); }
    async deleteMember(uid) { delete this.mem.users[uid]; delete this.mem.profiles[uid]; this._save(); }

    async listRoleplays() { return this._list("roleplays"); }
    // fb = { text: overall feedback, sections: { "Solution": "...", ... } } (private to member + execs)
    async addRoleplays(records, fb) {
      records.forEach((r) => {
        const id = "r_" + uid8();
        this.mem.roleplays[id] = { ...r, createdAt: Date.now() };
        if (hasFeedback(fb)) this.mem.feedback[id] = { ...cleanFeedback(fb), memberUid: r.memberUid };
      });
      this._save();
    }
    async deleteRoleplay(id) { delete this.mem.roleplays[id]; delete this.mem.feedback[id]; this._save(); }
    async getFeedback(memberUid) {
      const o = {};
      Object.entries(this.mem.feedback).forEach(([id, f]) => { if (!memberUid || f.memberUid === memberUid) o[id] = readFeedback(clone(f)); });
      return o;
    }


    async listQuestions() { return this._list("questions"); }
    async addQuestions(arr) { arr.forEach((q) => (this.mem.questions["q_" + uid8()] = { ...q, createdAt: Date.now() })); this._save(); }
    async deleteQuestion(id) { delete this.mem.questions[id]; this._save(); }

    // Per-question history: seen[uid][qid] = { at, ok, last } (ok = first answer, last = latest answer; old saves are just a time)
    async getHistory() {
      const uid = this.mem.currentUid;
      return makeHistory(this.mem.seen[uid] || {}, ((this.mem.bookmarks || {})[uid]) || []);
    }
    async getSeen() { return (await this.getHistory()).seen; }
    async setBookmark(qid, on) {
      const uid = this.mem.currentUid;
      const b = (this.mem.bookmarks = this.mem.bookmarks || {});
      const list = (b[uid] = (b[uid] || []).filter((x) => x !== qid));
      if (on) list.push(qid);
      this._save();
    }
    async recordExam(attempt, answers) {
      const uid = this.mem.currentUid;
      const seen = (this.mem.seen[uid] = this.mem.seen[uid] || {});
      const now = Date.now();
      answers.forEach((a) => {
        const prev = typeof seen[a.qid] === "object" ? seen[a.qid] : seen[a.qid] ? { at: seen[a.qid] } : null;
        seen[a.qid] = a.first || !prev ? { at: now, ok: a.correct ? 1 : 0, last: a.correct ? 1 : 0 } : { ...prev, last: a.correct ? 1 : 0 };
      });
      (this.mem.attempts[uid] = this.mem.attempts[uid] || []).push({ id: "a_" + uid8(), ...attempt });
      if (attempt.firstCount > 0) {
        const key = uid + "_" + attempt.season;
        const s = (this.mem.examStats[key] = this.mem.examStats[key] || { uid, season: attempt.season, answered: 0, correct: 0, byCluster: {} });
        s.answered += attempt.firstCount;
        s.correct += attempt.firstCorrect;
        Object.entries(attempt.byCluster).forEach(([c, v]) => {
          const b = (s.byCluster[c] = s.byCluster[c] || { a: 0, c: 0 });
          b.a += v.a; b.c += v.c;
        });
      }
      this._save();
    }
    async listExamStats() { return Object.values(clone(this.mem.examStats)); }
    async listMyAttempts() { return clone(this.mem.attempts[this.mem.currentUid] || []); }
    async exportAll() { return clone(this.mem); }
  }

  /* ======================= FIREBASE ======================= */
  const FB_VER = "10.12.2";
  const FB_BASE = `https://www.gstatic.com/firebasejs/${FB_VER}/`;

  class FirebaseBackend {
    constructor(cfg) { this.mode = "live"; this.cfg = cfg; }
    async init() {
      const [appM, authM, fsM] = await Promise.all([
        import(FB_BASE + "firebase-app.js"),
        import(FB_BASE + "firebase-auth.js"),
        import(FB_BASE + "firebase-firestore.js")
      ]);
      this.A = authM; this.F = fsM;
      this.app = appM.initializeApp(this.cfg);
      this.auth = authM.getAuth(this.app);
      this.db = fsM.getFirestore(this.app);
    }
    _doc(...p) { return this.F.doc(this.db, ...p); }
    _col(...p) { return this.F.collection(this.db, ...p); }
    async _all(...p) { const s = await this.F.getDocs(this._col(...p)); return s.docs.map((d) => ({ id: d.id, ...d.data() })); }

    onAuth(cb) {
      this.A.onAuthStateChanged(this.auth, async (u) => {
        if (!u) { this.uid = null; cb(null); return; }
        if (!domainAllowed(u.email)) {
          await this.A.signOut(this.auth);
          cb({ blocked: true, email: u.email });
          return;
        }
        this.uid = u.uid;
        try { cb(await this._ensureUser(u)); } catch (e) { console.error(e); cb({ error: e.message }); }
      });
    }
    async signIn(email, pw) {
      try { await this.A.signInWithEmailAndPassword(this.auth, String(email || "").trim(), pw || ""); }
      catch (e) { throw new Error(authMessage(e)); }
    }
    async signUp(name, email, pw) {
      checkSignup(name, email, pw);
      this.pendingName = String(name).trim().slice(0, 40);
      try { await this.A.createUserWithEmailAndPassword(this.auth, String(email).trim(), pw); }
      catch (e) { this.pendingName = null; throw new Error(authMessage(e)); }
    }
    async resetPassword(email) {
      try { await this.A.sendPasswordResetEmail(this.auth, String(email || "").trim()); }
      catch (e) { if (e.code === "auth/user-not-found") return; throw new Error(authMessage(e)); }
    }
    async signOut() { await this.A.signOut(this.auth); }
    async _ensureUser(u) {
      const F = this.F;
      const uref = this._doc("users", u.uid);
      let snap = await F.getDoc(uref);
      if (!snap.exists()) {
        const settings = await this.getSettings();
        await F.setDoc(uref, { email: u.email || "", role: "member", approved: settings.requireApproval ? false : true, createdAt: Date.now() });
        snap = await F.getDoc(uref);
      }
      const pref = this._doc("profiles", u.uid);
      let psnap = await F.getDoc(pref);
      if (!psnap.exists()) {
        const name = this.pendingName || u.displayName || (u.email || "Member").split("@")[0];
        this.pendingName = null;
        await F.setDoc(pref, { displayName: name.slice(0, 40), grade: "", event: "", showOnBoards: true, createdAt: Date.now() });
        psnap = await F.getDoc(pref);
      }
      return { uid: u.uid, ...snap.data(), ...psnap.data() };
    }

    async getSettings() {
      const s = await this.F.getDoc(this._doc("settings", "main"));
      return LB.mergeSettings(s.exists() ? s.data() : null);
    }
    async saveSettings(s) { await this.F.setDoc(this._doc("settings", "main"), s); }

    async listProfiles() { const o = {}; (await this._all("profiles")).forEach(({ id, ...p }) => (o[id] = p)); return o; }
    async updateMyProfile(fields) { await this.F.setDoc(this._doc("profiles", this.uid), fields, { merge: true }); }
    async listUsers() {
      const [users, profs] = await Promise.all([this._all("users"), this.listProfiles()]);
      return users.map(({ id, ...u }) => ({ uid: id, ...u, ...(profs[id] || {}) }));
    }
    async setUserFields(uid, fields) { await this.F.updateDoc(this._doc("users", uid), fields); }
    async deleteMember(uid) {
      const b = this.F.writeBatch(this.db);
      b.delete(this._doc("users", uid));
      b.delete(this._doc("profiles", uid));
      await b.commit();
    }

    async listRoleplays() { return this._all("roleplays"); }
    async addRoleplays(records, fb) {
      const b = this.F.writeBatch(this.db);
      records.forEach((r) => {
        const ref = this.F.doc(this._col("roleplays"));
        b.set(ref, { ...r, createdAt: Date.now() });
        if (hasFeedback(fb)) b.set(this._doc("feedback", ref.id), { ...cleanFeedback(fb), memberUid: r.memberUid });
      });
      await b.commit();
    }
    async deleteRoleplay(id) {
      const b = this.F.writeBatch(this.db);
      b.delete(this._doc("roleplays", id));
      b.delete(this._doc("feedback", id));
      await b.commit();
    }
    async getFeedback(memberUid) {
      const F = this.F;
      const q = memberUid ? F.query(this._col("feedback"), F.where("memberUid", "==", memberUid)) : this._col("feedback");
      const s = await F.getDocs(q);
      const o = {};
      s.docs.forEach((d) => { o[d.id] = readFeedback(d.data()); });
      return o;
    }


    // Questions are cached in localStorage and only re-downloaded when an exec changes the bank.
    async listQuestions() {
      const meta = await this.F.getDoc(this._doc("meta", "questions"));
      const v = meta.exists() ? meta.data().version : 0;
      const key = "mgci_lb_qcache_" + this.cfg.projectId;
      try {
        const c = JSON.parse(localStorage.getItem(key) || "null");
        if (c && c.v === v) return c.items;
      } catch (e) { /* ignore */ }
      const items = await this._loadQuestions();
      try { localStorage.setItem(key, JSON.stringify({ v, items })); } catch (e) { /* too big or unavailable */ }
      return items;
    }
    // Questions are stored in bundles ("packs") of up to 250 so that members download a few
    // documents instead of thousands. Older one-question documents still work.
    async _loadQuestions() {
      const out = [];
      (await this._all("questions")).forEach((d) => {
        if (d.pack) {
          let items = [];
          try { items = JSON.parse(d.json || "[]"); } catch (e) { console.error("Bad question pack", d.id); }
          items.forEach((q) => out.push({ ...q, packId: d.id }));
        } else out.push(d);
      });
      return out;
    }
    async _bumpQuestions() { await this.F.setDoc(this._doc("meta", "questions"), { version: Date.now() }); }
    async addQuestions(arr) {
      const now = Date.now();
      const items = arr.map((q) => ({ ...q, id: "q" + uid8() + uid8(), createdAt: now }));
      for (let i = 0; i < items.length; i += 250) {
        const chunk = items.slice(i, i + 250);
        await this.F.setDoc(this.F.doc(this._col("questions")), { pack: true, count: chunk.length, createdAt: now, json: JSON.stringify(chunk) });
      }
      await this._bumpQuestions();
    }
    async deleteQuestion(id) {
      const all = await this._loadQuestions();
      const q = all.find((x) => x.id === id);
      if (q && q.packId) {
        const rest = all.filter((x) => x.packId === q.packId && x.id !== id).map(({ packId, ...x }) => x);
        if (rest.length) await this.F.updateDoc(this._doc("questions", q.packId), { count: rest.length, json: JSON.stringify(rest) });
        else await this.F.deleteDoc(this._doc("questions", q.packId));
      } else await this.F.deleteDoc(this._doc("questions", id));
      await this._bumpQuestions();
    }

    /* Per-question history lives in users/{uid}/seen/{qid} = { at, ok, last, u }.
       users/{uid}/seen/_bookmarks = { ids, u } holds bookmarks.
       This device keeps a copy and only downloads what changed since (u = server time of the last change),
       so opening Exam practice doesn't re-read every question a member has ever answered. */
    _cacheGet(name) { try { const c = JSON.parse(localStorage.getItem(`mgci_${name}_v1_${this.uid}`)); return c && c.uid === this.uid ? c : null; } catch (e) { return null; } }
    _cacheSet(name, c) { try { localStorage.setItem(`mgci_${name}_v1_${this.uid}`, JSON.stringify({ ...c, uid: this.uid })); } catch (e) { /* storage full or blocked: fine, we just read more next time */ } }
    async _loadHistory() {
      if (this._hist && this._hist.uid === this.uid) return this._hist;
      const F = this.F, WEEK = 7 * 864e5;
      let c = this._cacheGet("hist");
      const full = !c || !c.full || Date.now() - c.full > WEEK;
      const col = this._col("users", this.uid, "seen");
      const snap = await F.getDocs(full ? col : F.query(col, F.where("u", ">", F.Timestamp.fromMillis(Math.max(0, (c.maxU || 0) - 120000)))));
      if (full) c = { docs: {}, maxU: 0, full: Date.now() };
      snap.docs.forEach((d) => {
        const v = d.data();
        const u = v.u && v.u.toMillis ? v.u.toMillis() : 0;
        if (u > c.maxU) c.maxU = u;
        c.docs[d.id] = d.id === "_bookmarks" ? { ids: v.ids || [] } : { at: v.at || 0, ok: v.ok, last: v.last };
      });
      this._hist = { uid: this.uid, ...c };
      this._cacheSet("hist", c);
      return this._hist;
    }
    async getHistory() {
      const h = await this._loadHistory();
      const { _bookmarks, ...docs } = h.docs;
      return makeHistory(docs, (_bookmarks && _bookmarks.ids) || []);
    }
    async getSeen() { return (await this.getHistory()).seen; }
    async setBookmark(qid, on) {
      const F = this.F;
      const h = await this._loadHistory();
      await F.setDoc(this._doc("users", this.uid, "seen", "_bookmarks"), { ids: on ? F.arrayUnion(qid) : F.arrayRemove(qid), u: F.serverTimestamp() }, { merge: true });
      const ids = ((h.docs._bookmarks || {}).ids || []).filter((x) => x !== qid);
      if (on) ids.push(qid);
      h.docs._bookmarks = { ids };
      this._cacheSet("hist", { docs: h.docs, maxU: h.maxU, full: h.full });
    }
    async recordExam(attempt, answers) {
      const F = this.F;
      const h = await this._loadHistory();
      const b = F.writeBatch(this.db);
      const now = Date.now();
      answers.forEach((a) => {
        const r = a.correct ? 1 : 0;
        const prev = h.docs[a.qid];
        const v = a.first || !prev ? { at: now, ok: r, last: r } : { last: r };
        b.set(this._doc("users", this.uid, "seen", a.qid), { ...v, u: F.serverTimestamp() }, { merge: true });
        h.docs[a.qid] = { ...(prev || {}), ...v };
      });
      const aref = F.doc(this._col("users", this.uid, "attempts"));
      b.set(aref, attempt);
      if (attempt.firstCount > 0) {
        const byCluster = {};
        Object.entries(attempt.byCluster).forEach(([c, v]) => (byCluster[c] = { a: F.increment(v.a), c: F.increment(v.c) }));
        b.set(
          this._doc("examStats", this.uid + "_" + attempt.season),
          { uid: this.uid, season: attempt.season, answered: F.increment(attempt.firstCount), correct: F.increment(attempt.firstCorrect), byCluster },
          { merge: true }
        );
      }
      await b.commit();
      this._cacheSet("hist", { docs: h.docs, maxU: h.maxU, full: h.full });
      if (this._att && this._att.uid === this.uid) { this._att.list.push({ id: aref.id, ...attempt }); this._cacheSet("att", this._att); }
    }
    async listExamStats() { return (await this._all("examStats")).map(({ id, ...s }) => s); }
    async listMyAttempts() {
      if (!(this._att && this._att.uid === this.uid)) {
        const F = this.F;
        let c = this._cacheGet("att");
        const col = this._col("users", this.uid, "attempts");
        const since = c && c.list.length ? Math.max(...c.list.map((a) => a.createdAt || 0)) : 0;
        const snap = await F.getDocs(c ? F.query(col, F.where("createdAt", ">", since - 600000)) : col);
        c = c || { list: [] };
        const have = new Set(c.list.map((a) => a.id));
        snap.docs.forEach((d) => { if (!have.has(d.id)) c.list.push({ id: d.id, ...d.data() }); });
        this._att = { uid: this.uid, list: c.list };
        this._cacheSet("att", this._att);
      }
      return clone(this._att.list);
    }
    async exportAll() {
      const [settings, users, roleplays, questions, examStats, feedback] = await Promise.all([
        this.getSettings(), this.listUsers(), this.listRoleplays(), this._loadQuestions(), this.listExamStats(), this.getFeedback()
      ]);
      return { exportedAt: new Date().toISOString(), settings, users, roleplays, feedback, questions, examStats };
    }
  }

  function authMessage(e) {
    const m = {
      "auth/invalid-credential": "That email and password don't match. Check them, or reset your password.",
      "auth/wrong-password": "That email and password don't match. Check them, or reset your password.",
      "auth/user-not-found": "That email and password don't match. Check them, or reset your password.",
      "auth/invalid-login-credentials": "That email and password don't match. Check them, or reset your password.",
      "auth/email-already-in-use": "An account already uses that email. Sign in instead.",
      "auth/weak-password": "Use a password with at least 6 characters.",
      "auth/password-does-not-meet-requirements": "That password doesn't meet the requirements. Try a longer one.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/missing-email": "Enter your email address.",
      "auth/missing-password": "Enter your password.",
      "auth/too-many-requests": "Too many attempts. Wait a few minutes, then try again.",
      "auth/network-request-failed": "The site couldn't reach the sign-in server. Check your internet connection.",
      "auth/operation-not-allowed": "Email sign-in isn't turned on yet. In Firebase, open Authentication, then Sign-in method, and enable Email/Password.",
      "auth/user-disabled": "This account has been turned off. Talk to a chapter exec."
    };
    return m[e && e.code] || (e && e.message) || "Something went wrong. Try again.";
  }

  LB.createBackend = function () {
    const cfg = window.LB_CONFIG || {};
    const fb = cfg.firebase || cfg.firebaseConfig; // accept either name
    if (fb && !cfg.forceDemo) return new FirebaseBackend(fb);
    return new LocalBackend();
  };
})();
