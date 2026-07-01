/**
 * @file ConsultorProductividad.tsx
 * @description Componente de interfaz de usuario correspondiente al sistema de Evaluación de Desempeño y KPI Analíticos de Productividad.
 * @module ExtintoresGS/components
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Target, 
  Smile, 
  Filter, 
  RefreshCcw, 
  Download, 
  FilePieChart,
  ArrowUpRight,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';
import { obtenerDashboardAnaliticoAction } from '@/controllers/productividad.controller';
import { exportarExcel, exportarPDF } from '@/lib/exportUtils';
import Toast from '@/components/ui/Toast';
import { obtenerFechaMinimaAction } from '@/controllers/reporte.controller';
import { generarPeriodosDinamicos, PeriodoOpcion } from '@/lib/periodUtils';

interface Props {
  areas: any[];
}

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function ConsultorProductividad({ areas }: Props) {
  const [isPending, startTransition] = useTransition();
  // Estados para filtros consolidado
  const [filtros, setFiltros] = useState({ 
    idArea: 0, 
    periodo: '',
    puntuacionMinima: 'Desempeño Global',
    compararCon: 'Mes Anterior'
  });
  const [periodos, setPeriodos] = useState<PeriodoOpcion[]>([]);

  useEffect(() => {
    const cargarPeriodos = async () => {
      const res = await obtenerFechaMinimaAction();
      const minDate = res.success && res.data ? res.data : '2025-01-01';
      const options = generarPeriodosDinamicos(minDate);
      
      const listado = [
        { value: 'Mes Actual', label: 'Mes Actual', tipo: 'Mes' as const },
        { value: 'Trimestre', label: 'Último Trimestre', tipo: 'Trimestre' as const },
        ...options
      ];
      setPeriodos(listado);
      if (listado.length > 0) {
        setFiltros(prev => ({ ...prev, periodo: 'Mes Actual' }));
      }
    };
    cargarPeriodos();
  }, []);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [data, setData] = useState<any>(null);

  const cargarDashboard = () => {
    startTransition(async () => {
      const res = await obtenerDashboardAnaliticoAction({ 
        idArea: filtros.idArea, 
        periodo: filtros.periodo,
        puntuacionMinima: filtros.puntuacionMinima,
        compararCon: filtros.compararCon
      });
      if (res.success) setData(res.data);
    });
  };

  useEffect(() => { 
    cargarDashboard(); 
  }, [
    filtros.idArea, 
    filtros.periodo, 
    filtros.puntuacionMinima, 
    filtros.compararCon
  ]);

  // Generación robusta de los últimos meses cronológicos coincidiendo con BD filtrada
  const historicoFiltrado = useMemo(() => {
    if (!data || !data.historico) return [];
    
    // Como la base de datos ya entrega los registros filtrados para el periodo y el área seleccionada, 
    // mapeamos directamente los valores devueltos para evitar discrepancias
    return data.historico.map((h: any) => ({
      mes: h.mes,
      promedio: parseFloat(h.promedio || 0)
    }));
  }, [data]);

  const porAreaFiltrado = useMemo(() => {
    if (!data || !data.porArea) return [];
    return data.porArea;
  }, [data]);

  // Lógica de exportación completa de todos los datos del informe
  const handleExportarDashboard = async (formato: 'PDF' | 'EXCEL') => {
    if (!data) return;
    
    if (formato === 'PDF') {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      const COLOR_PRIMARY = [220, 38, 38]; // Rojo Corporativo
      const COLOR_TEXT = [30, 41, 59]; // Gris Oscuro
      const COLOR_ACCENT = [79, 70, 229]; // Indigo
      
      // Fondo blanco limpio
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');
      
      // Título y Cabecera Decorativa
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
      doc.text('DASHBOARD ANALÍTICO DE PRODUCTIVIDAD', 15, 22);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 15, 28);
      doc.text(`Filtros: Área: ${filtros.idArea === 0 ? 'Todos' : areas.find(a => a.id_area === filtros.idArea)?.nombre_area || ''} | Periodo: ${filtros.periodo} | Puntuación Mínima: ${filtros.puntuacionMinima}`, 15, 33);
      
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.5);
      doc.line(15, 37, 195, 37);

      // --- SECCIÓN 1: TARJETAS DE INDICADORES (KPIs) ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      doc.text('INDICADORES DE RENDIMIENTO CLAVE (KPIS)', 15, 45);

      const kpiCards = [
        { label: 'Promedio Desempeño', val: data.kpis.promedioDesempeno, sub: '/ 5.00', bg: [243, 232, 255], txt: [107, 33, 168] },
        { label: 'Índice Productividad', val: `${data.kpis.indiceProductividad}%`, sub: 'Eficiencia', bg: [255, 237, 213], txt: [194, 65, 12] },
        { label: 'Cumplimiento Objetivo', val: `${data.kpis.cumplimientoObjetivos}%`, sub: 'Meta Alcanzada', bg: [219, 234, 254], txt: [30, 64, 175] },
        { label: 'Satisfacción Cliente', val: `${data.kpis.satisfaccionInterna}%`, sub: 'NPS Interno', bg: [209, 250, 229], txt: [6, 95, 70] }
      ];

      const cardW = 87;
      const cardH = 22;
      const startX = 15;
      const gapX = 6;
      const startY = 50;
      const gapY = 5;

      kpiCards.forEach((kpi, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = startX + col * (cardW + gapX);
        const y = startY + row * (cardH + gapY);

        doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
        doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        doc.text(kpi.label.toUpperCase(), x + 5, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(kpi.txt[0], kpi.txt[1], kpi.txt[2]);
        doc.text(kpi.val, x + 5, y + 15);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        doc.text(kpi.sub, x + 52, y + 15);
      });

      // --- SECCIÓN 2: HISTÓRICO DE DESEMPEÑO (GRÁFICO DE BARRAS VISUAL) ---
      const chartY = 115;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      doc.text('EVALUACIÓN DE DESEMPEÑO - ÚLTIMOS 6 MESES', 15, chartY - 5);

      // Contenedor del gráfico
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(15, chartY, 180, 60, 4, 4, 'F');
      
      const chartWidth = 150;
      const chartHeight = 40;
      const chartStartX = 30;
      const chartStartY = chartY + 10;
      
      // Eje Y (0 a 5.0)
      doc.setFontSize(7.5);
      doc.setTextColor(130, 130, 130);
      for (let val = 0; val <= 5; val++) {
        const yPos = chartStartY + chartHeight - (val / 5) * chartHeight;
        doc.text(val.toFixed(1), 22, yPos + 1.5);
        
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.15);
        doc.line(28, yPos, 185, yPos);
      }

      const barGap = 10;
      const numBars = historicoFiltrado.length;
      const barWidth = (chartWidth - (barGap * (numBars - 1))) / numBars;

      historicoFiltrado.forEach((h: any, idx: number) => {
        const barX = chartStartX + idx * (barWidth + barGap);
        const valRatio = Number(h.promedio) / 5.0;
        const barHeight = valRatio * chartHeight;
        const barY = chartStartY + chartHeight - barHeight;

        if (barHeight > 0) {
          doc.setFillColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
          doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
          doc.text(Number(h.promedio).toFixed(2), barX + (barWidth / 2) - 4, barY - 2.5);
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(h.mes, barX + (barWidth / 2) - 3.5, chartStartY + chartHeight + 5);
      });

      // --- SECCIÓN 3: PRODUCTIVIDAD POR ÁREA ---
      const areaY = 195;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      doc.text('PRODUCTIVIDAD Y DESEMPEÑO POR DEPARTAMENTO', 15, areaY - 5);

      const areaW = 87;
      const areaH = 14;
      porAreaFiltrado.forEach((a: any, idx: number) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = startX + col * (areaW + gapX);
        const y = areaY + row * (areaH + gapY);

        if (y + areaH < 290) {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.5);
          doc.roundedRect(x, y, areaW, areaH, 2, 2, 'FD');

          doc.setFillColor(243, 244, 246);
          doc.roundedRect(x + 2, y + 2, 8, 10, 1, 1, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`0${idx + 1}`, x + 3.5, y + 9);

          doc.setFontSize(9);
          doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
          doc.text(a.area, x + 13, y + 6);

          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text(`Promedio: `, x + 13, y + 10.5);
          
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
          doc.text(Number(a.promedio).toFixed(2), x + 28, y + 10.5);
        }
      });

      doc.save('Dashboard_Visual_Productividad.pdf');
      setToast({ message: 'Dashboard completo (Visual) exportado a PDF correctamente.', type: 'success' });
    } else {
      const excelRows: any[] = [];
      
      // 1. KPIs
      excelRows.push({ 'Sección / Detalle': '=== RESUMEN DE INDICADORES CLAVE (KPIS) ===', 'Información / Detalle': '', 'Valor': '' });
      excelRows.push({ 'Sección / Detalle': '  Promedio Desempeño', 'Información / Detalle': '/ 5.00', 'Valor': data.kpis.promedioDesempeno });
      excelRows.push({ 'Sección / Detalle': '  Índice de Productividad', 'Información / Detalle': 'Eficiencia Global', 'Valor': `${data.kpis.indiceProductividad}%` });
      excelRows.push({ 'Sección / Detalle': '  Cumplimiento Objetivo', 'Información / Detalle': 'Meta Alcanzada', 'Valor': `${data.kpis.cumplimientoObjetivos}%` });
      excelRows.push({ 'Sección / Detalle': '  Satisfacción Cliente (NPS)', 'Información / Detalle': 'NPS Interno', 'Valor': `${data.kpis.satisfaccionInterna}%` });
      excelRows.push({ 'Sección / Detalle': '', 'Información / Detalle': '', 'Valor': '' });
      
      // 2. Trend con barras de caracteres visuales
      excelRows.push({ 'Sección / Detalle': '=== TENDENCIA DE DESEMPEÑO (ÚLTIMOS 6 MESES) ===', 'Información / Detalle': 'Gráfico Visual', 'Valor': 'Promedio' });
      historicoFiltrado.forEach((h: any) => {
        const promedioNum = Number(h.promedio);
        const numBlocks = Math.round((promedioNum / 5.0) * 10);
        const barChar = '█'.repeat(numBlocks) + '░'.repeat(10 - numBlocks);
        excelRows.push({ 
          'Sección / Detalle': `  ${h.mes} 2026`, 
          'Información / Detalle': `${barChar} (${(promedioNum / 5 * 100).toFixed(0)}%)`, 
          'Valor': promedioNum.toFixed(2) 
        });
      });
      excelRows.push({ 'Sección / Detalle': '', 'Información / Detalle': '', 'Valor': '' });

      // 3. Areas
      excelRows.push({ 'Sección / Detalle': '=== PRODUCTIVIDAD POR DEPARTAMENTO / ÁREA ===', 'Información / Detalle': '', 'Valor': '' });
      porAreaFiltrado.forEach((a: any) => {
        excelRows.push({ 
          'Sección / Detalle': `  ${a.area}`, 
          'Información / Detalle': 'Promedio Área', 
          'Valor': Number(a.promedio).toFixed(2) 
        });
      });

      await exportarExcel({
        datos: excelRows,
        nombreArchivo: 'Dashboard_Completo_Productividad',
        estilosCeldasAdicionales: (worksheet, range, XLSX) => {
          // Formatear y estilizar los datos originales de la tabla (Incluye Opción A en Columna B)
          for (let R = 1; R <= range.e.r; R++) {
            const cellA = worksheet[XLSX.utils.encode_cell({ r: R, c: 0 })];
            const cellB = worksheet[XLSX.utils.encode_cell({ r: R, c: 1 })];
            const cellC = worksheet[XLSX.utils.encode_cell({ r: R, c: 2 })];

            const valA = cellA ? String(cellA.v) : '';

            if (valA.includes('===')) {
              const sectionStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" }, size: 10 },
                fill: { fgColor: { rgb: "1E293B" } },
                alignment: { horizontal: "left" }
              };
              if (cellA) cellA.s = sectionStyle;
              if (cellB) cellB.s = sectionStyle;
              if (cellC) cellC.s = sectionStyle;
            } else if (valA.includes('Promedio Desempeño')) {
              const style = { fill: { fgColor: { rgb: "F3E8FF" } }, font: { color: { rgb: "6B21A8" }, bold: true } };
              if (cellA) cellA.s = style; if (cellB) cellB.s = style; if (cellC) cellC.s = style;
            } else if (valA.includes('Índice de Productividad')) {
              const style = { fill: { fgColor: { rgb: "FFEDD5" } }, font: { color: { rgb: "C2410C" }, bold: true } };
              if (cellA) cellA.s = style; if (cellB) cellB.s = style; if (cellC) cellC.s = style;
            } else if (valA.includes('Cumplimiento Objetivo')) {
              const style = { fill: { fgColor: { rgb: "DBEAFE" } }, font: { color: { rgb: "1E40AF" }, bold: true } };
              if (cellA) cellA.s = style; if (cellB) cellB.s = style; if (cellC) cellC.s = style;
            } else if (valA.includes('Satisfacción Cliente')) {
              const style = { fill: { fgColor: { rgb: "D1FAE5" } }, font: { color: { rgb: "065F46" }, bold: true } };
              if (cellA) cellA.s = style; if (cellB) cellB.s = style; if (cellC) cellC.s = style;
            } else if (valA.includes('Ene') || valA.includes('Feb') || valA.includes('Mar') || valA.includes('Abr') || valA.includes('May') || valA.includes('Jun') || valA.includes('Jul') || valA.includes('Ago') || valA.includes('Sep') || valA.includes('Oct') || valA.includes('Nov') || valA.includes('Dic')) {
              const excelRowIndex = R + 1;
              if (cellB) {
                cellB.t = 's';
                cellB.f = `REPT("█", ROUND(C${excelRowIndex}*2, 0))`;
                cellB.s = {
                  font: { color: { rgb: "4F46E5" }, bold: true, name: "Courier New" },
                  alignment: { horizontal: "left" }
                };
              }
              if (cellC) {
                cellC.s = {
                  font: { bold: true },
                  alignment: { horizontal: "right" }
                };
              }
            }
          }
        },
        configuracionColumnas: [
          { wch: 45 }, // Sección / Detalle (A)
          { wch: 30 }, // Información / Detalle (B)
          { wch: 15 }  // Valor (C)
        ]
      });
      setToast({ message: 'Dashboard completo (Visual) exportado a Excel correctamente.', type: 'success' });
    }
  };

  if (!data) return (
    <div className="flex flex-col items-center justify-center p-40 gap-4 text-slate-400">
      <RefreshCcw className="animate-spin" size={48} />
      <p className="font-bold animate-pulse text-lg">Analizando indicadores de rendimiento estratégicos...</p>
    </div>
  );

  const { kpis, distribucion } = data;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* Barra Superior de Filtros */}
      <header className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-end gap-6">
        <div className="flex-1 min-w-[200px]">
          <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">
            <Filter size={12} /> Periodo Analítico
          </label>
          <select 
            value={filtros.periodo}
            onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
            className="w-full p-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            {periodos.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">Departamento</label>
          <select 
            value={filtros.idArea}
            onChange={(e) => setFiltros({...filtros, idArea: Number(e.target.value)})}
            className="w-full p-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="0">Todos los Departamentos</option>
            {areas.map(a => <option key={a.id_area} value={a.id_area}>{a.nombre_area}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">Puntuación Mínima</label>
          <select 
            value={filtros.puntuacionMinima}
            onChange={(e) => setFiltros({...filtros, puntuacionMinima: e.target.value})}
            className="w-full p-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="Desempeño Global">Desempeño Global</option>
            <option value="4.0">Superior a 4.0</option>
            <option value="3.0">Mínimo Aceptable (3.0)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2">Comparar con</label>
          <select 
            value={filtros.compararCon}
            onChange={(e) => setFiltros({...filtros, compararCon: e.target.value})}
            className="w-full p-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer"
          >
            <option value="Mes Anterior">Mes Anterior</option>
            <option value="Año Anterior">Año Anterior</option>
            <option value="Promedio de Área">Promedio de Área</option>
          </select>
        </div>
      </header>

      {/* Fila de Indicadores Clave (KPIs) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Promedio Desempeño', val: kpis.promedioDesempeno, sub: '/ 5.00', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', shadow: 'shadow-purple-100' },
          { label: 'Índice Productividad', val: `${kpis.indiceProductividad}%`, sub: 'Eficiencia Global', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', shadow: 'shadow-orange-100' },
          { label: 'Cumplimiento Objetivo', val: `${kpis.cumplimientoObjetivos}%`, sub: 'Meta Alcanzada', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', shadow: 'shadow-blue-100' },
          { label: 'Satisfacción Cliente', val: `${kpis.satisfaccionInterna}%`, sub: 'NPS Interno', icon: Smile, color: 'text-emerald-600', bg: 'bg-emerald-50', shadow: 'shadow-emerald-100' },
        ].map((kpi) => (
          <div key={kpi.label} className={`bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm ${kpi.shadow} flex items-center gap-6 group hover:scale-[1.02] transition-all`}>
            <div className={`p-4 ${kpi.bg} ${kpi.color} rounded-2xl group-hover:rotate-6 transition-transform`}>
              <kpi.icon size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${kpi.color}`}>{kpi.val}</span>
                <span className="text-[11px] font-bold text-slate-300">{kpi.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Grid Principal: Gráficos y Tabla */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Lado Izquierdo: Visualizaciones */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Bloque 1: Desempeño 6 meses */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="text-indigo-500" size={18} /> Evaluación de Desempeño - Histórico
              </h3>
              <span className={`text-[10px] font-bold ${Number(kpis.comparativoVariacion || 0) >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'} px-3 py-1 rounded-full`}>
                {Number(kpis.comparativoVariacion || 0) >= 0 ? '+' : ''}{kpis.comparativoVariacion}% vs {kpis.comparativoEtiqueta}
              </span>
            </div>
            
            <div className="h-56 flex items-end justify-between gap-4 px-4">
              {historicoFiltrado.map((h: any) => (
                <div key={h.mes} className="flex-1 flex flex-col items-center gap-4 group">
                  <div className="w-full bg-slate-50 rounded-2xl relative overflow-hidden h-40 flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-2xl transition-all duration-1000 ease-out group-hover:from-indigo-500 shadow-lg shadow-indigo-100" 
                      style={{ height: `${(h.promedio / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{h.mes}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bloque 2: Distribución */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <FilePieChart size={14} className="text-blue-500" /> Distribución por Calificación
              </h3>
              <div className="space-y-5">
                {distribucion.map((d: any, i: number) => (
                  <div key={d.categoria} className="group">
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                      <span>{d.categoria}</span>
                      <span className="text-slate-400 text-[10px]">{d.cantidad} registros</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                        style={{ width: `${(d.cantidad / (kpis.totalEvaluaciones || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloque 3: Productividad Área */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <LayoutDashboard size={14} className="text-emerald-500" /> Productividad de Área
              </h3>
              <div className="flex-1 flex flex-col justify-center gap-6">
                {porAreaFiltrado.map((a: any, i: number) => (
                  <div key={a.area} className="flex items-center gap-4 group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-indigo-50 text-indigo-600' : i === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      0{i+1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-700">{a.area}</p>
                      <p className="text-[10px] font-bold text-slate-400">Promedio: <span className="text-slate-600">{Number(a.promedio).toFixed(2)}</span></p>
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Tabla de Datos */}
        <div className="xl:col-span-4 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 text-slate-700 flex flex-col h-[650px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-8 relative z-10 border-b border-slate-100 pb-4">Detalle por Periodo</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4">Periodo/Mes</th>
                  <th className="pb-4 text-right">Promedio</th>
                  <th className="pb-4 text-right">Var.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historicoFiltrado.map((h: any, i: number) => (
                  <tr key={i} className="group cursor-pointer">
                    <td className="py-4">
                      <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{h.mes} 2026</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter text-ellipsis">Evaluación Semestral</p>
                    </td>
                    <td className="py-4 text-right font-black text-xs text-slate-700">{Number(h.promedio).toFixed(2)}</td>
                    <td className="py-4 text-right text-[10px] text-emerald-500">▲</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 space-y-3 relative z-10">
            <button onClick={() => handleExportarDashboard('EXCEL')} className="w-full py-4 bg-slate-50 border border-slate-150 text-slate-700 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
              <img src="/excel.ico" alt="Excel" className="w-4 h-4 object-contain" /> Exportar Dashboard
            </button>
            <button onClick={() => handleExportarDashboard('PDF')} className="w-full py-4 bg-red-600 rounded-2xl text-xs font-black text-white uppercase tracking-[0.2em] hover:bg-red-500 shadow-xl shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2">
              <img src="/PDF.ico" alt="PDF" className="w-4 h-4 object-contain" /> Generar Informe Completo
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.03); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
      `}</style>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}