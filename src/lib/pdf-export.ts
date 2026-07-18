import { jsPDF } from 'jspdf'
import type { Payslip } from '@/types'
import { employees } from '@/data/mock'

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const formatCurrency = (amount: number) =>
  `Rs. ${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount)}`

export function generatePayslipPDF(
  payslip: Payslip,
  action: 'view' | 'download'
): void {
  const emp = employees.find((e) => e.id === payslip.employeeId)
  if (!emp) return

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentW = pageW - margin * 2
  let y = margin

  // ── Helpers ──
  const drawLine = (yy: number, color: [number, number, number] = [226, 232, 240]) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(0.3)
    doc.line(margin, yy, pageW - margin, yy)
  }

  const textRight = (text: string, yy: number, opts: { size?: number; style?: string; color?: [number, number, number] } = {}) => {
    const { size = 10, style = 'normal', color = [26, 26, 26] } = opts
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(...color)
    doc.text(text, pageW - margin, yy, { align: 'right' })
  }

  const textLeft = (text: string, yy: number, opts: { size?: number; style?: string; color?: [number, number, number] } = {}) => {
    const { size = 10, style = 'normal', color = [26, 26, 26] } = opts
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(...color)
    doc.text(text, margin, yy)
  }

  const bgRect = (yy: number, h: number, color: [number, number, number] = [248, 250, 252]) => {
    doc.setFillColor(...color)
    doc.roundedRect(margin, yy, contentW, h, 2, 2, 'F')
  }

  // ══════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════
  // Company name
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(79, 70, 229) // #4F46E5
  doc.text('Zenith', margin, y + 8)

  // Company details
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('123 Business Street, San Francisco, CA 94102', margin, y + 14)
  doc.text('info@zenith.com | +1 (555) 123-4567', margin, y + 18)

  // Payslip title (right)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(26, 26, 26)
  doc.text('Salary Payslip', pageW - margin, y + 8, { align: 'right' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`${monthNames[payslip.month - 1]} ${payslip.year}`, pageW - margin, y + 14, { align: 'right' })

  y += 26
  // Header underline
  doc.setDrawColor(79, 70, 229)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageW - margin, y)
  y += 10

  // ══════════════════════════════════════════════
  // EMPLOYEE INFO GRID
  // ══════════════════════════════════════════════
  const gridH = 32
  bgRect(y, gridH)
  y += 6

  const colW = contentW / 4
  const infoItems = [
    ['Employee Name', `${emp.firstName} ${emp.lastName}`],
    ['Employee ID', emp.id.toUpperCase()],
    ['Department', emp.department],
    ['Designation', emp.designation],
    ['Date of Joining', emp.joiningDate],
    ['Payslip ID', payslip.id.slice(-8).toUpperCase()],
    ['Working Days', payslip.workingDays.toString()],
    ['Days Present', payslip.daysPresent.toString()],
  ]

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const idx = row * 4 + col
      const [label, value] = infoItems[idx]
      const x = margin + col * colW + 4
      const rowY = y + row * 13

      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(label.toUpperCase(), x, rowY)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(26, 26, 26)
      doc.text(value, x, rowY + 5)
    }
  }

  y += gridH + 10

  // ══════════════════════════════════════════════
  // EARNINGS & DEDUCTIONS (side by side)
  // ══════════════════════════════════════════════
  const halfW = (contentW - 6) / 2
  const leftX = margin
  const rightX = margin + halfW + 6

  // Section headers
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(16, 185, 129) // green
  doc.text('EARNINGS', leftX, y)

  doc.setTextColor(239, 68, 68) // red
  doc.text('DEDUCTIONS', rightX, y)
  y += 4
  drawLine(y)
  y += 5

  // Table headers
  const drawTableHeader = (x: number) => {
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('COMPONENT', x + 2, y)
    doc.text('AMOUNT', x + halfW - 2, y, { align: 'right' })
  }
  drawTableHeader(leftX)
  drawTableHeader(rightX)
  y += 4
  drawLine(y, [226, 232, 240])
  y += 4

  // Table rows
  const maxRows = Math.max(payslip.earnings.length, payslip.deductions.length)
  const rowH = 5.5

  for (let i = 0; i < maxRows; i++) {
    // Earnings row
    if (i < payslip.earnings.length) {
      const e = payslip.earnings[i]
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(26, 26, 26)
      doc.text(e.name, leftX + 2, y)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(16, 185, 129)
      doc.text(formatCurrency(e.amount), leftX + halfW - 2, y, { align: 'right' })
    }

    // Deductions row
    if (i < payslip.deductions.length) {
      const d = payslip.deductions[i]
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(26, 26, 26)
      doc.text(d.name, rightX + 2, y)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(239, 68, 68)
      doc.text(formatCurrency(d.amount), rightX + halfW - 2, y, { align: 'right' })
    }

    y += rowH

    // Alternating row background
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, y - rowH + 1.5, contentW, rowH, 'F')
    }
  }

  // Totals row
  y += 1
  drawLine(y)
  y += 5

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(26, 26, 26)
  doc.text('Total Earnings', leftX + 2, y)
  doc.setTextColor(16, 185, 129)
  doc.text(formatCurrency(payslip.grossSalary), leftX + halfW - 2, y, { align: 'right' })

  doc.setTextColor(26, 26, 26)
  doc.text('Total Deductions', rightX + 2, y)
  doc.setTextColor(239, 68, 68)
  doc.text(formatCurrency(payslip.totalDeductions), rightX + halfW - 2, y, { align: 'right' })

  y += 12

  // ══════════════════════════════════════════════
  // NET PAY BOX
  // ══════════════════════════════════════════════
  const netPayH = 16
  doc.setFillColor(79, 70, 229)
  doc.roundedRect(margin, y, contentW, netPayH, 3, 3, 'F')

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Net Pay', margin + 8, y + netPayH / 2 + 1.5)

  doc.setFontSize(16)
  doc.text(formatCurrency(payslip.netSalary), pageW - margin - 8, y + netPayH / 2 + 1.5, { align: 'right' })

  y += netPayH + 10

  // ══════════════════════════════════════════════
  // SUMMARY ROW
  // ══════════════════════════════════════════════
  const summaryItems = [
    ['Leave Days', payslip.leaveDays.toString()],
    ['LOP Days', payslip.lopDays.toString()],
    ['Overtime Hours', payslip.overtimeHours.toString()],
  ]
  const summaryColW = contentW / 3
  const summaryH = 14

  summaryItems.forEach(([label, value], i) => {
    const sx = margin + i * summaryColW
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(sx + 1, y, summaryColW - 2, summaryH, 2, 2, 'F')

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(label.toUpperCase(), sx + summaryColW / 2, y + 5, { align: 'center' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 26, 26)
    doc.text(value, sx + summaryColW / 2, y + 11, { align: 'center' })
  })

  y += summaryH + 16

  // ══════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════
  drawLine(y)
  y += 6

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('This is a computer-generated payslip and does not require a signature.', pageW / 2, y, { align: 'center' })
  y += 4
  doc.text(
    `Generated on ${new Date(payslip.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageW / 2, y, { align: 'center' }
  )

  // ── Output ──
  const filename = (() => {
    const e = employees.find((emp) => emp.id === payslip.employeeId)
    if (!e) return `payslip-${payslip.year}-${payslip.month}`
    return `payslip-${e.firstName}-${e.lastName}-${monthNames[payslip.month - 1]}-${payslip.year}`
  })()

  if (action === 'download') {
    doc.save(`${filename}.pdf`)
  } else {
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }
}
