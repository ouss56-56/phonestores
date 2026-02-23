import jsPDF from "jspdf";
import type { Product } from "@/lib/admin-types";

export const exportService = {
    downloadCSV(data: string, filename: string) {
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    },

    generateInvoicePDF(params: {
        orderNumber: string;
        customerName: string;
        items: { name: string; quantity: number; unit_price: number }[];
        totalAmount: number;
        discountAmount?: number;
        paymentMethod?: string;
    }) {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(15, 15, 30);
        doc.text("LUMINA LUXURY TECH", 20, 30);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("FACTURE PRO-FORMA", 20, 40);
        doc.text(`N°: ${params.orderNumber}`, 20, 46);
        doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 150, 40);
        doc.text(`Client: ${params.customerName}`, 150, 46);

        doc.setDrawColor(200);
        doc.line(20, 52, 190, 52);

        // Table header
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text("Article", 20, 62);
        doc.text("Qté", 120, 62);
        doc.text("P.U.", 140, 62);
        doc.text("Total", 170, 62);
        doc.line(20, 65, 190, 65);

        // Items
        doc.setTextColor(30);
        doc.setFontSize(10);
        let yPos = 72;
        params.items.forEach(item => {
            doc.text(item.name.substring(0, 40), 20, yPos);
            doc.text(String(item.quantity), 125, yPos);
            doc.text(`${item.unit_price.toLocaleString()} DA`, 135, yPos);
            doc.text(`${(item.unit_price * item.quantity).toLocaleString()} DA`, 160, yPos);
            yPos += 8;
        });

        // Totals
        doc.line(20, yPos, 190, yPos);
        yPos += 8;

        if (params.discountAmount && params.discountAmount > 0) {
            doc.setTextColor(100);
            doc.text("Remise:", 130, yPos);
            doc.text(`-${params.discountAmount.toLocaleString()} DA`, 160, yPos);
            yPos += 8;
        }

        doc.setFontSize(14);
        doc.setTextColor(15, 15, 30);
        doc.text("TOTAL:", 120, yPos);
        doc.text(`${params.totalAmount.toLocaleString()} DA`, 155, yPos);

        yPos += 15;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Méthode de paiement: ${params.paymentMethod || 'Espèces'}`, 20, yPos);
        doc.text("Merci pour votre confiance — LUMINA LUXURY TECH", 20, yPos + 6);

        doc.save(`Lumina-Facture-${params.orderNumber}.pdf`);
    },

    generateReportPDF(title: string, sections: { heading: string; rows: string[][] }[]) {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(15, 15, 30);
        doc.text("LUMINA LUXURY TECH", 20, 20);
        doc.setFontSize(12);
        doc.text(title, 20, 30);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, 37);

        let yPos = 50;

        sections.forEach(section => {
            doc.setFontSize(11);
            doc.setTextColor(30);
            doc.text(section.heading, 20, yPos);
            yPos += 8;

            doc.setFontSize(9);
            doc.setTextColor(60);
            section.rows.forEach(row => {
                doc.text(row.join('    |    '), 20, yPos);
                yPos += 6;
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
            });

            yPos += 6;
        });

        doc.save(`Lumina-${title.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
    }
};
