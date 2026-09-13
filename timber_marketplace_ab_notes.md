# Timber Marketplace AB — Startup Planning Notes
*Generated from planning session — August 2026*

---

## 1. Platform Overview

- **Company:** Timber Marketplace AB
- **Type:** Auction marketplace (intermediary platform, not seller)
- **Users:** Sellers (post announcements), moderator/admin, buyers/bidders
- **Tech stack:** Supabase (DB, auth, storage, realtime) + Node.js backend
- **Planned integrations:** BankID, maps, possibly Android app wrapper
- **Payment model:** Stripe Connect (buyer → Stripe → seller, platform fee collected separately). AB never touches money directly — avoids payment intermediary regulation.
- **Invoice model:** TBD — leaning toward sellers invoicing buyers directly, platform only collects its own fee
- **Alpha model:** No auction fee until sensible transaction volume — free period for real-world testing. Must be stated clearly in terms so users aren't surprised when fees activate.

---

## 2. Hosting & Core Services

| Service | Purpose | Free/Start | Upgrade |
|---|---|---|---|
| Supabase | DB, auth, storage, realtime | Free (pauses after 7 days inactivity) | Pro ~250 kr/mån (daily backups, no pausing) |
| Vercel / Netlify | Frontend hosting | Free tier | Pro ~200 kr/mån |
| Railway / Render / Fly.io | Node.js backend | Free / ~50 kr/mån | Scale by usage |
| Domain (.se) | Web address | ~150 kr/year | — |
| Resend | Transactional email | Free tier (low volume) | Pay per use |
| Sentry | Error monitoring | Free tier | — |
| Bokio | Bookkeeping | Free tier | Upgrade when volume grows |
| Cloudflare R2 | Image/file storage (future) | No egress fees | Scale as needed |

**Note:** Supabase free tier pauses after 7 days inactivity — fine pre-launch, must upgrade to Pro at go-live.

---

## 3. Key Integrations

### BankID
- Cannot integrate directly as a small company — must use a licensed reseller
- **Recommended provider:** Idura (formerly Criipto) — official Swedish BankID provider
- Cost: ~300–500 kr/month platform fee + ~0.15 kr per authentication
- Test environment free during development
- Other providers: Signicat, Scrive, ZignSec

### Maps
- **Recommended:** OpenStreetMap + Leaflet/MapLibre = effectively free
- Google Maps / Mapbox also options but have per-load costs

### Payments
- **Stripe Connect** — marketplace model, no monthly fee, per-transaction only
- ~1.5% + small fixed fee per EU card transaction
- $2/month per monthly active connected account OR $0.25 + $0.25 per payout
- During alpha/free period: near-zero Stripe cost

---

## 4. Company Registration — Timber Marketplace AB

### Registration costs (one-off)

| Item | Cost |
|---|---|
| Bolagsverket registration (digital, via verksamt.se) | 1,900 kr |
| Verklig huvudman registration | 250 kr |
| **Total registration fees** | **2,150 kr** |

**Aktiekapital:** 25,000 kr minimum (not a cost — stays in company, available for operations)
**Net available after registration:** ~22,850 kr

### Registration timeline

| Step | Time |
|---|---|
| Prepare documents + bank deposit | 1–3 days |
| Bolagsverket processing | ~5 working days |
| Skatteverket F-skatt approval | 2–6 weeks |
| **Total to fully operational** | **3–7 weeks** |

**Tip:** Submit Bolagsverket and Skatteverket applications simultaneously via verksamt.se.

---

## 5. Bank Account & Bankintyg

- AB cannot use personal bank account
- Must obtain **bankintyg** (bank certificate) proving aktiekapital deposited before Bolagsverket accepts registration
- Revolut and Wise **cannot** issue bankintyg — use as main account only after registration

### Bankintyg options

| Bank | Bankintyg | Setup fee | Notes |
|---|---|---|---|
| **Idura (Lunar Business)** | ✅ confirmed | 495 kr | Fully digital, sends directly to Bolagsverket, cheapest option |
| SEB | ✅ confirmed | varies | Fully digital |
| Danske Bank | ✅ confirmed | 2,500 kr | Must become full customer — not worth it just for bankintyg |
| Länsförsäkringar | ⚠️ likely yes | unknown | Call local office to confirm |

**Recommended path:** Use Lunar Business for bankintyg (495 kr) → transfer aktiekapital to Revolut or keep Lunar → use preferred bank for ongoing operations.

### Lunar Business — real customer verdict (forum research, 2025)

**Positives:**
- Smooth app, fast digital onboarding
- Free Fortnox/Bokio integration
- Bankgiro, Swish, e-faktura included
- Statlig insättningsgaranti up to ~1,050,000 kr
- Web access available (not just app)

