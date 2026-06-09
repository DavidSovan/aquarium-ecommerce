# Aquarium E-Commerce

A full-featured e-commerce platform with a **FastAPI** backend and **React + Vite** frontends (admin panel, storefront, and driver app).

## Features

- **Product management** with categories, images, options, and customization
- **Shopping cart & wishlist** with JSON-based product customization
- **Order management** with checkout flow, payment, and delivery scheduling
- **JWT authentication** with admin, staff, and customer roles
- **Real-time updates** via WebSocket for orders and delivery tracking
- **Bakong KHQR** payment gateway integration
- **Telegram bot** notifications for orders
- **Dynamic UI management** — theme, branding, homepage sections, CMS blocks, and media library configurable from the admin panel
- **Inventory management** with adjustment logging and low-stock alerts
- **Delivery scheduling** with slot management and driver assignment
- **Audit logging** for tracking changes

## Tech Stack

| Layer    | Technology                                                   |
|----------|--------------------------------------------------------------|
| Backend  | Python 3.10+, FastAPI, SQLAlchemy 2.0, PyMySQL               |
| Database | MySQL 8+                                                     |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router, Axios        |
| Auth     | JWT (python-jose), bcrypt (passlib)                          |
| Realtime | WebSocket (starlette)                                        |
| Payment  | Bakong KHQR                                                  |

## Quick Start

See **[SETUP.md](SETUP.md)** for full installation and configuration instructions.

## Project Structure

```
aquarium-ecommerce/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── config/                 # DB & settings configuration
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic request/response schemas
│   ├── routers/                # API route handlers
│   ├── services/               # Business logic (payments, telegram, etc.)
│   ├── websocket/              # WebSocket connection management
│   ├── dependencies/           # Auth & DB session dependencies
│   ├── migrations/             # Manual migration scripts
│   └── seed_*.py               # Database seeders
├── frontend/
│   ├── admin/                  # Admin panel (port 5174)
│   ├── storefront/             # Customer storefront (port 5173)
│   └── driver/                 # Driver delivery app (port 5175)
├── docs/                       # Additional documentation
├── SETUP.md                    # Setup guide
└── README.md
```
