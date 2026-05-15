# Datumart Digital Menu Widget

> AI-powered, embeddable digital menu widget for restaurant websites — built with MERN stack + Next.js

A production-style digital menu page widget for restaurant businesses integrated with the Datumart platform. The widget fetches live product and category data, generates dynamic SEO tags, and includes NLP-based smart search and menu recommendations.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
- [NLP Search](#nlp-search)
- [NLP Test Report](#nlp-test-report)
- [Recommendations](#recommendations)
- [Dynamic SEO](#dynamic-seo)
- [Widget Embed Code](#widget-embed-code)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Assumptions](#assumptions)

---

## Features

- **Embeddable Widget** — drop into any website using a script tag or iframe
- **Live Menu Data** — fetches categories and products via Datumart API or mock adapter
- **NLP Smart Search** — understands natural language queries like *"spicy veg starter under £6"*
- **Recommendations** — shows *You may also like* based on category, diet, price and spice level
- **Dynamic SEO** — generates title, meta description, Open Graph tags and JSON-LD structured data
- **Veg / Non-Veg Filter** — one-click dietary filtering
- **Responsive Design** — works on mobile, tablet and desktop
- **Stock Status** — shows Out of Stock badge when currentStock is 0
- **Discount Display** — shows original price strikethrough and discount badge
- **Analytics Events** — tracks menu views, searches and CTA clicks

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS, TypeScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| NLP / Search | Fuse.js (fuzzy search + intent classification) |
| SEO | Next.js Metadata API, JSON-LD schema.org |
| Security | dotenv, CORS, input validation |

---

## Project Structure

```
datumart-digital-menu-widget/
│
├── apps/
│   └── web-next/
│       ├── app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── menu/
│       │       └── [vendorSlug]/
│       │           └── page.tsx
│       ├── components/
│       │   ├── MenuWidget.tsx
│       │   ├── ProductCard.tsx
│       │   ├── MenuSearch.tsx
│       │   └── CategoryTabs.tsx
│       ├── lib/
│       │   └── seo/
│       │       └── menuSeo.ts
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── tsconfig.json
│
└── server/
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── Vendor.js
    │   ├── Category.js
    │   ├── Product.js
    │   ├── MenuIndex.js
    │   └── MenuEvent.js
    ├── routes/
    │   ├── menu.routes.js
    │   ├── category.routes.js
    │   ├── product.routes.js
    │   ├── search.routes.js
    │   └── event.routes.js
    ├── services/
    │   ├── menu.service.js
    │   ├── nlpSearch.service.js
    │   ├── recommendation.service.js
    │   └── seo.service.js
    ├── seed/
    │   ├── seedData.js
    │   └── seedDatabase.js
    ├── index.js
    ├── .env.example
    └── .env
```

---

## Prerequisites

- Node.js v18 or higher
- MongoDB running locally OR a MongoDB Atlas URI
- npm v9 or higher
- Git

---

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/datumart-digital-menu-widget.git
cd datumart-digital-menu-widget
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd apps/web-next
npm install
```

### 4. Configure environment variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in your values.

Create `apps/web-next/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Start MongoDB

```bash
mongod
```

Or use your MongoDB Atlas URI in `server/.env`.

### 6. Seed the database

```bash
cd server
npm run seed
```

Expected output:

```
✅ MongoDB connected: localhost
📦 Database: datumart
🗑️  Clearing existing data...
🏪 Inserting vendor...
📂 Inserting categories...
🍽️  Inserting products and building NLP index...
✅ Seed complete!
   Vendor:     1
   Categories: 8
   Products:   20
   MenuIndex:  20
```

---

## Environment Variables

### server/.env

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/datumart` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

### apps/web-next/.env.local

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000` |

---

## Running the App

Open two terminals and run both simultaneously.

**Terminal 1 — Backend**

```bash
cd server
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd apps/web-next
npm run dev
```

Open in browser: **http://localhost:3000/menu/anjappar-wimbledon**

---

## API Endpoints

### Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu/:vendorId` | Full menu payload |
| GET | `/api/menu/slug/:vendorSlug` | Menu by vendor slug |
| GET | `/api/menu/:vendorId/search?q=` | NLP smart search |
| GET | `/api/menu/:vendorId/recommendations?productId=` | Product recommendations |
| GET | `/api/menu/:vendorId/seo?categorySlug=` | SEO tags and JSON-LD |

### Categories and Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories/:vendorId` | Published categories |
| GET | `/api/products/:vendorId` | Active products with filters |
| GET | `/api/products/:vendorId/:productId` | Single product detail |

**Product filter query params:**

```
GET /api/products/:vendorId?isVeg=true&maxPrice=8&inStock=true
```

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events` | Track analytics event |
| GET | `/health` | Server health check |

---

## NLP Search

The NLP engine combines Fuse.js fuzzy matching with intent classification.

### How it works

```
User types: "crispy veg starter under 6 pounds"

Step 1 — Fuse.js fuzzy match against searchableText index
Step 2 — Extract intent tags:
         dietary  = veg
         taste    = crispy
         course   = starter
         budget   = under £6
Step 3 — Combined score: Fuse score (60%) + Intent score (40%)
Step 4 — Return ranked results with reason text
```

### Sample API Response

```json
{
  "query": "crispy veg starter under 6 pounds",
  "intentTags": ["veg", "crispy", "starter", "budget"],
  "results": [
    {
      "productId": "abc123",
      "name": "Samosa (4)",
      "score": 0.91,
      "reason": "Matches vegetarian, crispy description, starter category and price under £6."
    }
  ],
  "recommendations": [
    {
      "name": "Paneer Tikka",
      "reason": "Similar vegetarian Veg Starters option."
    }
  ],
  "fallback": false
}
```

---

## NLP Test Report

| # | Query | Top Result | Intent Tags |
|---|-------|------------|-------------|
| 1 | `spicy veg starter` | Gobi 65, Mushroom 65 | veg, spicy, starter |
| 2 | `crispy potato snack` | Samosa (4) | crispy, starter |
| 3 | `something sweet` | Gulab Jamun, Rasmalai | sweet, dessert |
| 4 | `chicken dish` | Chicken 65, Chettinad Chicken Curry | non-veg |
| 5 | `under 5 pounds` | Samosa (4), Mango Lassi, Masala Chai | budget |
| 6 | `south indian classic` | Masala Dosa, Idli Sambar | main |
| 7 | `grilled paneer` | Paneer Tikka | veg, starter |
| 8 | `rice meal` | Chicken Biryani, Vegetable Biryani | main |
| 9 | `refreshing drink` | Mango Lassi, Masala Chai | drink |
| 10 | `mild kids food` | Idli Sambar, Gulab Jamun | mild, kids |

---

## Recommendations

Products are scored based on four factors:

| Factor | Weight |
|--------|--------|
| Same category | 40% |
| Same dietary type (veg / non-veg) | 20% |
| Similar price range within £2 | 20% |
| Same spice level | 10% |
| Same meal type | 10% |

---

## Dynamic SEO

The widget generates SEO tags server-side using Next.js SSR.

### Generated HTML tags

```html
<title>Anjappar Wimbledon Menu - Veg Starters</title>
<meta name="description" content="Explore Veg Starters at Anjappar Wimbledon. Try our Samosa (4), Paneer Tikka, Gobi 65 and more." />
<meta property="og:title" content="Anjappar Wimbledon Digital Menu" />
<meta property="og:description" content="Discover dishes at Anjappar Wimbledon" />
<meta property="og:type" content="website" />
```

### JSON-LD Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Menu",
  "name": "Anjappar Wimbledon Digital Menu",
  "provider": {
    "@type": "Restaurant",
    "name": "Anjappar Wimbledon",
    "servesCuisine": ["South Indian", "Chettinad", "Tamil"]
  },
  "hasMenuSection": [
    {
      "@type": "MenuSection",
      "name": "Veg Starters",
      "hasMenuItem": [
        {
          "@type": "MenuItem",
          "name": "Samosa (4)",
          "description": "Golden, crispy pastry filled with spiced potato mixture.",
          "offers": {
            "@type": "Offer",
            "price": "5.00",
            "priceCurrency": "GBP"
          }
        }
      ]
    }
  ]
}
```

---

## Widget Embed Code

Any website owner embeds the menu by copying this into their HTML:

```html
<script src="https://cdn.datumart.co.uk/widgets/menu-widget.js"></script>
<div
  id="datumart-menu-widget"
  data-vendor-id="YOUR_VENDOR_ID"
  data-theme="chettinad"
  data-show-search="true"
  data-show-recommendations="true">
</div>
```

---

## Architecture

```
Restaurant Website
        ↓
Embeddable Widget (React / Next.js)
        ↓
Datumart API (Node.js / Express)
        ↓
MongoDB Atlas
├── vendors
├── categories
├── products
├── menuindexes   (NLP search index)
└── menuevents    (analytics)
```

**Request flow:**

1. Widget loads and reads `data-vendor-id` from the embed script
2. Calls `GET /api/menu/slug/:vendorSlug` and receives full menu payload
3. Next.js renders the page server-side for SEO
4. Customer types a query — NLP engine scores and ranks products
5. Customer views a product — recommendations engine suggests similar items
6. Customer clicks Order Now — analytics event is posted to `/api/events`

---

## Database Schema

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| `vendors` | Restaurant configuration | name, slug, theme, currency, widgetConfig |
| `categories` | Menu sections with parent-child nesting | vendorId, parentId, name, sortOrder, isPublished |
| `products` | Menu items | vendorId, categoryId, price, isVeg, isNonVeg, currentStock |
| `menuindexes` | NLP search and similarity index | searchableText, keywords, embedding |
| `menuevents` | Analytics event log | eventType, sessionId, query, productId, timestamp |

---

## Scripts Reference

| Location | Command | Description |
|----------|---------|-------------|
| `server/` | `npm run dev` | Start backend with nodemon |
| `server/` | `npm run seed` | Clear and re-seed MongoDB |
| `server/` | `npm start` | Start backend without nodemon |
| `apps/web-next/` | `npm run dev` | Start Next.js development server |
| `apps/web-next/` | `npm run build` | Build for production |
| `apps/web-next/` | `npm start` | Start production server |

---

## Assumptions

- **Fuse.js** is used for NLP in Week 1. Production would use vector embeddings via OpenAI or MongoDB Atlas Vector Search using the `embedding` field already in `MenuIndex`.
- **Images** are served from Unsplash and Pexels CDNs. In production these would be stored on a CDN like Cloudflare or AWS S3.
- **Payment checkout** is out of scope. CTA buttons are placeholders ready for integration.
- **Mock adapter pattern** — `seedData.js` follows the exact same JSON contract as the real Datumart API so switching to live data requires only changing the API base URL.
- **Soft deletes** are used throughout — records are never hard-deleted, only marked `isDeleted: true`.

---

*Built as part of the Datumart Internship Assignment — Datum AI Labs*


[Demo Video on Google Drive ](https://drive.google.com/file/d/1e72nAYhuvW61kNQIS4avESUgCSOnI1yS/view?usp=sharing)