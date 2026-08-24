# Full-Stack E-Commerce Platform

A modern, highly customizable, and modular full-stack e-commerce platform designed for selling physical, digital, and custom products online. Built with a high-performance **FastAPI (Python)** backend, **MySQL** database, and three dedicated **React + Vite** frontend applications.

---

## 🌟 Key Highlights

- **Multi-App Ecosystem**: Dedicated applications for customers (**Storefront**), business operators (**Admin Dashboard**), and logistics personnel (**Driver App**).
- **Dynamic UI & Theme Management**: Configure brand colors, logos, banners, homepage layout sections, and CMS content directly from the Admin Panel without code deployments.
- **Advanced Product Customization Engine**: Support dynamic product options (colors, dimensions, materials, text engravings) with real-time price modifiers and image previews.
- **Real-Time Order & Delivery Tracking**: Live WebSocket updates for real-time order state progression and delivery driver location tracking on interactive Leaflet maps.
- **Payment & Notification Integrations**: Built-in support for **Bakong KHQR** payment gateway and automated **Telegram Bot** order alerts.

---

## 🚀 Features

### 🛍️ Storefront (Customer-Facing)
- Responsive catalog with search, category filtering, and sorting.
- Dynamic product customization modal with instant price calculation.
- Shopping cart, wishlist, and discount/coupon code application.
- Multi-step checkout with delivery slot scheduling and address map pin selection.
- Customer account portal, order history, and live order tracking.
- Google OAuth & JWT authentication.

### 📊 Admin Dashboard (Business Management)
- **Analytics & Reporting**: Sales revenue, order statuses, top-selling products, and stock charts (powered by Recharts).
- **Catalog Management**: Categories, products, variant options, pricing modifiers, image uploads, and inventory control.
- **Order Processing**: Full lifecycle order management, payment status updates, invoice inspection, and driver assignment.
- **Delivery Management**: Time slot management, driver dispatching, and live delivery status.
- **Dynamic Site Builder**: Custom themes, hero banners, promotion sections, and CMS content blocks.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Admins and Staff.
- **Audit Logs**: Comprehensive logs tracking administrative actions.

### 🚚 Driver App (Logistics & Delivery)
- Mobile-optimized interface for delivery drivers.
- View assigned deliveries and customer contact details.
- Integrated Leaflet maps with turn-by-turn routing context.
- One-tap delivery status updates (Picked Up, Out for Delivery, Delivered, Failed).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Backend API** | Python 3.10+, FastAPI, Pydantic v2, Starlette, Uvicorn |
| **Database & ORM** | MySQL 8+, SQLAlchemy 2.0, PyMySQL |
| **Frontend Frameworks** | React 19, Vite 8, React Router v7 |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons |
| **Realtime & WebSockets** | Starlette WebSockets (Live order & driver tracking) |
| **Authentication** | JWT (`python-jose`), Passlib (`bcrypt`), Google OAuth |
| **Maps & Charts** | Leaflet / React-Leaflet, Recharts |
| **Payment Gateway** | Bakong KHQR |
| **Alerts & Integrations** | Telegram Bot API |

---

## 📁 Project Structure

```
ecommerce/
├── backend/
│   ├── config/             # Database settings, CORS & environment variables
│   ├── dependencies/       # Authentication & database session dependencies
│   ├── models/             # SQLAlchemy ORM database models
│   ├── routers/            # FastAPI route handlers (auth, products, orders, etc.)
│   ├── schemas/            # Pydantic request & response validation models
│   ├── services/           # Business logic (Bakong KHQR, Telegram, customizer)
│   ├── websocket/          # WebSocket connection manager & real-time messaging
│   ├── seed_*.py           # Database seed scripts for testing & demo data
│   └── main.py             # FastAPI application entry point
├── frontend/
│   ├── storefront/         # Customer-facing shopping application (Port 5173)
│   ├── admin/              # Store administration & analytics dashboard (Port 5174)
│   └── driver/             # Delivery driver companion application (Port 5175)
├── docs/                   # Additional documentation & architectural guides
├── SETUP.md                # Detailed local environment setup instructions
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- **Python 3.10+** & `pip`
- **Node.js 18+** & `npm`
- **MySQL 8+**

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate    # Linux/macOS
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run database seeders (optional demo data)
python seed_products.py
python seed_themes.py
python seed_homepage.py

# Start backend server
uvicorn main:app --reload --port 8000
```
- **API Docs (Swagger)**: `http://localhost:8000/docs`
- **API Docs (ReDoc)**: `http://localhost:8000/redoc`

### 2. Frontend Setup

Run each frontend app in separate terminal tabs:

```bash
# 1. Customer Storefront (Port 5173)
cd frontend/storefront
npm install
npm run dev

# 2. Admin Dashboard (Port 5174)
cd frontend/admin
npm install
npm run dev

# 3. Driver App (Port 5175)
cd frontend/driver
npm install
npm run dev
```

---

## 🔑 Default Accounts (Demo)

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@aquarium.com` | `admin123` | Storefront & Admin Dashboard |
| **Staff** | `staff@aquarium.com` | `staff123` | Admin Dashboard (Operational) |
| **Customer** | `customer@example.com` | `customer123` | Storefront |

---

## 📚 Documentation

For in-depth guides, check the following resources:
- [Setup & Deployment Guide](SETUP.md)
- [Product Customization System Documentation](PRODUCT_CUSTOMIZATION_SYSTEM.md)
- [Customization API Reference](API_REFERENCE_CUSTOMIZATION.md)
- [UI Management & Theme System](docs/ui-management-system.md)

---

## 📄 License

This project is licensed under the MIT License.
