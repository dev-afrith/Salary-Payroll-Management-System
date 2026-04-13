# AstraX Technologies — Salary Payroll Management System

> **Precision Payroll. Enterprise Security. Seamless Experience.**

A full-stack, **3NF-normalized** HR & Payroll Management System built for Indian enterprises. It covers the complete employee lifecycle — from onboarding and daily attendance to monthly payroll processing, statutory compliance, and real-time encrypted communication.

---

## 📸 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, TailwindCSS 4, Recharts |
| **Backend** | Node.js, Express 4 |
| **Database** | MySQL 8 (3NF Normalized) |
| **Real-time** | Socket.io 4 (JWT-secured) |
| **Auth** | JWT + bcryptjs |
| **AI Assistant** | Google Gemini (`@google/generative-ai`) |
| **PDF Engine** | jsPDF + jspdf-autotable |
| **Security** | Helmet, express-rate-limit, CORS |

---

## 🏢 Company Information

**AstraX Technologies Pvt Ltd**
143 Corporate Park, Near Sona College, Salem, TN, India

**Admin Portal**: `admin@company.com` / `Admin@123`
**Default Employee Password**: `Emp@123` (set/changed by Admin)

---

## 🗂️ Project Structure

```
Salary Payroll Management System/
├── backend/
│   ├── config/           # Database connection pool
│   ├── controllers/      # Business logic (auth, employees, payroll, etc.)
│   ├── database/
│   │   ├── schema.sql    # 3NF database schema
│   │   └── seed.sql      # Sample data
│   ├── middleware/        # JWT auth, file upload handlers
│   ├── routes/           # Express API route definitions
│   ├── scripts/
│   │   └── dbSetup.js    # One-command DB initializer
│   └── server.js         # Entry point
└── frontend/
    └── src/
        ├── components/   # Reusable UI components (Button, Modal, Table)
        ├── context/      # AuthContext — global auth state
        ├── pages/
        │   ├── admin/    # 21 Admin modules
        │   ├── employee/ # 7 Employee self-service modules
        │   ├── auth/     # Login, Forgot Password
        │   └── shared/   # Communication module
        ├── routes/       # Admin & Employee route guards
        └── utils/        # axios, pdfGenerator, formatCurrency, socket
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MySQL** v8.0+
- **Gemini API Key** — [Get one here](https://makersuite.google.com/app/apikey)

### 1. Database Setup

```bash
cd backend
npm install
node scripts/dbSetup.js
```

This bootstraps the database with the full 3NF schema and seeds it with sample departments, designations, and an admin user.

### 2. Backend Configuration

Create a `.env` file inside the `backend/` directory:

```env
PORT=5005
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=payroll_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=8h
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Backend

```bash
# Inside backend/
node server.js
```

Expected output:
```
🚀 AstraX Technologies API running on http://localhost:5005
📋 Environment: development
✅ Database connected successfully
```

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**. All `/api` requests are proxied to the backend via Vite's dev server, so no CORS issues during development.

---

## 🗄️ Database Architecture (3NF)

The database is fully normalized to **Third Normal Form** to eliminate data redundancy and ensure integrity.

| Table | Purpose |
|---|---|
| `employees` | Core identity — name, contact, department, designation, status |
| `employee_finance` | Isolated financial data — bank account, PAN, PF, UAN |
| `users` | Authentication credentials — hashed password, role, active status |
| `salary_structure` | Salary components — basic pay, HRA%, DA, allowances, OT rate |
| `departments` | Department master list |
| `designations` | Designation master, linked to departments |
| `attendance` | Daily punch-in/punch-out records with overtime calculation |
| `monthly_working_days` | Working-day configuration per month/year |
| `leave_types` | Configurable leave categories (Casual, Sick, etc.) |
| `leave_balance` | Allocated vs. used leave days per employee per year |
| `leave_applications` | Leave request lifecycle with admin approval workflow |
| `payroll` | Computed monthly payroll — earnings, deductions, net salary |
| `messages` | End-to-end encrypted real-time messages (public & private) |
| `password_reset_requests` | Employee-initiated password reset, pending admin approval |
| `company_settings` | Company branding, address, GSTIN, CIN |

---

## 🔌 API Reference

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/auth/admin-login` | Public |
| `POST` | `/auth/employee-login` | Public |
| `GET` | `/auth/me` | Authenticated |
| `POST` | `/auth/forgot-password` | Employee |
| `GET` | `/auth/reset-requests` | Admin |
| `PUT` | `/auth/reset-requests/:id` | Admin |

### Employees
| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/employees` | Admin |
| `POST` | `/employees` | Admin |
| `GET` | `/employees/:id` | Admin + Self |
| `PUT` | `/employees/:id` | Admin |
| `PUT` | `/employees/:id/approve` | Admin |
| `PUT` | `/employees/:id/reject` | Admin |
| `DELETE` | `/employees/:id` | Admin |

