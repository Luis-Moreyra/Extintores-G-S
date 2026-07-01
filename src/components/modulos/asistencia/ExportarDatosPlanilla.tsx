/**
 * @file ExportarDatosPlanilla.tsx
 * @description Componente de interfaz de usuario correspondiente a la consolidación y exportación de datos de asistencias para el cálculo de planilla.
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
  FileSpreadsheet, 
  FileJson, 
  CheckCircle, 
  Clock, 
  XCircle, 
  CalendarDays,
  Inbox,
  Search
} from 'lucide-react';
import { buscarAsistencias } from '@/controllers/asistencia.controller';
import { obtenerTodasLasAreas } from '@/controllers/empleado.controller';
import { exportarExcel, exportarPDF } from '@/lib/exportUtils';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function ExportarDatosPlanilla() {
  const [periodo, setPeriodo] = useState('Mensual');
  const [quincena, setQuincena] = useState('1');
  const [mes, setMes] = useState('Enero');
  const [anio, setAnio] = useState('2026');
  const [area, setArea] = useState('Todos');
  const [formato, setFormato] = useState('EXCEL');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  const camposDisponibles = [
    'Código', 
    'Nombre Completo', 
    'Área', 
    'Fecha', 
    'Hora Entrada/Salida', 
    'Horas Trabajadas'
  ];
  const [camposSeleccionados, setCamposSeleccionados] = useState<string[]>(camposDisponibles);

  const [listaCargos, setListaCargos] = useState<string[]>(['Todos']);
  const [loadingAreas, setLoadingAreas] = useState(true);

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

  // Estados para los datos de la base de datos
  const [resultados, setResultados] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [metricas, setMetricas] = useState({
    diasLaborables: 0,
    totalEmpleados: 0,
    registrosProcesados: 0,
    tardanzas: 0,
    ausencias: 0,
    asistencias: 0,
    asistenciasPorcentaje: 0
  });

  const mesesMap: { [key: string]: number } = {
    'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
    'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
  };

  const handleToggleCampo = (campo: string) => {
    setCamposSeleccionados(prev => 
      prev.includes(campo) ? prev.filter(c => c !== campo) : [...prev, campo]
    );
  };
  
  // Función auxiliar para calcular horas trabajadas
  const calcularTotalHoras = (entrada: string, salida: string) => {
    if (!entrada || !salida || entrada === '-' || salida === '-') return '-';
    const [hE, mE] = entrada.split(':').map(Number);
    const [hS, mS] = salida.split(':').map(Number);
    let minutosTotal = (hS * 60 + mS) - (hE * 60 + mE);
    if (minutosTotal < 0) minutosTotal += 24 * 60; 
    const horas = Math.floor(minutosTotal / 60);
    const minutos = minutosTotal % 60;
    return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
  };

  const handleVistaPrevia = async () => {
    setLoading(true);
    
    // 1. Calcular el primer y último día del mes seleccionado
    const monthIndex = mesesMap[mes];
    const yearNum = parseInt(anio);
    
    let startDate: Date;
    let endDate: Date;

    if (periodo === 'Mensual') {
      startDate = new Date(yearNum, monthIndex, 1);
      endDate = new Date(yearNum, monthIndex + 1, 0);
    } else if (quincena === '1') {
      startDate = new Date(yearNum, monthIndex, 1);
      endDate = new Date(yearNum, monthIndex, 15);
    } else {
      startDate = new Date(yearNum, monthIndex, 16);
      endDate = new Date(yearNum, monthIndex + 1, 0);
    }

    const formatDate = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // 2. Traer datos de la base de datos
    const res = await buscarAsistencias('', formatDate(startDate), formatDate(endDate));
    
    if (res.success) {
      let data = res.data;
      if (area !== 'Todos') {
        data = data.filter((row: any) => row.cargo === area);
      }
      
      setResultados(data);

      // 3. Procesar las métricas de la tabla
      const asistencias = data.filter((r: any) => r.estado === 'Presente').length;
      const tardanzas = data.filter((r: any) => r.estado === 'Tardanza').length;
      const ausencias = data.filter((r: any) => r.estado === 'Ausente').length;
      const total = asistencias + tardanzas + ausencias;
      
      const uniqueEmpleados = new Set(data.map((r: any) => r.empleado)).size;
      const uniqueDias = new Set(data.map((r: any) => r.fecha)).size;
      const porcentaje = total > 0 ? Math.round((asistencias / total) * 100) : 0;

      setMetricas({
        diasLaborables: uniqueDias,
        totalEmpleados: uniqueEmpleados,
        registrosProcesados: data.length,
        tardanzas,
        ausencias,
        asistencias,
        asistenciasPorcentaje: porcentaje
      });
    } else {
      setToast({ message: res.message || 'Error al obtener datos', type: 'error' });
      setResultados([]);
    }
    setLoading(false);
  };

  const handleLimpiarFiltros = () => {
    setResultados(null);
    setMetricas({ diasLaborables: 0, totalEmpleados: 0, registrosProcesados: 0, tardanzas: 0, ausencias: 0, asistencias: 0, asistenciasPorcentaje: 0 });
    setMes('Enero');
    setAnio('2026');
    setArea('Todos');
    setPeriodo('Mensual');
    setQuincena('1');
    setCamposSeleccionados(camposDisponibles);
  };

  const handleGenerarReporte = async () => {
    // Si el usuario da a exportar sin generar vista previa, generamos la data primero
    if (!resultados) {
      await handleVistaPrevia();
      setToast({ message: 'Se han cargado los datos. Por favor revise la Vista Previa y vuelva a presionar Generar Reporte.', type: 'info' });
      return;
    }

    if (resultados.length === 0) {
      setToast({ message: 'No hay datos para exportar en este periodo.', type: 'warning' });
      return;
    }

    // Filtrar columnas basadas en los checkboxes
    const datosExportar = resultados.map((row: any) => {
      const r: any = {};
      camposSeleccionados.forEach(campo => {
        switch(campo) {
          case 'Código': r['Código'] = row.dni || '-'; break;
          case 'Nombre Completo': r['Nombre Completo'] = row.empleado; break;
          case 'Área': r['Área'] = row.cargo; break;
          case 'Fecha': r['Fecha'] = row.fecha; break;
          case 'Hora Entrada/Salida': r['Hora Entrada/Salida'] = `${row.hora_entrada} - ${row.hora_salida}`; break;
          case 'Horas Trabajadas': r['Horas Trabajadas'] = calcularTotalHoras(row.hora_entrada, row.hora_salida); break;
        }
      });
      return r;
    });

    const fileName = `Planilla_${mes}_${anio}${periodo === 'Quincenal' ? `_Q${quincena}` : ''}`;

    if (formato === 'CSV') {
      const csvContent = [
        camposSeleccionados.join(','),
        ...datosExportar.map(row => camposSeleccionados.map(c => `"${row[c]}"`).join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName}.csv`);
      link.click();
    } else if (formato === 'EXCEL') {
      await exportarExcel({
        datos: datosExportar,
        nombreArchivo: fileName,
        nombreHoja: "Planilla"
      });
    } else if (formato === 'PDF') {
      await exportarPDF({
        columnas: camposSeleccionados,
        filas: datosExportar.map((row: any) => camposSeleccionados.map(campo => row[campo])),
        nombreArchivo: fileName,
        titulo: `Reporte Consolidado de Planilla - ${mes} ${anio}${periodo === 'Quincenal' ? ` (Q${quincena})` : ''}`
      });
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-300">
      
      {/* Encabezado */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
          Exportar para datos de planilla
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          Configure los parámetros para generar el reporte consolidado de nómina.
        </p>
      </div>

      {/* Cuerpo Superior (3 Columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna 1: Configuración */}
        <div className="space-y-5 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Configuración</h3>
          
          <div className="flex p-1 bg-gray-200 rounded-lg border border-gray-300">
            <button 
              onClick={() => setPeriodo('Mensual')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${periodo === 'Mensual' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Mensual
            </button>
            <button 
              onClick={() => setPeriodo('Quincenal')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${periodo === 'Quincenal' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Quincenal
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1.5">Mes</label>
              <select value={mes} onChange={(e) => setMes(e.target.value)} className="bg-white border border-gray-300 text-gray-800 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all">
                {Object.keys(mesesMap).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1.5">Año</label>
              <select value={anio} onChange={(e) => setAnio(e.target.value)} className="bg-white border border-gray-300 text-gray-800 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all">
                {['2024', '2025', '2026'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {periodo === 'Quincenal' && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1.5">Quincena</label>
              <select value={quincena} onChange={(e) => setQuincena(e.target.value)} className="bg-white border border-gray-300 text-gray-800 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all">
                <option value="1">1ra Quincena (Días 1 - 15)</option>
                <option value="2">2da Quincena (Día 16 - Fin de mes)</option>
              </select>
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1.5">Área / Departamentos</label>
            {loadingAreas ? (
              <div className="w-full p-2.5 h-[42px] border border-gray-300 rounded-lg bg-gray-100 animate-pulse"></div>
            ) : (
              <select value={area} onChange={(e) => setArea(e.target.value)} className="bg-white border border-gray-300 text-gray-800 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all">
                {listaCargos.map((cargo) => (
                  <option key={cargo} value={cargo}>{cargo === 'Todos' ? 'Todos los departamentos' : cargo}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Columna 2: Parámetros */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Parámetros del Periodo</h3>
          <table className="w-full text-sm text-left border-collapse border border-gray-200 rounded-lg overflow-hidden bg-white">
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <th className="font-medium text-gray-600 p-3 border-r border-gray-200">Días Laborables</th>
                <td className="p-3 text-gray-800 font-semibold">{resultados ? metricas.diasLaborables : '--'}</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <th className="font-medium text-gray-600 p-3 border-r border-gray-200">Total empleados</th>
                <td className="p-3 text-gray-800 font-semibold">{resultados ? metricas.totalEmpleados : '--'}</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <th className="font-medium text-gray-600 p-3 border-r border-gray-200">Registros procesados</th>
                <td className="p-3 text-gray-800 font-semibold">{resultados ? metricas.registrosProcesados : '--'}</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <th className="font-medium text-gray-600 p-3 border-r border-gray-200">Eventos de Tardanza</th>
                <td className="p-3 text-yellow-600 font-semibold">{resultados ? metricas.tardanzas : '--'}</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <th className="font-medium text-gray-600 p-3 border-r border-gray-200">Asistencias totales</th>
                <td className="p-3 text-green-600 font-semibold">{resultados ? `${metricas.asistenciasPorcentaje}%` : '--'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Columna 3: Exportación */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Formato</h3>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setFormato('PDF')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${formato === 'PDF' ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-red-300 hover:bg-red-50/50'}`}>
                <img src="/PDF.ico" alt="PDF" className="w-8 h-8 object-contain" />
                <span className="text-xs font-semibold">PDF</span>
              </button>
              <button onClick={() => setFormato('EXCEL')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${formato === 'EXCEL' ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-green-300 hover:bg-green-50/50'}`}>
                <img src="/excel.ico" alt="Excel" className="w-8 h-8 object-contain" />
                <span className="text-xs font-semibold">Excel</span>
              </button>
              <button onClick={() => setFormato('CSV')} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${formato === 'CSV' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:bg-blue-50/50'}`}>
                <FileJson size={32} strokeWidth={1.5} />
                <span className="text-xs font-semibold">CSV</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleLimpiarFiltros}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl border border-gray-200 transition-colors"
              >
                Limpiar Filtros
              </button>
              <button 
                onClick={handleVistaPrevia}
                disabled={loading}
                className={`py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? 'Cargando...' : 'Vista Previa'}
              </button>
            </div>
            <button 
              onClick={handleGenerarReporte}
              disabled={loading}
              className={`w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}
            >
              {formato === 'PDF' && <img src="/PDF.ico" alt="PDF" className="w-5 h-5 object-contain" />}
              {formato === 'EXCEL' && <img src="/excel.ico" alt="Excel" className="w-5 h-5 object-contain" />}
              Generar Reporte
            </button>
          </div>
        </div>

      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        {/* Cuerpo Inferior: KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
            <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Asistencias</p><p className="text-xl font-bold text-gray-800 mt-0.5">{resultados ? metricas.asistencias : '--'}</p></div>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Clock size={24} /></div>
            <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tardanzas</p><p className="text-xl font-bold text-gray-800 mt-0.5">{resultados ? metricas.tardanzas : '--'}</p></div>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg"><XCircle size={24} /></div>
            <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ausencias</p><p className="text-xl font-bold text-gray-800 mt-0.5">{resultados ? metricas.ausencias : '--'}</p></div>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><CalendarDays size={24} /></div>
            <div><p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total de días</p><p className="text-xl font-bold text-gray-800 mt-0.5">{resultados ? metricas.diasLaborables : '--'}</p></div>
          </div>
        </div>

        {/* Checkboxes de Campos */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Campos para incluir</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {camposDisponibles.map((campo) => (
              <label key={campo} className="flex items-center space-x-3 cursor-pointer group hover:opacity-80">
                <input 
                  type="checkbox" 
                  checked={camposSeleccionados.includes(campo)} 
                  onChange={() => handleToggleCampo(campo)} 
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 cursor-pointer" 
                />
                <span className="text-sm font-medium text-gray-700">{campo}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Vista Previa (Tabla dinámica) */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">Vista Previa de Datos</h3>
        {resultados === null && !loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50 border border-gray-200 rounded-xl border-dashed">
            <EmptyState icon={Search} title="Listo para generar reporte" description='Seleccione los filtros, marque las columnas deseadas y presione "Vista Previa".' />
          </div>
        ) : loading ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                  {camposDisponibles.map(campo => (
                    camposSeleccionados.includes(campo) && (
                      <th key={campo} className="p-4 font-semibold whitespace-nowrap">{campo}</th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 transition-colors">
                    {camposDisponibles.map(campo => (
                      camposSeleccionados.includes(campo) && (
                        <td key={campo} className="p-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                        </td>
                      )
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                  {camposDisponibles.map(campo => (
                    camposSeleccionados.includes(campo) && (
                      <th key={campo} className="p-4 font-semibold whitespace-nowrap">{campo}</th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {!resultados || resultados.length === 0 ? (
                  <tr>
                    <td colSpan={camposSeleccionados.length} className="p-12 text-center">
                      <EmptyState icon={Inbox} title="Sin resultados" description="No se encontraron registros para los filtros seleccionados." />
                    </td>
                  </tr>
                ) : (
                  resultados.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      {camposDisponibles.map(campo => {
                        if (!camposSeleccionados.includes(campo)) return null;
                        switch(campo) {
                          case 'Código': return <td key={campo} className="p-4 text-sm whitespace-nowrap">{row.dni || '-'}</td>;
                          case 'Nombre Completo': return <td key={campo} className="p-4 font-medium whitespace-nowrap">{row.empleado}</td>;
                          case 'Área': return <td key={campo} className="p-4 text-sm text-gray-500 whitespace-nowrap">{row.cargo}</td>;
                          case 'Fecha': return <td key={campo} className="p-4 text-sm whitespace-nowrap">{row.fecha}</td>;
                          case 'Hora Entrada/Salida': return <td key={campo} className="p-4 text-center font-mono text-sm whitespace-nowrap">{row.hora_entrada} - {row.hora_salida || '-'}</td>;
                          case 'Horas Trabajadas': return <td key={campo} className="p-4 text-center font-mono text-sm font-semibold whitespace-nowrap text-slate-700">{calcularTotalHoras(row.hora_entrada, row.hora_salida)}</td>;
                          default: return null;
                        }
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {resultados && resultados.length > 10 && (
              <div className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50 border-t border-gray-200">
                Mostrando los primeros 10 de {resultados.length} registros. Genere el reporte completo para exportarlos todos.
              </div>
            )}
          </div>
        )}
      </div>
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