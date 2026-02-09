

# 🎁 GiftCraft — Personalized 3D-Printed Gifting Platform

## Overview
A premium, emotion-driven e-commerce platform where users can browse, personalize, and order custom 3D-printed gifts for birthdays, anniversaries, surprises, and more. Multi-user with full authentication.

---

## 🎨 Design & Brand
- **Color palette**: Warm neutrals (soft cream/beige background) with a subtle accent color (warm coral or soft gold)
- **Typography**: Clean sans-serif (Inter or similar), generous spacing
- **Style**: Rounded cards, soft shadows, warm imagery, generous whitespace
- **Mood**: Premium, warm, creative — not corporate or salesy

---

## 📄 Pages & Features

### 1. Authentication Page (`/auth`)
- Email/password login and signup
- Clean, branded design matching the warm aesthetic
- Redirect authenticated users to homepage

### 2. Homepage (`/`)
- **Hero section**: Emotional headline (e.g., "Turn your feelings into something they can hold"), soft background, two CTAs: "Personalize a Gift" and "Explore Ideas"
- **Intent-based categories**: Birthday, Anniversary, Surprise, Custom — each with an icon and warm illustration style
- **Featured products**: Minimal product cards with soft shadows, hover effects
- **Trust section**: Reviews/testimonials, delivery info, quality promise
- **Footer**: Links, social, brand story snippet

### 3. Browse/Catalog Page (`/gifts`)
- Filter by occasion (Birthday, Anniversary, Surprise, Custom)
- Sort by price, popularity
- Responsive grid of product cards
- Mobile-first layout

### 4. Product Detail Page (`/gifts/:id`)
- **Left panel**: Customization options (text input, color/material selection, size)
- **Right panel**: Large product image gallery
- **Live preview area**: Shows personalization applied (2D visual mockup with text/color overlays — can upgrade to 3D viewer later)
- Price, estimated delivery, customization steps indicator
- **"Why this gift works"** storytelling section with emotional copy
- Add to cart button

### 5. Cart Page (`/cart`)
- List of customized items with preview thumbnails
- Edit/remove items
- Order summary with subtotal
- Proceed to checkout button (UI only for now — no real payment)

### 6. Checkout Page (`/checkout`)
- Shipping address form
- Order review
- "Place Order" button (simulated — saves order to database)
- Confirmation screen

### 7. User Profile/Orders (`/profile`)
- View past orders and their status
- Account settings (name, email)
- Saved/favorited items

---

## 🗄️ Backend (Lovable Cloud / Supabase)

### Database Tables
- **profiles** — user profile data (name, avatar, address)
- **products** — gift catalog (name, description, images, price, category/occasion, customization options)
- **orders** — user orders (status, total, shipping info)
- **order_items** — items in each order (product, customization details, quantity, price)
- **reviews** — product reviews from users

### Authentication
- Email/password signup and login via Supabase Auth
- Row-level security so users can only see their own orders/profile

### Seed Data
- Pre-populated with ~8-10 sample 3D-printed gift products across categories (personalized nameplates, custom figurines, engraved keychains, photo lithophanes, etc.)

---

## 📱 Responsive Design
- Mobile-first approach
- Hamburger menu on mobile
- Stacked layout for product pages on smaller screens
- Touch-friendly customization controls

---

## 🚀 Implementation Order
1. Set up Lovable Cloud (database, auth)
2. Design system & global styles (colors, typography, components)
3. Authentication page
4. Homepage with hero, categories, and featured products
5. Product catalog/browse page
6. Product detail page with customization panel and live preview
7. Cart and checkout flow (UI with database persistence)
8. User profile and order history
9. Seed product data and polish