### Payroll
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/payroll/process` | Admin |
| `GET` | `/payroll/summary` | Admin |
| `POST` | `/payroll/lock` | Admin |
| `GET` | `/payroll/employee/:id` | Admin + Self |
| `GET` | `/payroll/my` | Employee |

### Attendance
| Method | Endpoint | Access |
|---|---|---|
| `POST` | `/attendance/mark` | Employee |
| `GET` | `/attendance/my` | Employee |
| `GET` | `/attendance/daily` | Admin |
| `GET` | `/attendance/monthly-summary` | Admin |
| `PUT` | `/attendance/:id` | Admin |

### Leaves, Salary, Reports, Chat, Communication also have dedicated route groups.

---

## 📋 Feature Modules

### 👑 Admin Portal

| Module | Capabilities |
|---|---|
| **Dashboard** | Live KPIs — headcount, monthly payroll cost, attendance %, pending requests |
| **Employee Management** | Add, Edit, Approve, Reject, Delete employees with full 3NF data entry |
| **Salary Structure** | Configure Basic Pay, HRA%, DA, Special Allowance, OT Rate per employee |
| **Run Payroll** | One-click monthly payroll processing with automatic statutory calculations |
| **Payroll Summary** | Review, verify, and Lock payroll before releasing payslips |
| **Bulk Payslips** | Generate and download all payslips for a month in one action |
| **Daily Attendance** | View and manually override attendance for any employee on any date |
| **Monthly Attendance** | Full month attendance summary with Present/Absent/LOP breakdown |
| **Attendance Settings** | Set working-day count per month/year for accurate LOP calculation |
| **Leave Requests** | Approve or reject employee leave applications with admin remarks |
| **Leave Types** | Create and manage leave categories (Casual, Sick, Earned, etc.) |
| **Leave Balances** | View and adjust leave balances for all employees per year |
| **Departments** | Full CRUD for department and designation management |
| **Reports** | Monthly, Department-wise, and Employee-history payroll reports |
| **Password Resets** | Admin-controlled workflow to approve/reject employee password reset requests |

### 👤 Employee Self-Service Portal

| Module | Capabilities |
|---|---|
| **Dashboard** | Net salary, attendance %, leave balance, pending leaves at a glance |
| **Attendance** | Live clock, one-click Check In / Check Out, overtime tracking, monthly history |
| **Salary Details** | Full salary component breakdown — earnings, deductions, net pay |
| **Payslips** | View and download locked payslips as PDF for any month |
| **Leave Application** | Apply for leave by selecting type, date range, and reason |
| **My Leaves** | Track all leave applications and their approval status |
| **Profile** | View personal details, department, designation, and financial information |

### 🤖 AstraX AI (Gemini-Powered)
- **Admin AI**: Queries company stats, employee counts, departmental data in natural language.
- **Employee AI**: Personalized assistant with access to the employee's own salary, leave balance, and bank details.
- All responses are stripped of markdown formatting for clean, conversational output.

### 💬 AstraX Connect (Real-Time Communication)
- **End-to-End Encryption**: All messages encrypted using AES browser-based encryption before transmission.
- **Private Messaging**: One-to-one conversations between Admin and any Employee.
- **Broadcast**: Admin can send public announcements visible to all employees.
- **Socket Authentication**: Every socket connection is validated with a JWT token before joining rooms.

---

## 💰 Payroll Calculation Engine

All calculations follow **Indian statutory compliance**:

| Component | Formula |
|---|---|
| **HRA** | `Basic Pay × HRA%` (default 40%) |
| **Gross Salary** | `Basic + HRA + DA + Special Allowance + OT Pay + Bonus` |
| **EPF (Employee)** | `12% of Basic Pay` |
| **ESI** | `0.75% of Gross` *(only if Gross ≤ ₹21,000)* |
| **Professional Tax** | `₹0 / ₹150 / ₹200` based on Maharashtra schedule |
| **TDS** | New tax regime slabs, annualized then divided by 12 |
| **LOP Deduction** | `(Gross / Working Days) × LOP Days` |
| **Net Salary** | `Gross − Total Deductions` |

### Payroll Lifecycle
```
Run Payroll (Processed) → Admin Review → Lock Payroll → Employee Downloads Payslip
```

---

## 🛡️ Security

- **JWT Authentication**: Stateless, 8-hour expiring tokens on all protected routes.
- **bcrypt Password Hashing**: Rounds: 10 — industry-standard resistance to brute force.
- **Helmet**: Secures HTTP headers against common web vulnerabilities.
- **Socket.io JWT Guard**: Real-time events are rejected at the handshake if the token is missing or invalid.
- **Role-Based Access Control**: Every endpoint checks `role === 'admin'` or `role === 'employee'` independently.
- **Employee Approval Workflow**: New employee accounts are `Pending` by default — login is only enabled after explicit Admin approval.
- **Forgot Password Flow**: Employees cannot self-reset. Requests go through an Admin approval queue for security.

---

## 📄 Payslip PDF

Generated using **jsPDF + jspdf-autotable** and includes:
- Company name, address (`143 Corporate Park, Near Sona College, Salem, TN, India`), and header
- Employee Identity: Name, ID, Department, Designation, PAN, Bank Account (last 4 digits)
- Attendance Block: Working Days, Present Days, LOP Days, Overtime Hours
- Earnings vs. Deductions table: Fully itemized with Indian number formatting (`Rs. 1,25,000.00`)
- **Net Payable** in both numbers and words (`Rupees Sixty Thousand Five Hundred only`)
- **Authorized Signatory** block
- System-generated disclaimer footer

---

## 🔧 Environment Variables Summary

### Backend (`backend/.env`)
```env
PORT=5005
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=payroll_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=8h
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=http://localhost:5173   # Optional
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=/api
```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to your branch: `git push origin feat/your-feature-name`
5. Open a Pull Request.

---

<p align="center">Built with ❤️ by AstraX Engineering — Salem, Tamil Nadu, India</p>
