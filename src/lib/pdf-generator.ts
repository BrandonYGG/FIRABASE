
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Order } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Augment jsPDF with the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function generateOrderPdf(order: Order) {
  const doc = new jsPDF();

  const fullAddress = `${order.calle} ${order.numero}, ${order.colonia}, ${order.ciudad}, ${order.estado}, C.P. ${order.codigoPostal}`;
  const deliveryDate = `Del ${format(order.fechaMinEntrega, 'dd/MM/yyyy')} al ${format(order.fechaMaxEntrega, 'dd/MM/yyyy')}`;
  const isCashPayment = order.tipoPago === 'Efectivo';
  const title = isCashPayment ? 'Ticket de Compra (Pago en Efectivo)' : 'Resumen de Pedido';
  const idPrefix = isCashPayment ? 'TICKET' : 'PEDIDO';
  const orderId = `${idPrefix}-${order.id.substring(0, 8).toUpperCase()}`;

  // Header
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(orderId, 200, 22, { align: 'right' });


  // Order Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Pedido para la obra: ${order.obra}`, 14, 32);
  
  const details = [
    { title: 'Solicitante:', content: order.solicitante },
    { title: 'Dirección de Entrega:', content: fullAddress },
    { title: 'Fechas de Entrega:', content: deliveryDate },
    { title: 'Forma de Pago:', content: `${order.tipoPago}${order.tipoPago === 'Tarjeta' && order.frecuenciaCredito ? ` (${order.frecuenciaCredito})` : ''}` },
  ];

  doc.autoTable({
    startY: 40,
    body: details,
    theme: 'plain',
    styles: {
      cellPadding: { top: 1, right: 2, bottom: 1, left: 0 },
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 'auto' },
    },
    didParseCell: (data) => {
        if(data.column.index === 0) {
            data.cell.styles.halign = 'right';
        }
    }
  });

  const lastY = (doc as any).lastAutoTable.finalY || 80;

  // Materials Table
  doc.setFontSize(14);
  doc.text('Materiales Solicitados', 14, lastY + 10);

  const tableColumn = ["Descripción", "Cantidad", "Precio Unitario", "Subtotal"];
  const tableRows = order.materiales.map(item => [
    item.descripcion,
    item.cantidad,
    `$${item.precioUnitario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    `$${(item.cantidad * item.precioUnitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
  ]);

  doc.autoTable({
    startY: lastY + 15,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] }, // A blue color for the header
  });

  const finalTableY = (doc as any).lastAutoTable.finalY || lastY + 50;

  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total del Pedido:', 140, finalTableY + 10, { align: 'right' });
  doc.text(`$${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 200, finalTableY + 10, { align: 'right' });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} OrderFlow Construct`, 14, doc.internal.pageSize.height - 10);
  }

  // Save the PDF
  doc.save(`pedido_${order.obra.replace(/\s/g, '_')}_${order.id.substring(0,5)}.pdf`);
}
