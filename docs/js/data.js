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
        timeLimitMin: 10,
        piCount: 4,
        piBands: "0-3, 4-7, 8-11, 12",
        criteria: criteriaSet("0-3, 4-6, 7-9, 10")
      },
      series: {
        label: "Individual Series",
        participants: 1,
        timeLimitMin: 10,
        piCount: 5,
        piBands: "0-3, 4-6, 7-9, 10",
        criteria: criteriaSet("0-2, 3-5, 6-7, 8")
      },
      tdm: {
        label: "Team Decision Making",
        participants: 2,
        timeLimitMin: 15,
        piCount: 5,
        piBands: "0-3, 4-6, 7-9, 10",
        criteria: criteriaSet("0-2, 3-5, 6-7, 8")
      }
    }
  };

  /* ---------- Sample questions ----------
     Original practice questions written for this site (NOT official DECA exam items).
     Import your chapter's own bank in Exec → Question bank. */

  LB.SAMPLE_QUESTIONS = [
    {
    "cluster": "CORE",
    "q": "A name, symbol, or design that identifies a business's products and sets them apart from competitors' products is a",
    "options": [
    "price.",
    "channel.",
    "brand.",
    "market."
    ],
    "answer": 2,
    "explanation": "Brand. Brands help customers recognize products and build loyalty. Price is the amount charged, a channel is the path products take to customers, and a market is a group of potential customers.",
    "source": "MGCI DECA original, MK:015"
    },
    {
    "cluster": "CORE",
    "q": "A letter that asks a business for information about its products or services is a letter of",
    "options": [
    "recommendation.",
    "inquiry.",
    "application.",
    "adjustment."
    ],
    "answer": 1,
    "explanation": "Inquiry. A letter of inquiry requests information. An adjustment letter responds to a complaint, an application letter applies for a job, and a recommendation letter supports another person.",
    "source": "MGCI DECA original, CO:040"
    },
    {
    "cluster": "CORE",
    "q": "Which of the following is an example of computer hardware:",
    "options": [
    "Web browser",
    "Keyboard",
    "Operating system",
    "Spreadsheet program"
    ],
    "answer": 1,
    "explanation": "Keyboard. Hardware includes the physical parts of a computer system, such as keyboards, monitors, and storage devices. Operating systems, browsers, and spreadsheets are software.",
    "source": "MGCI DECA original, NF:084"
    },
    {
    "cluster": "CORE",
    "q": "A business that knowingly lies about a product's features to make a sale is committing",
    "options": [
    "negligence.",
    "trespassing.",
    "fraud.",
    "defamation."
    ],
    "answer": 2,
    "explanation": "Fraud. Fraud is intentionally deceiving someone to gain an advantage. Negligence is careless rather than intentional, trespassing is entering property without permission, and defamation is making false statements that damage a reputation.",
    "source": "MGCI DECA original, BL:069"
    },
    {
    "cluster": "CORE",
    "q": "A high school student looking for help in choosing a career could visit the school's",
    "options": [
    "cafeteria.",
    "athletic department.",
    "library circulation desk.",
    "guidance office."
    ],
    "answer": 3,
    "explanation": "Guidance office. Guidance counsellors provide career assessments, information about programs, and advice on career planning. The other places do not offer career counselling.",
    "source": "MGCI DECA original, PD:026"
    },
    {
    "cluster": "CORE",
    "q": "A new employee is unsure how to process a customer's special order. The employee should",
    "options": [
    "skip the steps that seem unnecessary.",
    "create his/her own method.",
    "follow the business's written procedure.",
    "tell the customer to come back later."
    ],
    "answer": 2,
    "explanation": "Follow the business's written procedure. Procedures ensure that tasks are done consistently and correctly. Creating new methods, delaying the customer, or skipping steps can cause errors.",
    "source": "MGCI DECA original, PD:250"
    },
    {
    "cluster": "CORE",
    "q": "Which of the following is a disadvantage of group decision-making:",
    "options": [
    "It always leads to poor decisions.",
    "Group members never disagree.",
    "It produces fewer ideas.",
    "It usually takes more time."
    ],
    "answer": 3,
    "explanation": "It usually takes more time. Groups must discuss options and reach agreement, which is slower than one person deciding. Groups usually generate more ideas, often disagree, and can make very good decisions.",
    "source": "MGCI DECA original, CO:067"
    },
    {
    "cluster": "CORE",
    "q": "An employee receives written instructions for submitting expense reports. To complete the task correctly, the employee should",
    "options": [
    "ask a coworker to read them instead.",
    "skip the instructions and use last year's method.",
    "read the instructions carefully and follow each step.",
    "skim the first line and guess the rest."
    ],
    "answer": 2,
    "explanation": "Read the instructions carefully and follow each step. Careful reading helps employees complete tasks correctly the first time. Skimming, relying on others, or using outdated methods can lead to mistakes.",
    "source": "MGCI DECA original, CO:056"
    },
    {
    "cluster": "CORE",
    "q": "When the quantity of a product supplied is greater than the quantity demanded at the current price, there is a(n)",
    "options": [
    "equilibrium.",
    "shortage.",
    "monopoly.",
    "surplus."
    ],
    "answer": 3,
    "explanation": "Surplus. A surplus, or excess supply, occurs when sellers offer more than buyers want at the current price, which usually causes prices to fall. A shortage is the opposite, equilibrium is where supply equals demand, and a monopoly is a single seller.",
    "source": "MGCI DECA original, EC:006"
    },
    {
    "cluster": "CORE",
    "q": "Innovation is important to businesses because it helps them",
    "options": [
    "avoid all competition.",
    "keep doing things the same way.",
    "reduce the need for planning.",
    "develop new products and better ways of working."
    ],
    "answer": 3,
    "explanation": "Develop new products and better ways of working. Innovation leads to new goods, services, and processes that can increase sales and efficiency. It does not remove competition, preserve old methods, or replace planning.",
    "source": "MGCI DECA original, PD:126"
    },
    {
    "cluster": "CORE",
    "q": "Getting to know coworkers and showing respect for their feelings helps employees",
    "options": [
    "eliminate all workplace rules.",
    "avoid doing their share of work.",
    "get promoted without effort.",
    "build positive working relationships."
    ],
    "answer": 3,
    "explanation": "Build positive working relationships. Respect and friendliness create trust and cooperation among coworkers. They do not replace effort, guarantee promotions, or remove rules.",
    "source": "MGCI DECA original, EI:036"
    },
    {
    "cluster": "CORE",
    "q": "Which of the following is an operating expense for a small business:",
    "options": [
    "A loan from a bank",
    "Money received from selling equipment",
    "Monthly utility bills",
    "The owner's investment in the business"
    ],
    "answer": 2,
    "explanation": "Monthly utility bills. Operating expenses are the ongoing costs of running a business, such as rent, utilities, and supplies. Money from selling equipment, loans, and owner investments are sources of funds, not expenses.",
    "source": "MGCI DECA original, FI:091"
    },
    {
    "cluster": "CORE",
    "q": "Buying and selling goods and services over the internet is",
    "options": [
    "direct mail.",
    "telemarketing.",
    "wholesaling.",
    "e-commerce."
    ],
    "answer": 3,
    "explanation": "E-commerce. Electronic commerce uses websites and apps to complete sales transactions online. Telemarketing uses the telephone, direct mail uses printed materials, and wholesaling is selling to other businesses for resale.",
    "source": "MGCI DECA original, NF:086"
    },
    {
    "cluster": "CORE",
    "q": "Which of the following is a characteristic of a project:",
    "options": [
    "It has a definite beginning and end.",
    "It does not involve stakeholders.",
    "It continues indefinitely.",
    "It never has a budget."
    ],
    "answer": 0,
    "explanation": "It has a definite beginning and end. Projects are temporary efforts to create a specific result, with set start and end dates. They usually have budgets and involve stakeholders.",
    "source": "MGCI DECA original, OP:519"
    },
    {
    "cluster": "CORE",
    "q": "A customer at a phone store is angry because his new phone stopped working. The salesperson should first",
    "options": [
    "ask the customer to come back another day.",
    "explain the store's return policy in detail.",
    "let the customer explain the problem without interrupting.",
    "tell the customer the problem is his fault."
    ],
    "answer": 2,
    "explanation": "Let the customer explain the problem without interrupting. Allowing an upset customer to vent shows respect and helps the employee understand the problem. Blaming the customer or sending him away makes him angrier, and explaining policies before listening seems uncaring.",
    "source": "MGCI DECA original, CR:009"
    },
    {
    "cluster": "CORE",
    "q": "Before selecting a new supplier, a business should find out whether the supplier",
    "options": [
    "sells to the business's competitors.",
    "is located in the same building.",
    "has the largest advertising budget.",
    "has the resources to deliver orders on time."
    ],
    "answer": 3,
    "explanation": "Has the resources to deliver orders on time. Businesses evaluate vendors on reliability, quality, price, and capabilities. Advertising budgets, competitors, and location in the same building are not key factors.",
    "source": "MGCI DECA original, OP:161"
    },
    {
    "cluster": "CORE",
    "q": "To build understanding with a coworker who is explaining a problem, Olivia should",
    "options": [
    "pay attention to the coworker's words and nonverbal cues.",
    "offer advice before the coworker finishes.",
    "think about her own problems.",
    "change the subject to something positive."
    ],
    "answer": 0,
    "explanation": "Pay attention to the coworker's words and nonverbal cues. Understanding others requires attention to what they say and how they say it. Thinking about yourself, interrupting with advice, or changing the subject shows a lack of understanding.",
    "source": "MGCI DECA original, EI:007"
    },
    {
    "cluster": "CORE",
    "q": "When speaking with customers, employees should use correct grammar because it",
    "options": [
    "allows the speaker to use more slang.",
    "is required by law.",
    "makes conversations last longer.",
    "makes the speaker appear knowledgeable and professional."
    ],
    "answer": 3,
    "explanation": "Makes the speaker appear knowledgeable and professional. Correct grammar helps the message be understood and creates a positive impression of the employee and the business. Slang should be avoided, length is not the goal, and grammar is not a legal requirement.",
    "source": "MGCI DECA original, CO:147"
    },
    {
    "cluster": "BMA",
    "q": "Extra inventory that a business keeps on hand in case demand is higher than expected or deliveries are late is",
    "options": [
    "work in process.",
    "buffer stock.",
    "consignment stock.",
    "obsolete stock."
    ],
    "answer": 1,
    "explanation": "Buffer stock. Buffer (safety) stock protects against running out. Obsolete stock is no longer saleable, work in process is partially finished goods, and consignment stock is owned by the supplier until sold.",
    "source": "MGCI DECA original, OP:336"
    },
    {
    "cluster": "BMA",
    "q": "A restaurant agrees to buy a set amount of produce from a supplier each week for a year at an agreed price. This type of agreement is a",
    "options": [
    "special order.",
    "rush order.",
    "blanket purchase order.",
    "trial order."
    ],
    "answer": 2,
    "explanation": "Blanket purchase order. A blanket order covers repeated purchases over a period of time, which saves time and often secures a better price. Special, rush, and trial orders are one-time purchases.",
    "source": "MGCI DECA original, OP:250"
    },
    {
    "cluster": "BMA",
    "q": "A business keeps sales records so that managers can compare actual sales with the budget. This shows that business records are used to",
    "options": [
    "advertise products.",
    "support planning and decision-making.",
    "increase the number of employees.",
    "replace the need for budgets."
    ],
    "answer": 1,
    "explanation": "Support planning and decision-making. Records provide the information managers need to compare results, spot problems, and plan. They do not replace budgets or relate to hiring or advertising.",
    "source": "MGCI DECA original, NF:001"
    },
    {
    "cluster": "BMA",
    "q": "Which of the following behaviours should be avoided during a group meeting:",
    "options": [
    "Listening to all viewpoints",
    "Attacking someone else's idea",
    "Asking questions to clarify a point",
    "Sharing relevant information"
    ],
    "answer": 1,
    "explanation": "Attacking someone else's idea. Personal attacks discourage participation and create conflict. Asking questions, sharing information, and listening help meetings succeed.",
    "source": "MGCI DECA original, CO:053"
    },
    {
    "cluster": "BMA",
    "q": "A business decides not to sell a product in a market where lawsuits are common. This method of handling risk is",
    "options": [
    "sharing the risk.",
    "avoiding the risk.",
    "retaining the risk.",
    "transferring the risk."
    ],
    "answer": 1,
    "explanation": "Avoiding the risk. Risk avoidance means choosing not to take part in a risky activity. Transferring shifts risk to others, such as through insurance, retaining means accepting it, and sharing spreads it among parties.",
    "source": "MGCI DECA original, EC:011"
    },
    {
    "cluster": "BMA",
    "q": "Assertive people",
    "options": [
    "avoid expressing their opinions.",
    "always get their own way.",
    "use threats to influence others.",
    "respect their own rights and the rights of others."
    ],
    "answer": 3,
    "explanation": "Respect their own rights and the rights of others. Assertiveness means expressing needs honestly while respecting others. Aggressive people insist on getting their way or use threats, and passive people avoid expressing opinions.",
    "source": "MGCI DECA original, EI:008"
    },
    {
    "cluster": "BMA",
    "q": "A project tool that breaks the project's work into smaller, manageable tasks is a",
    "options": [
    "work breakdown structure.",
    "balance sheet.",
    "job description.",
    "sales forecast."
    ],
    "answer": 0,
    "explanation": "Work breakdown structure. A WBS divides the total project into deliverables and tasks so that each can be planned and assigned. Balance sheets, job descriptions, and forecasts are not project-planning tools.",
    "source": "MGCI DECA original, PJ:006"
    },
    {
    "cluster": "BMA",
    "q": "A sales representative who visits customers' offices to explain products and answer questions is using",
    "options": [
    "sales promotion.",
    "personal selling.",
    "advertising.",
    "publicity."
    ],
    "answer": 1,
    "explanation": "Personal selling. Personal selling is direct, two-way communication with customers. Advertising and publicity are non-personal, and sales promotion uses incentives such as coupons.",
    "source": "MGCI DECA original, MK:015"
    },
    {
    "cluster": "BMA",
    "q": "During the closing phase of a project, the team meets to discuss what went well and what could be improved. This meeting is used to",
    "options": [
    "create the initial budget.",
    "assign new tasks.",
    "identify lessons learned.",
    "define the project scope."
    ],
    "answer": 2,
    "explanation": "Identify lessons learned. Reviewing the project at its end helps future projects avoid mistakes and repeat successes. Scope, task assignments, and budgets are set earlier.",
    "source": "MGCI DECA original, PJ:008"
    },
    {
    "cluster": "BMA",
    "q": "An applicant who has no paid work experience could strengthen his résumé by including",
    "options": [
    "volunteer work and school activities.",
    "a photo of his car.",
    "a list of his favourite movies.",
    "his social insurance number."
    ],
    "answer": 0,
    "explanation": "Volunteer work and school activities. These experiences show skills and responsibility. Personal entertainment preferences and unrelated photos are not relevant, and personal ID numbers should never be included.",
    "source": "MGCI DECA original, PD:031"
    },
    {
    "cluster": "BMA",
    "q": "When placing a caller on hold, an employee should",
    "options": [
    "ask the caller's permission and thank him/her for waiting.",
    "leave the caller on hold until he/she hangs up.",
    "put the caller on hold without saying anything.",
    "transfer the call to a random department."
    ],
    "answer": 0,
    "explanation": "Ask the caller's permission and thank him/her for waiting. Courtesy on the phone shows respect for the caller's time. Silent holds, long waits, and random transfers frustrate callers.",
    "source": "MGCI DECA original, CO:114"
    },
    {
    "cluster": "BMA",
    "q": "An informal communication network through which rumours spread among employees is the",
    "options": [
    "organizational chart.",
    "chain of command.",
    "formal channel.",
    "grapevine."
    ],
    "answer": 3,
    "explanation": "Grapevine. The grapevine carries unofficial information and can spread quickly, sometimes inaccurately. The chain of command and formal channels are official communication paths, and an organizational chart shows the structure.",
    "source": "MGCI DECA original, CO:014"
    },
    {
    "cluster": "BMA",
    "q": "An employee who schedules specific times for each task in his/her day is likely to experience",
    "options": [
    "more interruptions.",
    "less productivity.",
    "reduced stress and frustration.",
    "more missed deadlines."
    ],
    "answer": 2,
    "explanation": "Reduced stress and frustration. Planning time helps employees complete work efficiently and feel more in control. It usually reduces missed deadlines and increases productivity.",
    "source": "MGCI DECA original, PD:019"
    },
    {
    "cluster": "BMA",
    "q": "A test that measures a person's natural abilities in areas such as mechanical reasoning or verbal skills is a(n)",
    "options": [
    "personality inventory.",
    "achievement test.",
    "credit check.",
    "aptitude test."
    ],
    "answer": 3,
    "explanation": "Aptitude test. Aptitude tests identify natural talents that can guide career choices. Personality inventories describe traits, achievement tests measure what has been learned, and credit checks review borrowing history.",
    "source": "MGCI DECA original, PD:023"
    },
    {
    "cluster": "BMA",
    "q": "Laws that set out the rights and duties of people, such as the rules for forming a contract, are",
    "options": [
    "procedural laws.",
    "treaties.",
    "bylaws.",
    "substantive laws."
    ],
    "answer": 3,
    "explanation": "Substantive laws. Substantive laws define rights and obligations. Procedural laws set out how legal rights are enforced in court, bylaws are local rules, and treaties are agreements between countries.",
    "source": "MGCI DECA original, BL:067"
    },
    {
    "cluster": "BMA",
    "q": "Which of the following skills helps a project manager keep a project on schedule:",
    "options": [
    "Effective time management",
    "Avoiding communication with the team",
    "Changing deadlines daily",
    "Ignoring the project plan"
    ],
    "answer": 0,
    "explanation": "Effective time management. Managing time well helps project managers keep tasks moving and meet deadlines. Poor communication, ignoring the plan, and constant deadline changes cause delays.",
    "source": "MGCI DECA original, OP:158"
    },
    {
    "cluster": "BMA",
    "q": "To prevent electrical accidents in an office, employees should",
    "options": [
    "avoid overloading power outlets.",
    "run cords across walkways.",
    "use damaged cords until they are replaced.",
    "unplug equipment by pulling the cord."
    ],
    "answer": 0,
    "explanation": "Avoid overloading power outlets. Overloaded outlets can cause fires. Damaged cords, cords across walkways, and pulling on cords create shock, fire, and tripping hazards.",
    "source": "MGCI DECA original, OP:007"
    },
    {
    "cluster": "BMA",
    "q": "A business that trains workers to use new equipment, increasing their efficiency, benefits",
    "options": [
    "only the government.",
    "only the business's competitors.",
    "both the business and society.",
    "no one, because training is costly."
    ],
    "answer": 2,
    "explanation": "Both the business and society. More efficient workers help the business produce more at lower cost and gain skills that make them more valuable. Training is a cost, but it creates benefits.",
    "source": "MGCI DECA original, EC:010"
    },
    {
    "cluster": "ENT",
    "q": "A luxury watch brand that allows only one retailer in each city to sell its products is using __________ distribution.",
    "options": [
    "exclusive",
    "selective",
    "mass",
    "intensive"
    ],
    "answer": 0,
    "explanation": "Exclusive. Exclusive distribution supports a prestige image and close retailer relationships. Intensive and mass distribution use many outlets, and selective uses a limited number.",
    "source": "MGCI DECA original, CM:009"
    },
    {
    "cluster": "ENT",
    "q": "A list of all the risks a business faces, such as theft, fire, and lawsuits, is a",
    "options": [
    "balance sheet.",
    "sales forecast.",
    "purchase order.",
    "risk inventory."
    ],
    "answer": 3,
    "explanation": "Risk inventory. Identifying risks is the first step in managing them. Sales forecasts, balance sheets, and purchase orders serve different purposes.",
    "source": "MGCI DECA original, RM:062"
    },
    {
    "cluster": "ENT",
    "q": "A letter that accompanies a formal report and introduces it to the reader is a",
    "options": [
    "letter of transmittal.",
    "letter of resignation.",
    "collection letter.",
    "letter of application."
    ],
    "answer": 0,
    "explanation": "Letter of transmittal. It explains what the report is and why it is being sent. Application, collection, and resignation letters serve other purposes.",
    "source": "MGCI DECA original, CO:009"
    },
    {
    "cluster": "ENT",
    "q": "Involving team members in planning the details of a company event helps",
    "options": [
    "reduce communication.",
    "avoid teamwork.",
    "lower morale.",
    "build enthusiasm and engagement."
    ],
    "answer": 3,
    "explanation": "Build enthusiasm and engagement. People are more committed to plans they help create. Involvement increases communication and morale.",
    "source": "MGCI DECA original, EI:108"
    },
    {
    "cluster": "ENT",
    "q": "\"Answer 20 more practice questions each week until the competition\" is a good goal because it is",
    "options": [
    "vague.",
    "unrealistic.",
    "set by someone else.",
    "measurable."
    ],
    "answer": 3,
    "explanation": "Measurable. Measurable goals make it easy to track progress and stay motivated. Vague, unrealistic, or externally imposed goals are less effective.",
    "source": "MGCI DECA original, PD:257"
    },
    {
    "cluster": "ENT",
    "q": "The profits of a sole proprietorship are",
    "options": [
    "taxed twice like a corporation's.",
    "taxed as the owner's personal income.",
    "never taxed.",
    "paid to stockholders."
    ],
    "answer": 1,
    "explanation": "Taxed as the owner's personal income. Sole proprietors report business profits and losses on their personal tax returns. Corporations face double taxation, and proprietorships have no stockholders.",
    "source": "MGCI DECA original, EC:072"
    },
    {
    "cluster": "ENT",
    "q": "A lender requires a small-business owner to promise to repay a business loan from her own assets if the business cannot. She is giving a",
    "options": [
    "dividend.",
    "trade discount.",
    "rebate.",
    "personal guarantee."
    ],
    "answer": 3,
    "explanation": "Personal guarantee. Personal guarantees make the owner responsible for business debt. Dividends, rebates, and trade discounts are unrelated.",
    "source": "MGCI DECA original, FI:041"
    },
    {
    "cluster": "ENT",
    "q": "The percentage of people who click on an online ad after seeing it is the",
    "options": [
    "market share.",
    "click-through rate.",
    "inventory turnover.",
    "break-even point."
    ],
    "answer": 1,
    "explanation": "Click-through rate. Digital metrics help businesses measure how well online marketing engages customers. Market share, inventory turnover, and break-even point measure other things.",
    "source": "MGCI DECA original, MP:020"
    },
    {
    "cluster": "ENT",
    "q": "On a corporation's balance sheet, retained earnings appear under",
    "options": [
    "current assets.",
    "stockholders' equity.",
    "current liabilities.",
    "operating expenses."
    ],
    "answer": 1,
    "explanation": "Stockholders' equity. Retained earnings are profits kept in the business and belong to the owners. Liabilities are debts, assets are resources owned, and operating expenses appear on the income statement.",
    "source": "MGCI DECA original, FI:093"
    },
    {
    "cluster": "ENT",
    "q": "Which of the following is a legal issue that small businesses must be aware of:",
    "options": [
    "Deciding store hours",
    "Choosing the colour of their storefront",
    "Protecting their intellectual property",
    "Picking employees' lunch breaks"
    ],
    "answer": 2,
    "explanation": "Protecting their intellectual property. Businesses must understand laws about trademarks, patents, contracts, and liability. Colours, hours, and lunch breaks are operating choices.",
    "source": "MGCI DECA original, BL:001"
    },
    {
    "cluster": "ENT",
    "q": "A bank denies a loan to a young entrepreneur because she has never borrowed money before. The bank's main concern is that she",
    "options": [
    "has too much savings.",
    "has a strong business plan.",
    "owns too many assets.",
    "has no record of repaying loans."
    ],
    "answer": 3,
    "explanation": "Has no record of repaying loans. Lenders use credit history to judge risk. Savings, assets, and a strong plan would make a loan more likely.",
    "source": "MGCI DECA original, FI:034"
    },
    {
    "cluster": "ENT",
    "q": "In a corporation, the board of directors is",
    "options": [
    "chosen by competitors.",
    "appointed by customers.",
    "hired by the employees.",
    "elected by the stockholders."
    ],
    "answer": 3,
    "explanation": "Elected by the stockholders. Stockholders elect directors to oversee management on their behalf. Employees, customers, and competitors do not choose the board.",
    "source": "MGCI DECA original, PD:214"
    },
    {
    "cluster": "ENT",
    "q": "An entrepreneur starting a T-shirt printing business will need blank shirts, ink, and a printing machine. These are the business's",
    "options": [
    "promotional materials.",
    "legal documents.",
    "raw materials and equipment.",
    "financial statements."
    ],
    "answer": 2,
    "explanation": "Raw materials and equipment. Entrepreneurs must identify all the resources needed to produce their products. Promotional materials, statements, and legal documents are other needs.",
    "source": "MGCI DECA original, EN:009"
    },
    {
    "cluster": "ENT",
    "q": "A business has strong sales but little cash because many customers have not paid their invoices. The business has a large amount of",
    "options": [
    "owner's equity.",
    "fixed assets.",
    "accounts receivable.",
    "accounts payable."
    ],
    "answer": 2,
    "explanation": "Accounts receivable. Receivables are amounts customers owe, and high receivables can cause cash shortages. Payables are amounts the business owes.",
    "source": "MGCI DECA original, OP:030"
    },
    {
    "cluster": "ENT",
    "q": "When disciplining an employee, a manager should focus on the behaviour and remain",
    "options": [
    "unpredictable.",
    "sarcastic.",
    "angry.",
    "nonjudgmental."
    ],
    "answer": 3,
    "explanation": "Nonjudgmental. Focusing on behaviour rather than the person keeps discipline fair and constructive. Anger, sarcasm, and unpredictability damage trust and morale.",
    "source": "MGCI DECA original, HR:369"
    },
    {
    "cluster": "ENT",
    "q": "The process of recognizing an unmet want or need that could become a business opportunity is",
    "options": [
    "entrepreneurial discovery.",
    "market saturation.",
    "product recall.",
    "inventory control."
    ],
    "answer": 0,
    "explanation": "Entrepreneurial discovery. Entrepreneurs search for problems they can solve profitably. Market saturation, recalls, and inventory control are unrelated.",
    "source": "MGCI DECA original, EN:001"
    },
    {
    "cluster": "ENT",
    "q": "Governments create laws that require businesses to reduce pollution in order to",
    "options": [
    "limit consumer choice.",
    "raise business profits.",
    "encourage price fixing.",
    "protect the environment."
    ],
    "answer": 3,
    "explanation": "Protect the environment. Environmental regulations protect public health and natural resources. They do not aim to raise profits, limit choice, or encourage illegal pricing.",
    "source": "MGCI DECA original, EC:008"
    },
    {
    "cluster": "ENT",
    "q": "Providing ongoing employee training is one way a business can make sure it has",
    "options": [
    "fewer customers.",
    "higher turnover.",
    "less need for planning.",
    "the skilled people it needs in the future."
    ],
    "answer": 3,
    "explanation": "The skilled people it needs in the future. Strategic HR planning coordinates people with business goals. Training does not reduce customers or planning, and it usually lowers turnover.",
    "source": "MGCI DECA original, HR:508"
    },
    {
    "cluster": "FIN",
    "q": "A woodworker who invents a new cutting tool and starts a company to sell it is an",
    "options": [
    "employee.",
    "entrepreneur.",
    "investor only.",
    "consumer."
    ],
    "answer": 1,
    "explanation": "Entrepreneur. Entrepreneurs turn ideas into businesses and take on risk. The other roles do not.",
    "source": "MGCI DECA original, EN:039"
    },
    {
    "cluster": "FIN",
    "q": "The amount of time a business must keep different types of records",
    "options": [
    "is always one week.",
    "is never regulated.",
    "is the same for every document.",
    "varies greatly depending on the record and laws."
    ],
    "answer": 3,
    "explanation": "Varies greatly depending on the record and laws. Tax, payroll, and legal records have different retention requirements.",
    "source": "MGCI DECA original, NF:001"
    },
    {
    "cluster": "FIN",
    "q": "Planning and organizing a company's finances is part of the business function of",
    "options": [
    "human resources.",
    "financial analysis.",
    "production.",
    "marketing."
    ],
    "answer": 1,
    "explanation": "Financial analysis. This function manages money and evaluates financial performance. The other functions handle different activities.",
    "source": "MGCI DECA original, EC:071"
    },
    {
    "cluster": "FIN",
    "q": "\"This is the best investment ever\" is an example of",
    "options": [
    "an opinion.",
    "a fact.",
    "a financial statement.",
    "a statistic."
    ],
    "answer": 0,
    "explanation": "An opinion. Opinions are beliefs that cannot be proven. Facts can be verified.",
    "source": "MGCI DECA original, NF:077"
    },
    {
    "cluster": "FIN",
    "q": "An employee who identifies her most important tasks first each morning is",
    "options": [
    "procrastinating.",
    "prioritizing her time.",
    "multitasking randomly.",
    "avoiding work."
    ],
    "answer": 1,
    "explanation": "Prioritizing her time. Prioritization ensures important work gets done. The other choices are poor time management.",
    "source": "MGCI DECA original, PD:019"
    },
    {
    "cluster": "FIN",
    "q": "Blaming others for your own mistakes often leads to",
    "options": [
    "better teamwork.",
    "resentment and loss of trust.",
    "more respect.",
    "promotions."
    ],
    "answer": 1,
    "explanation": "Resentment and loss of trust. Accepting responsibility builds respect. Blame damages relationships.",
    "source": "MGCI DECA original, EI:075"
    },
    {
    "cluster": "FIN",
    "q": "In a group discussion, a participant who does not understand another person's point should",
    "options": [
    "ask questions to clarify.",
    "criticize the speaker.",
    "change the subject.",
    "stay silent."
    ],
    "answer": 0,
    "explanation": "Ask questions to clarify. Clarification prevents misunderstandings. Silence and criticism hinder discussion.",
    "source": "MGCI DECA original, CO:053"
    },
    {
    "cluster": "FIN",
    "q": "A corporation's board of directors represents the interests of the",
    "options": [
    "shareholders.",
    "suppliers only.",
    "government.",
    "competitors."
    ],
    "answer": 0,
    "explanation": "Shareholders. Directors are elected to oversee management on shareholders' behalf. They do not represent competitors.",
    "source": "MGCI DECA original, PD:214"
    },
    {
    "cluster": "FIN",
    "q": "Financial firms monitor technology trends in order to",
    "options": [
    "reduce efficiency.",
    "avoid change.",
    "remain competitive and serve customers better.",
    "eliminate customers."
    ],
    "answer": 2,
    "explanation": "Remain competitive and serve customers better. New technology changes how services are delivered. Ignoring trends risks falling behind.",
    "source": "MGCI DECA original, NF:013"
    },
    {
    "cluster": "FIN",
    "q": "A finance manager reviews inventory records before awarding purchasing contracts. Inventory records are an example of",
    "options": [
    "external publications.",
    "internal information sources.",
    "government statistics.",
    "competitor data."
    ],
    "answer": 1,
    "explanation": "Internal information sources. Businesses generate and keep their own records. The other sources are external.",
    "source": "MGCI DECA original, NF:014"
    },
    {
    "cluster": "FIN",
    "q": "Effective listening requires both the speaker and the listener to",
    "options": [
    "avoid eye contact.",
    "talk at the same time.",
    "participate actively in the exchange.",
    "think about other tasks."
    ],
    "answer": 2,
    "explanation": "Participate actively in the exchange. Communication is two-way. Distractions and interruptions reduce understanding.",
    "source": "MGCI DECA original, CO:017"
    },
    {
    "cluster": "FIN",
    "q": "A primary goal of customer relationship management is to",
    "options": [
    "eliminate customers.",
    "increase complaints.",
    "avoid customer data.",
    "build long-term, profitable customer relationships."
    ],
    "answer": 3,
    "explanation": "Build long-term, profitable customer relationships. CRM aligns business activities with customer needs. The other choices are the opposite.",
    "source": "MGCI DECA original, CR:016"
    },
    {
    "cluster": "FIN",
    "q": "Comparing operating costs with industry standards helps a business",
    "options": [
    "identify cost-saving opportunities.",
    "increase expenses.",
    "ignore problems.",
    "raise prices automatically."
    ],
    "answer": 0,
    "explanation": "Identify cost-saving opportunities. Benchmarks reveal areas of inefficiency. They do not raise prices.",
    "source": "MGCI DECA original, OP:159"
    },
    {
    "cluster": "FIN",
    "q": "Local laws that limit where billboards can be placed are an example of",
    "options": [
    "government regulation of business.",
    "contract law.",
    "trademark law.",
    "consumer protection only."
    ],
    "answer": 0,
    "explanation": "Government regulation of business. Governments regulate land use and advertising. The other choices are different areas of law.",
    "source": "MGCI DECA original, BL:001"
    },
    {
    "cluster": "FIN",
    "q": "Why should individuals keep organized financial records?",
    "options": [
    "To eliminate the need for a bank account",
    "To track spending, prepare taxes, and resolve disputes",
    "To avoid paying bills on time",
    "To impress lenders with large files"
    ],
    "answer": 1,
    "explanation": "To track spending, prepare taxes, and resolve disputes. Good records show where money goes and provide proof of payments and income. They do not replace bank accounts or excuse late payments.",
    "source": "MGCI DECA original, FI:069"
    },
    {
    "cluster": "FIN",
    "q": "A responsible employee balances his/her own needs with",
    "options": [
    "the needs of the team and organization.",
    "nothing else.",
    "competitors' needs.",
    "personal convenience only."
    ],
    "answer": 0,
    "explanation": "The needs of the team and organization. Responsibility includes considering how actions affect others.",
    "source": "MGCI DECA original, EI:021"
    },
    {
    "cluster": "FIN",
    "q": "A financial adviser who is legally required to act in the best interests of clients has a",
    "options": [
    "non-compete agreement.",
    "sales quota.",
    "fiduciary duty.",
    "franchise agreement."
    ],
    "answer": 2,
    "explanation": "Fiduciary duty. Fiduciaries must put clients' interests ahead of their own. The other agreements do not create this obligation.",
    "source": "MGCI DECA original, BL:133"
    },
    {
    "cluster": "FIN",
    "q": "Financial advisers who are dependable and keep their promises",
    "options": [
    "avoid responsibilities.",
    "need no communication skills.",
    "build strong client relationships.",
    "lose clients."
    ],
    "answer": 2,
    "explanation": "Build strong client relationships. Reliability creates trust and loyalty. Communication skills remain important.",
    "source": "MGCI DECA original, CR:003"
    },
    {
    "cluster": "HT",
    "q": "An email promotion that says \"Offer ends Friday!\" is trying to",
    "options": [
    "confuse readers.",
    "create a sense of urgency.",
    "hide the offer.",
    "discourage action."
    ],
    "answer": 1,
    "explanation": "Create a sense of urgency. Deadlines encourage readers to act quickly. Bulleted content also makes emails easy to scan.",
    "source": "MGCI DECA original, PR:279"
    },
    {
    "cluster": "HT",
    "q": "A hotel brand pays to have its logo appear inside a popular video game. This is called",
    "options": [
    "sampling.",
    "direct mail.",
    "telemarketing.",
    "advergaming."
    ],
    "answer": 3,
    "explanation": "Advergaming. Advergaming places brands in games. The other choices are different promotion methods.",
    "source": "MGCI DECA original, PR:002"
    },
    {
    "cluster": "HT",
    "q": "A restaurant buyer negotiates frequent small deliveries instead of one large monthly delivery in order to",
    "options": [
    "raise storage costs.",
    "minimize inventory investment.",
    "reduce menu choices.",
    "increase spoilage."
    ],
    "answer": 1,
    "explanation": "Minimize inventory investment. Smaller, frequent orders keep less money tied up in stock and reduce spoilage. They do not raise costs or limit menus.",
    "source": "MGCI DECA original, OP:015"
    },
    {
    "cluster": "HT",
    "q": "When a supervisor criticizes a server's performance, the server should",
    "options": [
    "ignore the comments.",
    "take the criticism seriously and use it to improve.",
    "argue with the supervisor.",
    "complain to guests."
    ],
    "answer": 1,
    "explanation": "Take the criticism seriously and use it to improve. Constructive criticism helps employees grow. Arguing, ignoring, and complaining damage relationships.",
    "source": "MGCI DECA original, EI:003"
    },
    {
    "cluster": "HT",
    "q": "Checking your credit report regularly helps you",
    "options": [
    "find errors and avoid being denied credit.",
    "raise your income.",
    "lower your taxes.",
    "close your bank account."
    ],
    "answer": 0,
    "explanation": "Find errors and avoid being denied credit. Credit bureaus may make mistakes that should be corrected. Reports do not change income or taxes.",
    "source": "MGCI DECA original, FI:072"
    },
    {
    "cluster": "HT",
    "q": "A hotel that inspects and services its air conditioning units regularly is practising",
    "options": [
    "overbooking.",
    "emergency repair.",
    "preventive maintenance.",
    "price skimming."
    ],
    "answer": 2,
    "explanation": "Preventive maintenance. Regular inspections prevent breakdowns that upset guests. Emergency repair happens after failure.",
    "source": "MGCI DECA original, OP:032"
    },
    {
    "cluster": "HT",
    "q": "A letter of inquiry should state what information is needed",
    "options": [
    "at the beginning of the letter.",
    "in a separate envelope.",
    "only in the closing.",
    "after several paragraphs of small talk."
    ],
    "answer": 0,
    "explanation": "At the beginning of the letter. Stating the request early makes it clear and easy to answer. Delaying it confuses the reader.",
    "source": "MGCI DECA original, CO:040"
    },
    {
    "cluster": "HT",
    "q": "A good personal budget includes a record of",
    "options": [
    "future vacation photos.",
    "monthly income and expenses.",
    "only large purchases.",
    "friends' spending."
    ],
    "answer": 1,
    "explanation": "Monthly income and expenses. Budgets compare money coming in with money going out. Recording only some spending gives an incomplete picture.",
    "source": "MGCI DECA original, FI:579"
    },
    {
    "cluster": "HT",
    "q": "A hotel's accounts payable clerk notices that a supplier billed the hotel twice. The clerk should",
    "options": [
    "pay both bills.",
    "ignore the error.",
    "stop ordering from all suppliers.",
    "contact the supplier to resolve the error."
    ],
    "answer": 3,
    "explanation": "Contact the supplier to resolve the error. Monitoring payables helps control expenses. Paying twice or ignoring errors wastes money.",
    "source": "MGCI DECA original, OP:184"
    },
    {
    "cluster": "HT",
    "q": "An employee who adds false expenses to an expense report to receive extra money is",
    "options": [
    "negotiating a discount.",
    "following company policy.",
    "padding an expense account.",
    "controlling costs."
    ],
    "answer": 2,
    "explanation": "Padding an expense account. This is a form of fraud that businesses try to prevent through reviews and receipts. It is not policy, negotiation, or cost control.",
    "source": "MGCI DECA original, OP:013"
    },
    {
    "cluster": "HT",
    "q": "Determining what training resources new employees will need is a responsibility of",
    "options": [
    "the maintenance department.",
    "the accounting department.",
    "human resources.",
    "the marketing department."
    ],
    "answer": 2,
    "explanation": "Human resources. HR plans recruitment, orientation, and training. The other departments have different responsibilities.",
    "source": "MGCI DECA original, HR:410"
    },
    {
    "cluster": "HT",
    "q": "Meeting deadlines and avoiding personal use of supplies help a business",
    "options": [
    "raise prices.",
    "reduce quality.",
    "increase its waste.",
    "control its expenses."
    ],
    "answer": 3,
    "explanation": "Control its expenses. Every employee affects costs through daily habits. These behaviours reduce, not increase, waste.",
    "source": "MGCI DECA original, OP:025"
    },
    {
    "cluster": "HT",
    "q": "A note-taking method that divides the page into sections for notes, key words, and a summary is the",
    "options": [
    "shorthand method.",
    "mind-map method only.",
    "outline method only.",
    "Cornell method."
    ],
    "answer": 3,
    "explanation": "Cornell method. The Cornell system organizes notes for easy review. The other methods are organized differently.",
    "source": "MGCI DECA original, CO:085"
    },
    {
    "cluster": "HT",
    "q": "Employees who act responsibly usually",
    "options": [
    "need constant monitoring.",
    "miss deadlines.",
    "avoid tasks.",
    "require less supervision."
    ],
    "answer": 3,
    "explanation": "Require less supervision. Responsible employees can be trusted to complete work. The other choices describe irresponsible behaviour.",
    "source": "MGCI DECA original, EI:021"
    },
    {
    "cluster": "HT",
    "q": "A hotel employee who sits up straight and greets guests warmly at the front desk is projecting a",
    "options": [
    "careless attitude.",
    "negative impression.",
    "casual style.",
    "professional image."
    ],
    "answer": 3,
    "explanation": "Professional image. Posture and manner contribute to how guests see employees and the hotel. These behaviours create a positive impression.",
    "source": "MGCI DECA original, PD:002"
    },
    {
    "cluster": "HT",
    "q": "The study of how people use limited resources to satisfy their wants is",
    "options": [
    "accounting.",
    "economics.",
    "law.",
    "marketing."
    ],
    "answer": 1,
    "explanation": "Economics. Economics studies choices about production, distribution, and consumption. Accounting, marketing, and law are other fields.",
    "source": "MGCI DECA original, EC:001"
    },
    {
    "cluster": "HT",
    "q": "Accounting helps a hotel owner",
    "options": [
    "understand how the business is doing financially.",
    "design the website.",
    "choose staff uniforms.",
    "decorate the rooms."
    ],
    "answer": 0,
    "explanation": "Understand how the business is doing financially. Accounting records and statements show profits, costs, and financial position. They do not guide decor or design.",
    "source": "MGCI DECA original, FI:085"
    },
    {
    "cluster": "HT",
    "q": "A hotel brand in the maturity stage of its life cycle may refresh its rooms and services in order to",
    "options": [
    "enter the introduction stage.",
    "stay competitive and attract guests.",
    "reduce guest satisfaction.",
    "eliminate marketing."
    ],
    "answer": 1,
    "explanation": "Stay competitive and attract guests. Product updates can extend the maturity stage. They do not reduce satisfaction or eliminate marketing.",
    "source": "MGCI DECA original, PM:001"
    },
    {
    "cluster": "MKT",
    "q": "A purchasing employee checks incoming goods against the purchase order before accepting them. This helps ensure",
    "options": [
    "quality and accuracy of shipments.",
    "more employees.",
    "higher prices.",
    "faster advertising."
    ],
    "answer": 0,
    "explanation": "Quality and accuracy of shipments. Inspecting goods on receipt catches errors and damage. It does not affect prices or advertising.",
    "source": "MGCI DECA original, OP:190"
    },
    {
    "cluster": "MKT",
    "q": "Before selling a new product line, salespeople should learn the products' features, uses, and",
    "options": [
    "manufacturers' payroll costs.",
    "the company's tax returns.",
    "benefits to customers.",
    "competitors' employees' names."
    ],
    "answer": 2,
    "explanation": "Benefits to customers. Customers buy benefits, so salespeople must explain how features help them. Payroll costs, competitors' employees, and tax returns are not useful selling information.",
    "source": "MGCI DECA original, SE:062"
    },
    {
    "cluster": "MKT",
    "q": "A creativity technique that compares a problem to an unrelated object, such as \"How is our store like a beehive?\", is",
    "options": [
    "price lining.",
    "forced analogy.",
    "test marketing.",
    "market segmentation."
    ],
    "answer": 1,
    "explanation": "Forced analogy. Forced analogies spark new ideas by connecting unrelated things. Test marketing, price lining, and segmentation are other marketing activities.",
    "source": "MGCI DECA original, PM:127"
    },
    {
    "cluster": "MKT",
    "q": "Analytics tools that recommend the best action to take, such as the ideal price, are",
    "options": [
    "descriptive statistics only.",
    "prescriptive analytics.",
    "manual records.",
    "word processing."
    ],
    "answer": 1,
    "explanation": "Prescriptive analytics. Prescriptive analytics suggest decisions based on data. Descriptive statistics summarize past data, and the other choices do not analyze data.",
    "source": "MGCI DECA original, NF:139"
    },
    {
    "cluster": "MKT",
    "q": "A product's position is ultimately determined by",
    "options": [
    "the date it was produced.",
    "the number of employees who made it.",
    "the company's office location.",
    "how customers perceive it compared with competitors."
    ],
    "answer": 3,
    "explanation": "How customers perceive it compared with competitors. Positioning exists in customers' minds. Employees, location, and production date do not define position.",
    "source": "MGCI DECA original, PM:042"
    },
    {
    "cluster": "MKT",
    "q": "An executive summary should be written for readers who",
    "options": [
    "want every detail.",
    "will not read the entire report.",
    "prefer technical appendices.",
    "are the report's authors."
    ],
    "answer": 1,
    "explanation": "Will not read the entire report. The executive summary gives busy readers the key findings and recommendations. Detailed readers use the full report.",
    "source": "MGCI DECA original, CO:091"
    },
    {
    "cluster": "MKT",
    "q": "When a job application asks for information that does not apply to you, you should",
    "options": [
    "write \"N/A\" in the space.",
    "make up an answer.",
    "leave the space blank.",
    "write a nickname."
    ],
    "answer": 0,
    "explanation": "Write \"N/A\" in the space. Writing \"not applicable\" shows the question was read. Blank spaces may look careless, and false or informal answers are inappropriate.",
    "source": "MGCI DECA original, PD:027"
    },
    {
    "cluster": "MKT",
    "q": "Thanking customers for their business is a simple way to",
    "options": [
    "create positive customer relationships.",
    "raise prices.",
    "avoid complaints.",
    "reduce customer contact."
    ],
    "answer": 0,
    "explanation": "Create positive customer relationships. Showing appreciation makes customers feel valued and encourages loyalty. It does not set prices or prevent all complaints.",
    "source": "MGCI DECA original, CR:003"
    },
    {
    "cluster": "MKT",
    "q": "Setting aside money regularly to pay for a child's future education is an example of",
    "options": [
    "borrowing.",
    "saving for a goal.",
    "gambling.",
    "impulse spending."
    ],
    "answer": 1,
    "explanation": "Saving for a goal. Saving helps people pay for future needs such as education or retirement. The other choices do not build savings.",
    "source": "MGCI DECA original, FI:270"
    },
    {
    "cluster": "MKT",
    "q": "Businesses decide what to produce based largely on",
    "options": [
    "the weather alone.",
    "consumer demand.",
    "their employees' preferences.",
    "competitors' office locations."
    ],
    "answer": 1,
    "explanation": "Consumer demand. In a market economy, demand signals what consumers want. Employee preferences, weather alone, and competitors' locations do not determine production.",
    "source": "MGCI DECA original, EC:005"
    },
    {
    "cluster": "MKT",
    "q": "After collecting completed surveys, a researcher's next step is usually to",
    "options": [
    "enter the data into a computer for analysis.",
    "choose a new sample.",
    "throw away incomplete surveys without review.",
    "write the final recommendations immediately."
    ],
    "answer": 0,
    "explanation": "Enter the data into a computer for analysis. Data must be organized and processed before it can be analyzed. Recommendations come after analysis.",
    "source": "MGCI DECA original, IM:062"
    },
    {
    "cluster": "MKT",
    "q": "A snack manufacturer adds a new flavour to keep its product line current. This production decision is made to",
    "options": [
    "eliminate marketing.",
    "avoid using natural resources.",
    "reduce the number of customers.",
    "update the product and stay competitive."
    ],
    "answer": 3,
    "explanation": "Update the product and stay competitive. Production responds to market needs and trends. It does not aim to reduce customers or eliminate marketing.",
    "source": "MGCI DECA original, OP:017"
    },
    {
    "cluster": "MKT",
    "q": "Answering a business phone with \"Betty Clark's desk\" instead of a full professional greeting is a problem because it",
    "options": [
    "asks the caller a question.",
    "does not project a professional image of the business.",
    "includes the company's name.",
    "is too long."
    ],
    "answer": 1,
    "explanation": "Does not project a professional image of the business. A good greeting identifies the business and the speaker and offers help. The short greeting omits the company and an offer of assistance.",
    "source": "MGCI DECA original, CO:114"
    },
    {
    "cluster": "MKT",
    "q": "Thinking about what you value most, such as creativity or helping others, can help you",
    "options": [
    "copy a friend's career choice.",
    "avoid career planning.",
    "choose the highest-paying job only.",
    "identify an appropriate career."
    ],
    "answer": 3,
    "explanation": "Identify an appropriate career. Careers that match personal values tend to be more satisfying. Pay alone or copying others ignores personal fit.",
    "source": "MGCI DECA original, PD:013"
    },
    {
    "cluster": "MKT",
    "q": "Decisions that are made often and follow established rules, such as reordering a standard item, are",
    "options": [
    "emergency decisions.",
    "major decisions.",
    "strategic decisions.",
    "routine decisions."
    ],
    "answer": 3,
    "explanation": "Routine decisions. Routine decisions are made quickly using existing procedures. Major and strategic decisions require more analysis.",
    "source": "MGCI DECA original, PD:017"
    },
    {
    "cluster": "MKT",
    "q": "Employees who stay calm and work to prevent a problem from getting worse during an uncertain situation show",
    "options": [
    "indifference.",
    "aggression.",
    "panic.",
    "emotional competence."
    ],
    "answer": 3,
    "explanation": "Emotional competence. Managing emotions under pressure is a key emotional intelligence skill. Indifference, panic, and aggression make situations worse.",
    "source": "MGCI DECA original, EI:009"
    },
    {
    "cluster": "MKT",
    "q": "The profit an investor earns on an investment is its",
    "options": [
    "risk.",
    "liability.",
    "principal.",
    "return."
    ],
    "answer": 3,
    "explanation": "Return. Return is the gain from an investment. The principal is the original amount, risk is uncertainty, and liabilities are debts.",
    "source": "MGCI DECA original, FI:077"
    },
    {
    "cluster": "MKT",
    "q": "When a coworker disagrees with your marketing idea during a meeting, the best response is to",
    "options": [
    "refuse to discuss it.",
    "raise your voice.",
    "criticize the coworker personally.",
    "present supporting research for your idea."
    ],
    "answer": 3,
    "explanation": "Present supporting research for your idea. Evidence helps others evaluate ideas objectively. Shouting, refusing, and personal criticism damage discussion.",
    "source": "MGCI DECA original, CO:061"
    },
    {
    "cluster": "PFL",
    "q": "Before negotiating the price of a car, a buyer should",
    "options": [
    "tell the seller the maximum budget.",
    "shop at only one dealer.",
    "research prices ahead of time.",
    "accept the first offer."
    ],
    "answer": 2,
    "explanation": "Research prices ahead of time. Knowledge strengthens the buyer's position. Revealing budgets or accepting first offers weakens it.",
    "source": "MGCI DECA original, SE:392"
    },
    {
    "cluster": "PFL",
    "q": "The main purpose of reconciling a bank statement is to",
    "options": [
    "make sure your records match the bank's records.",
    "close the account.",
    "increase your balance.",
    "apply for a loan."
    ],
    "answer": 0,
    "explanation": "Make sure your records match the bank's records. Reconciling finds errors and unauthorized transactions. It does not change the balance or apply for credit.",
    "source": "MGCI DECA original, FI:070"
    },
    {
    "cluster": "PFL",
    "q": "Owners of common stock usually have the right to",
    "options": [
    "be repaid before creditors.",
    "receive guaranteed dividends.",
    "vote on important company decisions.",
    "manage daily operations."
    ],
    "answer": 2,
    "explanation": "Vote on important company decisions. Shareholders elect directors and vote on major issues. Dividends are not guaranteed, and creditors are paid first.",
    "source": "MGCI DECA original, PD:309"
    },
    {
    "cluster": "PFL",
    "q": "Government agencies that test food and drugs for safety help to",
    "options": [
    "protect consumers.",
    "eliminate competition.",
    "advertise products.",
    "raise product prices."
    ],
    "answer": 0,
    "explanation": "Protect consumers. Safety regulators set standards and can order recalls. They do not advertise or raise prices.",
    "source": "MGCI DECA original, PM:017"
    },
    {
    "cluster": "PFL",
    "q": "When the cost of groceries rises faster than people's paycheques, households",
    "options": [
    "have more money to save.",
    "pay lower taxes.",
    "can buy less with the same income.",
    "receive automatic raises."
    ],
    "answer": 2,
    "explanation": "Can buy less with the same income. Rising living costs reduce purchasing power. They do not increase savings or trigger automatic raises.",
    "source": "MGCI DECA original, FI:091"
    },
    {
    "cluster": "PFL",
    "q": "An insurance agent who sells policies from several different insurance companies is an",
    "options": [
    "exclusive agent.",
    "actuary.",
    "independent agent.",
    "underwriter."
    ],
    "answer": 2,
    "explanation": "Independent agent. Independent agents can compare policies from many insurers. Exclusive agents represent one company.",
    "source": "MGCI DECA original, FI:082"
    },
    {
    "cluster": "PFL",
    "q": "Money that an employer withholds from a paycheque for income tax and pension contributions are",
    "options": [
    "tips.",
    "bonuses.",
    "payroll deductions.",
    "commissions."
    ],
    "answer": 2,
    "explanation": "Payroll deductions. Deductions reduce gross pay to net pay. Bonuses, commissions, and tips add to pay.",
    "source": "MGCI DECA original, FI:068"
    },
    {
    "cluster": "PFL",
    "q": "Expenses that a taxpayer lists individually to reduce taxable income, such as certain charitable donations, are",
    "options": [
    "penalties.",
    "deductions.",
    "refunds.",
    "wages."
    ],
    "answer": 1,
    "explanation": "Deductions. Deductions lower the income on which tax is calculated. Refunds return overpaid tax, and penalties are charges.",
    "source": "MGCI DECA original, FI:074"
    },
    {
    "cluster": "PFL",
    "q": "Ratios that measure a company's ability to pay its short-term debts are",
    "options": [
    "valuation ratios.",
    "growth ratios.",
    "profitability ratios.",
    "liquidity ratios."
    ],
    "answer": 3,
    "explanation": "Liquidity ratios. Liquidity ratios, such as the current ratio, show short-term financial strength. The other ratios measure different things.",
    "source": "MGCI DECA original, FI:281"
    },
    {
    "cluster": "PFL",
    "q": "In a stock listing, the difference between today's closing price and yesterday's closing price is the",
    "options": [
    "net change.",
    "volume.",
    "52-week high.",
    "dividend."
    ],
    "answer": 0,
    "explanation": "Net change. Net change shows how much the price moved. Dividends are payments, volume is shares traded, and the 52-week high is the highest price in a year.",
    "source": "MGCI DECA original, FI:275"
    },
    {
    "cluster": "PFL",
    "q": "Group health and dental plans are often provided to workers by",
    "options": [
    "employers.",
    "stock exchanges.",
    "landlords.",
    "credit bureaus."
    ],
    "answer": 0,
    "explanation": "Employers. Many employers offer benefits as part of compensation. The other organizations do not.",
    "source": "MGCI DECA original, PD:330"
    },
    {
    "cluster": "PFL",
    "q": "Auto insurance that pays to repair your car after an accident, regardless of who was at fault, is",
    "options": [
    "liability coverage.",
    "collision coverage.",
    "renter's insurance.",
    "life insurance."
    ],
    "answer": 1,
    "explanation": "Collision coverage. Collision covers damage to your own car from accidents. Liability covers damage to others.",
    "source": "MGCI DECA original, PD:319"
    },
    {
    "cluster": "PFL",
    "q": "Unlike individual stocks, most mutual funds",
    "options": [
    "have no professional managers.",
    "are bought and sold at a price set once at the end of the trading day.",
    "can only be held for one day.",
    "guarantee returns."
    ],
    "answer": 1,
    "explanation": "Are bought and sold at a price set once at the end of the trading day. Mutual funds are priced daily, while stocks trade throughout the day. Funds are professionally managed and not guaranteed.",
    "source": "MGCI DECA original, PD:304"
    },
    {
    "cluster": "PFL",
    "q": "When progress toward a goal is slow, a successful person usually",
    "options": [
    "keeps at it and adjusts the plan if needed.",
    "gives up immediately.",
    "sets no further goals.",
    "blames others."
    ],
    "answer": 0,
    "explanation": "Keeps at it and adjusts the plan if needed. Persistence and flexibility help people reach goals. Quitting or blaming others does not.",
    "source": "MGCI DECA original, PD:018"
    },
    {
    "cluster": "PFL",
    "q": "Because people cannot have everything they want, they must make choices. This basic economic problem is called",
    "options": [
    "inflation.",
    "profit.",
    "surplus.",
    "scarcity."
    ],
    "answer": 3,
    "explanation": "Scarcity. Limited resources and unlimited wants force choices. Inflation, surplus, and profit are other economic concepts.",
    "source": "MGCI DECA original, EC:001"
    },
    {
    "cluster": "PFL",
    "q": "An employer retirement plan in which the amount you receive depends on how much was contributed and how the investments performed is a",
    "options": [
    "savings bond.",
    "defined benefit plan.",
    "defined contribution plan.",
    "term life policy."
    ],
    "answer": 2,
    "explanation": "Defined contribution plan. The retirement amount is not guaranteed and depends on contributions and returns. Defined benefit plans promise a set payment.",
    "source": "MGCI DECA original, FI:569"
    },
    {
    "cluster": "PFL",
    "q": "Before hiring a financial planner, a consumer should ask, \"How are your fees structured?\" in order to",
    "options": [
    "understand how the planner is paid and any conflicts of interest.",
    "learn where the planner went on vacation.",
    "decide what to eat for lunch.",
    "find out the planner's favourite stock."
    ],
    "answer": 0,
    "explanation": "Understand how the planner is paid and any conflicts of interest. Fee-only, commission, and salary structures can affect advice. The other questions are irrelevant.",
    "source": "MGCI DECA original, FI:076"
    },
    {
    "cluster": "PFL",
    "q": "Roads, highways, and bridges built by governments are examples of",
    "options": [
    "human resources.",
    "capital resources.",
    "consumer goods.",
    "natural resources."
    ],
    "answer": 1,
    "explanation": "Capital resources. Infrastructure is human-made and used to produce and deliver goods and services. Natural resources come from nature.",
    "source": "MGCI DECA original, EC:003"
    }
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
      users: {}, profiles: {}, roleplays: {}, feedback: {}, questions: {},
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
    const TITLES = {
      CORE: ["Coffee shop customer complaint", "Explaining business ownership to a new owner", "Training a new hire on customer service"],
      MKT: ["Ski resort loyalty program", "Launching a plant-based snack line", "Social media plan for a local gym", "Repositioning a sneaker brand"],
      FIN: ["Explaining a budget variance to a client", "Retirement savings plan for a young client", "Choosing between leasing and buying equipment"],
      ENT: ["Funding options for a food truck", "Pitching a campus delivery app", "Expanding a craft brewery"],
      HT: ["Overbooked hotel weekend", "Designing a family travel package", "Recovering from a bad restaurant review"],
      BMA: ["Reducing turnover at a call centre", "Handling a contract dispute with a supplier", "Rolling out a new HR policy"],
      PFL: ["First paycheque budgeting", "Choosing a first credit card"]
    };
    const SHEETS = [
      { situation: "Participant is a new marketing manager\nJudge is the owner of the business\nSales have dropped for two quarters\nMust recommend a plan before the busy season",
        intro: "Firm handshake and good eye contact\nRestated the problem clearly\nCould preview your solution in the introduction",
        creative: "Three-step plan with a catchy name\nSketched a simple chart of expected sales",
        conclusion: "Recapped each PI\nEnd by explaining why your plan fits this business",
        questions: [{ q: "How would you measure whether the plan worked?", notes: "Good answer: tracking monthly sales and repeat customers\nCould add a specific target" }, { q: "What would you do if the budget were cut in half?", notes: "Prioritized the cheapest ideas, nice\nTake a moment before answering so you sound confident" }],
        went: "Strong structure from start to finish", improve: "Connect every PI back to the case\nUse the full time: aim for about 8 minutes before questions" },
      { situation: "Participant is a customer service lead\nJudge is the regional manager\nOnline reviews mention slow responses\nMust propose a policy to fix response times",
        intro: "Clear greeting and introduction of your role\nExplained which PIs you would cover",
        creative: "A 24-hour response promise\nCustomer-of-the-month idea",
        conclusion: "Short but clear\nCould restate the main benefit to the business",
        questions: [{ q: "Is an automated reply enough for customers?", notes: "Picked a side and defended it, great\nGive one example to support your answer" }],
        went: "Realistic, practical ideas\nCalm and professional tone", improve: "Vary your tone and speed\nUse hand gestures to emphasize key points" },
      { situation: "Participant is a financial consultant\nJudge is a client opening a small business\nClient is unsure how to fund equipment\nMust compare options and recommend one",
        intro: "Good energy\nStated the client's goal in your own words",
        creative: "Simple comparison table of lease versus buy",
        conclusion: "Clear recommendation\nThanked the judge and summarized next steps",
        questions: [{ q: "What risks come with taking a loan?", notes: "Mentioned interest costs and cash flow, good\nCould mention what happens if sales are slow" }, { q: "Why not just use savings?", notes: "Answer was a bit short\nExplain the value of keeping an emergency cushion" }],
        went: "Explained financial terms simply\nEvery PI tied to the client's situation", improve: "Slow down when explaining numbers\nMake the conclusion a little longer" }
    ];
    const SEC_FB = {
      pi: ["You covered every PI, but PI 3 needed a concrete example.", "Strong explanation of the first two PIs. Tie the last one back to the judge's problem.", "Name each PI out loud as you address it so the judge can check it off."],
      sol: ["Practical idea, but give one number to show it would work.", "Creative solution. Explain how you would measure success.", "The solution was safe. Push for something more original."],
      car: ["Clear communication. Slow down when you explain your reasoning.", "Good critical thinking. Weigh one downside before deciding.", "Answered the judge's questions well. Make eye contact more often."],
      ovr: ["Confident and professional throughout.", "Strong handshake and opening. Finish with a clearer close.", "Good poise. Stand up straighter at the start."]
    };
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
      const secs = ev.type === "tdm" ? 600 + Math.floor(rand() * 300) : 420 + Math.floor(rand() * 200);
      db.roleplays[id] = {
        memberUid: uid, event, title: pick(TITLES[ev.cluster] || TITLES.CORE), area: pick(AREAS[ev.cluster] || AREAS.CORE), date: dayStr(day), mode: rand() > 0.5 ? "online" : "in-person",
        durationSec: secs, pis, criteria, total, maxTotal, judgeUid: judge, teamId: teamId || null, createdAt: now - (30 - day) * 864e5
      };
      const S2 = pick(SHEETS);
      db.feedback[id] = {
        memberUid: uid,
        situation: S2.situation, intro: S2.intro, creative: S2.creative, conclusion: S2.conclusion,
        questions: S2.questions, text: S2.went + "\n" + pick(FEEDBACK), improve: S2.improve,
        notes: { pi: pis.map((_, i) => (rand() > 0.25 ? pick(SEC_FB.pi) : "")), cr: criteria.map((c) => (rand() > 0.3 ? pick(c.section === "Solution" ? SEC_FB.sol : c.section === "Career competencies" ? SEC_FB.car : SEC_FB.ovr) : "")) }
      };
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
      db.feedback[id] = { ...JSON.parse(JSON.stringify(db.feedback[a])), memberUid: "u_lucas" };
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
