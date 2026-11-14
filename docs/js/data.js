/* Static data: clusters, events, default settings, sample questions, demo seed. */
(function () {
  const LB = (window.LB = window.LB || {});

  LB.CLUSTERS = [
    { id: "CORE", name: "Principles (Business Admin Core)" },
    { id: "BMA", name: "Business Management & Administration" },
    { id: "ENT", name: "Entrepreneurship" },
    { id: "FIN", name: "Finance" },
    { id: "HT", name: "Hospitality & Tourism" },
    { id: "MKT", name: "Marketing" },
    { id: "PFL", name: "Personal Financial Literacy" }
  ];
  LB.clusterName = (id) => (LB.CLUSTERS.find((c) => c.id === id) || { name: id || "Other" }).name;

  // type decides which rubric template the exec scoring form loads.
  LB.EVENTS = [
    { code: "PBM", name: "Principles of Business Management & Administration", cluster: "CORE", type: "principles" },
    { code: "PEN", name: "Principles of Entrepreneurship", cluster: "CORE", type: "principles" },
    { code: "PFN", name: "Principles of Finance", cluster: "CORE", type: "principles" },
    { code: "PHT", name: "Principles of Hospitality & Tourism", cluster: "CORE", type: "principles" },
    { code: "PMK", name: "Principles of Marketing", cluster: "CORE", type: "principles" },

    { code: "ACT", name: "Accounting Applications Series", cluster: "FIN", type: "series" },
    { code: "AAM", name: "Apparel & Accessories Marketing Series", cluster: "MKT", type: "series" },
    { code: "ASM", name: "Automotive Services Marketing Series", cluster: "MKT", type: "series" },
    { code: "BFS", name: "Business Finance Series", cluster: "FIN", type: "series" },
    { code: "BSM", name: "Business Services Marketing Series", cluster: "MKT", type: "series" },
    { code: "ENT", name: "Entrepreneurship Series", cluster: "ENT", type: "series" },
    { code: "FMS", name: "Food Marketing Series", cluster: "MKT", type: "series" },
    { code: "HLM", name: "Hotel & Lodging Management Series", cluster: "HT", type: "series" },
    { code: "HRM", name: "Human Resources Management Series", cluster: "BMA", type: "series" },
    { code: "MCS", name: "Marketing Communications Series", cluster: "MKT", type: "series" },
    { code: "QSRM", name: "Quick Serve Restaurant Management Series", cluster: "HT", type: "series" },
    { code: "RFSM", name: "Restaurant & Food Service Management Series", cluster: "HT", type: "series" },
    { code: "RMS", name: "Retail Merchandising Series", cluster: "MKT", type: "series" },
    { code: "SEM", name: "Sports & Entertainment Marketing Series", cluster: "MKT", type: "series" },
    { code: "PFL", name: "Personal Financial Literacy", cluster: "PFL", type: "series" },

    { code: "BLTDM", name: "Business Law & Ethics Team Decision Making", cluster: "BMA", type: "tdm" },
    { code: "BTDM", name: "Buying & Merchandising Team Decision Making", cluster: "MKT", type: "tdm" },
    { code: "ETDM", name: "Entrepreneurship Team Decision Making", cluster: "ENT", type: "tdm" },
    { code: "FTDM", name: "Financial Services Team Decision Making", cluster: "FIN", type: "tdm" },
    { code: "HTDM", name: "Hospitality Services Team Decision Making", cluster: "HT", type: "tdm" },
    { code: "MTDM", name: "Marketing Management Team Decision Making", cluster: "MKT", type: "tdm" },
    { code: "STDM", name: "Sports & Entertainment Marketing Team Decision Making", cluster: "MKT", type: "tdm" },
    { code: "TTDM", name: "Travel & Tourism Team Decision Making", cluster: "HT", type: "tdm" },

    { code: "OTHER", name: "Other / mixed practice", cluster: "OTHER", type: "series" }
  ];
  LB.eventByCode = (code) => LB.EVENTS.find((e) => e.code === code);

  LB.BAND_NAMES = ["Novice", "Developing", "Proficient", "Exemplary"];
  function criteriaSet(overallBands) {
    const sol = "0-2, 3-5, 6-7, 8", car = "0-1, 2-3, 4-5, 6";
    return [
      { section: "Solution", name: "Unique", desc: "Original thinking, fresh perspectives and an insightful approach", bands: sol },
      { section: "Solution", name: "Practical", desc: "An actionable, viable solution in a real-world context", bands: sol },
      { section: "Solution", name: "Effective", desc: "A solution that achieves relevant outcomes", bands: sol },
      { section: "Career competencies", name: "Critical thinking", desc: "Thinks critically to understand and solve problems", bands: car },
      { section: "Career competencies", name: "Communication", desc: "Communicates clearly, effectively and with reason", bands: car },
      { section: "Career competencies", name: "Decision making", desc: "Considers the impacts of decisions", bands: car },
      { section: "Overall impression", name: "Overall impression", desc: "Career readiness through professionalism, poise and confidence", bands: overallBands }
    ];
  }

  // Default settings. Everything here is editable in Admin → Settings once live.
  LB.DEFAULT_SETTINGS = {
    signupSheetUrl:
      "https://docs.google.com/spreadsheets/d/1Ej880l6Nr0S6vCe_uyXzKcnzdUMJ-BYKyfTqADKv0do/edit?gid=0#gid=0",
    requireApproval: true,
    points: {
      rpAttend: 5, // points just for completing a roleplay
      rpScoreDiv: 10, // + (score % ÷ this). 85% → 8.5 pts
      rpPbBonus: 3, // + bonus when a member beats their personal best
      piRush: [1, 2, 3], // points for PI Rush rating 1 / 2 / 3
      examPerCorrect: 0.2 // per first-attempt correct exam answer (100 Qs ≈ one roleplay)
    },
    mins: {
      rpAvg: 3, // roleplays needed to appear on the Roleplay Avg board
      examAcc: 100, // first-attempt questions needed for the Exam Accuracy board
      improvedMin: 4 // roleplays needed for Most Improved
    },
    seasons: [
      { id: "s1", name: "Fall season", start: "2026-10-26", end: "2026-12-06" },
      { id: "s2", name: "Winter season", start: "2026-12-07", end: "2027-01-17" },
      { id: "s3", name: "Provincials season", start: "2027-01-18", end: "2027-02-28" }
    ],
    keyDates: [
      { label: "Roleplay Competition", date: "2026-11-20" },
      { label: "Provincials Written Report due", date: "2027-01-07" },
      { label: "Provincials Competition", date: "2027-02-04" }
    ],
    // Roleplay scoring sheets, matching the 2026 DECA judge's evaluation forms.
    // Bands are the Novice / Developing / Proficient / Exemplary point ranges.
    rubrics: {
      principles: {
        label: "Principles",
        participants: 1,
        piCount: 4,
        piBands: "0-3, 4-7, 8-11, 12",
        criteria: criteriaSet("0-3, 4-6, 7-9, 10")
      },
      series: {
        label: "Individual Series",
        participants: 1,
        piCount: 5,
        piBands: "0-3, 4-6, 7-9, 10",
        criteria: criteriaSet("0-2, 3-5, 6-7, 8")
      },
      tdm: {
        label: "Team Decision Making",
        participants: 2,
        piCount: 5,
        piBands: "0-3, 4-6, 7-9, 10",
        criteria: criteriaSet("0-2, 3-5, 6-7, 8")
      }
    }
  };

  /* ---------- Sample questions ----------
     Original practice questions written for this site (NOT official DECA exam items).
     Import your chapter's own bank in Exec → Question bank. */
  const Q = (cluster, q, options, answer, explanation) => ({ cluster, q, options, answer, explanation, source: "Sample (MGCI DECA)" });
  LB.SAMPLE_QUESTIONS = [
    Q("CORE", "Machines, tools and buildings used to produce goods are which type of economic resource?", ["Land", "Labour", "Capital goods", "Entrepreneurship"], 2, "Capital goods are man-made resources used to produce other goods and services."),
    Q("CORE", "A business owned by one person who has unlimited personal liability for its debts is a:", ["Partnership", "Corporation", "Sole proprietorship", "Co-operative"], 2, "Sole proprietors and the business are legally the same, so the owner's personal assets are at risk."),
    Q("CORE", "An employee nods and paraphrases a customer's complaint back to them. This is an example of:", ["Selective listening", "Active listening", "Persuasive speaking", "Nonverbal resistance"], 1, "Active listening means showing you understand — paraphrasing and nonverbal cues like nodding."),
    Q("CORE", "Which of the following is a fixed cost for a small café?", ["Coffee beans", "Paper cups", "Monthly rent", "Overtime wages"], 2, "Fixed costs stay the same regardless of how much is sold; rent doesn't change with sales volume."),
    Q("CORE", "The value of the next-best alternative you give up when making a choice is called:", ["Sunk cost", "Opportunity cost", "Marginal utility", "Comparative advantage"], 1, "Opportunity cost is what you sacrifice by choosing one option over the next-best one."),
    Q("CORE", "Which statement best describes business ethics?", ["Following only the rules written into law", "Doing whatever maximizes short-term profit", "Acting on principles of right and wrong, even when the law doesn't require it", "Letting each employee decide what is acceptable"], 2, "Ethics goes beyond legal minimums to what is right and fair."),

    Q("BMA", "Which management function involves setting goals and deciding how to reach them?", ["Planning", "Organizing", "Staffing", "Controlling"], 0, "Planning comes first: setting objectives and the strategies to achieve them."),
    Q("BMA", "In a SWOT analysis, which two elements are EXTERNAL to the business?", ["Strengths and weaknesses", "Opportunities and threats", "Strengths and opportunities", "Weaknesses and threats"], 1, "Opportunities and threats come from the outside environment; strengths and weaknesses are internal."),
    Q("BMA", "A manager who makes decisions alone without asking employees for input uses which leadership style?", ["Democratic", "Laissez-faire", "Autocratic", "Servant"], 2, "Autocratic leaders keep decision-making authority to themselves."),
    Q("BMA", "The process of finding and attracting qualified applicants for a job opening is called:", ["Orientation", "Recruitment", "Appraisal", "Compensation"], 1, "Recruitment builds the pool of applicants; selection then picks from it."),
    Q("BMA", "A legally enforceable agreement between two or more parties is a:", ["Memo", "Contract", "Mission statement", "Proposal"], 1, "A contract creates obligations that can be enforced by law."),

    Q("ENT", "Ongoing payments a franchisee makes to the franchisor, usually a percentage of sales, are called:", ["Dividends", "Tariffs", "Royalties", "Rebates"], 2, "Royalties pay for continued use of the franchisor's brand and system."),
    Q("ENT", "The point where total revenue equals total costs is the:", ["Profit margin", "Break-even point", "Market equilibrium", "Gross margin"], 1, "At break-even the business has neither profit nor loss."),
    Q("ENT", "Raising money by selling part-ownership of the business to investors is:", ["Debt financing", "Equity financing", "Trade credit", "Bootstrapping"], 1, "Equity investors receive ownership instead of loan repayments."),
    Q("ENT", "A minimum viable product (MVP) is best described as:", ["The cheapest product on the market", "The simplest version of a product that can test real customer demand", "A product that meets every possible customer need", "A prototype that is never shown to customers"], 1, "An MVP lets a startup learn from real customers before investing heavily."),
    Q("ENT", "A primary purpose of a business plan is to:", ["Replace the need for market research", "Describe the business's goals and strategy, often to attract funding", "Guarantee the business will be profitable", "Register the business name with the government"], 1, "Lenders and investors use the plan to judge whether the venture is sound."),

    Q("FIN", "Complete the accounting equation: Assets = Liabilities + ______", ["Revenue", "Expenses", "Owner's equity", "Cash"], 2, "Everything a business owns is financed either by creditors (liabilities) or owners (equity)."),
    Q("FIN", "Which financial statement shows revenues and expenses over a period of time?", ["Balance sheet", "Income statement", "Statement of cash flows", "Trial balance"], 1, "The income statement reports profit or loss for a period."),
    Q("FIN", "A company has current assets of $50,000 and current liabilities of $25,000. Its current ratio is:", ["0.5", "1.0", "2.0", "25,000"], 2, "Current ratio = current assets ÷ current liabilities = 50,000 ÷ 25,000 = 2.0."),
    Q("FIN", "Compound interest is calculated on:", ["The original principal only", "The principal plus interest already earned", "Only the interest earned last year", "The amount withdrawn"], 1, "Compounding earns 'interest on interest', which speeds up growth."),
    Q("FIN", "The main purpose of diversifying an investment portfolio is to:", ["Guarantee higher returns", "Reduce risk by spreading money across different investments", "Avoid paying taxes", "Increase trading fees"], 1, "Diversification lowers the impact of any single investment performing badly."),
    Q("FIN", "Spreading the cost of a long-term asset over its useful life is called:", ["Appreciation", "Amortization of revenue", "Depreciation", "Inflation"], 2, "Depreciation matches the asset's cost to the periods that benefit from it."),

    Q("HT", "In the hotel industry, RevPAR stands for:", ["Revenue per available room", "Reservations per arriving resident", "Rate of visitor arrivals", "Room expense per average reservation"], 0, "RevPAR = room revenue ÷ rooms available; it combines rate and occupancy."),
    Q("HT", "A 200-room hotel sells 150 rooms tonight. What is its occupancy rate?", ["50%", "66%", "75%", "150%"], 2, "Occupancy = rooms sold ÷ rooms available = 150 ÷ 200 = 75%."),
    Q("HT", "Accepting more reservations than there are rooms, to offset expected no-shows, is called:", ["Upselling", "Overbooking", "Yield pricing", "Walk-in sales"], 1, "Overbooking protects revenue from no-shows but risks having to 'walk' a guest."),
    Q("HT", "Which is an INTANGIBLE part of a hospitality product?", ["The hotel's swimming pool", "Breakfast buffet food", "The friendliness of front-desk staff", "Room furniture"], 2, "Service quality can't be touched or stored — it's intangible."),
    Q("HT", "When a guest complains, the recommended first step is usually to:", ["Offer a full refund immediately", "Listen and acknowledge the guest's concern", "Explain the hotel's policy", "Call a manager before saying anything"], 1, "Guests need to feel heard before any solution will land well."),

    Q("MKT", "Which of the following is NOT one of the four Ps of the marketing mix?", ["Product", "Price", "Promotion", "Profit"], 3, "The four Ps are Product, Price, Place and Promotion."),
    Q("MKT", "Dividing a market by age, income and gender is ______ segmentation.", ["Geographic", "Demographic", "Psychographic", "Behavioural"], 1, "Demographic segmentation uses measurable population characteristics."),
    Q("MKT", "Setting a low introductory price to quickly gain market share is called:", ["Price skimming", "Penetration pricing", "Prestige pricing", "Odd-even pricing"], 1, "Penetration pricing trades early margin for fast customer growth."),
    Q("MKT", "A company's distinctive name, symbol or design that identifies its products is its:", ["Slogan", "Brand", "Patent", "Channel"], 1, "A brand distinguishes a company's products from competitors'."),
    Q("MKT", "Paid, non-personal communication from an identified sponsor is:", ["Publicity", "Personal selling", "Advertising", "Word of mouth"], 2, "Advertising is paid and non-personal; publicity is unpaid."),
    Q("MKT", "Information a business collects itself for a specific current purpose is:", ["Secondary data", "Primary data", "Census data", "Syndicated data"], 1, "Primary data is gathered first-hand (surveys, focus groups, observation)."),

    Q("PFL", "In Canada, a Tax-Free Savings Account (TFSA) allows you to:", ["Avoid all income tax on your salary", "Earn investment income tax-free within contribution limits", "Borrow money at zero interest", "Deduct contributions from your taxable income"], 1, "Growth and withdrawals in a TFSA aren't taxed, but contributions aren't tax-deductible."),
    Q("PFL", "Which factor usually has the biggest impact on a credit score?", ["Your income", "Payment history", "Your age", "Where you bank"], 1, "Paying bills on time is the single most important factor."),
    Q("PFL", "Net pay is:", ["Pay before any deductions", "Pay after taxes and other deductions", "Your hourly wage", "Pay including bonuses"], 1, "Net pay is your take-home amount after deductions from gross pay."),
    Q("PFL", "An emergency fund is commonly recommended to cover about:", ["One week of expenses", "3–6 months of essential expenses", "Five years of income", "Only your phone bill"], 1, "Three to six months of essentials gives a buffer for job loss or surprise costs.")
  ];

  /* ---------- Demo seed (fake people, demo mode only) ---------- */
  LB.buildDemoSeed = function () {
    let seed = 20261114;
    const rand = () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const pick = (arr) => arr[Math.floor(rand() * arr.length)];
    const now = Date.now();

    const people = [
      ["u_admin", "Chapter President", 12, "MTDM", "admin"],
      ["u_e1", "Avery Chen", 12, "BFS", "exec"],
      ["u_e2", "Priya Natarajan", 11, "MCS", "exec"],
      ["u_e3", "Marcus Liu", 12, "ENT", "exec"],
      ["u_maya", "Maya Thompson", 10, "PMK", "member"],
      ["u_ethan", "Ethan Wong", 9, "PBM", "member"],
      ["u_sofia", "Sofia Rahman", 11, "MCS", "member"],
      ["u_daniel", "Daniel Park", 10, "BFS", "member"],
      ["u_aisha", "Aisha Khan", 12, "TTDM", "member"],
      ["u_lucas", "Lucas Fernandes", 12, "TTDM", "member"],
      ["u_hannah", "Hannah Lee", 9, "PFN", "member"],
      ["u_omar", "Omar Siddiqui", 11, "ENT", "member"],
      ["u_chloe", "Chloe Martin", 10, "HLM", "member"],
      ["u_ryan", "Ryan Patel", 11, "FTDM", "member"],
      ["u_zara", "Zara Ahmed", 9, "PEN", "member"],
      ["u_noah", "Noah Kim", 10, "SEM", "member"]
    ];
    const db = {
      settings: JSON.parse(JSON.stringify(LB.DEFAULT_SETTINGS)),
      users: {}, profiles: {}, roleplays: {}, feedback: {}, pirush: {}, questions: {},
      examStats: {}, seen: {}, attempts: {}, currentUid: "u_maya"
    };
    people.forEach(([uid, name, grade, event, role]) => {
      const email = name.toLowerCase().replace(/[^a-z]+/g, ".") + "@example.com";
      db.users[uid] = { email, role, approved: true, createdAt: now };
      db.profiles[uid] = { displayName: name, grade: String(grade), event, showOnBoards: uid !== "u_noah", createdAt: now };
    });
    db.users.u_jordan = { email: "jordan.smith@example.com", role: "member", approved: false, createdAt: now };
    db.profiles.u_jordan = { displayName: "Jordan Smith", grade: "9", event: "PMK", showOnBoards: true, createdAt: now };

    LB.SAMPLE_QUESTIONS.forEach((q, i) => (db.questions["q" + i] = { ...q, createdAt: now }));

    const PI_POOL = {
      CORE: ["Explain the concept of competition", "Describe the nature of business ethics", "Explain the role of customer service", "Demonstrate active listening skills", "Explain types of business ownership"],
      MKT: ["Explain the nature of promotion", "Determine pricing strategies", "Explain the concept of market segmentation", "Describe the use of social media in marketing", "Explain the nature of positioning", "Identify product opportunities", "Explain the role of branding"],
      FIN: ["Explain the purpose of financial statements", "Describe the nature of budgets", "Explain the time value of money", "Calculate financial ratios", "Explain the role of ethics in finance", "Describe types of investments"],
      ENT: ["Assess opportunities for venture creation", "Explain the need for a business plan", "Describe methods of financing a venture", "Explain the nature of risk", "Develop a marketing plan for a new venture"],
      HT: ["Explain the role of guest services", "Handle customer complaints", "Explain yield management", "Describe the nature of travel packages", "Explain the importance of service recovery", "Coordinate activities with other departments"],
      BMA: ["Explain the role of human resources", "Describe the nature of business law", "Explain the decision-making process", "Explain ethical considerations in management", "Describe motivational strategies"]
    };
    const FEEDBACK = [
      "Strong opening and confident eye contact. Tie each PI back to the judge's actual problem — two PIs felt generic.",
      "Great structure. You ran out of time before the final PI; practise a tighter 2-minute middle section.",
      "Creative solution! Back it up with one number or example so it sounds realistic.",
      "Good answers to follow-up questions. Slow down in the first minute — nerves made you rush.",
      "Covered every PI clearly. Next step: a memorable closing line and a recap of benefits.",
      "Solid knowledge, but explain the 'why' behind each recommendation, not just the 'what'."
    ];
    const execs = ["u_e1", "u_e2", "u_e3", "u_admin"];
    const judgeBias = { u_e1: 0, u_e2: 0.06, u_e3: -0.04, u_admin: 0 }; // Priya scores generously, Marcus harshly
    const dayStr = (d) => { const dt = new Date(Date.UTC(2026, 9, 27)); dt.setUTCDate(dt.getUTCDate() + d); return dt.toISOString().slice(0, 10); };
    let rid = 0;
    const settings = db.settings;

    const AREAS = { CORE: ["Communication Skills", "Customer Relations", "Economics"], MKT: ["Promotion", "Pricing", "Product/Service Management", "Marketing-Information Management"], FIN: ["Financial Analysis", "Financial-Information Management", "Risk Management"], ENT: ["Product/Service Management", "Entrepreneurship", "Financial Analysis"], HT: ["Customer Relations", "Product/Service Management", "Operations"], BMA: ["Human Resources Management", "Operations", "Business Law"], PFL: ["Money Management", "Earning Income"] };
    const scoreItem = (bandsStr, p) => {
      const bands = LB.parseBands(bandsStr);
      const max = bands[bands.length - 1][1];
      const score = Math.max(0, Math.min(max, Math.round(p * max)));
      return { score, max, band: LB.bandIndex(score, bands) };
    };
    function makeRoleplay(uid, event, day, base, judge, teamId) {
      const ev = LB.eventByCode(event);
      const tpl = settings.rubrics[ev.type];
      const pool = PI_POOL[ev.cluster] || PI_POOL.CORE;
      const pis = [];
      const used = new Set();
      for (let i = 0; i < tpl.piCount; i++) {
        let name = pick(pool), guard = 0;
        while (used.has(name) && guard++ < 10) name = pick(pool);
        used.add(name);
        const p = Math.max(0.2, Math.min(1, base + judgeBias[judge] + (rand() - 0.5) * 0.3));
        pis.push({ name, ...scoreItem(tpl.piBands, p) });
      }
      const criteria = tpl.criteria.map((c) => {
        const p = Math.max(0.2, Math.min(1, base + judgeBias[judge] + (rand() - 0.5) * 0.3));
        return { section: c.section, name: c.name, ...scoreItem(c.bands, p) };
      });
      const total = [...pis, ...criteria].reduce((a, x) => a + x.score, 0);
      const maxTotal = [...pis, ...criteria].reduce((a, x) => a + x.max, 0);
      const id = "r" + rid++;
      db.roleplays[id] = {
        memberUid: uid, event, area: pick(AREAS[ev.cluster] || AREAS.CORE), date: dayStr(day), mode: rand() > 0.5 ? "online" : "in-person",
        pis, criteria, total, maxTotal, judgeUid: judge, teamId: teamId || null, createdAt: now - (30 - day) * 864e5
      };
      db.feedback[id] = { memberUid: uid, text: pick(FEEDBACK) };
      return id;
    }

    const plans = {
      u_maya: [5, 0.62, 0.035], u_ethan: [3, 0.5, 0.06], u_sofia: [6, 0.74, 0.015], u_daniel: [4, 0.66, 0.02],
      u_hannah: [2, 0.58, 0.03], u_omar: [5, 0.7, 0.01], u_chloe: [4, 0.55, 0.05], u_zara: [1, 0.6, 0],
      u_noah: [3, 0.68, 0.02], u_e1: [2, 0.8, 0], u_e3: [2, 0.76, 0.01], u_ryan: [3, 0.63, 0.03]
    };
    Object.entries(plans).forEach(([uid, [n, base, slope]]) => {
      const event = db.profiles[uid].event;
      for (let i = 0; i < n; i++) {
        let judge = pick(execs);
        while (judge === uid) judge = pick(execs);
        makeRoleplay(uid, event, Math.floor((i + 0.5) * (17 / n)), base + slope * i, judge);
      }
    });
    // TDM pair: one roleplay, one record per partner
    [[2, 0.6], [8, 0.68], [13, 0.74], [16, 0.79]].forEach(([day, base], i) => {
      const judge = pick(execs);
      const team = "t" + i;
      const a = makeRoleplay("u_aisha", "TTDM", day, base, judge, team);
      const r = db.roleplays[a];
      const id = "r" + rid++;
      db.roleplays[id] = { ...JSON.parse(JSON.stringify(r)), memberUid: "u_lucas" };
      db.feedback[id] = { memberUid: "u_lucas", text: db.feedback[a].text };
    });

    // PI Rush
    let pid = 0;
    Object.keys(db.profiles).forEach((uid) => {
      if (uid === "u_jordan" || uid === "u_admin") return;
      const n = Math.floor(rand() * 6);
      for (let i = 0; i < n; i++) {
        const ev = LB.eventByCode(db.profiles[uid].event);
        db.pirush["p" + pid++] = {
          memberUid: uid, event: ev.code, pi: pick(PI_POOL[ev.cluster] || PI_POOL.CORE),
          rating: 1 + Math.floor(rand() * 3), judgeUid: pick(execs), date: dayStr(Math.floor(rand() * 18)), createdAt: now
        };
      }
    });

    // Exam stats (season 1)
    const examPlans = {
      u_maya: [180, 0.71, "MKT"], u_ethan: [260, 0.64, "CORE"], u_sofia: [120, 0.82, "MKT"], u_daniel: [340, 0.77, "FIN"],
      u_aisha: [90, 0.8, "HT"], u_lucas: [150, 0.69, "HT"], u_hannah: [410, 0.73, "CORE"], u_omar: [60, 0.7, "ENT"],
      u_chloe: [200, 0.66, "HT"], u_ryan: [130, 0.86, "FIN"], u_zara: [110, 0.59, "CORE"], u_e1: [220, 0.9, "FIN"], u_noah: [100, 0.8, "MKT"]
    };
    Object.entries(examPlans).forEach(([uid, [answered, acc, cl]]) => {
      const correct = Math.round(answered * acc);
      const coreA = Math.round(answered * 0.3);
      const coreC = Math.round(coreA * acc);
      const byCluster = cl === "CORE" ? { CORE: { a: answered, c: correct } } : { [cl]: { a: answered - coreA, c: correct - coreC }, CORE: { a: coreA, c: coreC } };
      db.examStats[uid + "_s1"] = { uid, season: "s1", answered, correct, byCluster };
    });
    return db;
  };
})();