**Negatives:**
- Repeated mid-contract price hikes — Simple plan went from 490 kr/year → 890 kr/year in 2 months, then added per-transaction fees
- Danish bank with Swedish account numbers causes occasional friction (e.g. Apple App Store payouts don't work)
- No physical branches
- Support is chat-based, not always instant

**Conclusion:** Fine for bankintyg step. For ongoing banking, unpredictable pricing is a risk on a tight budget. Easy to switch banks later (export SIE file, open new account, update bankgiro).

---

## 6. Bookkeeping

- AB is legally required to keep accounts from registration day (Bokföringslagen)
- Excel not accepted — must use proper software
- **Recommended start:** Bokio free tier (handles low transaction volume, free årsredovisning template)
- **Upgrade path:** Export SIE file from Bokio → import to Fortnox at start of new räkenskapsår (cleanest migration point)
- Lunar Business has free integration with Fortnox, Bokio, Bolageriet, SpeedLedger

**First årsredovisning:** Have an accountant review (not prepare) it — ~1,500–3,000 kr one-time. Worth it to avoid Bolagsverket errors.

### Räkenskapsår tip
When registering, set first räkenskapsår end date to **31 december 2026** (maximum 18 months) to defer first filing deadline as long as possible.

---

## 7. Insurance

### Legal requirement
No legal requirement for insurance on an AB — entirely voluntary except in specific regulated industries (not applicable here).

### When insurance is needed
- **Before go-live:** Not required
- **At go-live (first real user registers):** Cyber + liability insurance should be active

### Relevant insurance types for a marketplace platform

| Type | Purpose | Relevance |
|---|---|---|
| Företagsförsäkring (base) | Ansvar + avbrott + rättsskydd | Standard starting point |
| Ansvarsförsäkring | Third-party liability | Core for platform |
| Cyberförsäkring | Data breaches, GDPR incidents, ransomware, IT forensics, business interruption | **Critical from go-live** — BankID + personal data = high exposure |
| VD-/styrelseansvarsförsäkring | Personal liability as VD/board | Worth asking about when profitable |

**GDPR fines (böter) are NOT insurable** — insurance covers costs of handling an incident, not the fine itself.

### Cost estimates (AB, early stage)

| Insurance | Cost/month |
|---|---|
| Företagsförsäkring (ansvar base) | ~300 kr |
| Cyberförsäkring | ~400–600 kr |
| **Total** | **~700–900 kr/month** |

**Recommended brokers/insurers:** If, Trygg-Hansa, Svedea, Gjensidige, Folksam, Söderberg & Partners (broker — shops multiple insurers, useful for non-standard risk profiles).

**Framing for insurance quotes:** "Marketplace platform, intermediary not seller, BankID + payment handling, holds personal data." This gets cyber + extended liability rather than a standard e-handlare package.

---

## 8. Office / Home Address

- No legal requirement to have a commercial address — home address is fully valid for AB registration
- No rental agreement required at any point — entirely optional

### Rent between you and the AB (tax optimization only)
- Makes sense only when AB has taxable profit
- During 0–6 month dev/pre-launch phase: **do not set up rent** — no profit to shelter, creates personal tax liability for no benefit
- When to activate: when AB has both revenue AND taxable profit after costs
- Modest amount (500–1,000 kr/month) reduces bolagsskatt (20.6%)
- When activating: consult Skatteverket guidance on *uthyrning till eget bolag*

---

## 9. Mobile Phone Subscription (Företagsabonnemang)

| Provider | Cost/month | Notes |
|---|---|---|
| Hallon / Plus 46 | ~99–129 kr | Budget pick, runs on Tre network |
| Tre | ~299 kr | Mid-range, free surf |
| Telia | 329 kr+ | Avoid at this stage |

---

## 10. Full Chronological Cost Timeline

### Pre-registration
- Arrange bank account for bankintyg (Lunar: 495 kr one-off)
- Deposit 25,000 kr aktiekapital

### Day of registration
- Bolagsverket: 1,900 kr
- Verklig huvudman: 250 kr
- **Total day-one:** 2,150 kr
- **Remaining from aktiekapital:** ~22,850 kr

### Immediately after registration
- Open företagskonto (Lunar/Revolut: ~100 kr/mån)
- Mobilabonnemang: ~300–400 kr/mån
- Domain: ~150 kr/year
- Bokio (bookkeeping): 0 kr initially

### Dev phase (monthly burn)
| Item | Kr/month |
|---|---|
| Bank | ~100 |
| Mobile | ~300–400 |
| Hosting (free tiers) | 0–50 |
| Bokio | 0 |
| **Total dev phase** | **~400–550 kr/mån** |

*At 500 kr/month burn, 22,850 kr gives ~45 months of runway — very comfortable.*

### At go-live (add these)
| Item | Kr/month |
|---|---|
| Supabase Pro | ~250 |
| Hosting (low traffic) | ~50–150 |
| BankID / Idura | ~300–500 |
| Stripe Connect | ~0 during alpha |
| Företagsförsäkring + Cyber | ~700–900 |
| Email (Resend) | 0 |
| Sentry | 0 |
| **Total at launch** | **~1,700–2,400 kr/mån** |

**Planning number: ~2,000 kr/month at low-traffic alpha launch.**

---

## 11. Key Decisions Still Open

- [ ] Invoice model — sellers invoice buyers directly vs. platform-managed
- [ ] Stripe Connect vs alternative payment provider
- [ ] Android app — PWA wrapper (Capacitor) vs native build
- [ ] Which BankID provider to go with (Idura recommended as cheapest/simplest)
- [ ] Ongoing bank — Lunar vs Revolut vs other
- [ ] When to formalize home office rent (defer until profitable)
- [ ] Almi mikrolån / Tillväxtverket funding application (worth exploring for runway)

---

*Notes compiled from planning session. Prices indicative — verify current rates before committing. Not legal or financial advice — consult relevant professionals for insurance, tax, and payment regulation specifics.*
