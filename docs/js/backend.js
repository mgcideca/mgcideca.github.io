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
  const uid8 = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

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
      this.key = "mgci_deca_lb_demo_v3";
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
    async addRoleplays(records, feedbackText) {
      records.forEach((r) => {
        const id = "r_" + uid8();
        this.mem.roleplays[id] = { ...r, createdAt: Date.now() };
        if (feedbackText) this.mem.feedback[id] = { memberUid: r.memberUid, text: feedbackText };
      });
      this._save();
    }
    async deleteRoleplay(id) { delete this.mem.roleplays[id]; delete this.mem.feedback[id]; this._save(); }
    async getFeedback(memberUid) {
      const o = {};
      Object.entries(this.mem.feedback).forEach(([id, f]) => { if (!memberUid || f.memberUid === memberUid) o[id] = f.text; });
      return o;
    }


    async listQuestions() { return this._list("questions"); }
    async addQuestions(arr) { arr.forEach((q) => (this.mem.questions["q_" + uid8()] = { ...q, createdAt: Date.now() })); this._save(); }
    async deleteQuestion(id) { delete this.mem.questions[id]; this._save(); }

    async getSeen() { return new Set(Object.keys(this.mem.seen[this.mem.currentUid] || {})); }
    async recordExam(attempt, firstIds) {
      const uid = this.mem.currentUid;
      const seen = (this.mem.seen[uid] = this.mem.seen[uid] || {});
      firstIds.forEach((id) => (seen[id] = Date.now()));
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
    async addRoleplays(records, feedbackText) {
      const b = this.F.writeBatch(this.db);
      records.forEach((r) => {
        const ref = this.F.doc(this._col("roleplays"));
        b.set(ref, { ...r, createdAt: Date.now() });
        if (feedbackText) b.set(this._doc("feedback", ref.id), { memberUid: r.memberUid, text: feedbackText });
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
      s.docs.forEach((d) => (o[d.id] = d.data().text));
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
      const items = await this._all("questions");
      try { localStorage.setItem(key, JSON.stringify({ v, items })); } catch (e) { /* too big or unavailable */ }
      return items;
    }
    async _bumpQuestions() { await this.F.setDoc(this._doc("meta", "questions"), { version: Date.now() }); }
    async addQuestions(arr) {
      for (let i = 0; i < arr.length; i += 400) {
        const b = this.F.writeBatch(this.db);
        arr.slice(i, i + 400).forEach((q) => b.set(this.F.doc(this._col("questions")), { ...q, createdAt: Date.now() }));
        await b.commit();
      }
      await this._bumpQuestions();
    }
    async deleteQuestion(id) { await this.F.deleteDoc(this._doc("questions", id)); await this._bumpQuestions(); }

    async getSeen() { return new Set((await this._all("users", this.uid, "seen")).map((d) => d.id)); }
    async recordExam(attempt, firstIds) {
      const F = this.F;
      const b = F.writeBatch(this.db);
      firstIds.forEach((id) => b.set(this._doc("users", this.uid, "seen", id), { at: Date.now() }));
      b.set(F.doc(this._col("users", this.uid, "attempts")), attempt);
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
    }
    async listExamStats() { return (await this._all("examStats")).map(({ id, ...s }) => s); }
    async listMyAttempts() { return this._all("users", this.uid, "attempts"); }
    async exportAll() {
      const [settings, users, roleplays, questions, examStats, feedback] = await Promise.all([
        this.getSettings(), this.listUsers(), this.listRoleplays(), this._all("questions"), this.listExamStats(), this.getFeedback()
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
