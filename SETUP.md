# Aquarium E-Commerce — Setup Guide

## Prerequisites

- **Python 3.10+** and **pip**
- **Node.js 18+** and **npm**
- **MySQL 8+** running locally or remotely

---

## 1. Clone & Navigate

```bash
git clone <repo-url> aquarium-ecommerce
cd aquarium-ecommerce
```

---

## 2. Backend Setup

### 2.1 Create Virtual Environment & Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Linux / macOS
# venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### 2.2 Configure Environment

```bash
cp .env.example .env
```

Edit `backend/.env` with your settings:

| Variable              | Description                            | Example                                      |
|-----------------------|----------------------------------------|----------------------------------------------|
| `DATABASE_URL`        | MySQL connection string                | `mysql+pymysql://root:password@localhost:3306/aquarium_ecommerce` |
| `JWT_SECRET`          | Secret key for JWT tokens              | `change-me-to-a-random-secret`               |
| `JWT_ALGORITHM`       | JWT signing algorithm                  | `HS256`                                      |
| `JWT_EXPIRE_MINUTES`  | Token expiry time                      | `1440` (24 hours)                            |
| `ALLOW_DB_RESET`      | Allow dangerous DB reset endpoint      | `false`                                      |

Optional integrations:

| Variable              | Description                            |
|-----------------------|----------------------------------------|
| `BAKONG_ACCOUNT_ID`   | Bakong KHQR merchant account ID        |
| `BAKONG_API_BASE_URL` | Bakong API base URL                    |
| `BAKONG_API_TOKEN`    | Bakong API token                       |
| `TELEGRAM_BOT_TOKEN`  | Telegram bot token for notifications   |
| `TELEGRAM_CHAT_ID`    | Telegram chat ID to receive alerts     |
| `TELEGRAM_BOT_USERNAME` | Bot username for deep-link pairing   |
| `PUBLIC_BASE_URL`     | Public-facing URL of the backend       |

### 2.3 Create Database

```sql
CREATE DATABASE aquarium_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.4 Seed Data

```bash
python seed_products.py
```

This creates categories, products, users, coupons, banners, and settings.

Additional seeders (optional):

```bash
python seed_themes.py       # theme & branding presets
python seed_homepage.py     # homepage section layouts
python seed_furniture.py    # additional product data
```

**Default accounts:**

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@aquarium.com     | admin123     |
| Staff    | staff@aquarium.com     | staff123     |
| Customer | customer@example.com   | customer123  |

### 2.5 Run Backend

```bash
uvicorn main:app --reload --port 8000
```

- API root: `http://localhost:8000`
- Interactive docs (Swagger): `http://localhost:8000/docs`

---

## 3. Frontend Setup

Three React + Vite apps live under `frontend/`. Each must be set up separately.

### Admin Panel

```bash
cd frontend/admin
npm install
npm run dev       # → http://localhost:5174
```

### Storefront (Customer-facing)

```bash
cd frontend/storefront
npm install
npm run dev       # → http://localhost:5173
```

### Driver App (Delivery)

```bash
cd frontend/driver
npm install
npm run dev       # → http://localhost:5175
```

---

## 4. Running Tests

### Backend (Python / pytest)

```bash
cd backend
source venv/bin/activate
pytest test_api.py -v
```

### Bash Integration Tests

```bash
./test_checkout_flow.sh
./test_checkout_advanced.sh
```

---

## 5. Verifying It Works

1. **API**: Open `http://localhost:8000/docs` — you should see the Swagger UI.
2. **Storefront**: Open `http://localhost:5173` — the customer-facing shop loads.
3. **Admin panel**: Open `http://localhost:5174` — the admin dashboard loads.
4. **Driver app**: Open `http://localhost:5175` — the delivery tracking app loads.

---

## Project Structure

```
aquarium-ecommerce/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── config/                 # DB engine & settings config
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── routers/                # API route handlers
│   ├── services/               # Business logic (payments, telegram, ...)
│   ├── websocket/              # WebSocket connection manager & auth
│   ├── dependencies/           # Auth & DB session dependencies
│   ├── migrations/             # Manual migration scripts
│   ├── seed_*.py               # Database seeders
│   └── requirements.txt
├── frontend/
│   ├── admin/                  # React admin panel (Vite, port 5174)
│   ├── storefront/             # React customer storefront (Vite, port 5173)
│   └── driver/                 # React driver delivery app (Vite, port 5175)
├── docs/                       # Additional documentation
├── SETUP.md                    # This file
└── README.md
```

---

## Optional: Telegram Notifications

To receive order notifications via Telegram, add to `.env`:

```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
TELEGRAM_BOT_USERNAME=YourBot
PUBLIC_BASE_URL=https://your-domain.com
```

## Optional: Bakong KHQR Payment

The platform supports Bakong KHQR (Cambodian QR payment). Configure in `.env`:

```
BAKONG_ACCOUNT_ID=your_bakongID@bkt
BAKONG_API_BASE_URL=https://api-bakong.nbc.gov.kh
BAKONG_API_TOKEN=your_api_token_here
```

---

## Troubleshooting

| Problem                          | Likely Fix                                                         |
|----------------------------------|-------------------------------------------------------------------|
| `pymysql.err.OperationalError`   | MySQL is not running or credentials in `.env` are wrong.          |
| `ModuleNotFoundError`            | Virtual environment is not activated or not all deps installed.   |
| Tables not created               | Run the backend once — `Base.metadata.create_all` runs on startup. |
| CORS errors from frontend        | Backend already has CORS middleware configured for localhost.      |
| Port already in use              | Change the port in the `uvicorn` or `vite` command.               |
