# 📊 PayrollPro — Salary Payroll Management System
### Full-Stack HR Dashboard | Indian Statutory Compliance | Professional Analytics

PayrollPro is a comprehensive Salary Payroll Management System designed for Indian enterprises. Built with a modern tech stack, it handles everything from employee registration and attendance to complex salary calculations, leave management, and professional PDF payslip generation.

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js**: Version 18 or higher.
- **MySQL**: Version 8.0 or higher.
- **Package Manager**: npm (comes with Node.js).

### 1️⃣ Database Configuration
1. Ensure your MySQL server is running.
2. Navigate to the `backend` folder and copy `.env.example` to `.env`.
3. Update `DB_USER`, `DB_PASS`, and other credentials in `.env`.
4. Run the automated setup script to create the database, tables, and seed data:
   ```bash
   cd backend
   npm install
   node dbSetup.js
   ```

### 2️⃣ Backend Setup
```bash
cd backend
# (Ensure DB is configured in .env as per step 1)
node server.js
```
> [!NOTE]
> The backend server runs on **http://localhost:5005** by default.

### 3️⃣ Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies and start the development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
> [!TIP]
> The frontend application will be available at **http://localhost:5173**.

---

## 🔐 Default Credentials

| Role         | Identifier (ID/Email) | Password   |
|--------------|-----------------------|------------|
| **Administrator** | `admin@company.com`   | `Admin@123` |
| **Employee**      | `EMP001`              | `Admin@123` |
| **Employee**      | `EMP002`              | `Admin@123` |

---

## 🛠️ Tech Stack & Features

- **Frontend**: React 18 (Vite), Tailwind CSS, Recharts (Visual Analytics), jsPDF (Payslip Export), Lucide Icons.
- **Backend**: Node.js, Express, MySQL, JWT (Role-Based Auth), bcryptjs.
- **Payroll Engine**: Automated calculation of PF (12%), ESI (0.75%), TDS, and Professional Tax based on Indian compliance.
- **Attendance**: Real-time punch-clock with overtime and LOP tracking.
- **Leaves**: Transactional leave management system (Sick, Casual, Earned).

---

## 📦 Project Modules & Status

1. ✅ **Authentication & Authorization**: Role-based access for Admin and Employee.
2. ✅ **Employee Management**: Full CRUD with approval workflows.
3. ✅ **Department & Designations**: Hierarchical organization management.
4. ✅ **Attendance Tracking**: Digital clock-in/out and admin override.
5. ✅ **Salary Calculation**: Compliance-ready engine with attendance integration.
6. ✅ **Leave Management**: Quota allocation and approval workflow.
7. ✅ **Payslip & Reports**: Professional PDF export and financial dashboards.

