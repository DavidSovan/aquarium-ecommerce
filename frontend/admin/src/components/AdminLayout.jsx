import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

/* ── SVG Icon Components ─────────────────────────────────────────────── */

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  categories: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  customers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  coupons: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={3} />
    </svg>
  ),
  banners: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  cms: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  delivery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  homepage: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  collapse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  ),
  expand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  ),
  theme: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.06 0 1.93-.8 2-1.84a1.86 1.86 0 0 0-.54-1.35c-.41-.4-.64-.95-.64-1.53 0-1.18.96-2.14 2.14-2.14h2.51A4.53 4.53 0 0 0 22 10.61C22 5.86 17.52 2 12 2z"/>
      <circle cx="6.5" cy="10.5" r="1.5"/>
      <circle cx="10.5" cy="5.5" r="1.5"/>
      <circle cx="15.5" cy="6.5" r="1.5"/>
    </svg>
  ),
  branding: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z"/>
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
      <path d="M2 2l7.586 7.586"/>
      <circle cx="11" cy="11" r="2"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

/* ── Navigation structure with grouped sections ──────────────────────── */

const navSections = [
  {
    label: 'Main',
    items: [
      { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
    ],
  },
  {
    label: 'Store',
    items: [
      { path: '/admin/products', label: 'Products', icon: 'products' },
      { path: '/admin/categories', label: 'Categories', icon: 'categories' },
      { path: '/admin/inventory', label: 'Inventory', icon: 'inventory' },
      { path: '/admin/orders', label: 'Orders', icon: 'orders' },
      { path: '/admin/customers', label: 'Users', icon: 'customers' },
      { path: '/admin/coupons', label: 'Coupons', icon: 'coupons' },
    ],
  },
  {
    label: 'Content',
    items: [
      { path: '/admin/banners', label: 'Banners', icon: 'banners' },
      { path: '/admin/media', label: 'Media Library', icon: 'media' },
      { path: '/admin/cms-blocks', label: 'CMS Blocks', icon: 'cms' },
      { path: '/admin/settings/homepage', label: 'Homepage', icon: 'homepage' },
      { path: '/admin/settings/theme', label: 'Theme', icon: 'theme' },
      { path: '/admin/settings/branding', label: 'Branding', icon: 'branding' },
    ],
  },
  {
    label: 'Delivery',
    items: [
      { path: '/admin/delivery-slots', label: 'Delivery Slots', icon: 'delivery' },
    ],
  },
  {
    label: 'Analytics & Settings',
    items: [
      { path: '/admin/reports', label: 'Reports', icon: 'reports' },
      { path: '/admin/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

/* ── Sidebar CSS (injected once) ─────────────────────────────────────── */

const sidebarStylesId = 'admin-sidebar-styles';

function injectSidebarStyles() {
  if (document.getElementById(sidebarStylesId)) return;
  const style = document.createElement('style');
  style.id = sidebarStylesId;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    /* ── Sidebar Container ─────────────────── */
    .admin-sidebar {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      width: 272px;
      background: linear-gradient(180deg, #0f1729 0%, #0a0f1f 50%, #060b18 100%);
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      overflow: hidden;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 10;
    }

    .admin-sidebar.collapsed {
      width: 72px;
    }

    /* Subtle noise texture overlay */
    .admin-sidebar::before {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }

    .admin-sidebar > * {
      position: relative;
      z-index: 1;
    }

    /* ── Brand Header ──────────────────────── */
    .sidebar-brand {
      padding: 20px 16px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 72px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.08);
    }

    .sidebar-brand-logo {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      object-fit: contain;
      flex-shrink: 0;
      background: rgba(99, 102, 241, 0.15);
      padding: 4px;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .sidebar-brand-placeholder {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      flex-shrink: 0;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      color: #a78bfa;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    .sidebar-brand-info {
      overflow: hidden;
      opacity: 1;
      transition: opacity 0.2s ease;
    }

    .collapsed .sidebar-brand-info {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .sidebar-brand-name {
      font-size: 15px;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }

    .sidebar-brand-tag {
      font-size: 11px;
      color: #6366f1;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    /* ── Navigation ────────────────────────── */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(99, 102, 241, 0.2) transparent;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(99, 102, 241, 0.2);
      border-radius: 4px;
    }

    /* ── Section Header ────────────────────── */
    .sidebar-section-label {
      font-size: 10.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(148, 163, 184, 0.5);
      padding: 16px 8px 6px;
      white-space: nowrap;
      overflow: hidden;
      transition: opacity 0.2s ease;
    }

    .collapsed .sidebar-section-label {
      opacity: 0;
      height: 16px;
      padding: 8px 0 0;
    }

    .sidebar-section:first-child .sidebar-section-label {
      padding-top: 4px;
    }

    /* ── Nav Item ───────────────────────────── */
    .sidebar-nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      border-radius: 10px;
      text-decoration: none;
      color: #94a3b8;
      font-size: 13.5px;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      white-space: nowrap;
      margin-bottom: 2px;
    }

    .collapsed .sidebar-nav-item {
      padding: 9px;
      justify-content: center;
    }

    .sidebar-nav-item:hover {
      color: #e2e8f0;
      background: rgba(148, 163, 184, 0.08);
    }

    .sidebar-nav-item.active {
      color: #fff;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.08);
    }

    /* Active accent indicator bar */
    .sidebar-nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      border-radius: 0 3px 3px 0;
      background: linear-gradient(180deg, #818cf8, #6366f1);
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.6);
    }

    .collapsed .sidebar-nav-item.active::before {
      left: 50%;
      top: auto;
      bottom: 0;
      transform: translateX(-50%);
      width: 20px;
      height: 3px;
      border-radius: 3px 3px 0 0;
    }

    /* Icon container */
    .sidebar-nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

    .sidebar-nav-item:hover .sidebar-nav-icon {
      transform: scale(1.1);
    }

    .sidebar-nav-item.active .sidebar-nav-icon {
      color: #818cf8;
    }

    /* Nav label */
    .sidebar-nav-label {
      opacity: 1;
      transition: opacity 0.2s ease;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .collapsed .sidebar-nav-label {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    /* ── User / Footer Section ─────────────── */
    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(148, 163, 184, 0.08);
    }

    .sidebar-user-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 10px;
      border-radius: 10px;
      background: rgba(148, 163, 184, 0.04);
      margin-bottom: 8px;
      transition: background 0.2s ease;
    }

    .sidebar-user-card:hover {
      background: rgba(148, 163, 184, 0.08);
    }

    .collapsed .sidebar-user-card {
      justify-content: center;
      padding: 10px 6px;
    }

    .sidebar-avatar {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: #fff;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .sidebar-user-info {
      overflow: hidden;
      opacity: 1;
      transition: opacity 0.2s ease;
    }

    .collapsed .sidebar-user-info {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    .sidebar-user-name {
      font-size: 13px;
      font-weight: 600;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sidebar-user-role {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }

    .sidebar-logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 9px 12px;
      border-radius: 10px;
      border: none;
      background: none;
      color: #64748b;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .collapsed .sidebar-logout-btn {
      padding: 9px;
      justify-content: center;
    }

    .sidebar-logout-btn:hover {
      color: #f87171;
      background: rgba(248, 113, 113, 0.08);
    }

    .sidebar-logout-btn svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .sidebar-logout-label {
      opacity: 1;
      transition: opacity 0.2s ease;
    }

    .collapsed .sidebar-logout-label {
      opacity: 0;
      width: 0;
      overflow: hidden;
    }

    /* ── Collapse Toggle ───────────────────── */
    .sidebar-collapse-btn {
      position: absolute;
      top: 24px;
      right: -14px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #1e293b;
      border: 2px solid rgba(99, 102, 241, 0.25);
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
      transition: all 0.2s ease;
      padding: 0;
      opacity: 0;
    }

    .admin-sidebar:hover .sidebar-collapse-btn,
    .sidebar-collapse-btn:focus-visible {
      opacity: 1;
    }

    .sidebar-collapse-btn:hover {
      background: #6366f1;
      color: #fff;
      border-color: #6366f1;
      transform: scale(1.1);
    }

    .sidebar-collapse-btn svg {
      width: 14px;
      height: 14px;
    }

    /* ── Tooltip for collapsed mode ────────── */
    .sidebar-tooltip {
      position: fixed;
      left: 78px;
      background: #1e293b;
      color: #e2e8f0;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 500;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(148, 163, 184, 0.1);
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.15s ease, transform 0.15s ease;
    }

    .sidebar-tooltip.visible {
      opacity: 1;
      transform: translateX(0);
    }

    /* ── Mobile header ─────────────────────── */
    .admin-mobile-header {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      display: none;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(180deg, #0f1729, #0a0f1f);
      color: #e2e8f0;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.08);
    }

    .admin-mobile-header-btn {
      background: none;
      border: none;
      color: #94a3b8;
      padding: 6px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .admin-mobile-header-btn:hover {
      color: #e2e8f0;
      background: rgba(148, 163, 184, 0.1);
    }

    .admin-mobile-header-btn svg {
      width: 24px;
      height: 24px;
    }

    .admin-mobile-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .admin-mobile-brand img {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      object-fit: contain;
    }

    .admin-mobile-brand span {
      font-size: 14px;
      font-weight: 600;
    }

    /* ── Mobile overlay ────────────────────── */
    .admin-mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
    }

    .admin-mobile-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease;
    }

    .admin-mobile-drawer {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 280px;
      box-shadow: 0 0 60px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .admin-mobile-drawer .admin-sidebar {
      width: 280px !important;
    }

    .admin-mobile-close {
      position: absolute;
      top: 16px;
      right: -44px;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      color: #94a3b8;
      padding: 8px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .admin-mobile-close:hover {
      color: #fff;
      background: rgba(0, 0, 0, 0.7);
    }

    .admin-mobile-close svg {
      width: 20px;
      height: 20px;
    }

    /* ── Responsive ────────────────────────── */
    @media (max-width: 1023px) {
      .admin-mobile-header {
        display: flex;
      }

      .admin-desktop-sidebar {
        display: none !important;
      }
    }

    @media (min-width: 1024px) {
      .admin-mobile-header {
        display: none;
      }
    }

    /* ── Animations ────────────────────────── */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }

    /* ── Layout container ──────────────────── */
    .admin-layout-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f1f5f9;
    }

    .admin-layout-body {
      display: flex;
      flex: 1;
      min-height: 0;
    }

    .admin-layout-main {
      flex: 1;
      overflow: auto;
      min-width: 0;
    }

    .admin-layout-main-inner {
      padding: 24px;
    }

    @media (max-width: 768px) {
      .admin-layout-main-inner {
        padding: 16px;
      }
    }
  `;
  document.head.appendChild(style);
}

/* ── Tooltip Hook ────────────────────────────────────────────────────── */

function Tooltip({ text, targetRect, visible }) {
  if (!targetRect || !visible) return null;

  return (
    <div
      className={`sidebar-tooltip ${visible ? 'visible' : ''}`}
      style={{ top: targetRect.top + targetRect.height / 2 - 14 }}
    >
      {text}
    </div>
  );
}

/* ── Sidebar Component ───────────────────────────────────────────────── */

function Sidebar({ collapsed, onToggleCollapse, onNavClick, showCollapseBtn = true }) {
  const { user, logout } = useAuth();
  const { storeName, storeLogo } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState({ text: '', rect: null, visible: false });
  const tooltipTimer = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showTooltip = (e, text) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => {
      setTooltip({ text, rect, visible: true });
    }, 200);
  };

  const hideTooltip = () => {
    clearTimeout(tooltipTimer.current);
    setTooltip((t) => ({ ...t, visible: false }));
  };

  const userInitial = user?.email ? user.email[0] : 'A';

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Collapse Toggle Button (desktop only) */}
      {showCollapseBtn && (
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? icons.expand : icons.collapse}
        </button>
      )}

      {/* Brand Header */}
      <div className="sidebar-brand">
        {storeLogo ? (
          <img src={storeLogo} alt={storeName} className="sidebar-brand-logo" />
        ) : (
          <div className="sidebar-brand-placeholder">
            {storeName?.[0] || 'A'}
          </div>
        )}
        <div className="sidebar-brand-info">
          <div className="sidebar-brand-name">{storeName}</div>
          <div className="sidebar-brand-tag">Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.label} className="sidebar-section">
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavClick}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onMouseEnter={(e) => showTooltip(e, item.label)}
                  onMouseLeave={hideTooltip}
                >
                  <span className="sidebar-nav-icon">{icons[item.icon]}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div
            className="sidebar-avatar"
            onMouseEnter={(e) => showTooltip(e, user?.email || 'Admin')}
            onMouseLeave={hideTooltip}
          >
            {userInitial}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.email || 'Admin'}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-logout-btn"
          onMouseEnter={(e) => showTooltip(e, 'Logout')}
          onMouseLeave={hideTooltip}
        >
          {icons.logout}
          <span className="sidebar-logout-label">Logout</span>
        </button>
      </div>

      {/* Tooltip Portal (for collapsed mode) */}
      <Tooltip text={tooltip.text} targetRect={tooltip.rect} visible={tooltip.visible} />
    </aside>
  );
}

/* ── AdminLayout ─────────────────────────────────────────────────────── */

export function AdminLayout({ children }) {
  const { storeName, storeLogo } = useSiteSettings();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Inject global sidebar styles
  useEffect(() => {
    injectSidebarStyles();
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Page titles for document.title
  const pageTitles = {
    '/admin': 'Dashboard',
    '/admin/products': 'Products',
    '/admin/categories': 'Categories',
    '/admin/inventory': 'Inventory',
    '/admin/orders': 'Orders',
    '/admin/customers': 'Customers',
    '/admin/coupons': 'Coupons',
    '/admin/banners': 'Banners',
    '/admin/media': 'Media Library',
    '/admin/cms-blocks': 'CMS Blocks',
    '/admin/reports': 'Reports',
    '/admin/settings': 'Settings',
    '/admin/settings/homepage': 'Homepage Builder',
    '/admin/delivery-slots': 'Delivery Slots',
  };

  useEffect(() => {
    const page = pageTitles[location.pathname] || 'Admin';
    document.title = `${page} - ${storeName}`;
  }, [location.pathname, storeName]);

  return (
    <div className="admin-layout-root">
      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <button
          className="admin-mobile-header-btn"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open menu"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="admin-mobile-brand">
          {storeLogo && (
            <img src={storeLogo} alt={storeName} />
          )}
          <span>{storeName}</span>
        </div>
        <div style={{ width: 24 }} />
      </div>

      <div className="admin-layout-body">
        {/* Desktop Sidebar */}
        <div className="admin-desktop-sidebar" style={{ flexShrink: 0 }}>
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            onNavClick={() => {}}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="admin-mobile-overlay">
            <div
              className="admin-mobile-backdrop"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="admin-mobile-drawer">
              <Sidebar
                collapsed={false}
                onToggleCollapse={() => {}}
                onNavClick={() => setMobileSidebarOpen(false)}
                showCollapseBtn={false}
              />
              <button
                className="admin-mobile-close"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close menu"
              >
                {icons.close}
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="admin-layout-main">
          <div className="admin-layout-main-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
