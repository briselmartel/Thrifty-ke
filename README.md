# Thrifty.ke — deployment guide (start to finish)

Contact: **0799 505 257** · **kaixaden6@gmail.com**

If your page loaded blank: that was a real bug — the app crashed silently when it couldn't find your Supabase credentials. It's fixed in this version, and now shows a clear on-screen message telling you exactly what's missing instead of a blank screen. But you still need to do the setup below for the site to actually work (browsing, sign up, listings, checkout all need the database connected).

---

## Before you start, you need three accounts (all free)
1. **GitHub** — github.com — where your code lives
2. **Supabase** — supabase.com — your database, login system, and file storage
3. **Vercel** — vercel.com — hosts the live site

You can sign up to Vercel and Supabase using your GitHub account, which saves a step.

---

## Step 1 — Set up the database (Supabase)

1. Go to supabase.com/dashboard and either open your existing project (ref `hssjyreswltunyiarzdf`, if it's still there) or click **New project** and create one — pick a password and region (choose one close to Kenya, e.g. Europe).
2. Once the project is open, click **SQL Editor** in the left sidebar → **New query**.
3. Open the file `supabase/schema.sql` from this folder, copy **everything** in it, paste it into the SQL editor, and click **Run** (bottom right). You should see "Success. No rows returned."
4. In the left sidebar click **Storage** → **New bucket**. Create a bucket named exactly `listing-images`, toggle **Public bucket** on, click **Create bucket**.
5. Repeat step 4 for a second bucket named exactly `payment-proofs`, also **Public**.
6. In the left sidebar click **Project Settings** (gear icon) → **Data API** (or "API" depending on the version). Copy two values — you'll need them in Step 3:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

## Step 2 — Push the code to GitHub

If you don't already have a GitHub repo for this, open a terminal in this folder and run:
```
git init
git add .
git commit -m "Thrifty.ke launch build"
git branch -M main
```
Then on github.com, click **New repository**, name it `thrifty-ke`, leave it empty (no README/license), click **Create repository**. GitHub will show you a command like this — copy it exactly from your own repo page and run it:
```
git remote add origin https://github.com/YOUR-USERNAME/thrifty-ke.git
git push -u origin main
```

## Step 3 — Deploy to Vercel

1. Go to vercel.com/new and click **Import** next to the `thrifty-ke` repo (log in with GitHub first if asked, and authorize Vercel to see your repos).
2. Vercel will detect it's a Vite project automatically — don't change the build settings.
3. Before clicking Deploy, open **Environment Variables** and add these two, using the values you copied in Step 1:
   - Name: `VITE_SUPABASE_URL` → Value: your Project URL
   - Name: `VITE_SUPABASE_ANON_KEY` → Value: your anon public key
4. Click **Deploy**. Wait about a minute — you'll get a live link like `thrifty-ke.vercel.app`.
5. Open that link. You should see the real homepage now, not a blank page or setup notice.

## Step 4 — Make yourself an admin

1. On your live site, click **Join Thrifty**, sign up using `kaixaden6@gmail.com`, choose **buyer or seller** (either works for admin access).
2. Back in Supabase → **SQL Editor** → **New query**, run:
   ```sql
   update profiles set is_admin = true where email = 'kaixaden6@gmail.com';
   ```
3. Go to `your-site.vercel.app/admin` — you should now see the admin panel for verifying sellers and managing escrow.

## Step 5 — Add your real bank details

Open `src/lib/constants.js`, find `BANK_DETAILS`, and replace the placeholder text with your actual bank name, account name, account number, and branch — this is what buyers see at checkout. Save, then:
```
git add .
git commit -m "Add real bank details"
git push
```
Vercel redeploys automatically within a minute of every push.

## Step 6 — Connect the thrifty.ke domain (once registered)

In your Vercel project → **Settings → Domains**, add `thrifty.ke`. Vercel will show you DNS records (usually an A record or CNAME) to add wherever you register the domain. Once DNS propagates (can take a few hours), the live site will answer at thrifty.ke instead of the vercel.app link.

---

## Troubleshooting

**Blank white page, nothing at all.** Almost always means you opened `index.html` directly by double-clicking it, or the environment variables aren't set on Vercel. This build no longer goes fully blank — if the Supabase keys are missing, it now shows an on-screen message telling you what to add. If you still get a truly blank page: open the browser console (right-click → Inspect → Console tab) and check for a red error — send me a screenshot of that and I can pinpoint it.

**"Thrifty.ke isn't connected yet" message.** This means the site is live but `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` aren't set correctly on Vercel. Go to Vercel → your project → Settings → Environment Variables, double check both values match exactly what's in Supabase → Project Settings → API, then go to the **Deployments** tab and redeploy the latest one (env var changes need a redeploy to take effect).

**Signup or listing photos don't work.** Means Step 1.3–1.5 (the SQL schema and the two storage buckets) weren't completed, or the bucket names don't match exactly (`listing-images` and `payment-proofs`, all lowercase with a hyphen).

**Local dev instead of deploying:**
```
npm install
cp .env.example .env   # then paste your Supabase URL + anon key into .env
npm run dev
```

---

## How the manual bank-transfer escrow works day-to-day
1. Buyer selects an item, sees your bank details at checkout, transfers the amount, uploads a screenshot/slip as proof.
2. Order appears in `/admin` as `payment_submitted`.
3. You confirm the transfer landed, set the order to `escrow_held`, message the seller to ship.
4. Seller ships to the buyer's delivery address (shown in the admin order row).
5. Buyer confirms the item is correct → you set the order to `released` and pay the seller out manually, minus your commission if any.
6. Buyer disputes → set status to `disputed` and resolve manually before releasing funds.

This needs no payment gateway approval, so you can launch today, and it doubles as a manual fraud check — nothing releases without you confirming both sides.

## Adding M-Pesa later (once Daraja is approved)
Add an Edge Function that calls the Daraja STK Push API, trigger it from Checkout as a second payment option alongside bank transfer, and use Daraja's callback to auto-flip orders to `escrow_held`. Keep bank transfer available even after — some buyers will prefer it.

## Suggested next priorities (not blocking launch)
- Email notifications when an order changes status
- A public seller storefront page listing everything one shop/thrift store has for sale
- Ratings/reviews after a completed order
- A basic signup rate limit or CAPTCHA to deter fake accounts
- Terms of Service + Privacy Policy pages before real payments flow through the site
