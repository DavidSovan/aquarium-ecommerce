# Category Management Module - Setup Guide

## Project Structure

The backend has been refactored into organized modules:

```
backend/
├── main.py                    # App initialization and routes
├── config/
│   └── database.py           # SQLAlchemy configuration
├── models/
│   └── category.py           # Category ORM model
├── schemas/
│   └── category.py           # Pydantic validation schemas
├── routers/
│   └── categories.py         # Category API endpoints
├── requirements.txt
├── .env.example              # Environment variables template
└── test_api.py               # Tests (products + categories)
```

## Installation & Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Database

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```
DATABASE_URL=mysql+pymysql://username:password@localhost/aquarium_ecommerce
```

### 3. Create MySQL Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE aquarium_ecommerce;
EXIT;
```

## Running the Application

### Start the Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### View API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Category API Endpoints

### List Categories
```
GET /categories
```

### Get Category Tree (Hierarchical)
```
GET /categories/tree
```

### Get Category Detail
```
GET /categories/{id}
```

### Create Category
```
POST /categories
```

Body:
```json
{
  "name": "Freshwater Fish",
  "slug": "freshwater-fish",
  "description": "Fish for freshwater aquariums",
  "image": "https://...",
  "parent_id": null,
  "is_active": true
}
```

### Update Category
```
PUT /categories/{id}
```

Body (all fields optional):
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": false
}
```

### Delete Category
```
DELETE /categories/{id}
```

## Features

- **Parent-Child Relationships**: Support hierarchical category structure
- **Category Tree API**: Get full nested hierarchy with `/categories/tree`
- **Slug Management**: Auto-generate slugs from names or set custom slugs
- **Active/Inactive Status**: Control category visibility
- **Circular Reference Prevention**: Prevents self-referencing hierarchies
- **Timestamps**: Automatic created_at and updated_at tracking

## Running Tests

```bash
pytest test_api.py -v
```

### Test Coverage

- Product CRUD operations (existing)
- Category CRUD operations (new)
- Parent-child relationships
- Category tree structure
- Slug uniqueness validation
- Circular reference prevention
- Error handling (404, 400 errors)

## Database Schema

### Categories Table

| Field | Type | Details |
|-------|------|---------|
| id | INT | Primary key, auto-increment |
| name | VARCHAR(255) | Required, category name |
| slug | VARCHAR(255) | Required, unique, indexed |
| description | TEXT | Optional |
| image | VARCHAR(500) | Optional, image URL |
| parent_id | INT | Foreign key (self-reference), nullable |
| is_active | BOOLEAN | Default: True |
| created_at | DATETIME | Auto-populated |
| updated_at | DATETIME | Auto-updated |

## Troubleshooting

### "Access denied for user 'root'@'localhost'"

Make sure you have:
1. Created a `.env` file with correct MySQL credentials
2. Created the `aquarium_ecommerce` database
3. MySQL is running

### "Table 'aquarium_ecommerce.categories' doesn't exist"

The tables will be created automatically when the server starts. If this doesn't happen:

```bash
# In Python shell
from config.database import Base, engine
Base.metadata.create_all(bind=engine)
```

### Import Errors

Make sure you're running from the `backend` directory and have installed all dependencies:

```bash
pip install -r requirements.txt
```

## Next Steps

- Migrate Products module to use the same database-backed approach
- Add pagination parameters (skip, limit, sorting)
- Add filtering and search capabilities
- Consider adding Alembic for database migrations
- Add image upload/storage handling
