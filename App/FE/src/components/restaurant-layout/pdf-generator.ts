const jsPDF = await import("jspdf");
import { TableInterface } from "@/types/layout-table";

const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject(new Error("Canvas context failed"));
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Gagal memuat gambar: ${url}`));
    };

    img.src = url;
  });
};

export const generateTableQRPdf = async (selectedTables: TableInterface[]) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const cardWidth = 55;
  const cardHeight = 75;
  const gap = 10;
  const columns = 3;
  
  let currentX = margin;
  let currentY = margin;
  let columnIndex = 0;

  for (const table of selectedTables) {
    const cleanPath = table.qr_code.replace(/^\//, "");
    
    const qrUrl = `/storage/${cleanPath}`;

    if (currentY + cardHeight > 280) {
      doc.addPage();
      currentY = margin;
      currentX = margin;
      columnIndex = 0;
    }

    doc.setDrawColor(230, 230, 230);
    doc.setLineDashPattern([1, 1], 0);
    doc.rect(currentX, currentY, cardWidth, cardHeight);
    doc.setLineDashPattern([], 0);

    try {
      const imgData = await loadImage(qrUrl);
      doc.addImage(imgData, "PNG", currentX + 5, currentY + 5, cardWidth - 10, cardWidth - 10);
    } catch (error) {
      doc.setFontSize(7);
      doc.setTextColor(200, 0, 0);
      doc.text("QR ERROR", currentX + (cardWidth / 2), currentY + 30, { align: "center" });
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.text(`TABLE ${table.table_number}`, currentX + (cardWidth / 2), currentY + cardHeight - 15, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Scan to Order", currentX + (cardWidth / 2), currentY + cardHeight - 8, { align: "center" });

    columnIndex++;
    if (columnIndex < columns) {
      currentX += cardWidth + gap;
    } else {
      columnIndex = 0;
      currentX = margin;
      currentY += cardHeight + gap;
    }
  }

  doc.save(`QR_Export_${Date.now()}.pdf`);
};