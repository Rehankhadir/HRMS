import { employees } from '@/data/mock'

interface BulkUploadRow {
  serialNo: number
  beneficiaryName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  amount: number
  paymentReference: string
  remarks: string
}

function formatCurrency(amount: number): string {
  return amount.toFixed(2)
}

function sanitizeForCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function generateBulkUploadCSV(
  rows: { employeeId: string; netPay: number }[],
  month: number,
  year: number
): string {
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const period = `${monthNames[month - 1]} ${year}`
  const debitAccount = '50100000123456'
  const companyIFSC = 'HDFC0000001'

  const headers = [
    'S.No',
    'Beneficiary Name',
    'Account Number',
    'IFSC Code',
    'Bank Name',
    'Amount (INR)',
    'Payment Reference',
    'Remarks',
  ]

  const dataRows: BulkUploadRow[] = rows
    .map((row, index) => {
      const emp = employees.find(e => e.id === row.employeeId)
      if (!emp || row.netPay <= 0) return null
      return {
        serialNo: index + 1,
        beneficiaryName: `${emp.firstName} ${emp.lastName}`,
        accountNumber: emp.bankDetails.accountNumber,
        ifscCode: emp.bankDetails.ifscCode,
        bankName: emp.bankDetails.bankName,
        amount: row.netPay,
        paymentReference: `SAL-${year}${String(month).padStart(2, '0')}-${emp.id}`,
        remarks: `Salary for ${period}`,
      }
    })
    .filter(Boolean) as BulkUploadRow[]

  const csvLines = [
    `Company Debit Account,${debitAccount}`,
    `Company IFSC,${companyIFSC}`,
    `Payment Date,${new Date().toISOString().split('T')[0]}`,
    `Total Rows,${dataRows.length}`,
    `Total Amount,${formatCurrency(dataRows.reduce((sum, r) => sum + r.amount, 0))}`,
    '',
    headers.join(','),
    ...dataRows.map(row =>
      [
        row.serialNo,
        sanitizeForCSV(row.beneficiaryName),
        row.accountNumber,
        row.ifscCode,
        sanitizeForCSV(row.bankName),
        formatCurrency(row.amount),
        row.paymentReference,
        sanitizeForCSV(row.remarks),
      ].join(',')
    ),
  ]

  return csvLines.join('\n')
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
