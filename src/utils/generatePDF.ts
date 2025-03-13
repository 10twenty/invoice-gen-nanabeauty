import { jsPDF } from 'jspdf';
import { InvoiceData } from '@/types/invoice';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = async (data: InvoiceData): Promise<Uint8Array> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set font
  doc.setFont('helvetica');

  // Add watermark
  doc.setFontSize(60);
  doc.setTextColor(128, 128, 128, 0.1);
  doc.setFont('helvetica', 'bold');
  doc.text('Sample Only', 105, 148, { align: 'center' });

  // Add header background
  doc.setFillColor(99, 102, 241); // indigo-600
  doc.rect(0, 0, 210, 40, 'F');

  // Add decorative elements
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  doc.setFillColor(255, 255, 255);
  doc.circle(20, 45, 2, 'F');
  doc.circle(190, 45, 2, 'F');

  // Company Logo/Name
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Na Na Beauty', 105, 25, { align: 'center' });

  // Invoice Title
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('INVOICE', 105, 35, { align: 'center' });

  // Invoice Details
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Invoice #: ${data.invoiceNumber}`, 20, 60);
  doc.text(`Date: ${data.date}`, 20, 65);

  // Company Information
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text('From:', 20, 80);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName, 20, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(data.companyAddress, 20, 90);
  doc.text(`Phone: ${data.companyPhone}`, 20, 95);
  doc.text(`Email: ${data.companyEmail}`, 20, 100);

  // Client Information
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text('To:', 20, 120);
  doc.setFont('helvetica', 'bold');
  doc.text(data.clientName, 20, 125);
  doc.setFont('helvetica', 'normal');
  if (data.clientPhone) doc.text(`Phone: ${data.clientPhone}`, 20, 130);
  if (data.clientEmail) doc.text(`Email: ${data.clientEmail}`, 20, 135);

  // Items Table
  const tableData = data.items.map(item => [
    item.description,
    item.quantity.toString(),
    `$${item.price.toFixed(2)}`,
    `$${(item.quantity * item.price).toFixed(2)}`
  ]);

  // Add total row
  tableData.push(['', '', 'Total:', `$${(data.total || 0).toFixed(2)}`]);

  autoTable(doc, {
    startY: 150,
    head: [['Description', 'Quantity', 'Price', 'Amount']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: [75, 85, 99],
      fillColor: [249, 250, 251],
      fontStyle: 'normal',
    },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: [249, 250, 251],
      textColor: [75, 85, 99],
      fontStyle: 'bold',
    },
  });

  // Notes
  if (data.notes) {
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text('Notes:', 20, (doc as any).lastAutoTable.finalY + 20);
    doc.setFontSize(9);
    doc.text(data.notes, 20, (doc as any).lastAutoTable.finalY + 25);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for your business!', 105, pageHeight - 20, { align: 'center' });
  doc.text(`© ${new Date().getFullYear()} Na Na Beauty. All rights reserved.`, 105, pageHeight - 15, { align: 'center' });

  // Add decorative elements to footer
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 25, 190, pageHeight - 25);
  doc.setFillColor(99, 102, 241);
  doc.circle(20, pageHeight - 25, 2, 'F');
  doc.circle(190, pageHeight - 25, 2, 'F');

  // Convert ArrayBuffer to Uint8Array
  const arrayBuffer = doc.output('arraybuffer');
  return new Uint8Array(arrayBuffer);
}; 