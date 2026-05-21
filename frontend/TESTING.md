# Frontend Testing Guide

## Quick Start

### Prerequisites
1. Backend running: `uvicorn main:app --reload` (from backend directory)
2. MySQL database with categories table created
3. Dependencies installed: `npm install` (if not already done)

### Start Development Server

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

### Test URLs

- **Home Page:** http://localhost:5173/
- **Admin Categories:** http://localhost:5173/admin/categories

## Testing Checklist

### 1. List View
- [ ] Load `/admin/categories` → should display empty state or existing categories
- [ ] Click "+ New Category" button
- [ ] Verify table displays: Name, Slug, Parent, Status, Actions columns
- [ ] Click sort icons (↑↓) on headers → verify sorting
- [ ] Verify Active/Inactive status badges appear correctly

### 2. Create Category
- [ ] Fill in category form:
  - [ ] Name: "Freshwater Fish"
  - [ ] Slug: auto-fills as "freshwater-fish"
  - [ ] Description: "Fish that live in freshwater"
  - [ ] Leave parent as "None"
  - [ ] Check "Active" checkbox
- [ ] Click "Create Category"
- [ ] Verify success message appears
- [ ] Category appears in list immediately
- [ ] Form closes automatically

### 3. Parent-Child Relationships
- [ ] Create another category with:
  - [ ] Name: "Tropical Fish"
  - [ ] Parent: "Freshwater Fish"
- [ ] Verify parent shows correctly in list
- [ ] Switch to Tree View → see nested hierarchy

### 4. Edit Category
- [ ] Click "Edit" button on a category
- [ ] Form opens with existing data
- [ ] Change the description
- [ ] Click "Update Category"
- [ ] Verify changes reflected immediately

### 5. Delete Category
- [ ] Click "Delete" button
- [ ] Confirmation dialog appears with category name
- [ ] Click "Delete" → success message
- [ ] Category removed from list

### 6. Tree View
- [ ] Click "Tree View" tab
- [ ] See hierarchical structure with parent-child relationships
- [ ] Hover over items → see Edit, Add Child, Delete buttons
- [ ] Click expand/collapse arrows (▶/▼)
- [ ] Click "Add Child" button on a category
- [ ] Form opens with parent_id pre-filled
- [ ] Create child category

### 7. Form Validation
- [ ] Try to create category with empty name
- [ ] Should show error: "Name is required"
- [ ] Try to create with empty slug
- [ ] Should show error: "Slug is required"
- [ ] Cannot submit until errors are fixed

### 8. Error Handling
- [ ] Try to create duplicate slug
- [ ] Should show error from API: "Slug already exists"
- [ ] Try to set a category as its own parent
- [ ] Should show error: "Circular reference detected"

### 9. Navigation
- [ ] Click "Home" link in navbar → goes to home page
- [ ] Click "Manage Categories" → goes to admin page
- [ ] Click "Start Managing Categories" button on home

### 10. Responsive Design
- [ ] Resize browser to mobile width (< 640px)
- [ ] Layout should stack vertically
- [ ] Form and list should be readable
- [ ] Buttons should remain clickable

## Troubleshooting

### "Failed to fetch categories" Error
- Check backend is running on http://localhost:8000
- Check database connection in `.env`
- Check CORS if needed

### Form doesn't submit
- Check browser console for validation errors
- Verify category name and slug are not empty
- Check if slug already exists (must be unique)

### Parent category dropdown is empty
- Check that other categories exist in the database
- Create a root category first before adding children

### Table doesn't show data
- Check "List View" tab is active
- Verify categories were created successfully
- Check browser console for API errors

## Performance Notes

- List view loads all categories (consider pagination for 100+ categories)
- Tree view builds hierarchy in memory (fine for < 1000 categories)
- Slug auto-generation works on client (instant feedback)
- All API calls show loading state

## API Endpoints Used

The frontend communicates with these backend endpoints:

```
GET  /categories           - List all categories
GET  /categories/tree      - Get hierarchy tree
GET  /categories/{id}      - Get single category
POST /categories           - Create category
PUT  /categories/{id}      - Update category
DELETE /categories/{id}    - Delete category
```

All responses include proper error handling and user-friendly messages.
