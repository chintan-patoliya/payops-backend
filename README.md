# PayOps — Backend API

> Payout Operations Management backend built with **Node.js**, **Express.js**, **MongoDB Atlas**, and **JWT Authentication** with server-side **RBAC (Role-Based Access Control)**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Seed Data](#seed-data)
- [API Endpoints](#api-endpoints)
- [Authentication & RBAC](#authentication--rbac)
- [Status Workflow](#status-workflow)
- [Audit Trail](#audit-trail)
- [Deployment](#deployment)

---

## Tech Stack

| Technology   | Version | Purpose                    |
|-------------|---------|----------------------------|
| Node.js     | >=18.0.0 | Runtime                   |
| Express.js  | ^4.18.2 | REST API framework         |
| MongoDB     | 6.x/7.x | Database (MongoDB Atlas)   |
| Mongoose    | ^8.4.0  | ODM for MongoDB            |
| JWT         | ^9.0.2  | Authentication tokens      |
| bcryptjs    | ^2.4.3  | Password hashing           |
| helmet      | ^7.1.0  | Security headers           |
| cors        | ^2.8.5  | Cross-origin requests      |
| morgan      | ^1.10.0 | HTTP request logging       |
| nodemon     | ^3.1.0  | Development auto-restart   |

---

## Project Structure

```
payops-backend/
├── src/
│   ├── config/
│   │   ├── express.js        # Express app setup (middleware, routes, error handling, CORS)
│   │   ├── mongoose.js       # MongoDB connection
│   │   └── vars.js           # Environment variables & constants
│   ├── constants/
│   │   ├── index.js          # Status enums, roles, payment modes, audit actions
│   │   └── messages.js       # Error & success messages with formatMessage helper
│   ├── controllers/
│   │   ├── auth.controller.js     # Login handler with constant messages
│   │   ├── vendor.controller.js   # Vendor CRUD
│   │   └── payout.controller.js   # Payout CRUD + status transitions with constants
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication + RBAC authorization
│   │   └── error.js          # Global error handler
│   ├── models/
│   │   ├── user.model.js          # User schema (email, password_hash, role)
│   │   ├── vendor.model.js        # Vendor schema
│   │   ├── payout.model.js        # Payout schema with status workflow
│   │   └── payoutAudit.model.js   # Audit trail schema
│   ├── routes/
│   │   ├── index.js          # Route aggregator
│   │   ├── auth.route.js     # /api/auth/* with API documentation
│   │   ├── vendor.route.js   # /api/vendors/* with API documentation
│   │   └── payout.route.js   # /api/payouts/* with API documentation
│   ├── seed/
│   │   └── seed.js           # Database seeder (creates demo users)
│   ├── utils/
│   │   └── APIError.js       # Custom error class
│   └── server.js             # Entry point
├── .env.example              # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** >= 9.0.0 (comes with Node.js)
- **MongoDB Atlas** account (Free Tier) — [https://cloud.mongodb.com](https://cloud.mongodb.com)
  - MongoDB version: 6.x or 7.x
  - Free M0 cluster is sufficient for development

**Check your versions:**
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/payops-backend.git
cd payops-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your MongoDB connection string and JWT secret:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/payops?retryWrites=true&w=majority
JWT_SECRET=your_strong_random_secret_key
JWT_EXPIRATION_DAYS=7
FRONTEND_URL=http://localhost:3000
```

> **Tip:** Generate a secure JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 4. Seed the database

```bash
npm run seed
```

This creates two demo users:

| Role    | Email             | Password |
|---------|-------------------|----------|
| OPS     | ops@demo.com      | ops123   |
| FINANCE | finance@demo.com  | fin123   |

### 5. Start the server

```bash
# Development (with hot-reload via nodemon)
npm run dev

# Production
npm start
```

The API will be available at: **http://localhost:5000**

### Health Check

```bash
curl http://localhost:5000/health
# {"status":"ok","timestamp":"2024-..."}
```

---

## Environment Variables

| Variable             | Required | Description                              | Default              |
|---------------------|----------|------------------------------------------|----------------------|
| `PORT`              | No       | Server port                              | 5000                 |
| `NODE_ENV`          | No       | Environment (development/production)      | development          |
| `MONGO_URI`         | **Yes**  | MongoDB Atlas connection string          | —                    |
| `JWT_SECRET`        | **Yes**  | Secret key for JWT token signing         | —                    |
| `JWT_EXPIRATION_DAYS`| No      | Token expiration in days                 | 7                    |
| `FRONTEND_URL`      | No       | Allowed CORS origin                      | http://localhost:3000 |

---

## Seed Data

Run `npm run seed` to populate the database with initial users.

**Important:** The seed script will **clear all existing users** before creating new ones. Only run on development/fresh databases.

Passwords are hashed using **bcrypt** (10 salt rounds) — never stored in plain text.

---

## Code Organization

### Constants & Messages

All constants and static messages are centralized in the `src/constants/` directory:

**`constants/index.js`** - Application constants:
- `PAYOUT_STATUSES`: Draft, Submitted, Approved, Rejected
- `PAYMENT_MODES`: UPI, IMPS, NEFT
- `USER_ROLES`: OPS, FINANCE
- `AUDIT_ACTIONS`: CREATED, SUBMITTED, APPROVED, REJECTED

**`constants/messages.js`** - All user-facing messages:
- `ERROR_MESSAGES`: Authentication, validation, payout, vendor errors
- `SUCCESS_MESSAGES`: Success feedback for all operations
- `formatMessage(message, params)`: Helper to replace placeholders

**Usage Example:**
```javascript
const { ERROR_MESSAGES, formatMessage } = require('../constants/messages');

// Simple message
throw new APIError({ message: ERROR_MESSAGES.PAYOUT_NOT_FOUND });

// Message with placeholders
throw new APIError({ 
  message: formatMessage(ERROR_MESSAGES.CANNOT_SUBMIT, { status: payout.status })
});
```

### CORS Configuration

The backend supports flexible CORS for development and production:

**Development Mode:**
- Allows all localhost origins (any port)
- Allows local network IPs (192.168.x.x, 10.x.x.x)
- Automatically detects and allows local development servers

**Production Mode:**
- Strict origin checking
- Only allows configured `FRONTEND_URL` from environment

**Configuration** (`src/config/express.js`):
```javascript
// Automatically allows:
// - http://localhost:3000, http://localhost:8080
// - http://192.168.1.100:3000 (any local IP)
// - Configured FRONTEND_URL
```

---

## API Endpoints

### Authentication

| Method | Endpoint          | Auth Required | Description          |
|--------|-------------------|---------------|----------------------|
| POST   | `/api/auth/login` | No            | Login & get JWT token |

**Request:**
```json
{ "email": "ops@demo.com", "password": "ops123" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": "...", "email": "ops@demo.com", "role": "OPS" }
  }
}
```

### Vendors

| Method | Endpoint        | Auth Required | Role    | Description       |
|--------|-----------------|---------------|---------|-------------------|
| GET    | `/api/vendors`  | Yes           | Any     | List all vendors  |
| POST   | `/api/vendors`  | Yes           | OPS     | Create a new vendor|

### Payouts

| Method | Endpoint                    | Auth Required | Role    | Description                         |
|--------|-----------------------------|---------------|---------|-------------------------------------|
| GET    | `/api/payouts`              | Yes           | Any     | List payouts (filterable)           |
| POST   | `/api/payouts`              | Yes           | OPS     | Create payout (Draft status)       |
| GET    | `/api/payouts/:id`          | Yes           | Any     | Get payout detail + audit trail     |
| POST   | `/api/payouts/:id/submit`   | Yes           | OPS     | Submit payout (Draft → Submitted)   |
| POST   | `/api/payouts/:id/approve`  | Yes           | FINANCE | Approve payout (Submitted → Approved)|
| POST   | `/api/payouts/:id/reject`   | Yes           | FINANCE | Reject payout (Submitted → Rejected)|

**Payout List Filters** (query params):
- `status` — Filter by status (Draft, Submitted, Approved, Rejected)
- `vendor_id` — Filter by vendor ID

**Reject Request:**
```json
{ "decision_reason": "Amount exceeds limit" }
```

---

## API Documentation

All API routes include comprehensive inline documentation following the APIDoc format:

- **@api** - HTTP method and endpoint path
- **@apiDescription** - Clear endpoint description
- **@apiVersion** - API version number
- **@apiName** - Unique endpoint name
- **@apiGroup** - Logical grouping (Auth, Vendors, Payouts)
- **@apiPermission** - Access control requirements
- **@apiHeader** - Required headers (e.g., Authorization)
- **@apiParam** - Request parameters with types and constraints
- **@apiParamExample** - Example request JSON
- **@apiSuccess** - Success response structure
- **@apiSuccessExample** - Example success response JSON
- **@apiError** - Possible error responses with status codes
- **@apiErrorExample** - Example error response JSON

**Documentation Files:**
- `src/routes/auth.route.js` - Authentication endpoints
- `src/routes/vendor.route.js` - Vendor management endpoints
- `src/routes/payout.route.js` - Payout workflow endpoints (9 total)

**Generate HTML Documentation** (optional):
```bash
npm install -g apidoc
apidoc -i src/routes/ -o docs/
```

---

## Authentication & RBAC

### How it works

1. User logs in via `/api/auth/login` → receives JWT token
2. All protected routes require `Authorization: Bearer <token>` header
3. JWT is verified server-side on every request
4. **Role is NEVER trusted from the frontend** — always read from the database

### Role Permissions

| Action                | OPS | FINANCE |
|-----------------------|-----|---------|
| View payouts          | ✅  | ✅      |
| Create payout (Draft) | ✅  | ❌      |
| Submit payout         | ✅  | ❌      |
| Approve payout        | ❌  | ✅      |
| Reject payout         | ❌  | ✅      |
| View/Create vendors   | ✅  | ✅      |

### Error Response Format

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Only FINANCE can approve payouts"
}
```

---

## Status Workflow

```
Draft → Submitted → Approved
                  → Rejected
```

### Valid Transitions

| From      | To        | Who     |
|-----------|-----------|---------|
| Draft     | Submitted | OPS     |
| Submitted | Approved  | FINANCE |
| Submitted | Rejected  | FINANCE |

### Invalid Transitions (Blocked)

- Draft → Approved ❌
- Draft → Rejected ❌
- Submitted → Draft ❌
- Approved → any ❌
- Rejected → any ❌

---

## Audit Trail

Every payout action automatically creates an audit record:

| Action    | Trigger                    |
|-----------|----------------------------|
| CREATED   | When payout is created     |
| SUBMITTED | When payout is submitted   |
| APPROVED  | When payout is approved    |
| REJECTED  | When payout is rejected    |

Each audit record stores:
- **action** — What happened
- **performed_by_user_id** — Who did it
- **timestamp** — When it happened

Audit trail is returned with payout details via `GET /api/payouts/:id`.

---

## Deployment

### Render / Railway

1. Create a new **Web Service**
2. Connect your GitHub repo (`payops-backend`)
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables (MONGO_URI, JWT_SECRET, FRONTEND_URL)
5. Deploy

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## License

MIT
