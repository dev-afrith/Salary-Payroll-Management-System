-- 1. Departments
INSERT INTO departments (name, description) VALUES 
('Engineering', 'Software and Infrastructure'),
('Human Resources', 'People and Culture'),
('Finance', 'Payroll and Accounting'),
('Marketing', 'Branding and Growth');

-- 2. Designations
INSERT INTO designations (name, department_id) VALUES 
('Software Engineer', 1),
('Senior DevOps', 1),
('HR Manager', 2),
('Payroll Specialist', 3),
('Financial Analyst', 3);

-- 3. Employees (Identity)
INSERT INTO employees 
(employee_id, full_name, email, phone, gender, date_of_birth, date_of_joining, address, department_id, designation_id, employment_type, status) VALUES 
('ADM001', 'System Administrator', 'admin@astrax.com', '0000000000', 'Male', '1985-05-15', '2020-01-01', 'AstraX HQ, Bengaluru', 1, 1, 'Full-time', 'Approved'),
('EMP001', 'John Doe', 'john.doe@astrax.com', '9876543210', 'Male', '1990-01-01', '2023-01-15', 'Flat 402, Green Oaks, Bengaluru', 1, 1, 'Full-time', 'Approved'),
('EMP002', 'Jane Smith', 'jane.smith@astrax.com', '9876543211', 'Female', '1992-06-20', '2023-02-01', 'Sector 5, HSR Layout, Bengaluru', 2, 3, 'Full-time', 'Approved'),
('EMP003', 'Robert Wilson', 'robert.wilson@astrax.com', '9876543212', 'Male', '1988-11-30', '2023-03-10', 'Indiranagar 2nd Stage, Bengaluru', 3, 5, 'Contract', 'Approved');

-- 4. Users (Auth)
-- Default password is 'Admin@123' or 'Emp@123' - Hashed versions:
-- ADM001: Admin@123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- EMP001-003: Emp@123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (employee_id, password, role) VALUES
('ADM001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('EMP001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
('EMP002', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
('EMP003', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee');

-- 5. Employee Finance (1:1 with Employees)
INSERT INTO employee_finance (employee_id, bank_account_number, ifsc_code, pan_number, pf_number, uan_number) VALUES 
(1, '00000000000', 'ASTX0000123', 'ABCDE1234F', 'PF/2020/001', '100000000001'),
(2, '99887766554', 'HDFC0001234', 'BKZPD4432K', 'PF/2023/101', '100882299110'),
(3, '11223344556', 'ICIC0005678', 'CLYPO9988L', 'PF/2023/102', '100882299111'),
(4, '55443322110', 'SBIN0000999', 'DMQRS5566M', 'PF/2023/103', '100882299112');

-- 6. Salary Structures
INSERT INTO salary_structure (employee_id, basic_pay, hra_percent, da_amount, special_allowance, overtime_rate, effective_from) VALUES 
(1, 150000.00, 40, 5000.00, 10000.00, 1500.00, '2020-01-01'),
(2, 65000.00, 40, 2000.00, 5000.00, 800.00, '2023-01-15'),
(3, 85000.00, 40, 3000.00, 7000.00, 1000.00, '2023-02-01'),
(4, 55000.00, 40, 1500.00, 3500.00, 600.00, '2023-03-10');

-- 7. Leave Types
INSERT INTO leave_types (name, max_days_per_year, is_paid, color) VALUES 
('Casual Leave', 12, TRUE, '#3B82F6'),
('Sick Leave', 10, TRUE, '#EF4444'),
('Privilege Leave', 15, TRUE, '#10B981'),
('Loss of Pay', 0, FALSE, '#6B7280');

-- 8. Leave Balance (Year 2024)
INSERT INTO leave_balance (employee_id, leave_type_id, year, allocated, used, remaining) VALUES 
(2, 1, 2024, 12, 2, 10),
(2, 2, 2024, 10, 1, 9),
(3, 1, 2024, 12, 0, 12),
(4, 1, 2024, 12, 1, 11);

-- 9. Monthly Working Days
INSERT INTO monthly_working_days (month, year, total_working_days) VALUES (3, 2024, 26);

-- 10. Demo Processed Payroll (March 2024)
INSERT INTO payroll (employee_id, month, year, working_days, present_days, basic_pay, hra, net_salary, status) VALUES 
(2, 3, 2024, 26, 26, 65000.00, 26000.00, 91000.00, 'Processed');
