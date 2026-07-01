/**
 * @file exportUtils.ts
 * @description Librería utilitaria y de configuración global para el módulo de EXPORTUTILS.
 * @module ExtintoresGS/lib
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */


interface ExportarExcelProps {
  datos: any[];
  nombreArchivo: string;
  nombreHoja?: string;
  configuracionColumnas?: { wch: number }[];
  estilosCeldasAdicionales?: (worksheet: any, range: any, XLSX: any) => void;
}

export async function exportarExcel({ datos, nombreArchivo, nombreHoja = "Datos", configuracionColumnas, estilosCeldasAdicionales }: ExportarExcelProps) {
  const XLSX = await import('xlsx-js-style');
  const worksheet = XLSX.utils.json_to_sheet(datos);
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

  // Estilos de cabecera (Fila 0) consistentes para toda la app
  for (let C = 0; C <= range.e.c; C++) {
    const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
    if (worksheet[cell_address]) {
      worksheet[cell_address].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "DC2626" } } // Rojo corporativo
      };
    }
  }

  // Aplicar lógica personalizada si se pasa a través de los props
  if (estilosCeldasAdicionales) estilosCeldasAdicionales(worksheet, range, XLSX);
  
  if (configuracionColumnas) worksheet['!cols'] = configuracionColumnas;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
  XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
}

interface ExportarPDFProps {
  columnas: string[];
  filas: any[][];
  nombreArchivo: string;
  titulo: string;
  subtitulos?: string[];
}

export async function exportarPDF({ columnas, filas, nombreArchivo, titulo, subtitulos = [] }: ExportarPDFProps) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  // Usar orientación horizontal (landscape) si hay más de 5 columnas para evitar que se aplaste el texto
  const orientacion = columnas.length > 5 ? 'l' : 'p';
  const doc = new jsPDF({ orientation: orientacion });
  
  doc.setFontSize(18);
  doc.text(titulo, 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);

  let currentY = 36;
  subtitulos.filter(Boolean).forEach(sub => {
    doc.text(sub, 14, currentY);
    currentY += 6;
  });

  // Ajustar el tamaño de fuente según la cantidad de columnas para asegurar visibilidad
  const fontSize = columnas.length > 10 ? 6 : columnas.length > 7 ? 7 : 8;

  autoTable(doc, { 
    head: [columnas], 
    body: filas, 
    startY: currentY, 
    theme: 'grid', 
    styles: { fontSize: fontSize, cellPadding: 2, overflow: 'linebreak' }, 
    headStyles: { fillColor: [220, 38, 38] } 
  });
  doc.save(`${nombreArchivo}.pdf`);
}

interface ExportarCSVProps {
  columnas: string[];
  datos: any[];
  nombreArchivo: string;
}

export function exportarCSV({ columnas, datos, nombreArchivo }: ExportarCSVProps) {
  const headers = columnas.join(',');
  const csvRows = datos.map((row: any) => columnas.map(campo => `"${row[campo] || ''}"`).join(','));
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + csvRows.join('\n');
  const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `${nombreArchivo}.csv`);
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}