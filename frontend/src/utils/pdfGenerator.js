import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatINR } from './formatCurrency';

// Helper to convert number to Indian words
const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  };

  const words = inWords(Math.floor(num)).trim();
  return words + ' only';
};

// Helper for PDF-safe currency (jsPDF default fonts don't support ₹)
const formatPDFINR = (val) => {
  return 'Rs. ' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
};

const createPDF = (data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // 1. Header
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text('AstraX Technologies', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('143 Corporate Park, Near Sona College, Salem, TN, India', pageWidth / 2, 28, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(15, 35, pageWidth - 15, 35);

  // 2. Title
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`PAYSLIP FOR THE MONTH OF ${new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}`, pageWidth / 2, 45, { align: 'center' });

  // 3. Employee Details
  doc.setFontSize(10);
  const leftCol = 20;
  const rightCol = pageWidth / 2 + 10;
  let y = 55;

  doc.setFont(undefined, 'bold'); doc.text('Employee Name:', leftCol, y);
  doc.setFont(undefined, 'normal'); doc.text(data.full_name, leftCol + 35, y);
  doc.setFont(undefined, 'bold'); doc.text('Employee ID:', rightCol, y);
  doc.setFont(undefined, 'normal'); doc.text(data.emp_code, rightCol + 35, y);
  
  y += 7;
  doc.setFont(undefined, 'bold'); doc.text('Department:', leftCol, y);
  doc.setFont(undefined, 'normal'); doc.text(data.department_name || 'N/A', leftCol + 35, y);
  doc.setFont(undefined, 'bold'); doc.text('Designation:', rightCol, y);
  doc.setFont(undefined, 'normal'); doc.text(data.designation_name || 'N/A', rightCol + 35, y);

  y += 7;
  doc.setFont(undefined, 'bold'); doc.text('PAN Number:', leftCol, y);
  doc.setFont(undefined, 'normal'); doc.text(data.pan_number || 'N/A', leftCol + 35, y);
  doc.setFont(undefined, 'bold'); doc.text('Account No:', rightCol, y);
  doc.setFont(undefined, 'normal'); doc.text(data.bank_account_number || 'N/A', rightCol + 35, y);

  // 4. Attendance Table - Fixed autoTable call
  autoTable(doc, {
    startY: y + 10,
    head: [['Working Days', 'Present Days', 'LOP Days', 'Overtime Hrs']],
    body: [[data.working_days, data.present_days, data.lop_days, data.overtime_hours]],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { halign: 'center' }
  });

  // 5. Earnings vs Deductions Table
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Earnings', 'Amount', 'Deductions', 'Amount']],
    body: [
      ['Basic Pay', formatPDFINR(data.basic_pay), 'PF (Employee)', formatPDFINR(data.pf_employee)],
      ['HRA', formatPDFINR(data.hra), 'ESI (Employee)', formatPDFINR(data.esi_employee)],
      ['DA', formatPDFINR(data.da), 'Professional Tax', formatPDFINR(data.professional_tax)],
      ['Special Allowance', formatPDFINR(data.special_allowance), 'TDS', formatPDFINR(data.tds)],
      ['Overtime Pay', formatPDFINR(data.overtime_pay), 'LOP Deduction', formatPDFINR(data.lop_deduction)],
      ['Bonus', formatPDFINR(data.bonus), '', ''],
      [
        { content: 'Total Earnings', styles: { fontStyle: 'bold' } }, 
        { content: formatPDFINR(data.gross_salary), styles: { fontStyle: 'bold' } }, 
        { content: 'Total Deductions', styles: { fontStyle: 'bold' } }, 
        { content: formatPDFINR(data.total_deductions), styles: { fontStyle: 'bold' } }
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // 6. Net Pay
  y = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0);
  doc.text(`NET PAYABLE: ${formatPDFINR(data.net_salary)}`, pageWidth - 20, y, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'italic');
  doc.text(`(Amount in words: Rupees ${numberToWords(data.net_salary).trim()})`, 20, y + 8);

  // 7. Signature area
  y += 35;
  doc.setFont(undefined, 'bold');
  doc.text('__________________________', pageWidth - 70, y);
  doc.text('Authorized Signatory', pageWidth - 70, y + 7);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('AstraX Technologies Pvt Ltd', pageWidth - 70, y + 13);

  // 7. Footer
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(150);
  doc.text('This is a computer-generated payslip and does not require a physical signature.', pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });

  return doc;
};

export const generatePayslipPDF = (data) => {
  const doc = createPDF(data);
  doc.save(`Payslip_${data.emp_code}_${data.month}_${data.year}.pdf`);
};

export const previewPayslipPDF = (data) => {
  const doc = createPDF(data);
  const blob = doc.output('bloburl');
  window.open(blob, '_blank');
};
