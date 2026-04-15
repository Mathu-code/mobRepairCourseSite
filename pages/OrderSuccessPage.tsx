import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { CheckCircle, Download, PlayCircle, Smartphone, FileText, Award } from 'lucide-react';
import { Header } from '../components/Header';
import { jsPDF } from 'jspdf';

export function OrderSuccessPage() {
  const location = useLocation();
  const storedOrder = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('lastOrder') || 'null');
    } catch {
      return null;
    }
  }, []);

  const order = (location.state as any) || storedOrder || {};
  const orderNumber = order.orderNumber || `ORD-${new Date().getFullYear()}-1234`;
  const orderDate = order.date ? new Date(order.date) : new Date();
  const itemTitle = order.itemTitle || 'Complete iPhone Repair Mastery Course';
  const courseId = order.courseId || '';
  const noteId = order.noteId || '';
  const itemType = order.itemType || 'course';
  const totalPaid = Number(order.totalPaid || 89.99);
  const email = order.email || 'john.doe@email.com';
  const paymentMethod = order.paymentMethod || 'Credit Card •••• 3456';

  const downloadReceipt = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header gradient-style blocks
    doc.setFillColor(8, 145, 178);
    doc.rect(0, 0, pageWidth, 34, 'F');
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 28, pageWidth, 8, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('MobRepair Receipt', 16, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Official purchase confirmation', 16, 26);

    // Badge
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(pageWidth - 62, 10, 46, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PAID', pageWidth - 47, 18);

    // Details card
    doc.setDrawColor(191, 219, 254);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 46, pageWidth - 28, 56, 4, 4, 'FD');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', 20, 56);

    const labelColor = [71, 85, 105] as const;
    const valueColor = [15, 23, 42] as const;
    const leftX = 20;
    const rightX = 128;
    const rows: Array<[string, string]> = [
      ['Order Number', `#${orderNumber}`],
      ['Date', orderDate.toLocaleString()],
      ['Payment Method', paymentMethod],
      ['Email', email]
    ];

    doc.setFontSize(10);
    rows.forEach(([label, value], index) => {
      const y = 66 + index * 10;
      doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(label, leftX, y);
      doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(value, rightX, y);
    });

    // Item card
    doc.setFillColor(236, 254, 255);
    doc.setDrawColor(125, 211, 252);
    doc.roundedRect(14, 110, pageWidth - 28, 40, 4, 4, 'FD');
    doc.setFillColor(14, 165, 233);
    doc.roundedRect(20, 120, 16, 16, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('↗', 25, 131);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(itemTitle, 42, 126, { maxWidth: pageWidth - 60 });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const descriptionText = itemType === 'note' 
      ? 'Access your repair guide documentation anytime'
      : 'Access your repair training anytime, anywhere';
    doc.text(descriptionText, 42, 134);

    // Total paid area
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 160, pageWidth - 28, 28, 4, 4, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Paid', 20, 177);
    doc.setTextColor(8, 145, 178);
    doc.setFontSize(18);
    doc.text(`$${totalPaid.toFixed(2)}`, pageWidth - 20, 177, { align: 'right' });

    // Footer note
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Thank you for purchasing from MobRepair.', 14, pageHeight - 18);
    doc.text('Keep this receipt for your records.', 14, pageHeight - 12);

    doc.save(`receipt-${orderNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-cyan-900 bg-clip-text text-transparent">Purchase Successful!</h1>
          <p className="text-slate-600 mb-8 text-lg">
            Thank you for your purchase. Your order has been confirmed and you now have access to your repair training content.
          </p>

          {/* Order Details */}
          <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl p-6 mb-8 text-left border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Order Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Order Number</span>
                <span className="font-semibold text-slate-900">#{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Date</span>
                <span className="font-semibold text-slate-900">{orderDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Method</span>
                <span className="font-semibold text-slate-900">{paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-300">
                <span className="font-bold text-slate-900">Total Paid</span>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">${totalPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Item Purchased */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 mb-8 border-2 border-cyan-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                {itemType === 'note' ? (
                  <FileText className="w-8 h-8 text-white" />
                ) : (
                  <Smartphone className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-slate-900 mb-1">{itemTitle}</h3>
                <p className="text-sm text-slate-600">
                  {itemType === 'note' 
                    ? 'Access your repair guide documentation anytime'
                    : 'Access your repair training anytime, anywhere'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to={courseId ? `/learn/${courseId}` : noteId ? `/view/${noteId}` : '/student/dashboard'}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-105 transition-all font-bold flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              {itemType === 'note' ? 'View Repair Guide' : 'Start Learning Now'}
            </Link>

            <button onClick={downloadReceipt} className="w-full py-4 border-2 border-cyan-600 text-cyan-600 rounded-xl hover:bg-cyan-50 hover:border-cyan-700 transition-all font-semibold flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download Receipt
            </button>

            <Link
              to="/student/dashboard"
              className="w-full py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all font-semibold flex items-center justify-center gap-2"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Email Confirmation */}
          <p className="text-sm text-slate-600 mt-8">
            A confirmation email has been sent to <span className="text-cyan-600 font-semibold">{email}</span>
          </p>
        </div>

        {/* What's Next */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">What's Next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <PlayCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900 mb-1">Access Your Training</h3>
                <p className="text-sm text-slate-600">
                  Start learning repair techniques immediately from your dashboard
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900 mb-1">Download Repair Guides</h3>
                <p className="text-sm text-slate-600">
                  Get all repair manuals, diagrams, and reference materials
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900 mb-1">Earn Your Certification</h3>
                <p className="text-sm text-slate-600">
                  Complete the course to receive your professional repair technician certificate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
