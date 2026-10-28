# 🚀 NutriGuard AI: Stellar Blockchain Deployment & Monetization Architecture

This document describes the complete monetization, 14-day free trial anti-bypass system, and Stellar blockchain deployment specifications for **NutriGuard AI**.

---

## 🛡️ 1. Cryptographic Anti-Bypass Architecture

In typical web apps, malicious users can bypass client-side paywalls by editing `localStorage`, modifying JavaScript variables in DevTools, or making raw `fetch()` calls to backend endpoints.

NutriGuard AI eliminates this vulnerability using **Server-Side Cryptographic Enforcement**:

1. **HMAC-SHA256 Signed Tokens**:
   - Every user/device session receives a cryptographic token signed by the server (`server/licensing.ts`) using an internal secret key (`NUTRIGUARD_LICENSE_SECRET`).
   - The token contains: `deviceId`, `userEmail`, `isPaid`, `plan`, `trialStartedAt`, `trialExpiresAt`, `stellarTxHash`, and a secure `nonce`.
   - Modifying any timestamp or value in the browser invalidates the HMAC signature immediately (`402/403 Payment Required`).

2. **Server Middleware Protection**:
   - The core AI toxicology and chemical spectrometry routes (`/api/analyze-food`, `/api/chat-advice`) are guarded by `requireValidSubscriptionOrTrial`.
   - If a request arrives without a valid, unexpired token, the server **refuses to invoke the AI model** and returns HTTP `402 Payment Required`.
   - Even if an attacker completely strips the frontend UI, the backend will never return forensic food analysis without proof of an active trial or verified Stellar payment.

3. **Persistent Device & Trial Registry**:
   - Trials are tracked on the backend in `server/db.ts` (`trial_registrations`).
   - Clearing cookies or `localStorage` will not grant an attacker additional 14-day trials because the server recognizes the device footprint.

---

## ⏳ 2. The 14-Day Free Trial Engine

- Every new user gets **14 full days (336 hours / 1,209,600,000 ms)** of complete, unrestricted access.
- **Included in Free Trial**:
  - Full forensic AI spectrometry & poison identification.
  - Chemical formulas, estimated concentration in PPM, and antidote guides.
  - Allergen safety radar and FDA/EFSA contamination alerts.
  - Water & liquid drinkability testing.
  - Interactive clinical AI advisor.
- **Trial Banner & Countdown**:
  - Live days/hours indicator rendered in the UI with a progress bar.
  - When the 14 days elapse, the UI transitions to the **Stellar Paywall**, requiring a micropayment in XLM or USDC to unlock further scanning.

---

## 🌟 3. Stellar Blockchain Monetization

NutriGuard AI supports instant micropayments on the **Stellar network** (known for 3-5 second finality and sub-cent fees).

### Supported Assets & Tiers:
| Tier | Duration | Stellar XLM | Stellar USDC |
|------|----------|-------------|--------------|
| **Pro Monthly** | 30 Days | `25.00 XLM` (~$3.50) | `$9.99 USDC` |
| **Pro Annual** | 365 Days | `250.00 XLM` | `$89.99 USDC` |
| **Forensic Lifetime** | 10 Years | `500.00 XLM` | `$199.99 USDC` |

### Treasury Configuration:
- **Treasury Public Key**: `GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJULST`
- **Memo Format**: `MEMO_TEXT` containing `NG-<DEVICE_HASH>`
- **Horizon Endpoints**:
  - Testnet: `https://horizon-testnet.stellar.org`
  - Public Mainnet: `https://horizon.stellar.org`

### Anti-Replay Ledger Protection:
- The backend checks every submitted Stellar transaction hash on Horizon.
- Verified hashes are stored in `server/db.ts` (`stellar_transactions`).
- Attempting to submit the same transaction hash twice will result in an immediate `400: Double-spend attempt detected`.

---

## 🛠️ 4. Deploying the Soroban Smart Contract to Stellar

NutriGuard AI includes an on-chain **Soroban Smart Contract** in `contracts/nutriguard_license/` written in Rust.

### Prerequisites:
Install Rust and the Stellar CLI:
```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# 2. Install Stellar CLI
cargo install --locked stellar-cli --features opt
```

### Build the WASM Contract:
```bash
cd contracts/nutriguard_license
stellar contract build
```

### Deploy to Stellar Testnet:
```bash
# Generate / configure deployer identity
stellar keys generate --global nutriguard-admin --network testnet
stellar keys fund nutriguard-admin --network testnet

# Deploy WASM bytecode to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/nutriguard_license.wasm \
  --source nutriguard-admin \
  --network testnet
```
*Output will give your `CONTRACT_ID` (e.g. `CA...`).*

### Initialize the Contract:
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source nutriguard-admin \
  --network testnet \
  -- \
  initialize \
  --admin $(stellar keys address nutriguard-admin) \
  --treasury GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJULST
```

### Verify License On-Chain:
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source nutriguard-admin \
  --network testnet \
  -- \
  check_license \
  --device_id "dev-8472-a9f1"
```

---

## 🌐 5. Deploying the NutriGuard AI Full-Stack App

The application is a full-stack Node.js + Express + React + Vite application ready to deploy to any cloud provider (Google Cloud Run, Railway, Render, Fly.io, Heroku, Docker).

### Environment Variables:
```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
NUTRIGUARD_LICENSE_SECRET=your_32_byte_secret_key_here
STELLAR_TREASURY_PUBLIC_KEY=GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJULST
```

### Production Build & Start Commands:
```bash
# 1. Install dependencies
npm install

# 2. Build the optimized Vite client
npm run build

# 3. Start the production server
npm start
```

### Dockerfile (Optional for Container Deployments):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🧪 6. Testing the Stellar Monetization in the App

1. Launch the app (`npm run dev` or production build).
2. Look at the top bar: the **"14-Day Free Trial"** badge is active with 14 days remaining.
3. Click **"Pay with Stellar"** or **"Upgrade Pro"** in the header.
4. Select **"Stellar Blockchain (XLM)"** or open the dedicated Stellar checkout.
5. Choose your plan (**Monthly 25 XLM**, **Annual 250 XLM**, or **Lifetime 500 XLM**).
6. Click **"1-Click Testnet Demo Verification"** (or enter a live testnet transaction hash) to verify against the ledger.
7. The server cryptographically validates the ledger entry and issues a verified paid license token!
