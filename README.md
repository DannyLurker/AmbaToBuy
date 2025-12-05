# 🍔 AmbaToBuy - Food and Beverage Pre-Order Platform

A pre-order management system developed for a bazaar event.

## 🔗 Live Project
**Check it out:** [AmbaToBuy](https://amba-to-buy.vercel.app)

---

## 📸 Screenshots

| Landing Page | Product Page | Pre-Order Form |
| :---: | :---: | :---: |
| ![Landing Page](https://github.com/DannyLurker/AmbaToBuy/blob/main/ambatobuy.png?raw=true) | ![Product Page](https://github.com/DannyLurker/AmbaToBuy/blob/main/productamba.png?raw=true) | ![Pre-Order Form](https://github.com/DannyLurker/AmbaToBuy/blob/main/form-preorder.png?raw=true) |
| User Pre-Order Page | Admin Dashboard | |
| ![User Pre-Order Page](https://github.com/DannyLurker/AmbaToBuy/blob/main/cartamba-sensored.png?raw=true) | ![Admin Dashboard](https://github.com/DannyLurker/AmbaToBuy/blob/main/admin-page-sensored.png?raw=true) | |

---

## 📖 Project Overview

**AmbaToBuy** is a pre-order platform specifically designed to support the activities of our school bazaar event. Although its initial development goal was merely a hobby project, the platform now serves to facilitate the ordering of food and beverages during special school events. (**The event has already concluded.)**

Developed by [@danny_env](https://www.instagram.com/danny_env/) & **Team 9**

---

## ✨ Core Functionality

### 🔐 Authentication System
-   **Email Verification Registration:** Secure sign-up process utilizing a 6-digit OTP sent via email.
-   **JWT Authentication:** Token-based system for secure and persistent user sessions.
-   **Password Management:** Secure password reset functionality via a verification code.

### 🛒 Pre-Order Management
-   **Intuitive Order Form:** A user-friendly interface designed for quick and easy ordering.
-   **Order Tracking:** Comprehensive management of customer orders.
-   **Status Lifecycle:** Clear order status tracking: `Pending`, `Confirmed`, `Completed`, and `Cancelled`.

### 👨‍💼 Admin Dashboard
-   **Centralized Control:** Ability to manage and oversee all incoming pre-orders.
-   **Direct Status Update:** Quick modification of order statuses by administrators.
-   **Data Export:** Feature to export order data directly to an **Excel (.xlsx)** file.
-   **Filtering & Search:** Robust tools for filtering and searching specific orders.

---

## 🛠️ Tech Stack

### Frontend
-   **[Next.js 15.1.3](https://nextjs.org/)** – Powerful React framework utilizing the App Router.
-   **[TypeScript](https://www.typescriptlang.org/)** – For type-safe and scalable development.
-   **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework for rapid styling.
-   **[Radix UI](https://www.radix-ui.com/)** – High-quality, accessible, and modular UI components.
-   **[Lucide React](https://lucide.dev/)** – Modern and consistent icon library.

### Backend
-   **Next.js API Routes** – Serverless endpoints for robust API development.
-   **[MongoDB](https://www.mongodb.com/)** – Flexible NoSQL database solution.
-   **[JWT (jsonwebtoken)](https://jwt.io/)** – Industry-standard token authentication.
-   **[Bcrypt.js](https://www.npmjs.com/package/bcryptjs)** – Secure password hashing.
-   **[Nodemailer](https://nodemailer.com/about/)** – For sending transactional emails (verification, reset codes).

### Utilities
-   **[XLSX](https://github.com/SheetJS/sheetjs)** – Library for handling and exporting Excel files.

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
-   Node.js **v18+**
-   A running **MongoDB** instance (local or cloud-hosted)
-   An email account (Gmail recommended) configured for sending emails (App Password required for security).

### Step 1: Clone Repository
```bash
git clone https://github.com/DannyLurker/AmbaToBuy.git
cd AmbaToBuy
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
```bash
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string_here

# JSON Web Token (JWT) Secret Key
JWT_SECRET=your_super_secret_jwt_key_for_signing_tokens

# Email Configuration (for Nodemailer - Using Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_from_google
EMAIL_FROM=noreply@ambatobuy.com

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Pre-Order Form Visibility Status (set to 'public' or 'closed')
NEXT_PUBLIC_PRE_ORDER_FORM_STATUS=public
```

### Step 4: Run Development Server
```bash
npm run dev
```

### Access the application via your browser at:
```bash
http://localhost:3000
```

### 👥 Development Team
- This project, AmbaToBuy, was developed by Team 9. It was built with a strong focus on collaboration, technological exploration, and continuous learning.
- Key Developers: [@danny_env](https://www.instagram.com/danny_env/) | [@DannyLurker](https://x.com/DannyLurker)

### 📜 License
This project is licensed under the MIT License – feel free to use, modify, and develop it further for educational and web application development purposes.
