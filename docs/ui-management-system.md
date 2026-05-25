# Dynamic UI Management System

A fully dynamic storefront customization system where all visual elements are configured from the Admin Panel without modifying code. Changes apply immediately after saving.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Admin Panel Guide](#admin-panel-guide)
  - [Theme Settings](#1-theme-settings)
  - [Branding Settings](#2-branding-settings)
  - [Homepage Builder](#3-homepage-builder)
  - [Banner Management](#4-banner-management)
  - [CMS Blocks](#5-cms-blocks)
  - [Media Library](#6-media-library)
- [Storefront Usage](#storefront-usage)
- [API Reference](#api-reference)
- [Extending the System](#extending-the-system)

---

## Architecture Overview

```
Admin Panel (React)                  Backend (FastAPI)              Storefront (React)
       │                                   │                              │
       │── PUT /settings/theme ──────────► │                              │
       │── PUT /settings/branding ────────►│                              │
       │── POST /homepage ────────────────►│                              │
       │── POST /media/upload ────────────►│                              │
       │                                   │                              │
       │                                   │◄── GET /settings/theme/active│
       │                                   │◄── GET /settings/branding/pub│
       │                                   │◄── GET /homepage ────────────│
       │                                   │◄── GET /cms-blocks/active    │
       │                                   │                              │
       │                          ┌───────┴────────┐                     │
       │                          │   MySQL DB     │                     │
       │                          │  theme_settings│                     │
       │                          │  branding_set  │                     │
       │                          │  homepage_sec  │                     │
       │                          │  cms_blocks    │                     │
       │                          │  media_library │                     │
       │                          └────────────────┘                     │
```

### Key Principles

1. **All visual content comes from the database** — no hardcoded colors, images, or text in components
2. **CSS Variables** power the theme system — every component reads from `var(--primary)`, `var(--bg)`, etc.
3. **API-first** — the storefront fetches all settings on startup and caches them
4. **Immediate effect** — settings changes are visible after page refresh (auto-refresh every 60s)

### Database Tables

| Table | Stores |
|-------|--------|
| `theme_settings` | Color palettes, typography, layout, button styles (multiple themes possible) |
| `branding_settings` | Store name, logos, favicon, contact info, social links |
| `homepage_sections` | Hero sections, promotional banners, featured sections, testimonials |
| `cms_blocks` | Reusable content blocks (text, image, video, HTML, product showcase) |
| `media_library` | Uploaded images/videos with metadata |
| `banners` | Promotional banners with scheduling (existing, extended) |
| `settings` | Key-value store for misc settings |

---

## Getting Started

### 1. Run Backend

```bash
cd backend
uvicorn main:app --reload
```

Tables are auto-created on startup. Default theme and branding rows are seeded automatically.

### 2. Run Admin Panel

```bash
cd frontend/admin
npm install
npm run dev
```

Opens at `http://localhost:5174`

### 3. Run Storefront

```bash
cd frontend/storefront
npm install
npm run dev
```

Opens at `http://localhost:5173`

### 4. Seed Default Data (Optional)

```bash
cd backend
python seed_products.py
```

### 5. Run Migration Script (Alternative to auto-create)

```bash
python -m backend.migrations.001_create_ui_system
```

---

## Admin Panel Guide

### 1. Theme Settings

**Navigate:** Settings → Theme Settings (`/admin/settings/theme`)

#### What you can configure:

**Colors (16 fields)**
| Setting | Default | Description |
|---------|---------|-------------|
| Primary Color | `#2563eb` | Main brand color, used for links and active elements |
| Secondary Color | `#4f46e5` | Secondary brand accent |
| Accent Color | `#38bdf8` | Highlight color for badges and decorative elements |
| Background Color | `#f9fafb` | Page background |
| Surface/Card Color | `#ffffff` | Card, modal, and surface backgrounds |
| Header Color | `#0c1445` | Navigation bar background |
| Footer Color | `#0c1445` | Footer background |
| Text Primary | `#111827` | Main body text |
| Text Secondary | `#6b7280` | Muted/secondary text |
| Button Background | `#2563eb` | Primary button fill |
| Button Text | `#ffffff` | Primary button text |
| Button Hover | `#1d4ed8` | Button hover state |
| Success Color | `#10b981` | Success messages and indicators |
| Warning Color | `#f59e0b` | Warning messages |
| Error Color | `#ef4444` | Error messages and validation |
| Border Color | `#e5e7eb` | Borders and dividers |

**Typography (5 fields)**
| Setting | Default | Description |
|---------|---------|-------------|
| Font Family | `Inter, system-ui, sans-serif` | CSS font-family stack |
| Heading Font Size | `2.5rem` | Size for h1/h2 elements |
| Body Font Size | `1rem` | Base paragraph size |
| Font Weight | `400` | Default font weight |
| Line Height | `1.6` | Paragraph line height |

**Layout (8 fields)**
| Setting | Default | Description |
|---------|---------|-------------|
| Container Width | `1280px` | Max width of content area |
| Grid Columns | `4` | Default product/category grid columns |
| Card Style | `rounded-xl` | Card border-radius style |
| Border Radius | `0.75rem` | Default border radius |
| Box Shadow | `0 1px 3px rgba(0,0,0,0.1)` | Default card shadow |
| Section Spacing | `4rem` | Vertical spacing between sections |
| Header Height | `4rem` | Navbar height |
| Footer Height | `auto` | Footer height |

**Button Styles (5 fields)**
| Setting | Default | Description |
|---------|---------|-------------|
| Border Radius | `0.5rem` | Button corner rounding |
| Padding | `0.75rem 1.5rem` | Button internal spacing |
| Hover Animation | `scale` | `scale`, `lift`, `glow`, or `none` |
| Shadow | `0 4px 6px rgba(0,0,0,0.1)` | Button shadow |

#### Theme Management

- **Multiple themes** — create, duplicate, and switch between themes
- **Live preview** — the right panel shows real-time preview of changes
- **Dark mode toggle** — per-theme dark mode support
- **Activate** — one theme is active at a time; the storefront uses the active theme

#### How it works:

1. Admin edits colors in the color pickers
2. Click **Save Changes**
3. Backend stores in `theme_settings` table
4. Storefront fetches `GET /settings/theme/active` on load and every 60s
5. CSS variables are applied to `<html>` element via `ThemeContext`
6. All components read from `var(--primary)`, `var(--bg)`, etc.

---

### 2. Branding Settings

**Navigate:** Settings → Branding Settings (`/admin/settings/branding`)

#### Store Information
- **Store Name** — used in title bar, header, and throughout the storefront
- **Contact Email** — displayed in footer
- **Contact Phone** — displayed in footer
- **Contact Address** — displayed in footer
- **Copyright Text** — footer copyright line

#### Logos & Favicon
- **Store Logo** — displayed in navbar (replaces text logo)
- **Favicon** — browser tab icon (updates dynamically)
- **Footer Logo** — displayed in footer section

Each logo field has a **Browse** button to pick from the Media Library, or you can paste a URL directly.

#### Social Media Links
Facebook, Twitter/X, Instagram, YouTube, LinkedIn — displayed as links in the footer.

#### Preview
The right panel shows a live preview of how branding will appear.

---

### 3. Homepage Builder

**Navigate:** Settings → Homepage Builder (`/admin/settings/homepage`)

Build your homepage by adding, editing, and reordering sections.

#### Available Section Types

| Type | Description |
|------|-------------|
| **Hero Section** | Full-screen hero with title, subtitle, CTA button, background image/video, overlay |
| **Featured Categories** | Grid of category placeholders |
| **Featured Products** | Grid of product placeholders |
| **Promotional Section** | Banner-style section with image and text |
| **Testimonials** | Customer testimonial cards |
| **Custom Content** | Free-form content section |

#### Hero Section Configuration

| Field | Description |
|-------|-------------|
| Hero Title | Main headline text |
| Hero Subtitle | Supporting text below title |
| CTA Button Text | Call-to-action button label |
| CTA Button URL | Where the button links to |
| Badge Text | Small badge above the title (e.g., "New Collection") |
| Background Image URL | Full-screen background image |
| Background Video URL | Full-screen background video (MP4 or YouTube) |
| Overlay Color | Color overlay on top of background media |
| Overlay Opacity | How transparent the overlay is (0-100%) |
| Text Color | Color of all hero text |

#### Reordering Sections
Use the ▲ and ▼ buttons to reorder sections. The storefront renders sections in ascending `sort_order`.

#### How it works:
1. Admin adds/edits sections in the builder
2. Click **Save All** to persist changes
3. Storefront fetches `GET /homepage` which returns all active sections ordered
4. `DynamicSection` component renders each section based on `section_type`

---

### 4. Banner Management

**Navigate:** Banners (`/admin/banners`)

Full CRUD for promotional banners with scheduling support.

#### Banner Fields

| Field | Description |
|-------|-------------|
| Title | Display title |
| Subtitle | Secondary text |
| Description | Longer description |
| Image URL | Banner image |
| Video URL | Background video |
| Video Type | `mp4`, `youtube`, etc. |
| Button Text | CTA label |
| Button Link | CTA destination |
| Position | `hero`, `sidebar`, `bottom` |
| Sort Order | Display order |
| Active | Toggle visibility |
| Start Date | Scheduled publish date |
| End Date | Scheduled unpublish date |

#### Date Scheduling
Active banners respect start/end dates. A banner is only returned by `GET /banners/active` if:
- `is_active = true`
- Current time is between `start_date` and `end_date` (if set)

---

### 5. CMS Blocks

**Navigate:** CMS Blocks (`/admin/cms-blocks`)

Create unlimited reusable content blocks with drag-and-drop ordering and scheduling.

#### Block Types

| Type | Content |
|------|---------|
| **Text Block** | Rich text content |
| **Image Block** | Image with URL and alt text |
| **Video Block** | Video with autoplay option |
| **HTML Block** | Raw HTML (rendered via dangerouslySetInnerHTML) |
| **Product Showcase** | Product grid/carousel by product IDs |
| **Category Showcase** | Category display by category IDs |

#### Features
- **Drag ordering** — use ▲/▼ to reorder blocks
- **Scheduling** — set `publish_at` and `unpublish_at` dates
- **Enable/Disable** — toggle individual blocks
- **Slug** — unique identifier for programmatic access

#### How it works:
Blocks are fetched by the storefront via `GET /cms-blocks/active` which applies scheduling filters server-side.

---

### 6. Media Library

**Navigate:** Media Library (`/admin/media`)

Upload and manage media assets that can be reused across the system.

#### Features
- **Upload Files** — drag-and-drop or click to upload images/videos
- **Add URL** — save external URLs as media entries
- **Copy URL** — one-click copy of media URLs for use in other settings
- **Filter by type** — All, Images, or Videos
- **Preview** — thumbnails for quick visual identification
- **Delete** — remove media entries

#### Usage
When configuring banners, homepage sections, or branding, use the **Browse** button to open the media library picker and select an image directly.

---

## Storefront Usage

### Theme Integration

The storefront uses a **ThemeProvider** (`context/ThemeContext.jsx`) that:

1. **On load**: Fetches `GET /settings/theme/active` and applies CSS variables to `document.documentElement`
2. **Auto-refresh**: Polls the API every 60 seconds for theme changes
3. **Fallback**: Uses sensible defaults if the API is unavailable
4. **Dark mode**: Adds/removes `dark` class on `<html>` based on `is_dark_mode`

### Using CSS Variables in Components

```jsx
// Any component can use theme values via CSS variables
function MyCard() {
  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      color: 'var(--text-primary)',
      borderRadius: 'var(--border-radius)',
      boxShadow: 'var(--box-shadow)',
      border: '1px solid var(--border)',
    }}>
      <h2 style={{ fontSize: 'var(--heading-size)' }}>Title</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Description</p>
      <button style={{
        backgroundColor: 'var(--button-bg)',
        color: 'var(--button-text)',
        borderRadius: 'var(--button-radius)',
        padding: 'var(--button-padding)',
      }}>
        Click me
      </button>
    </div>
  );
}
```

### Available CSS Variables

```
--primary            --secondary          --accent
--bg                 --surface            --header-bg
--footer-bg          --text-primary       --text-secondary
--button-bg          --button-text        --success
--warning            --error              --border
--font-family        --heading-size       --body-size
--font-weight        --line-height        --container-width
--border-radius      --box-shadow         --section-spacing
--header-height      --button-radius      --button-padding
--button-hover       --button-shadow
```

### Site Settings Hook

```jsx
import { useSiteSettings } from '../context/SiteSettingsContext';

function MyComponent() {
  const {
    storeName,          // string
    storeLogo,          // string (URL) or null
    favicon,            // string (URL) or null
    footerLogo,         // string (URL) or null
    copyrightText,      // string
    contactEmail,       // string or null
    contactPhone,       // string or null
    contactAddress,     // string or null
    socialLinks,        // { facebook, twitter, instagram, youtube, linkedin }
    backgroundVideoEnabled,  // bool
    backgroundVideoUrl,      // string (URL) or null
    homepageSections,   // array of section objects
    loading,            // bool
    reload,             // function to refetch
  } = useSiteSettings();

  return <h1>{storeName}</h1>;
}
```

### Theme Hook

```jsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { cssVars, isDarkMode, loading, reload } = useTheme();
  // cssVars is an object like { '--primary': '#2563eb', ... }
  return <div>Dark mode: {isDarkMode ? 'on' : 'off'}</div>;
}
```

---

## API Reference

### Theme Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/settings/theme/active` | Public | Get active theme CSS variables |
| `GET` | `/settings/theme` | Admin/Staff | List all themes |
| `GET` | `/settings/theme/{id}` | Admin/Staff | Get theme by ID |
| `POST` | `/settings/theme` | Admin/Staff | Create theme |
| `PUT` | `/settings/theme/{id}` | Admin/Staff | Update theme fields |
| `DELETE` | `/settings/theme/{id}` | Admin/Staff | Delete theme |
| `POST` | `/settings/theme/{id}/duplicate` | Admin/Staff | Duplicate a theme |

### Branding Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/settings/branding/public` | Public | Get public branding info |
| `GET` | `/settings/branding` | Admin/Staff | Get full branding settings |
| `PUT` | `/settings/branding` | Admin/Staff | Update branding settings |

### Homepage Sections

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/homepage` | Public | Get active sections + branding |
| `GET` | `/homepage/admin` | Admin/Staff | List all sections |
| `POST` | `/homepage` | Admin/Staff | Create section |
| `PUT` | `/homepage/{id}` | Admin/Staff | Update section |
| `DELETE` | `/homepage/{id}` | Admin/Staff | Delete section |
| `PUT` | `/homepage/reorder/all` | Admin/Staff | Batch reorder sections |

### CMS Blocks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/cms-blocks/active` | Public | Get published, active blocks |
| `GET` | `/cms-blocks` | Admin/Staff | List all blocks |
| `GET` | `/cms-blocks/{id}` | Admin/Staff | Get block by ID |
| `POST` | `/cms-blocks` | Admin/Staff | Create block |
| `PUT` | `/cms-blocks/{id}` | Admin/Staff | Update block |
| `DELETE` | `/cms-blocks/{id}` | Admin/Staff | Delete block |
| `PUT` | `/cms-blocks/reorder/all` | Admin/Staff | Batch reorder blocks |

### Media Library

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/media` | Admin/Staff | List media (filter by `?folder=` or `?media_type=`) |
| `GET` | `/media/{id}` | Admin/Staff | Get media details |
| `POST` | `/media/upload` | Admin/Staff | Upload file (multipart/form-data) |
| `POST` | `/media/url` | Admin/Staff | Save external URL as media entry |
| `PUT` | `/media/{id}` | Admin/Staff | Update media metadata |
| `DELETE` | `/media/{id}` | Admin/Staff | Delete media |

### Banners

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/banners` | Public | List all banners (sorted) |
| `GET` | `/banners/active` | Public | Get active, in-schedule banners |
| `GET` | `/banners/{id}` | Admin/Staff | Get banner by ID |
| `POST` | `/banners` | Admin/Staff | Create banner |
| `PUT` | `/banners/{id}` | Admin/Staff | Update banner |
| `DELETE` | `/banners/{id}` | Admin/Staff | Delete banner |

---

## Extending the System

### Adding a New Theme Setting

1. **Backend**: Add column to `ThemeSettings` model in `backend/models/theme.py`
2. **Schema**: Add field to `ThemeSettingsBase` and `ThemeSettingsUpdate` in `backend/schemas/theme.py`
3. **API**: Add mapping in the `get_active_theme_css` function in `backend/routers/theme.py`
4. **Admin**: Add field to `COLOR_FIELDS`, `TYPOGRAPHY_FIELDS`, or `LAYOUT_FIELDS` in `frontend/admin/src/pages/settings/ThemeSettings.jsx`
5. **Storefront**: CSS variable is automatically available via `var(--your-new-var)`

### Adding a New Homepage Section Type

1. **Backend**: No changes needed — `section_type` is a string, `content` is JSON
2. **Admin**: Add option to `SECTION_TYPES` array in `frontend/admin/src/pages/settings/HomepageBuilder.jsx`
3. **Storefront**: Add a render case in `DynamicSection` component (`frontend/storefront/src/components/DynamicSection.jsx`)

### Adding a New Branding Field

1. **Backend**: Add column to `BrandingSettings` model
2. **Schema**: Add to `BrandingSettingsBase` and `BrandingSettingsUpdate`
3. **Admin**: Add input field in `BrandingSettings.jsx`
4. **Storefront**: Add to `SiteSettingsContext` and use in components

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Storefront shows default colors | API unreachable or no active theme | Check backend is running, check `theme_settings` table has an active theme |
| Changes not reflecting | Cache | Hard refresh (Ctrl+Shift+R), or wait for 60s auto-refresh |
| Media upload fails | `uploads/` directory not writable | `chmod 755 backend/uploads/` or check permissions |
| Banner not showing on storefront | Date scheduling or `is_active=false` | Check `start_date`, `end_date`, and `is_active` flag |
| Admin page crashes | Missing imports or wrong path | Check `App.jsx` route paths match page file locations |
