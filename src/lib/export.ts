import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export function exportToPDF(data: any[], title: string = 'Financial Report') {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text(title, 14, 22)
    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    const tableData = data.map(row => [
        row.date,
        row.type,
        row.category,
        row.description,
        `$${row.amount}`
    ])

    autoTable(doc, {
        head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] } // Emerald color
    })

    doc.save('finance-report.pdf')
}

export function exportToExcel(data: any[], filename: string = 'finance-report') {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report")
    XLSX.writeFile(workbook, `${filename}.xlsx`)
}
