# DevPath — Benchmark Research (Agent R)

Scope: what the best learning and craft products do, which of our hypotheses the evidence supports, and a ranked list of levers mapped to DevPath's current engine (XP, levels, streak + freezes, daily XP goal, quests, achievements, spaced-repetition review queue, Kip companion, path map, command palette, Wrapped recap, Arena mock interviews).

Evidence grades used below: **A** = randomized trial, meta-analysis, or public A/B result with numbers. **B** = first-party claim or reported company metric. **C** = practitioner or observational write-up.

---

## 1. Headline numbers worth remembering

| Fact | Source |
|---|---|
| Duolingo streak program: current-user retention rate (CURR) +21%, which means daily churn of best users fell more than 40%. Together with other bets, DAU grew 4.5x over 4 years. | [Mazal, Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth) (B) |
| Learners who reach a 7-day streak are 2.4x more likely to come back the next day. | [Duolingo blog](https://blog.duolingo.com/improving-the-streak/) (B) |
| Separating the streak (1 lesson) from the daily goal: Day-14 retention +3.3%, DAU +1%, new learners on a streak +19%. Learners on a 7+ day streak rose from about one third to more than half of DAU. | [Duolingo blog](https://blog.duolingo.com/improving-the-streak/) (A, A/B test) |
| Allowing 2 equipped streak freezes instead of 1: daily active learners +0.38%. A third freeze added nothing. | [Duolingo blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit/) (A) |
| Weekend Amulet: +4% return a week later, 5% less streak loss. Streak Wager: Day-7 retention +14%. | [Duolingo blog](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/) (A) |
| Leagues: learning time +17%, highly engaged learners (1 hour/day, 5 days/week) tripled, lesson completion +25%. | [Mazal](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth) (B) |
| Friend Streak: users with at least one are 22% more likely to finish their daily lesson. | [Duolingo blog](https://blog.duolingo.com/product-lessons-friend-streak/) (B, observational) |
| Lesson first, signup later: about +20% DAU. Soft-wall refinements added another +8.2% DAU. | [First Round Review](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker/) (A) |
| A notification bandit that rotates fresh templates: DAU +0.5%, new-user retention +2%. | [Yancey & Settles, KDD 2020](https://research.duolingo.com/papers/yancey.kdd20.pdf) (A) |
| Duolingo DAU was 58.7M in Q2 2026 (+23% YoY). Management credits product changes, marketing, and a one-time event to revive lost streaks. | [Q2 FY26 letter](https://www.sec.gov/Archives/edgar/data/1562088/000162828026053299/q2fy26duolingo6-30x26share.htm) (B) |
| "Dead Duo" campaign: 1.7B impressions in 2 weeks, about 50.9B XP earned by the community to "revive" the mascot. | [Fast Company](https://www.fastcompany.com/91313082/duolingo-dead-duo-owl-social-media-campaign), [Energy PR](https://www.energypr.co.uk/blog/the-death-of-duo-a-social-media-success-from-duolingo/) (B) |
| Spotify Wrapped 2025: 200M engaged users and 500M shares in 24 hours (+19% engagement, +41% shares YoY). 575M shares by 65 hours. The new "Listening Age" card alone drew 65M shares. | [Business Insider](https://www.businessinsider.com/spotify-wrapped-2025-metrics-2025-12), [Variety](https://variety.com/2025/music/news/spotify-wrapped-breaks-own-record-250-million-engagements-1236603493/) (B) |
| Duolingo Year-in-Review: the top 10% of XP earners produced more than half of all shares, until "learner style" cards gave everyone a non-ranked identity to share. | [Duolingo blog](https://blog.duolingo.com/year-in-review-behind-the-scenes/) (B) |
| Active learning vs lecture: exam scores +0.47 SD, and failure rate 21.8% vs 33.8% (lecture students 1.5x more likely to fail). | [Freeman et al., PNAS 2014](https://www.pnas.org/doi/10.1073/pnas.1319030111) (A, 225 studies) |
| Spaced vs massed retrieval practice: g = 0.74. Expanding vs uniform intervals: no significant difference (g = 0.03). | [Latimier et al. 2021](https://link.springer.com/article/10.1007/s10648-020-09572-8) (A) |
| Distributed practice across 317 experiments: spacing beat massing in 259 of 271 comparisons. An optimal gap improved final recall by up to 150%. | [Cepeda et al. 2006](https://doi.org/10.1037/0033-2909.132.3.354), [Cepeda 2009](https://pubmed.ncbi.nlm.nih.gov/19439395/) (A) |
| Feedback effect on learning: d = 0.48 (435 studies). It is strongest when the feedback carries task information, and weaker when it is praise only. | [Wisniewski, Zierer & Hattie 2020](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full) (A) |
| Khanmigo randomized trial (18 schools, 2 years): +0.06–0.08 SD per year, the same as practice without AI. 96% of students tried the tutor, but they messaged it in only 17% of the sessions where they made a mistake. | [NBER w35620](https://www.nber.org/papers/w35620) (A) |
| Khan Academy: 30+ minutes per week is associated with about 20% greater-than-expected gains. Only 9% of students reached that dose. | [Khan blog](https://blog.khanacademy.org/khan-academy-efficacy-results-november-2024/) (B) |
| Brilliant unified, retry-friendly problem flow with encouraging feedback: daily active learners +8.1%, lesson completion +7%. | [Paige Ormiston case study](https://www.paigeormiston.com/brilliant) (B) |
| MOOC completion (MITx/HarvardX, 5.6M learners): 3.1% overall, 15% even among learners who said they intended to finish. | [Reich & Ruipérez-Valiente, Science 2019](https://www.science.org/doi/10.1126/science.aav7958) (A, observational census) |
| roadmap.sh has about 370K GitHub stars (around #8 of all repositories). NeetCode's roadmap claims more than 1M users. | [GitHub](https://github.com/nilbuild/developer-roadmap), [NeetCode](https://blog.neetcode.io/p/prepare-coding-interviews) (B) |

---

## 2. Product teardowns (short)

### Duolingo
- **Core loop:** a 2–5 minute lesson, then XP, then streak +1, then a league position update. The next lesson is always the single glowing node on the path.
- **Retention:** streak (with a deliberately low bar of one lesson), 2 freezes, Weekend Amulet, Streak Wager, leagues of about 30 learners matched by engagement, friend streaks, a streak-saver push late at night.
- **Onboarding:** pick a goal, take a placement test or start from scratch, and **do a lesson before signup**. Soft walls come before a hard wall ([First Round](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker/)).
- **Identity and character:** Duo the owl is a passive-aggressive, meme-native mascot with a cast of friends. Real personality makes the stunts work: by marketers' accounts, Planters' Mr. Peanut "death" flopped because nobody felt attached ([Marketing Brew](https://www.marketingbrew.com/stories/2025/02/25/planning-to-kill-your-mascot-consider-the-following)).
- **Why people tell friends:** streak bragging ("1,435 days, no freezes"), Year-in-Review cards, and mascot memes. 80–90% of users are said to arrive organically ([ApsteQ teardown](https://apsteq.com/videos/duolingo-retention-teardown/), C).

### Brilliant
- **Core loop:** one idea per lesson, and you **try before you're taught** (pretesting), with interactive visuals and instant custom feedback ([About](https://brilliant.org/about/)).
- **Retention:** streaks and leagues only. They deliberately "avoid packing too many game incentives" and say most of their retention gain came from content quality.
- **AI:** the Koji tutor sees the screen state and what the learner tried, gives escalating hints, and steps back during independent practice.
- **Identity:** clean, tactile, with sound and haptics on every interaction. Retry-without-punishment flow was a measured win (+8.1% daily active learners).
- **Takeaway for DevPath:** the interaction design of a single problem matters more than adding another game mechanic.

### Boot.dev (the closest analogue to DevPath)
- **Core loop:** read briefly, write code in the browser, submit, get XP and maybe a chest. Heavy RPG framing: quests, bosses, potions, "Seer Stones" to peek at a solution.
- **Retention:** daily streaks (moved from weekly to daily in 2024 because "it's just so much more powerful to build a daily habit"), "embers" earned on hard days that protect a missed day, and a public live leaderboard ([Nov 2024](https://www.boot.dev/blog/news/bootdev-beat-2024-11)).
- **Character and AI:** Boots, a wizard bear who uses the Socratic method and is pre-prompted with every lesson and its solution. **Asking Boots before you solve costs XP** unless you spend Baked Salmon; chatting after you solve is free ([May 2024](https://www.boot.dev/blog/news/bootdev-beat-2024-05)). The leaderboard shows about 6.5K Boots chats per day against 74K lessons per day ([leaderboard](https://www.boot.dev/leaderboard)).
- **Community events:** Halloween boss fights where everyone's XP pools into a single shared boss.
- **Why people tell friends:** the humor and lore around Boots, the lootbox dopamine, and a clear career path.

### Codecademy
- **Core loop:** instructions on the left, editor on the right, "Run" with tests checking your code. Code runs in the first minute.
- **Retention:** career paths, streaks, weekly targets, and certificates.
- **Contrast:** strong at doing, weaker at personality. There is no character, and the tone is neutral and corporate.

### Khan Academy
- **Core loop:** mastery-based practice (familiar, then proficient, then mastered) with "course challenges."
- **Evidence:** gains track practice dose and skills mastered, not the AI chat ([NBER](https://www.nber.org/papers/w35620), [PNAS](https://www.pnas.org/doi/10.1073/pnas.2507708123)).
- **AI lesson:** Khanmigo access was near-universal but engagement was thin, mostly bare answers or clicks on suggested prompts. **An AI tutor does not help if students never ask it for help.** The tutor has to proactively appear at the moment of the mistake.

### freeCodeCamp
- **Core loop:** small step-by-step challenges with tests, which build up to projects and then certifications.
- **Retention:** a free certificate, a public profile, and a huge forum. The GitHub repo has about 456K stars ([leaderboard](https://githublb.vercel.app/)).
- **Why people tell friends:** it's free, the certificates go on LinkedIn, and there are community success stories.

### roadmap.sh
- **Core loop:** a visual node graph per role. Click a node, read resources, and mark it done, learning, or skipped.
- **Why it spreads:** the map itself is the shareable artifact ("here's my frontend roadmap, 62% done"). There are also custom community roadmaps.
- **Proof that visual roadmaps spread:** about 370K stars and a claimed 3.2M+ registered users ([community](https://roadmap.sh/community)).

### NeetCode / LeetCode
- **NeetCode:** a curated 150-problem list grouped by **pattern**, with a dependency roadmap and a free video for every problem. Its explicit advice is to "Repetition — review and re-solve problems" ([blog](https://blog.neetcode.io/p/prepare-coding-interviews)). It beats LeetCode for beginners because 3,000 problems is intimidating ([Reddit, NeetCode reply](https://www.reddit.com/r/leetcode/comments/1ac232r/why_is_everybody_doing_neetcode_150/)).
- **LeetCode:** daily challenge, contests, and a public submission heatmap. The heatmap and contest rating are the artifacts people screenshot.

### Scrimba
- **Core loop:** "scrims," which are recorded *editor events* rather than video pixels. You pause and edit the teacher's code in place, so "the video player is the IDE" ([Scrimba](https://scrimba.com/articles/the-quality-of-a-coding-bootcamp-at-the-price-of-a-gym-membership/)).
- **Principle:** "teachers write as little code as possible before they tell the student to take over."
- **Why people tell friends:** students call it "mind blowing" because the format itself is the novelty.

### Mimo / Sololearn
- **Core loop:** 5–10 minute mobile lessons with fill-in-the-blank code, XP, streaks, and leagues. Sololearn adds hearts (a limited number of mistakes) and community code challenges ([Scrimba vs Sololearn](https://scrimba.com/articles/scrimba-vs-sololearn/)).
- **Caveat:** tapping the correct answer trains recognition, not producing code. They are good at habit, weak at depth. DevPath should keep real typing in the core loop.

### Exercism
- **Core loop:** exercises, then automated analysis, then **free human mentoring**. 3.1M students, 72M submissions, 417K mentoring discussions ([impact](https://exercism.org/about/impact)).
- **Lever:** "be mentored and mentor." Teaching others reinforces learning and earns reputation.

### Coursera / Udemy (contrast)
- Long video curricula with weak forcing functions. MOOC completion is about 3% ([Science](https://www.science.org/doi/10.1126/science.aav7958)).
- Verified (paid) learners complete at about 46%. **Commitment devices, not content, move completion.**
- Lesson for DevPath: do not let the curriculum become a 40-hour course; always show only the next 5 minutes.

### Anki
- **Core loop:** due cards, recall, grade yourself, and the algorithm schedules the next review. FSRS (now in Anki) predicts recall with 44% lower log loss than SM-2 and lets users set a target retention ([Anki FAQ](https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html), [Yazu](https://yazu.app/blog/why-fsrs-means-fewer-reviews/)).
- **Caveat:** the popular "20–30% fewer reviews" figure has no traceable source; don't cite it.
- **Retention risk:** a pile of overdue reviews is the classic reason people quit Anki. Cap daily reviews and handle reviews done late gracefully.

### Linear / Notion / Cursor (UI craft)
- **Linear:** keyboard-first but mouse-friendly, with ⌘K for everything and mnemonic shortcuts. **"Keyboard shortcuts and command menus only feel great if your product is fast."** It uses local-first optimistic updates and a global undo ([Saarinen interview](https://sarharibhakti.substack.com/p/a-better-way-to-build-software)). Right-click menus teach the shortcuts ([Invisible details](https://linear.app/now/invisible-details)). Their quality policy: zero bugs, with issues fixed within 7 days ([Why is quality so rare?](https://linear.app/now/why-is-quality-so-rare)).
- **Notion:** blocks, templates, and a template gallery. User-made templates are its free growth channel.
- **Cursor:** AI is embedded in the work surface (inline, with diffs and context), not off to the side in a chat. That maps directly to having Kip live inside the editor.

### Spotify Wrapped (shareability)
- **Mechanics:** a vertical story format, one big stat per card, identity labels ("Listening Age," personality types), and story-sized images ready for Instagram, plus a social layer ("Wrapped Party").
- **Numbers:** 500M shares in 24 hours ([Business Insider](https://www.businessinsider.com/spotify-wrapped-2025-metrics-2025-12)). A single novel identity card drew 65M shares.
- **Key insight from Duolingo's version:** ranking-based cards only get shared by the top 10%. **Identity cards that aren't rankings get everyone sharing.**

---

## 3. Hypotheses: verdicts

| # | Hypothesis | Verdict | Evidence |
|---|---|---|---|
| H1 | Tiny sessions plus an always-visible next step beat big curricula | **Supported** | Separating "1 lesson keeps the streak" from the daily goal raised Day-14 retention (+3.3%) and the share of learners on a streak ([Duolingo](https://blog.duolingo.com/improving-the-streak/)). Duolingo found "binge" learners churn more ([Duolingo](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)). MOOCs complete at about 3%. NeetCode's curated 150 beats LeetCode's 3,000 for beginners. |
| H2 | Streaks, goals, and loss aversion drive habit, while forgiving mechanics prevent churn | **Strongly supported, with a cap** | CURR +21%, 7-day streak = 2.4x next-day return. 2 freezes gave +0.38% but **3 gave no extra benefit**. Weekend Amulet +4%. Boot.dev embers. Retention flattens after day 7, so focus on getting users from 0 to 7 days ([Lenny's podcast](https://lennyspodcast.podplaybooks.com/episodes/behind-the-product-duolingo-streaks-2024-12-15)). |
| H3 | Learning by doing in the first 30 seconds beats reading | **Supported** | Active learning: +0.47 SD and fewer failures ([Freeman](https://www.pnas.org/doi/10.1073/pnas.1319030111)). Lesson-before-signup: +20% DAU. Brilliant pretests before teaching. Scrimba hands over the keyboard as soon as possible. |
| H4 | A consistent character creates attachment | **Supported for brand and virality; unproven for learning** | Dead Duo: 1.7B impressions and 50.9B XP. Mr. Peanut's equivalent flopped because it lacked attachment. Boots is beloved, but Khanmigo shows **students rarely use an AI tutor unprompted**. Character drives sharing and return visits, not learning gains by itself. |
| H5 | Visual roadmaps make progress feel real and are shareable | **Supported (observational)** | roadmap.sh has about 370K stars. NeetCode credits its roadmap's clarity about how patterns relate. Brilliant intentionally shows a *simplified* prerequisite graph to give "clear and satisfying milestones" ([About](https://brilliant.org/about/)). There is no randomized trial. |
| H6 | Spaced repetition produces outcomes that sustain belief | **Supported for outcomes; belief is inferred** | g = 0.74 for spaced retrieval. Expanding intervals are no better than uniform ones, so DevPath doesn't need a fancy schedule to get most of the benefit. The "sustains belief" part is plausible (re-solving a problem you once failed feels like progress) but has no direct study behind it. |
| H7 | Celebration and fast feedback are underrated | **Feedback: supported. Celebration: weaker** | Feedback d = 0.48, strongest when it carries task information ([Wisniewski](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full)). Brilliant's encouraging, retryable feedback gave +8.1% daily active learners. Linear: speed is a feature. Pure celebration (confetti) has no isolated evidence. Pair it with information ("you beat your previous runtime by 40%"). |
| H8 | Shareable artifacts are free growth | **Supported** | Wrapped: 575M shares in 65 hours. Duolingo Year-in-Review drove a "significant spike in new users." Identity cards outperform ranking cards. |

---

## 4. Ranked success levers

Impact: **H** = likely moves Day-7 retention or weekly active users noticeably; **M** = a clear but secondary effect; **L** = polish. Effort: S under 1 day, M 1–3 days, L over 3 days.

### 4a. Levers that map onto existing DevPath systems (tune, don't rebuild)

| # | Lever | Evidence | DevPath mapping | Effort | Impact |
|---|---|---|---|---|---|
| 1 | **Low streak bar, decoupled from the daily goal** (1 accepted solve or 1 review keeps the streak; the XP goal is separate) | [Duolingo: D14 +3.3%, 7+ day streaks +40%](https://blog.duolingo.com/improving-the-streak/) | Make sure the streak event fires on *any* qualifying action (a review card counts). Show the daily XP goal as a separate ring. | S | H |
| 2 | **Push the first week, from 0 to a 7-day streak** | [2.4x next-day return at 7 days](https://blog.duolingo.com/improving-the-streak/), [retention flattens after day 7](https://lennyspodcast.podplaybooks.com/episodes/behind-the-product-duolingo-streaks-2024-12-15) | A "First 7 days" quest chain, a day-7 achievement with a Wrapped-style card, and Kip's mood tied to streak progress. | S | H |
| 3 | **Cap freezes at 2, plus earn-a-freeze ("embers")** | [2 freezes +0.38%, 3 = no gain](https://blog.duolingo.com/how-duolingo-streak-builds-habit/), [Boot.dev embers](https://www.boot.dev/blog/news/bootdev-beat-2024-11) | Award a freeze when the daily goal is beaten 2x. Max 2 equipped. Show a "freeze used" note instead of a silent rescue. | S | M |
| 4 | **Always-visible single next step** | [Brilliant: one idea per lesson](https://brilliant.org/about/), MOOC ~3% completion | The dashboard hero is a single "Continue: Two Pointers · Lesson 3 · ~4 min" button. The path map highlights one node. The command palette's top item is "Resume." | S | H |
| 5 | **Spaced-repetition queue as "re-solve," with a capped daily load** | [g = 0.74](https://link.springer.com/article/10.1007/s10648-020-09572-8), [NeetCode: re-solve](https://blog.neetcode.io/p/prepare-coding-interviews), Anki overdue-pile churn | Show the count of items due today on the dashboard, capped at about 5 per day so overdue items don't pile up. Fixed intervals (1, 3, 7, 21 days) are fine since expanding schedules show no extra benefit. Re-solving earns XP and counts toward the streak. | M | H |
| 6 | **Retry-friendly, informative judge feedback** | [Feedback d = 0.48](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full), [Brilliant +8.1% DAL](https://www.paigeormiston.com/brilliant) | Show the failing test case diff, give a one-line "what this usually means," and don't penalize XP on retry. Speed matters: show the run result in under 2 seconds or stream it. | M | H |
| 7 | **Kip appears proactively at the moment of a mistake** | [Khanmigo: used in only 17% of sessions with errors](https://www.nber.org/papers/w35620), [Boots is Socratic](https://www.boot.dev/blog/wiki/boots) | After 2 failed submits, Kip's glyph changes mood and offers one Socratic nudge inline in the editor (not in a side panel). Hints before solving cost a bit of XP; chatting after solving is free (the Boot.dev model). | M | H |
| 8 | **Wrapped built on identity, not rank** | [Duolingo: the top 10% made over half of shares until identity cards](https://blog.duolingo.com/year-in-review-behind-the-scenes/), [Listening Age: 65M shares](https://variety.com/2025/music/news/spotify-wrapped-breaks-own-record-250-million-engagements-1236603493/) | Add an "Algorithm persona" card (e.g., "Greedy Optimist," "Recursion Monk") and a "Big-O age." Export a 1080×1920 story image. Make Wrapped available monthly, not just yearly. | M | H |
| 9 | **Shareable path map** | [roadmap.sh ~370K stars](https://github.com/nilbuild/developer-roadmap) | A public read-only `/u/[handle]/path` page plus an Open Graph image of the map with a completion percentage. | M | M |
| 10 | **Quests that bring users back the next day** | [Streak Wager D7 +14%](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/) | An opt-in "7-day pledge" quest that rewards double XP on completion. Daily quests refresh at local midnight. | S | M |
| 11 | **Command palette that is fast and teaches shortcuts** | [Linear: shortcuts only feel great if fast](https://sarharibhakti.substack.com/p/a-better-way-to-build-software) | Optimistic UI for XP and streak updates. Show the shortcut hint next to every palette item. Add "Resume," "Review due," and "Ask Kip" commands. | S | L |
| 12 | **Arena as a weekly event, not just a tool** | [Leagues: +17% learning time, 3x highly engaged users](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth) | Run a weekly Arena problem set with a scoped ranking (cohort or college), bronze/silver/gold tiers, and a shareable score card. | M | M |
| 13 | **Celebration paired with information** | [Feedback strongest when task-informative](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full) | Accept screen shows "+XP," a streak flame animation, *and* a specific fact such as "O(n) — 3x faster than your last attempt" or "Pattern unlocked: sliding window." | S | M |

### 4b. Levers NOT yet covered (next-session backlog)

| # | Lever | Evidence | Concrete DevPath move | Effort | Impact |
|---|---|---|---|---|---|
| B1 | **Try before signup (soft walls)** | [+20% DAU, later +8.2% more](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker/) | Landing page offers "Solve your first problem — no account" with an in-browser editor and a local draft. Ask for signup only after the first accepted solve: "Save your streak." Requires middleware to allow a `/try` route. | M | H |
| B2 | **Code in the first 30 seconds of onboarding** | [Freeman active learning](https://www.pnas.org/doi/10.1073/pnas.1319030111), [Brilliant pretesting](https://brilliant.org/about/) | Replace the first onboarding questionnaire step with a 3-line "fix this bug" micro-problem that also works as placement. | S | H |
| B3 | **Streak-saver reminder (email or web push)** | [Mazal: the single most valuable notification](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth), [rotating templates: +2% new-user retention](https://research.duolingo.com/papers/yancey.kdd20.pdf) | An evening email or push if the streak is at risk, written in Kip's voice with rotating templates. | M | H |
| B4 | **Friend or cohort streaks** | [+22% daily completion](https://blog.duolingo.com/product-lessons-friend-streak/) | Invite-link pairs who share a streak, and college/cohort pods (fits the SAIT student context). | L | H |
| B5 | **Weekly leagues by engagement** | [Leagues: +17% time, +25% completion](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth) | Groups of about 30 matched by last week's XP; the top 5 promote. Ranking infrastructure already exists. | L | H |
| B6 | **Pattern-first curriculum view** | [NeetCode roadmap, 1M+ users](https://blog.neetcode.io/p/prepare-coding-interviews) | An alternate path-map lens grouped by pattern (sliding window, BFS…) with problem counts per pattern. | M | M |
| B7 | **Community "boss" event** | [Dead Duo: 50.9B XP pooled](https://www.energypr.co.uk/blog/the-death-of-duo-a-social-media-success-from-duolingo/), [Boot.dev boss fights](https://www.boot.dev/blog/news/bootdev-beat-2024-11) | A seasonal event where everyone's accepted solves damage a shared "Big-O boss," and Kip reacts. | M | M |
| B8 | **Human / peer review loop** | [Exercism: 417K mentoring discussions](https://exercism.org/about/impact) | After an accepted solve, offer "Explain your solution in 2 lines" for a short peer upvote feed. Teaching reinforces learning. | L | M |
| B9 | **Editable worked examples ("scrim-lite")** | [Scrimba: hand the keyboard over ASAP](https://scrimba.com/articles/the-quality-of-a-coding-bootcamp-at-the-price-of-a-gym-membership/) | Lesson examples are pre-filled editor states: run, modify, run again, with the visualizer synced. | M | M |
| B10 | **Public profile heatmap and badge embed** | LeetCode heatmap culture, [freeCodeCamp certs](https://githublb.vercel.app/) | `/u/[handle]` with a contribution-style heatmap, plus an embeddable SVG badge for READMEs and LinkedIn. | M | M |
| B11 | **Weekend / exam-week protection** | [Weekend Amulet +4%](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/) | An "Exam mode" toggle that protects the streak for up to 3 days, earned via quests. | S | M |
| B12 | **Measure it: an experiment harness** | Duolingo runs 300+ experiments per quarter ([ApsteQ](https://apsteq.com/videos/duolingo-retention-teardown/), C) | Track D1/D7/D14 retention and the percentage of users on a 7+ day streak from the event store. Add a feature-flag bucket for A/B tests. | M | H (enabler) |

---

## 5. Anti-patterns to avoid (evidence-backed)

- **More than 2 freezes:** no retention gain ([Duolingo](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)).
- **Rewarding binge sessions:** bingers churn more ([Duolingo](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)). Cap XP per day for anything that counts toward the streak, and reward consistency instead.
- **AI tutor only in a side panel:** students rarely ask on their own ([Khanmigo RCT](https://www.nber.org/papers/w35620)).
- **Shareables that are leaderboards:** only top users share them ([Duolingo YiR](https://blog.duolingo.com/year-in-review-behind-the-scenes/)).
- **Game-mechanic sprawl:** Brilliant says content delivery drove most of its retention, and it limits itself to a few loops ([About](https://brilliant.org/about/)). DevPath already has many systems. The next session should *tune and surface* them, not add ten new ones.
- **Tap-to-answer as the core loop:** it trains recognition, not producing code ([Scrimba vs Sololearn](https://scrimba.com/articles/scrimba-vs-sololearn/)).
- **Unsourced stats** such as "FSRS = 20–30% fewer reviews" have no traceable source ([Yazu](https://yazu.app/blog/why-fsrs-means-fewer-reviews/)).

---

## 6. Recommended next-session order

1. Levers 1, 2 and 4: low streak bar, first-week push, single next step. Small effort, high impact, and all use existing systems.
2. B2 and B1: code in the first 30 seconds, then try before signup.
3. Lever 6 and Lever 7: informative retry-friendly feedback, plus Kip stepping in after a failed submit.
4. Lever 5: a capped daily review queue that counts toward the streak.
5. Lever 8 and Lever 9: identity-based Wrapped cards and a shareable path map with an Open Graph image.
6. B12: retention metrics from the event store, so the next round of changes can be measured.
7. B3 then B5/B4: reminders, then the social layer (leagues, friend/cohort streaks).
