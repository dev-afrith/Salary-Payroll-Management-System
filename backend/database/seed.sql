USE payroll_db;

INSERT INTO users (email, password, role) VALUES
('admin@payrollpro.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
 'admin');

INSERT INTO company_settings
(company_name, company_address, company_email, company_phone, gstin) VALUES
('PayrollPro Inc.',
 '4th Floor, Tech Park, Whitefield, Bengaluru, Karnataka - 560066',
 'hr@payrollpro.com', '+91-80-4567-8900', '29ABCDE1234F1Z5');

INSERT INTO departments (name, description) VALUES
('Engineering', 'Software development and infrastructure'),
('Human Resources', 'People operations and recruitment'),
('Finance', 'Accounts, payroll and financial operations'),
('Marketing', 'Brand, growth and communications'),
('Operations', 'Business operations and admin');

INSERT INTO designations (name, department_id) VALUES
('Software Engineer', 1),
('Senior Software Engineer', 1),
('Tech Lead', 1),
('HR Executive', 2),
('HR Manager', 2),
('Accountant', 3),
('Finance Manager', 3),
('Marketing Executive', 4),
('Operations Executive', 5);

INSERT INTO leave_types (name, max_days_per_year, is_paid, color) VALUES
('Casual Leave', 12, TRUE, '#3B82F6'),
('Sick Leave', 12, TRUE, '#10B981'),
('Earned Leave', 15, TRUE, '#F59E0B');

INSERT INTO employees
(employee_id, full_name, email, phone, gender, date_of_birth,
 date_of_joining, department_id, designation_id, employment_type,
 bank_account_number, ifsc_code, pan_number, pf_number, status) VALUES
('EMP001', 'Arjun Sharma', 'arjun@payrollpro.com', '9876543210',
 'Male', '1995-06-15', '2022-01-10', 1, 2, 'Full-time',
 '1234567890123456', 'SBIN0001234', 'ABCPS1234D', 'PF001234', 'Approved'),
('EMP002', 'Priya Nair', 'priya@payrollpro.com', '9876543211',
 'Female', '1997-03-22', '2023-03-01', 2, 4, 'Full-time',
 '9876543210123456', 'HDFC0001234', 'XYZPN5678E', 'PF005678', 'Approved'),
('EMP003', 'Rahul Mehta', 'rahul@payrollpro.com', '9876543212',
 'Male', '1993-11-08', '2021-07-15', 3, 6, 'Full-time',
 '1122334455667788', 'ICIC0001234', 'PQRRM9012F', 'PF009012', 'Approved');

INSERT INTO users (employee_id, email, password, role) VALUES
('EMP001', 'arjun@payrollpro.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
('EMP002', 'priya@payrollpro.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
('EMP003', 'rahul@payrollpro.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee');

INSERT INTO salary_structure
(employee_id, basic_pay, hra_percent, da_amount, special_allowance,
 overtime_rate, effective_from) VALUES
(1, 45000, 40, 3000, 5000, 200, '2022-01-10'),
(2, 35000, 40, 2000, 3000, 150, '2023-03-01'),
(3, 40000, 40, 2500, 4000, 175, '2021-07-15');

INSERT INTO monthly_working_days (month, year, total_working_days) VALUES
(1, 2025, 26),(2, 2025, 24),(3, 2025, 26),
(4, 2025, 26),(5, 2025, 25),(6, 2025, 26);

INSERT INTO leave_balance
(employee_id, leave_type_id, year, allocated, used, remaining) VALUES
(1,1,2025,12,2,10),(1,2,2025,12,0,12),(1,3,2025,15,5,10),
(2,1,2025,12,1,11),(2,2,2025,12,3,9),(2,3,2025,15,0,15),
(3,1,2025,12,4,8),(3,2,2025,12,2,10),(3,3,2025,15,3,12);
