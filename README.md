# 🚀 B2B Lead Gen SaaS

An AI-powered B2B Lead Generation platform that captures, enriches, scores, and converts leads in one unified workspace. Built to replace fragmented sales tools with a single, beautiful, and lightning-fast platform.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture & Folder Structure](#-architecture--folder-structure)
5. [Database Schema](#-database-schema)
6. [Getting Started (Local Setup)](#-getting-started-local-setup)
7. [Environment Variables](#-environment-variables)
8. [Security & Performance](#-security--performance)
9. [Deployment](#-deployment)
10. [Roadmap](#-roadmap)

---

## 🌟 Overview

**B2B Lead Gen SaaS** is designed for modern sales teams who are tired of stitching together 5 different tools. It provides a seamless pipeline: from capturing a raw lead (via CSV, API, or form) to enriching it with company data, scoring it with AI, and running outbound campaigns—all without leaving the app.

This is a **full-stack, production-ready MVP** featuring multi-tenant workspaces, Stripe billing, advanced security, and an enterprise-grade UI.

---

## ✨ Key Features

### 🎯 Core Lead Management
*   **Lead Capture:** Add leads manually, import via CSV (with validation), or push via API.
*   **Lead Enrichment:** Automatically fetch company data, social links, and contact info using integration providers (Clearbit/Apollo).
*   **AI Lead Scoring:** Every lead is analyzed by AI (OpenAI) to get a 1-100 score indicating its likelihood to convert, along with a reason.
*   **Activity Timeline:** Track every note, email, status change, and call associated with a lead.
*   **Advanced Filtering:** Filter by status, priority, source, and tags. Bulk actions for mass deletion or export.

### 🏢 Workspaces & Teams
*   **Multi-Tenant Architecture:** Users can create teams, invite members, and share pipelines securely.
*   **Role-Based Access Control (RBAC):** Owner, Admin, Member, and Viewer roles.
*   **Notifications:** Real-time in-app notifications for team activity, lead assignments, and system alerts.

### 💳 Billing & Subscriptions
*   **Stripe Integration:** Fully integrated Checkout, Customer Portal, and Webhooks.
*   **Tiered Plans:** Free, Basic, Pro, and Enterprise limits (enforced via the database).
*   **Invoices & Payment Methods:** Users can view history and update their cards directly in the app.

### 🎨 UI/UX & Developer Experience
*   **Beautiful Interface:** Built with Tailwind CSS and Shadcn/ui. Includes a premium landing page, dark mode support, and interactive 3D/liquid glass effects.
*   **Application-Friendly:** Command Palette (`⌘K`), keyboard shortcuts, skeleton loaders, and optimistic UI updates.
*   **SEO Optimized:** Dynamic `sitemap.xml`, `robots.txt`, JSON-LD structured data, and optimized metadata.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React, TypeScript |
| **Styling** | Tailwind CSS, Shadcn/ui, Lucide Icons |
| **Backend/DB** | Supabase (PostgreSQL, Auth, Realtime, Edge Functions) |
| **Payments** | Stripe API (Subscriptions & Webhooks) |
| **AI Engine** | OpenAI API (GPT-4o for scoring & enrichment) |
| **Emails** | Resend / React Email (Transactional emails) |
| **Deployment** | Vercel (Frontend) + Supabase Cloud (Database) |

---

## 📂 Architecture & Folder Structure

This project uses the Next.js App Router with Route Groups for clean separation of concerns.

```text
src/
├── app/
│   ├── (auth)/            # Login, Signup, Password Reset
│   ├── (marketing)/       # Public pages (Landing, Pricing, Blog)
│   ├── (dashboard)/       # Protected app (Leads, Campaigns, Settings)
│   ├── api/               # Serverless API Routes (REST endpoints)
│   ├── layout.tsx         # Root HTML/Body/Providers
│   └── middleware.ts      # Edge Middleware (Auth & Security)
├── components/
│   ├── ui/                # Shadcn base components (Button, Card, Table)
│   ├── layout/            # Navbar, Sidebar, Footer
│   ├── leads/             # Lead table, filters, forms
│   └── common/            # Skeletons, ErrorBoundaries, CommandPalette
├── lib/
│   ├── supabase/          # Client, Server, and Middleware helpers
│   ├── stripe/            # Checkout, Portal, Webhook handlers
│   ├── ai/                # OpenAI scoring logic
│   └── validations/       # Zod schemas for forms and APIs
└── types/                 # Global TypeScript definitions
