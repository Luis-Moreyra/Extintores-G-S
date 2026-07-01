/**
 * @file ReportePorFechas.tsx
 * @description Componente de interfaz de usuario correspondiente al flujo de Control de Asistencia y Reportes de Marcaciones del personal.
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

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  File, 
  FileSpreadsheet,
  Search,
  Inbox
} from 'lucide-react';
import { buscarAsistencias } from '@/controllers/asistencia.controller';
import { obtenerTodasLasAreas } from '@/controllers/empleado.controller';
import EmptyState from '@/components/ui/EmptyState';
import { exportarExcel, exportarPDF } from '@/lib/exportUtils';
import Toast from '@/components/ui/Toast';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function ReportePorFechas() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [area, setArea] = useState('Todos');
  const [formato, setFormato] = useState('PDF');

  const [resultados, setResultados] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const [listaCargos, setListaCargos] = useState<string[]>(['Todos']);
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      setLoadingAreas(true);
      const res = await obtenerTodasLasAreas();
      if (res.success && res.areas) {
        setListaCargos(['Todos', ...res.areas.map((a: any) => a.nombre_area)]);
      }
      setLoadingAreas(false);
    };
    fetchAreas();
  }, []);

  // Lógica para asignar fechas automáticamente
  const handleFiltroRapido = (filtro: 'hoy' | 'semana' | 'mes' | '5meses') => {
    const hoy = new Date();
    let inicio = new Date();
    
    if (filtro === 'hoy') {
      inicio = hoy;
    } else if (filtro === 'semana') {
      const diaSemana = hoy.getDay(); // 0 (Domingo) - 6 (Sábado)
      const difLunes = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
      inicio = new Date(hoy);
      inicio.setDate(difLunes);
    } else if (filtro === 'mes') {
      inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    } else if (filtro === '5meses') {
      inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);
    }

    // Formatear a YYYY-MM-DD para el input type="date"
    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    setFechaInicio(formatDate(inicio));
    setFechaFin(formatDate(hoy)); // El rango en estos filtros siempre acaba hoy
  };

  // Lógica para previsualizar buscando en la base de datos
  const handleGenerarVistaPrevia = async () => {
    if (!fechaInicio) {
      setToast({ message: 'Por favor, seleccione al menos una fecha de inicio para generar la vista previa.', type: 'warning' });
      return;
    }
    setLoading(true);
    // Enviamos un string vacío como nombre para que traiga todos los empleados en ese rango de fechas
    const res = await buscarAsistencias('', fechaInicio, fechaFin);
    if (res.success) {
      let data = res.data;
      if (area !== 'Todos') {
        data = data.filter((row: any) => row.cargo === area);
      }
      setResultados(data);
    } else {
      setToast({ message: res.message || 'Error al buscar asistencias', type: 'error' });
      setResultados([]);
    }
    setLoading(false);
  };

  // Lógica para descargar el reporte
  const handleDescargar = async () => {
    if (!fechaInicio) {
      setToast({ message: 'Por favor, seleccione al menos una fecha de inicio antes de generar el reporte.', type: 'warning' });
      return;
    }

    // Si no hay resultados generados, los buscamos primero
    let dataToExport = resultados;
    if (!dataToExport) {
      setLoading(true);
      const res = await buscarAsistencias('', fechaInicio, fechaFin);
      if (res.success) {
        let data = res.data;
        if (area !== 'Todos') {
          data = data.filter((row: any) => row.cargo === area);
        }
        dataToExport = data;
        setResultados(data);
      } else {
        setToast({ message: res.message || 'Error al obtener datos', type: 'error' });
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    if (!dataToExport || dataToExport.length === 0) {
      setToast({ message: 'No hay datos para exportar en este rango de fechas.', type: 'warning' });
      return;
    }

    if (formato === 'EXCEL') {
      const datosExcel = dataToExport.map((row: any) => ({
        'Fecha': row.fecha,
        'DNI': row.dni || '-',
        'Empleado': row.empleado,
        'Área/Depto': row.cargo,
        'Estado': row.estado,
        'Hora Entrada': row.hora_entrada,
        'Hora Salida': row.hora_salida,
        'Observaciones': row.observaciones || '-'
      }));

      await exportarExcel({
        datos: datosExcel,
        nombreArchivo: `Reporte_Fechas_${fechaInicio}`,
        nombreHoja: "ReporteFechas",
        configuracionColumnas: [{ wch: 15 }, { wch: 15 }, { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }],
        estilosCeldasAdicionales: (worksheet, range, XLSX) => {
          for (let R = 1; R <= range.e.r; R++) {
            const cell_address = XLSX.utils.encode_cell({ r: R, c: 4 });
            const cell = worksheet[cell_address];
            if (cell && cell.v) {
              if (cell.v === 'Tardanza') cell.s = { font: { bold: true, color: { rgb: "D97706" } } };
              else if (cell.v === 'Falta') cell.s = { font: { bold: true, color: { rgb: "DC2626" } } };
              else if (cell.v === 'Presente') cell.s = { font: { bold: true, color: { rgb: "15803D" } } };
            }
          }
        }
      });
    } else if (formato === 'PDF') {
      await exportarPDF({
        columnas: ['Fecha', 'DNI', 'Empleado', 'Área/Depto', 'Estado', 'Entrada', 'Salida'],
        filas: dataToExport.map((fila: any) => [fila.fecha, fila.dni || '-', fila.empleado, fila.cargo, fila.estado, fila.hora_entrada, fila.hora_salida]),
        nombreArchivo: `Reporte_Fechas_${fechaInicio}`,
        titulo: 'Reporte General por Fechas',
        subtitulos: [
          `Período: ${fechaInicio} al ${fechaFin || 'Fin'}`,
          `Área: ${area}`
        ]
      });
    } else {
      setToast({ message: 'La exportación en formato Documento Genérico aún está en construcción. Por favor, seleccione PDF o Excel.', type: 'info' });
    }
  };

  return (
    <div className="w-full">
      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Generar Reporte por Fechas</h1>
            <p className="text-gray-500 mt-2">Seleccione los filtros para configurar la exportación de su reporte.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 1. Inputs de Fechas */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Rango de Fechas</h2>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Inicio</label>
                    <input 
                      type="date" 
                      value={fechaInicio}
                      onChange={(e) => {
                        setFechaInicio(e.target.value);
                        if (fechaFin && e.target.value > fechaFin) {
                          setFechaFin(e.target.value);
                        }
                      }}
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800 bg-white" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Fin</label>
                    <input 
                      type="date"
                      value={fechaFin}
                      min={fechaInicio}
                      onChange={(e) => setFechaFin(e.target.value)} 
                      className="w-full p-3 md:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800 bg-white" 
                    />
                  </div>
                </div>
              </div>
              
              {/* 2. Botones de Filtro Rápidos */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Filtros Rápidos</h2>
                <div className="grid grid-cols-2 gap-3 h-[76px] items-end">
                  <button type="button" onClick={() => handleFiltroRapido('hoy')} className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors duration-200 border border-gray-200">Hoy</button>
                  <button type="button" onClick={() => handleFiltroRapido('semana')} className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors duration-200 border border-gray-200">Esta semana</button>
                  <button type="button" onClick={() => handleFiltroRapido('mes')} className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors duration-200 border border-gray-200">Este mes</button>
                  <button type="button" onClick={() => handleFiltroRapido('5meses')} className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors duration-200 border border-gray-200">Últimos 5 meses</button>
                </div>
              </div>
            </div>

            {/* 3. Select Ancho Área/Departamento */}
            <div className="space-y-3">
               <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Área / Departamentos</label>
               {loadingAreas ? (
                 <div className="w-full p-4 h-[58px] border border-gray-300 rounded-xl bg-gray-100 animate-pulse"></div>
               ) : (
                 <select 
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800 bg-white cursor-pointer"
                 >
                   {listaCargos.map((cargo) => (
                     <option key={cargo} value={cargo}>{cargo === 'Todos' ? 'Todos los departamentos' : cargo}</option>
                   ))}
                 </select>
               )}
            </div>

            {/* 4. Tarjetas de Exportación */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Formato de Exportación</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button 
                  onClick={() => setFormato('PDF')}
                  className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all duration-200 ${formato === 'PDF' ? 'border-red-500 bg-red-50 text-red-700 shadow-md scale-[1.02]' : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50 text-gray-500 shadow-sm'}`}>
                  <img src="/PDF.ico" alt="PDF" className="w-14 h-14 object-contain" />
                  <span className="font-bold tracking-wide">Documento PDF</span>
                </button>
                
                <button 
                  onClick={() => setFormato('DOC')}
                  className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all duration-200 ${formato === 'DOC' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-[1.02]' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 text-gray-500 shadow-sm'}`}>
                  <File size={56} strokeWidth={1.5} className={formato === 'DOC' ? 'text-blue-600' : 'text-gray-400'} />
                  <span className="font-bold tracking-wide">Documento Genérico</span>
                </button>

                <button 
                  onClick={() => setFormato('EXCEL')}
                  className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all duration-200 ${formato === 'EXCEL' ? 'border-green-500 bg-green-50 text-green-700 shadow-md scale-[1.02]' : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50 text-gray-500 shadow-sm'}`}>
                  <img src="/excel.ico" alt="Excel" className="w-14 h-14 object-contain" />
                  <span className="font-bold tracking-wide">Formato EXCEL</span>
                </button>
              </div>
            </div>

            {/* 5. Cajas de Solo Lectura (Resumen) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-center items-start">
                <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Periodo Seleccionado</span>
                <span className="text-lg font-bold text-slate-800">{fechaInicio && fechaFin ? `${fechaInicio} al ${fechaFin}` : 'Sin definir'}</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-center items-start">
                <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Total de Registros</span>
                <span className="text-xl font-black text-slate-800">{resultados ? resultados.length : '--'}</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-center items-start">
                <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Empleados Incluidos</span>
                <span className="text-xl font-black text-slate-800">{resultados ? new Set(resultados.map(r => r.empleado)).size : '--'}</span>
              </div>
            </div>

            {/* 6. Botones Finales (Acciones) */}
            <div className="flex flex-col md:flex-row justify-end items-center gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => { setFechaInicio(''); setFechaFin(''); setArea('Todos'); setFormato('PDF'); setResultados(null); }}
                className="w-full md:w-auto px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors duration-200"
              >
                Limpiar Filtros
              </button>
              <button 
                type="button"
                onClick={handleGenerarVistaPrevia}
                disabled={loading || !fechaInicio}
                className={`w-full md:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm transition-colors duration-200 ${(loading || !fechaInicio) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Cargando...' : 'Vista Previa'}
              </button>
              <button 
                type="button"
                onClick={handleDescargar}
                disabled={loading || !fechaInicio}
                className={`w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm transition-colors duration-200 flex items-center justify-center gap-2 ${(loading || !fechaInicio) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {formato === 'PDF' && <img src="/PDF.ico" alt="PDF" className="w-5 h-5 object-contain" />}
                {formato === 'EXCEL' && <img src="/excel.ico" alt="Excel" className="w-5 h-5 object-contain" />}
                Generar Reporte
              </button>
            </div>

            {/* 7. Tabla de Vista Previa */}
            {loading ? (
              <div className="pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Vista Previa de Datos</h3>
                <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                        <th className="p-4 font-semibold whitespace-nowrap">Fecha</th>
                        <th className="p-4 font-semibold whitespace-nowrap">DNI</th>
                        <th className="p-4 font-semibold whitespace-nowrap">Empleado</th>
                        <th className="p-4 font-semibold whitespace-nowrap">Área/Depto</th>
                        <th className="p-4 font-semibold whitespace-nowrap text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-50 transition-colors">
                          {[...Array(5)].map((_, j) => (
                            <td key={j} className="p-4">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : resultados !== null && (
              <div className="pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Vista Previa de Datos</h3>
                <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                        <th className="p-4 font-semibold whitespace-nowrap">Fecha</th>
                        <th className="p-4 font-semibold whitespace-nowrap">DNI</th>
                        <th className="p-4 font-semibold whitespace-nowrap">Empleado</th>
                        <th className="p-4 font-semibold whitespace-nowrap">Área/Depto</th>
                        <th className="p-4 font-semibold whitespace-nowrap text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {resultados.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center">
                            <EmptyState icon={Inbox} title="Sin resultados" description="No se encontraron registros para estos filtros." />
                          </td>
                        </tr>
                      ) : (
                        resultados.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-sm whitespace-nowrap">{row.fecha}</td>
                            <td className="p-4 text-sm whitespace-nowrap">{row.dni || '-'}</td>
                            <td className="p-4 font-medium whitespace-nowrap">{row.empleado}</td>
                            <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{row.cargo}</td>
                            <td className="p-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${row.estado === 'Presente' ? 'bg-green-50 text-green-700' : row.estado === 'Tardanza' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                                {row.estado}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {resultados.length > 10 && (
                    <div className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50 border-t border-gray-200">
                      Mostrando los primeros 10 de {resultados.length} registros. Genere el reporte completo para exportarlos todos.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
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