# AURA: Full-Stack Fashion E-Commerce Platform

AURA is a premium, full-stack fashion e-commerce application designed for a seamless, curated shopping experience. It features a responsive customer-facing shop front and a secure, role-restricted administrative dashboard for catalog and order management.

---

## 🛠️ Tech Stack Overview

- **Frontend**: React 19 (scaffolded with Vite), TailwindCSS for utility-first styling, and Axios for handling API communications.
- **Backend**: Node.js & Express REST API using structured routes, controllers, and authorization/authentication middlewares.
- **Database**: PostgreSQL database served through Prisma ORM for schema definitions, relations, and transactional operations (e.g., transaction-wrapped inventory management during checkout).

---

## 📋 Prerequisites

Ensure the following tools are installed on your local development machine:
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** (v14 or higher, running locally or hosted)

---

## 🚀 Step-by-Step Local Setup

Follow these instructions to clone and run the project locally. (The database is already hosted and seeded on Supabase).

### 1. Configure Backend Environment Variables
We have provided an example environment file that connects to a live test database.
Navigate to the `backend/` directory and rename `.env.example` to `.env`:
```bash
# Navigate to backend directory
cd backend

# Rename the example env file
mv .env.example .env
```

### 2. Install Project Dependencies
Install dependencies for both the frontend and backend workspaces:
```bash
# In the backend directory, install backend dependencies
npm install

# Navigate to frontend, then install frontend dependencies
cd ../frontend
npm install
```

### 3. Start Development Servers
Spin up the local backend server and Vite frontend server:

**Start Backend API** (running on `http://localhost:5005`):
```bash
cd ../backend
npm run dev
```

**Start Frontend** (running on `http://localhost:5174` or check console port output):
```bash
cd ../frontend
npm run dev
```

---

## 🔑 Demo Credentials

Use the following default accounts populated by the seed script to log in:

### 👤 Regular Customer Account
- **Email**: `user@aura.com`
- **Password**: `userpassword`
- **Role**: `USER`
- *Capabilities*: Browse catalog, filter by categories, persistent cart operations, checkout orders, and view personal order history.

### 👑 Administrator Account
- **Email**: `admin@aura.com`
- **Password**: `adminpassword`
- **Role**: `ADMIN`
- *Capabilities*: Access secure `/admin` paths, view dashboard sales and catalog metrics, manage products CRUD, manage category CRUD, and transition customer order lifecycles (PLACED ➡️ PROCESSING ➡️ SHIPPED ➡️ DELIVERED).

---

## 🚧 Known Limitations & Future Improvements

- **Image Uploads**: Product images currently utilize static public placeholder URLs. Future iterations will integrate cloud media storage solutions (such as AWS S3 or Cloudinary) with backend upload endpoints.
- **Payment Processing**: Checkout implements mock payment validation on checkout. A real integration with Stripe or PayPal will handle financial transactions.
- **Search Optimization**: Current product search uses database-level insensitive SQL string comparisons. Scaling to larger catalog sizes will benefit from search index engines like Elasticsearch.

---

## 🤖 AI Usage Note

*This project was developed with the assistance of LLM-based agent scaffolding to accelerate database schema construction, REST API boilerplate scaffolding, and layout styling. The core business rules, transactional database checks, and security gates were manually reviewed, verified, and hardened to ensure enterprise-grade safety.*
