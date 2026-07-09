# SMPL T20 Kenya Tour — Player Registration

Individual player registration website for the **Summer Mombasa Premier
League T20 (Kenya Tour)**. Built with Next.js App Router, TypeScript,
Tailwind CSS, and Supabase (Database + Storage). Payment is manual only
(UPI/QR or Bank Transfer) — there is no payment gateway integration.

---

## 1. Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Supabase (Postgres database + private Storage bucket)
- Zod for validation
- Deployable on Vercel

---

## 2. Project Structure

```
app/
  page.tsx                          Home / registration page
  terms/page.tsx                    Terms & Conditions page
  admin/page.tsx                    Admin panel (client-side)
  components/RegistrationForm.tsx   The registration form
  api/register/route.ts             POST — save registration + upload proof
  api/admin/registrations/route.ts  GET  — list registrations (admin only)
  api/admin/registrations/[id]/route.ts  PATCH — update payment status
  api/admin/export/route.ts         GET  — export registrations as CSV
lib/
  supabaseAdmin.ts   Server-only Supabase client (service role key)
  adminAuth.ts        Admin password check helper
  validators.ts       Zod schemas + dropdown option constants
  paymentDetails.ts    UPI / Bank details shown on the site
public/
  logo.png    ⚠ placeholder — replace with your real logo
  poster.png  ⚠ placeholder — replace with your real event poster
  qr.png      ⚠ placeholder — replace with your real UPI QR code
supabase.sql   Run this in the Supabase SQL editor
```

> **⚠ Important — placeholder images:** No logo, poster, or QR image
> files were provided, so `public/logo.png`, `public/poster.png`, and
> `public/qr.png` are generated placeholders (clearly labeled "PLACEHOLDER").
> The QR code is **not a real, scannable UPI code** — replace it with your
> actual UPI QR before going live, or players will pay to the wrong place
> or fail to pay at all. Simply overwrite these three files with your real
> images using the exact same filenames.

---

## 3. Run Locally

```bash
npm install
cp .env.example .env.local
# fill in .env.local (see section 5 below)
npm run dev
```

Visit `http://localhost:3000`.

---

## 4. Create the Supabase Project

1. Go to https://supabase.com/dashboard and create a new project.
2. Once it's ready, go to **Project Settings → API** and copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (under "Project API keys") → this is your
     `SUPABASE_SERVICE_ROLE_KEY`

   ⚠ The service role key bypasses all security rules. Never put it in
   a `NEXT_PUBLIC_...` variable, never commit it, and never expose it
   to the browser. It is only ever read inside `lib/supabaseAdmin.ts`,
   which runs exclusively in server-side API routes.

### Run `supabase.sql`

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of `supabase.sql` from this project.
3. Click **Run**.

This creates the `registrations` table with Row Level Security enabled
and no public policies — meaning the table is only reachable through
your server-side API routes using the service role key, never directly
from the browser.

### Create the `registration-proofs` Storage bucket

1. In the Supabase dashboard, go to **Storage → New bucket**.
2. Name it exactly: `registration-proofs`
3. Leave it set to **Private** (do not toggle "Public bucket").
4. Click **Create bucket**.

No storage policies are needed for the anon key — all uploads and all
signed-URL generation happen server-side via the service role key.

---

## 5. Environment Variables

Create `.env.local` locally (never commit it) and add the same variables
in Vercel:

| Variable | Where to get it | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | **No — server only** |
| `ADMIN_PASSWORD` | Choose your own strong password | **No — server only** |
| `NEXT_PUBLIC_EVENT_NAME` | `Summer Mombasa Premier League T20` | Yes |
| `NEXT_PUBLIC_REGISTRATION_FEE` | `2500` | Yes |

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / anon key is **not required** —
this project never calls Supabase directly from the browser, so it's
intentionally omitted.

---

## 6. Deploy on Vercel

1. Push this project to a GitHub repository.
2. Go to https://vercel.com/new and import the repository.
3. In **Environment Variables**, add all 5 variables from the table
   above (same values as your `.env.local`).
4. Click **Deploy**.
5. Once deployed, your site is live at `https://<your-project>.vercel.app`.

You can trigger redeploys automatically by pushing to your GitHub
branch, or manually from the Vercel dashboard.

---

## 7. Access the Admin Panel

1. Visit `/admin` on your deployed site (e.g.
   `https://<your-project>.vercel.app/admin`).
2. Enter the password you set as `ADMIN_PASSWORD`.
3. From the admin panel you can:
   - View every registration with full player, payment, and proof details
   - Click **View Proof** to open the payment screenshot/receipt via a
     short-lived (1 hour) signed URL — the storage bucket itself stays
     private
   - Mark a registration as **Pending**, **Verified**, or **Rejected**
   - Use the **WhatsApp confirmation** link on verified players to open
     a pre-filled WhatsApp message to that player
   - Click **Export CSV** to download all registrations as a spreadsheet
   - Filter by status or search by name / email / phone / UTR

There is no persistent admin session — you re-enter the password each
time you load `/admin`, and it is only ever sent as a request header,
never stored in the URL or in browser storage.

---

## 8. Notes on the Manual Payment Flow

- There is **no payment gateway** (no Razorpay, no auto-verification).
- A player pays manually via UPI/QR or Bank Transfer using the details
  shown on the homepage, then submits the form with their UTR/Transaction
  ID, sender name, and a screenshot/receipt as proof.
- Every registration is saved with `payment_status = 'pending'` by
  default. It only becomes `verified` when an admin manually checks the
  organizer's bank/UPI statement against the submitted UTR and proof,
  and clicks **Verify** in the admin panel.
- This is intentional and matches the requirement: **registration is
  confirmed only after manual payment verification.**

---

## 9. Updating Payment Details

The UPI ID, UPI name, and bank details are defined in one place:
`lib/paymentDetails.ts`. If these ever change, edit that file only —
both the homepage payment section and (if you extend it) any future
pages will stay in sync.
