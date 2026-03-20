CREATE DATABASE IF NOT EXISTS payroll_db;
USE payroll_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE company_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL DEFAULT 'PayrollPro Inc.',
  company_address TEXT,
  company_email VARCHAR(100),
  company_phone VARCHAR(20),
  company_logo_url VARCHAR(255),
  cin_number VARCHAR(50),
  gstin VARCHAR(20),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE designations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15),
  gender ENUM('Male','Female','Other'),
  date_of_birth DATE,
  date_of_joining DATE,
  department_id INT,
  designation_id INT,
  employment_type ENUM('Full-time','Part-time','Contract') DEFAULT 'Full-time',
  bank_account_number VARCHAR(30),
  ifsc_code VARCHAR(20),
  pan_number VARCHAR(15),
  pf_number VARCHAR(20),
  uan_number VARCHAR(20),
  profile_photo_url VARCHAR(255),
  status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE SET NULL
);

CREATE TABLE salary_structure (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT UNIQUE NOT NULL,
  basic_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
  hra_percent DECIMAL(5,2) DEFAULT 40,
  da_amount DECIMAL(10,2) DEFAULT 0,
  special_allowance DECIMAL(10,2) DEFAULT 0,
  overtime_rate DECIMAL(10,2) DEFAULT 0,
  effective_from DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE monthly_working_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month INT NOT NULL,
  year INT NOT NULL,
  total_working_days INT NOT NULL DEFAULT 26,
  UNIQUE KEY unique_month_year (month, year)
);

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('Present','Absent','Half-day','Holiday','LOP','On-Leave') NOT NULL,
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  check_in TIME,
  check_out TIME,
  remarks VARCHAR(255),
  UNIQUE KEY unique_attendance (employee_id, date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE leave_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  max_days_per_year INT NOT NULL DEFAULT 12,
  is_paid BOOLEAN DEFAULT TRUE,
  color VARCHAR(20) DEFAULT '#3B82F6'
);

CREATE TABLE leave_balance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  year INT NOT NULL,
  allocated INT NOT NULL DEFAULT 0,
  used DECIMAL(4,1) DEFAULT 0,
  remaining DECIMAL(4,1) DEFAULT 0,
  UNIQUE KEY unique_balance (employee_id, leave_type_id, year),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
);

CREATE TABLE leave_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days DECIMAL(4,1) NOT NULL,
  reason TEXT,
  status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  admin_remarks VARCHAR(255),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
);

CREATE TABLE payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  working_days INT DEFAULT 26,
  present_days DECIMAL(5,2) DEFAULT 0,
  lop_days DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  basic_pay DECIMAL(10,2) DEFAULT 0,
  hra DECIMAL(10,2) DEFAULT 0,
  da DECIMAL(10,2) DEFAULT 0,
  special_allowance DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  gross_salary DECIMAL(10,2) DEFAULT 0,
  pf_employee DECIMAL(10,2) DEFAULT 0,
  esi_employee DECIMAL(10,2) DEFAULT 0,
  professional_tax DECIMAL(10,2) DEFAULT 0,
  tds DECIMAL(10,2) DEFAULT 0,
  lop_deduction DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) DEFAULT 0,
  status ENUM('Draft','Processed','Locked') DEFAULT 'Draft',
  payslip_path VARCHAR(255),
  processed_at TIMESTAMP NULL,
  UNIQUE KEY unique_payroll (employee_id, month, year),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
