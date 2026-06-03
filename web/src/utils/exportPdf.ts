import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrice } from './format';
import type { OrderRecord } from '@services/order.service';

let robotoRegularBase64: string | null = null;
let robotoMediumBase64: string | null = null;

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const loadFonts = async () => {
  if (!robotoRegularBase64) {
    const res = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf');
    const buf = await res.arrayBuffer();
    robotoRegularBase64 = arrayBufferToBase64(buf);
  }
  if (!robotoMediumBase64) {
    const res = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf');
    const buf = await res.arrayBuffer();
    robotoMediumBase64 = arrayBufferToBase64(buf);
  }
};

export const exportOrderInvoice = async (order: OrderRecord) => {
  await loadFonts();

  const doc = new jsPDF();

  doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularBase64!);
  doc.addFileToVFS('Roboto-Medium.ttf', robotoMediumBase64!);
  
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
  
  doc.setFont('Roboto', 'normal');

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.setFont('Roboto', 'bold');
  doc.text('HÓA ĐƠN MUA HÀNG', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('Roboto', 'normal');
  doc.text('NexPhone Store', 14, 28);
  doc.text('123 Đường ABC, Quận XYZ, TP. HCM', 14, 34);
  doc.text('Điện thoại: 0123.456.789', 14, 40);

  // Thông tin đơn hàng
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.setFont('Roboto', 'bold');
  
  doc.text('THÔNG TIN ĐƠN HÀNG', 120, 20);
  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  doc.text(`Mã đơn hàng: ${order.orderCode}`, 120, 28);
  doc.text(`Ngày đặt: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}`, 120, 34);
  
  const statusMap: Record<string, string> = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };
  doc.text(`Trạng thái: ${statusMap[order.status] || order.status}`, 120, 40);

  // Line
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 45, 196, 45);

  // Thông tin khách hàng
  doc.setFontSize(11);
  doc.setFont('Roboto', 'bold');
  doc.text('THÔNG TIN KHÁCH HÀNG', 14, 55);
  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  doc.text(`Người nhận: ${order.customerName}`, 14, 63);
  doc.text(`Điện thoại: ${order.customerPhone}`, 14, 69);
  doc.text(`Email: ${order.customerEmail || 'Không có'}`, 14, 75);
  
  const paymentMap: Record<string, string> = {
    cod: 'Thanh toán khi nhận hàng',
    bank_transfer: 'Chuyển khoản ngân hàng',
    credit_card: 'Thẻ tín dụng',
    wallet: 'Ví điện tử'
  };
  doc.text(`Phương thức TT: ${paymentMap[order.paymentMethod] || order.paymentMethod}`, 14, 81);
  
  const splitAddress = doc.splitTextToSize(`Địa chỉ: ${order.shippingAddress}`, 180);
  doc.text(splitAddress, 14, 87);

  // Table items
  const tableData = order.items.map((item, index) => [
    index + 1,
    item.productName,
    item.quantity.toString(),
    formatPrice(item.unitPrice),
    formatPrice(item.lineTotal)
  ]);

  autoTable(doc, {
    startY: 100,
    head: [['STT', 'Tên sản phẩm', 'SL', 'Đơn giá', 'Thành tiền']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    styles: { font: 'Roboto', fontSize: 10 },
  });

  const finalY = (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 100;

  // Tính toán tiền
  const subtotal = order.subtotalAmount || order.totalAmount;
  const discount = order.discountAmount || 0;
  const total = order.totalAmount;

  doc.setFont('Roboto', 'normal');
  doc.text(`Tạm tính:`, 130, finalY + 15);
  doc.text(formatPrice(subtotal), 196, finalY + 15, { align: 'right' });

  if (discount > 0) {
    doc.text(`Giảm giá:`, 130, finalY + 23);
    doc.text(`-${formatPrice(discount)}`, 196, finalY + 23, { align: 'right' });
  }

  doc.setFontSize(12);
  doc.setFont('Roboto', 'bold');
  doc.text(`TỔNG THANH TOÁN:`, 110, finalY + 33);
  doc.text(formatPrice(total), 196, finalY + 33, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setFont('Roboto', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Cảm ơn quý khách đã mua sắm tại NexPhone!', 105, 280, { align: 'center' });

  doc.save(`HoaDon-${order.orderCode}.pdf`);
};
