# Civic Connect — Participatory Governance Platform

> A unified digital platform bridging citizens and elected representatives through real-time consultation, AI-powered conflict detection, and transparent accountability.

Built at **Build for Bengaluru Hackathon** · 25–26 April 2025 · REVA University  
Theme: **Peacebuilding & Conflict Prevention** · SDG 16: Peace, Justice & Strong Institutions

---

## The Problem

Bengaluru has 9 million people. When BBMP announces a new infrastructure project, citizens find out after the tender is signed. When a local MLA resolves an issue, no one knows. When community tensions around a policy escalate, there is no early warning — only protests.

The governance system lacks:
- Structured platforms for **pre-policy public consultation**
- A unified space for **citizens to report and track local issues**
- **Direct engagement channels** between citizens and their elected representatives
- **Visibility into politician performance** between elections

This disconnect breeds distrust, conflict, and wasted public resources.

---

## The Solution

A two-sided platform where **citizens** and **government** communicate continuously — not just at election time.

**For citizens:**
- Report local issues with geo-tagged location and direct MLA/MP tagging
- Vote on upcoming government policies before they are implemented
- Track issue resolution status in real time

**For elected representatives:**
- Receive AI-generated weekly digests of constituency sentiment
- Manage and update issue resolution publicly
- Build a transparent work profile visible to all constituents

**For governance:**
- AI conflict-risk detection flags high-tension issues before they escalate
- Sentiment analysis on policy feedback informs decision-making
- Public accountability scores create measurable transparency

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Auth | Firebase Authentication |
| Database | Cloud Firestore (real-time) |
| Backend logic | Firebase Cloud Functions (Node.js) |
| AI / NLP | Gemini 2.5 Flash API |
| Maps | Google Maps Platform |
| Hosting | Firebase Hosting |
| Version control | GitHub |

All core infrastructure runs on Google technologies — Firebase, Gemini, and Google Maps Platform.

---

## Key Features

### Conflict-Risk Detection
Every citizen issue is processed by Gemini 2.5 Flash, which returns a conflict-risk score (`low / medium / high`) and a sentiment classification. High-risk issues are flagged immediately for representative attention — enabling early intervention before tensions escalate.

### Real-Time Issue Tracking
Citizens report issues with a Google Maps pin drop. The issue is tagged to the relevant MLA/MP and appears on their dashboard. Status updates by the representative propagate instantly to the citizen via Firestore real-time listeners.

### Pre-Policy Consultation
Government officials post upcoming policies for public comment before implementation. Citizens vote and leave feedback. Gemini summarizes the community response into a structured digest for the representative.

### Politician Transparency Profile
Each representative has a public profile showing: issues reported to them, resolution rate, engagement score, and a Gemini-generated weekly digest of their constituency's top concerns.

---

## Project Structure

```
civic-connect/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── citizen/          # Issue reporting, feed, policy voting
│   │   │   ├── politician/       # Dashboard, issue tracker, Gemini digest
│   │   │   └── auth/             # Login / OTP
│   │   ├── components/           # Shared UI: MapView, IssueCard, RiskBadge
│   │   └── services/             # Firebase service wrappers
│   └── package.json
├── functions/
│   ├── src/
│   │   ├── onIssueCreate.js      # Triggers Gemini on new issue, writes risk score
│   │   ├── onPolicyCreate.js     # Generates Gemini sentiment digest on new policy
│   │   └── notifyMla.js          # Notifies tagged representative
│   └── package.json
├── scripts/
│   ├── seed.js                   # Seeds demo data to Firestore
│   └── prerunGemini.js           # Pre-runs AI on demo data, caches results
├── firestore.rules
├── firebase.json
└── README.md
```

---

## Firestore Data Model

```
users/{uid}
  → name, role (citizen | mla | admin), wardId, mlaMpId

issues/{id}
  → title, description, lat, lng, wardId, taggedMla
  → status, conflictRisk, sentimentScore, createdAt

policies/{id}
  → title, description, postedBy, votesFor, votesAgainst
  → geminiSentimentDigest, status

politicians/{id}
  → name, ward, issuesResolved, engagementScore
  → geminiWeeklyDigest, workLog[]

votes/{policyId_uid}
  → vote (for | against), timestamp
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project with Firestore, Auth, Functions, and Hosting enabled
- Google Maps API key
- Gemini API key (from [Google AI Studio](https://aistudio.google.com))

### 1. Clone the repository

```bash
git clone https://github.com/your-org/civic-connect.git
cd civic-connect
```

### 2. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_MAPS_KEY=your_google_maps_key
```

```bash
npm run dev
```

### 3. Firebase Functions setup

```bash
cd functions
npm install
```

Create `functions/.env`:

```env
GEMINI_API_KEY=your_gemini_key
```

```bash
firebase deploy --only functions
```

### 4. Seed demo data

```bash
cd scripts
node seed.js
```

### 5. Deploy frontend

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## How the AI Layer Works

When a citizen submits an issue, `onIssueCreate` Cloud Function fires and calls Gemini 2.5 Flash with the following prompt structure:

```
Analyze this citizen issue: {title} - {description}.
Return JSON only: {
  sentimentScore: -1 to 1,
  conflictRisk: "low" | "medium" | "high",
  summary: "one sentence",
  tags: ["tag1", "tag2"]
}
```

The result is written back to the Firestore issue document and surfaced immediately on both the citizen's feed and the representative's dashboard.

For policies, a similar digest is generated from aggregated vote counts and comments.

---

## SDG Alignment

**SDG 16 — Peace, Justice and Strong Institutions**

| SDG 16 Target | How this platform addresses it |
|---|---|
| 16.6 — Effective, accountable institutions | Public politician profiles with verifiable resolution metrics |
| 16.7 — Participatory decision-making | Pre-policy consultation with voting before implementation |
| 16.10 — Public access to information | Real-time issue status, transparent engagement scores |

---

## Rotaract Focus Area

**Peacebuilding & Conflict Prevention** — The conflict-risk detection layer is the core differentiator. By flagging high-tension issues early, the platform enables representatives to respond before community frustration escalates into public conflict.

---

## Team

Built in 30 hours by a 4-person team from Bengaluru.

| Role | Responsibilities |
|---|---|
| Team Lead / Backend | System design, Firebase Functions, deployment, pitch |
| Frontend — Citizen Portal | Issue reporting, Maps integration, policy voting UI |
| AI Engineer | Gemini integration, sentiment analysis, conflict classifier |
| Frontend — Politician Dashboard | Representative UI, GitHub README, pitch deck |

---

## License

MIT License — see [LICENSE](LICENSE) for details.

Intellectual property developed during the hackathon remains with the participants.  
The organizers retain the right to showcase this project for promotional purposes.

---

> *Built for Bengaluru. Designed for every city.*
