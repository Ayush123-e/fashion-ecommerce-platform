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

Follow these instructions to clone, configure, migrate, and run the project locally.

### 1. Configure Backend Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
# Navigate to backend directory
cd backend

# Create .env file
touch .env
```
Add the following configuration parameters inside `backend/.env`:
```env
PORT=5005
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<db_name>?schema=public"
JWT_SECRET="aura_super_secure_jwt_secret_key_2026"
NODE_ENV="development"
```
*(Replace `<username>`, `<password>`, and `<db_name>` with your local PostgreSQL server database credentials)*

### 2. Install Project Dependencies
Install dependencies for both the frontend and backend workspaces:
```bash
# In the project root, install backend dependencies
cd backend
npm install

# Return to root, then install frontend dependencies
cd ../frontend
npm install
```

### 3. Run Database Migrations
Generate the Prisma Client and execute migrations to set up the PostgreSQL tables:
```bash
cd ../backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Execute the Seed Script
Populate the database with default categories, realistic fashion items, and pre-configured accounts:
```bash
npx prisma db seed
```

### 5. Start Development Servers
Spin up the local backend server and Vite frontend server:

**Start Backend API** (running on `http://localhost:5005`):
```bash
cd backend
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
