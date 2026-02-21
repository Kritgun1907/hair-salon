# Hair Salon – Booking & Analytics Platform

A full-stack salon management application with online appointment booking,
integrated Razorpay payments, and a real-time analytics dashboard.

> **Live demo**
> - Frontend: <https://hair-salon-self-gamma.vercel.app>
> - Backend API: <https://hair-salon-backend-two.vercel.app>

---

## Features

| Area | Highlights |
|------|-----------|
| **Booking Form** | Client details, date/time picker, artist & service selection, **auto-calculated pricing** from selected services, **percentage-based discount** |
| **Payments** | Razorpay embedded checkout (order flow) with server-side HMAC-SHA256 signature verification |
| **Analytics** | Revenue summary, top services chart, employee leaderboard, repeat-customer donut chart, per-employee deep-dive, Excel export |
| **UI/UX** | Warm cream & gold theme, Framer Motion animations, responsive layout, canvas sparkles & SVG beam effects |

---

## Tech Stack

### Frontend

- **React 19** + **TypeScript 5.9** (Vite 7)
- **TailwindCSS 4** for styling
- **React Router DOM 7** – SPA routing
- **Framer Motion** – page transitions & micro-interactions
- **Recharts** – bar & pie charts on the analytics dashboard
- **Radix UI** – accessible Select, Popover, Label primitives
- **cmdk** – command-menu-based combobox & multi-select
- **Day.js** – lightweight date manipulation
- **Lucide React** – icon set

### Backend

- **Express 4** (Node.js)
- **Mongoose 9** – MongoDB ODM
- **Razorpay Node SDK** – order creation & payment verification
- **SheetJS (xlsx)** – Excel export for analytics data
- **Vercel** – serverless deployment (`@vercel/node`)

### Database

- **MongoDB Atlas** (free M0 cluster)

---

## Project Structure

```
hair-salon/
├── backend/
│   ├── index.js            # Express app – payments, form data, health
│   ├── db.js               # Singleton MongoDB connection manager
│   ├── models/
│   │   └── Visit.js        # Mongoose schema for salon visits
│   ├── routes/
│   │   └── analytics.js    # Analytics endpoints + Excel export
│   ├── .env.example         # Template for environment variables
│   ├── package.json
│   └── vercel.json          # Vercel serverless routing config
│
├── frontend/form_razorpay/
│   ├── src/
│   │   ├── main.tsx              # Router + route definitions
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Animated hero landing
│   │   │   ├── BookingPage.tsx   # 3-section booking form
│   │   │   ├── PaymentStatus.tsx # Post-payment result page
│   │   │   └── Analytics.tsx     # Dashboard shell
│   │   ├── components/
│   │   │   ├── analytics/        # Dashboard widgets (7 components)
│   │   │   └── ui/               # Reusable UI primitives (shadcn-style)
│   │   ├── hooks/
│   │   │   └── useBookingForm.ts # Form state, validation & payment flow
│   │   ├── services/
│   │   │   ├── api.ts            # Backend HTTP helpers
│   │   │   └── razorpay.ts       # Razorpay script loader
│   │   ├── types/
│   │   │   └── booking.ts        # Shared TypeScript interfaces
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx     # Shared header & navigation
│   │   └── lib/
│   │       └── utils.ts          # Tailwind class-merge utility
│   ├── .env.production           # Public backend URL
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.app.json
│   └── vercel.json               # SPA rewrite rule
│
└── .gitignore
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or yarn/pnpm)
- **MongoDB Atlas** cluster (or local MongoDB)
- **Razorpay** account (test mode is fine)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/hair-salon.git
cd hair-salon
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hair-salon
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Start the server:

```bash
npm run dev          # starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd ../frontend/form_razorpay
npm install
```

Create a `.env.local` (optional — defaults to production URL):

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev          # starts on http://localhost:5173
```

---

## API Endpoints

### Payment Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/create-order` | Create a Razorpay order for embedded checkout |
| `POST` | `/api/verify-order-payment` | Verify Razorpay signature after checkout |
| `POST` | `/api/create-payment-link` | Create a hosted payment link (legacy) |
| `GET`  | `/api/verify-payment` | Verify payment-link callback signature |

### Data Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/form-data` | Service catalogue with prices, artists, staff |
| `GET` | `/api/health` | Server health check |

### Analytics Routes (mounted at `/api/analytics`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/summary` | Revenue, visits, unique customers, avg ticket |
| `GET` | `/top-services` | Most booked services |
| `GET` | `/employees` | Employee leaderboard by revenue |
| `GET` | `/employee/:name` | Deep-dive stats for one artist |
| `GET` | `/repeat-customers` | New vs returning customer counts |
| `GET` | `/export` | Download all visits as `.xlsx` |

---

## Booking & Payment Workflow

```
User selects services (prices shown) → Amount auto-calculated
      ↓
Optional discount (%) applied → Payable = Subtotal − Discount
      ↓
Frontend calls POST /api/create-order (amount in ₹)
      ↓
Backend creates Razorpay Order (converts to paise)
      ↓
Razorpay embedded checkout opens in-browser
      ↓
On success → POST /api/verify-order-payment (HMAC-SHA256 check)
      ↓
Redirect to /payment-status with payment details
```

---

## Deployment (Vercel)

Both the frontend and backend are deployed as separate Vercel projects.

### Backend

1. Import the `backend/` folder as a new Vercel project.
2. Set the environment variables (`MONGODB_URI`, `RAZORPAY_KEY_ID`, etc.) in Vercel's dashboard.
3. The included `vercel.json` routes all requests through `index.js`.

### Frontend

1. Import `frontend/form_razorpay/` as a new Vercel project.
2. Set `VITE_BACKEND_URL` to the deployed backend URL.
3. The included `vercel.json` rewrites all paths to `index.html` for SPA routing.

> **Tip:** Ensure your MongoDB Atlas cluster has `0.0.0.0/0` in its IP access list so Vercel's dynamic IPs can connect.

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `MONGODB_URI` | Backend | MongoDB Atlas connection string |
| `RAZORPAY_KEY_ID` | Backend | Razorpay API key (public) |
| `RAZORPAY_KEY_SECRET` | Backend | Razorpay API secret |
| `FRONTEND_URL` | Backend | Frontend origin (used in payment callbacks) |
| `PORT` | Backend | Server port (default 5000) |
| `VITE_BACKEND_URL` | Frontend | Backend API base URL |

---

## Scripts

### Backend

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node index.js` | Production start |
| `dev` | `node --watch index.js` | Development with file watching |

### Frontend

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Start Vite dev server |
| `build` | `tsc -b && vite build` | Type-check & production build |
| `lint` | `eslint .` | Run ESLint |
| `preview` | `vite preview` | Preview production build locally |

---

## License

This project was built for a hackathon. No license has been specified.
