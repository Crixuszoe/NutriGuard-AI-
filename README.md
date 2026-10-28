# NutriGuard AI 🛡️🥦

**AI-Powered Food Security & Nutritional Analysis Mobile & Web Platform**

NutriGuard AI is an advanced food safety, poison detection, and nutritional intelligence application. Built with React, TypeScript, Tailwind CSS, and a robust Express backend with local JSON persistence and Google Chat community support integration.

---

## ✨ Features

- 🔬 **Real-Time Poison & Contaminant Detection**: Chemical composition breakdown, estimated addition timestamp, hazard severity, toxicity index, and emergency countermeasures.
- 🥗 **Ingredient Breakdown & Freshness Scoring**: Automated allergen warnings, additive identification, and organic freshness metrics.
- 📊 **Nutritional Analysis**: Comprehensive macro/micronutrient tracking, calorie counts, daily percentage values, and dietary compatibility.
- 🍄 **Spoilage & Shelf-Life Estimation**: Microbial growth risk, humidity/temperature sensitivity, and safe storage recommendations.
- 💧 **Water & Beverage Safety**: pH estimation, heavy metal risk assessment, and bacterial safety index.
- ⛓️ **Blockchain Food Traceability**: Simulated tamper-proof farm-to-table verification with cryptographic hashes.
- 💬 **Google Chat Community Support**: Real-time collaborative discussion rooms for food alerts, recall notifications, and nutrition advice.
- 🚨 **One-Touch Emergency Hotlines**: Immediate access to Poison Control, Emergency Medical Services, and local emergency centers.
- 👑 **Subscription Management**: Free, Pro, and Enterprise tiers with premium chemical modeling and exportable PDF safety reports.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend**: Node.js, Express, TypeScript (`tsx`)
- **Persistence**: File-based transactional database (`data/nutriguard-database.json`)
- **Integrations**: Google Chat API (OAuth 2.0), Google Vision / Gemini AI models

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Crixuszoe/NutriGuard-AI-.git
cd NutriGuard-AI-
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Add your `GEMINI_API_KEY` in `.env` if using direct Gemini calls.

4. Start the development server:
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## 📁 Project Structure

```
├── data/
│   └── nutriguard-database.json   # Persistent JSON database (scans, rooms, user)
├── server/
│   └── db.ts                      # Backend database operations and schema
├── server.ts                      # Express server with Vite middleware integration
├── src/
│   ├── components/                # Modular UI cards, modals, sliders, and drawers
│   ├── services/                  # API client and Google Chat OAuth service
│   ├── types/                     # TypeScript definitions for food safety & scans
│   ├── App.tsx                    # Main interactive mobile-frame application
│   └── main.tsx                   # React root entry point
├── package.json
└── vite.config.ts
```

---

## 📄 License
Apache-2.0
