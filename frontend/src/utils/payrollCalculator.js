/**
 * Indian payroll calculation utilities
 * All formulas follow Indian statutory compliance
 */

// HRA = basic_pay × (hra_percent / 100)
export const calcHRA = (basicPay, hraPercent = 40) => {
  return (basicPay * hraPercent) / 100;
};

// Gross = Basic + HRA + DA + Special Allowance + OT Pay + Bonus
export const calcGross = ({ basicPay, hra, da, specialAllowance, overtimePay = 0, bonus = 0 }) => {
  return basicPay + hra + da + specialAllowance + overtimePay + bonus;
};

// PF = 12% of Basic Pay
export const calcPF = (basicPay) => {
  return basicPay * 0.12;
};

// ESI = 0.75% of Gross (only if Gross ≤ ₹21,000)
export const calcESI = (grossSalary) => {
  if (grossSalary > 21000) return 0;
  return grossSalary * 0.0075;
};

// Professional Tax (Maharashtra schedule)
export const calcProfessionalTax = (grossSalary) => {
  if (grossSalary < 10000) return 0;
  if (grossSalary <= 14999) return 150;
  return 200;
};

// TDS (new regime, annual → monthly)
export const calcTDS = (annualGross) => {
  let tax = 0;
  if (annualGross <= 300000) {
    tax = 0;
  } else if (annualGross <= 600000) {
    tax = (annualGross - 300000) * 0.05;
  } else if (annualGross <= 900000) {
    tax = 15000 + (annualGross - 600000) * 0.10;
  } else if (annualGross <= 1200000) {
    tax = 45000 + (annualGross - 900000) * 0.15;
  } else {
    tax = 90000 + (annualGross - 1200000) * 0.20;
  }
  return tax / 12; // Monthly TDS
};

// LOP Deduction = (Gross / Working Days) × LOP Days
export const calcLOPDeduction = (gross, workingDays, lopDays) => {
  if (workingDays === 0 || lopDays === 0) return 0;
  return (gross / workingDays) * lopDays;
};

// Net Salary = Gross - Total Deductions
export const calcNetSalary = (gross, totalDeductions) => {
  return gross - totalDeductions;
};

// Full payroll calculation for one employee
export const calculateFullPayroll = ({
  basicPay, hraPercent = 40, da, specialAllowance,
  overtimeHours = 0, overtimeRate = 0, bonus = 0,
  workingDays = 26, presentDays = 26, lopDays = 0
}) => {
  const hra = calcHRA(basicPay, hraPercent);
  const overtimePay = overtimeHours * overtimeRate;
  const gross = calcGross({ basicPay, hra, da, specialAllowance, overtimePay, bonus });

  const pf = calcPF(basicPay);
  const esi = calcESI(gross);
  const professionalTax = calcProfessionalTax(gross);
  const annualGross = gross * 12;
  const tds = calcTDS(annualGross);
  const lopDeduction = calcLOPDeduction(gross, workingDays, lopDays);

  const totalDeductions = pf + esi + professionalTax + tds + lopDeduction;
  const netSalary = calcNetSalary(gross, totalDeductions);

  return {
    basicPay, hra, da, specialAllowance, overtimePay, bonus, gross,
    pf, esi, professionalTax, tds, lopDeduction, totalDeductions, netSalary,
    workingDays, presentDays, lopDays, overtimeHours
  };
};
