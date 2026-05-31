# Aquarium E-Commerce — Setup Guide

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MySQL 8+**
- **pip** and **npm**

---

## 1. Clone & Navigate

```bash
git clone <repo-url> aquarium-ecommerce
cd aquarium-ecommerce
```

---

## 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DATABASE_URL=mysql+pymysql://root:password@localhost/aquarium_ecommerce
JWT_SECRET=change-me-to-a-random-secret
```

### Create Database

```sql
CREATE DATABASE aquarium_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Seed Data

```bash
python seed_products.py
```

This creates categories, products, users, coupons, banners, and settings.

**Default accounts:**

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@aquarium.com     | admin123     |
| Staff    | staff@aquarium.com     | staff123     |
| Customer | customer@example.com   | customer123  |

### Run Backend

```bash
uvicorn main:app --reload --port 8000
```

API: `http://localhost:8000`  
Docs: `http://localhost:8000/docs`

---

## 3. Frontend Setup

Two React + Vite apps are in `frontend/`.

### Admin Panel

```bash
cd frontend/admin
npm install
npm run dev       # → http://localhost:5174
```

### Storefront

```bash
cd frontend/storefront
npm install
npm run dev       # → http://localhost:5173
```

---

## 4. Verifying It Works

1. Open `http://localhost:8000/docs` — you should see the Swagger API docs.
2. Open `http://localhost:5173` — storefront loads.
3. Open `http://localhost:5174` — admin panel loads.

---

## Project Structure

```
aquarium-ecommerce/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── config/                 # DB & settings config
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── routers/                # API route handlers
│   ├── services/               # Business logic (telegram, etc.)
│   ├── websocket/              # WebSocket connection management
│   ├── dependencies/           # Auth, DB session dependencies
│   ├── migrations/             # Manual migration scripts
│   ├── seed_products.py        # Database seeder
│   └── requirements.txt
├── frontend/
│   ├── admin/                  # React admin panel (Vite)
│   └── storefront/             # React customer storefront (Vite)
├── docs/                       # Additional documentation
└── README.md
```

## Optional: Telegram Notifications

Set these in `.env` to receive order notifications in Telegram:

```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```
