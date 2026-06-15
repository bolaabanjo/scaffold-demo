# Basecamp — Web3 AI Assistant

Basecamp is a modern, premium Web3 AI chatbot that assists users with blockchain questions, smart contract development, and DeFi concepts. The app is built on **Next.js** using the **Cencori SDK** for AI models and integrates **Celo cUSD on-chain payments** to gate premium "Pro" model tiers. It is optimized to run inside the **Opera MiniPay** browser.

---

## Key Features

1. **Dual-Tier AI Capabilities**:
   - **Standard Tier (Free)**: Quick access to standard AI models.
   - **Pro Tier (Paid)**: Premium models (e.g. Claude 3.5 Sonnet) accessible for **0.02 cUSD** per message.
2. **Opera MiniPay Integration**:
   - Automatic injection detection (`window.ethereum.isMiniPay`).
   - Seamless auto-wallet connection on load for MiniPay users.
   - Hides generic web3 connect buttons in the MiniPay webview context for a cleaner mobile application look.
3. **Dual-Network Payment & Verification**:
   - Works out-of-the-box on **Celo Mainnet** (Chain ID `42220`) and **Celo Sepolia Testnet** (Chain ID `11142220`).
   - Auto-verifies the payment txHash on the server-side before serving AI responses.
4. **Rich UI & Aesthetics**:
   - Fully formatted Markdown rendering for AI responses (with custom CSS for headers, lists, code blocks, and blockquotes).
   - Premium icons powered by **Hugeicons** (all emojis removed for a sleek corporate look).
   - Mobile browser focus-zoom bug fixed by ensuring inputs have a `16px` font size.

---

## Tech Stack

* **Frontend Framework**: Next.js 15 (App Router)
* **AI Engine**: Cencori SDK & Vercel AI SDK
* **Web3 Integration**: Wagmi, Viem, and RainbowKit
* **Markdown Parser**: React Markdown
* **Icons**: Hugeicons

---

## Quick Start

### 1. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Get a key at https://cencori.com/dashboard
CENCORI_API_KEY=csk_...

# Get a project ID at https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=317073c0962a17d65379cdde980ac5db
```

### 2. Start the Application

```bash
# Install dependencies
npm install

# Start local server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the desktop version.

---

## Testing in MiniPay (Celo Sepolia Testnet)

To test the Pro payment flow inside MiniPay without spending real funds:

### Step 1: Expose Local Host (Optional)
If you are developing locally, run a secure tunnel to get an HTTPS URL:
```bash
npx ngrok http 3000
```
Copy the secure `https://...` address. (If you are using a deployed version, just copy your Vercel URL).

### Step 2: Unlock Developer Mode in MiniPay
1. Open **Opera Mini** on your mobile device and tap the **MiniPay wallet** icon.
2. Go to **Settings** $\rightarrow$ **About**.
3. Tap the **Version number repeatedly** (7 times) until a prompt confirms Developer Mode is enabled.
4. Go back to Settings $\rightarrow$ **Developer Settings**.
5. Toggle **Developer mode** and **Use test net** (Celo Sepolia) to **On**.

### Step 3: Claim Test Tokens
1. Copy your active Celo address from your MiniPay wallet.
2. Visit the **[Celo Faucet](https://faucet.celo.org)** in a browser.
3. Enter your address, select the **Sepolia** network option, and request **cUSD** tokens.

### Step 4: Open and Test
1. In MiniPay Developer Settings, tap **Open URL...** (under *Load Mini App*).
2. Paste your secure application URL (Vercel or ngrok link) and click open.
3. Select the **Pro** tier in the toggle, write a prompt, and submit.
4. Confirm the transaction fee of `0.02 cUSD` using your free testnet tokens.

---

## Project Structure

* `/components/chat.tsx` — Main chat user interface & transaction logic.
* `/components/tier-toggle.tsx` — Minimalist selector for switching between Standard and Pro tiers.
* `/lib/constants.ts` — cUSD smart contract addresses and recipient configuration.
* `/lib/payment.ts` — React hook triggering ERC-20 contract writes.
* `/app/api/chat/route.ts` — Edge Chat API route. Verifies payment on-chain before generating AI streams.
* `/app/api/verify-payment/route.ts` — API endpoint to verify transaction receipts.
