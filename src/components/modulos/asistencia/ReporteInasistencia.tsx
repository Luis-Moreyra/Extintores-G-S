/**
 * @file ReporteInasistencia.tsx
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

import { useState, useEffect } from 'react';
import { buscarAsistencias } from '@/controllers/asistencia.controller';
import { obtenerTodasLasAreas } from '@/controllers/empleado.controller';
import { Search, Inbox } from 'lucide-react';
import { exportarExcel, exportarPDF } from '@/lib/exportUtils';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function ReporteInasistencia({ initialParams }: { initialParams?: any }) {
  const [formatoReporte, setFormatoReporte] = useState(initialParams?.formato || 'PDF');
  const [fechaInicio, setFechaInicio] = useState(initialParams?.fechaInicio || '');
  const [fechaFin, setFechaFin] = useState(initialParams?.fechaFin || '');
  const [nombreCompleto, setNombreCompleto] = useState(initialParams?.empleado || '');
  const [area, setArea] = useState(initialParams?.area || 'Todos');

  const [tipoInasistencia, setTipoInasistencia] = useState(initialParams?.tipoInasistencia || 'Todas'); // Todas, Solo Tardanzas, Solo Ausencias
  const [resumenActivo, setResumenActivo] = useState(''); // totalAusencias, totalTardanzas, empleadosAfectados

  const [resultados, setResultados] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
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

  useEffect(() => {
    if (initialParams) {
      if (initialParams.formato) setFormatoReporte(initialParams.formato);
      if (initialParams.empleado) setNombreCompleto(initialParams.empleado);
      if (initialParams.area) setArea(initialParams.area);
      if (initialParams.fechaInicio) setFechaInicio(initialParams.fechaInicio);
      if (initialParams.fechaFin) setFechaFin(initialParams.fechaFin);
      if (initialParams.tipoInasistencia) setTipoInasistencia(initialParams.tipoInasistencia);
    }
  }, [initialParams]);

  // Cálculos para los botones de resumen
  const countAusencias = resultados ? resultados.filter((r) => r.estado === 'Falta').length : 0;
  const countTardanzas = resultados ? resultados.filter((r) => r.estado === 'Tardanza').length : 0;
  const countEmpleados = resultados ? new Set(resultados.map((r) => r.empleado)).size : 0;

  // Filtramos localmente los resultados según el botón de resumen que esté activo
  const resultadosFiltrados = resultados === null ? null : resultados.filter((row) => {
    if (resumenActivo === 'totalAusencias') return row.estado === 'Falta';
    if (resumenActivo === 'totalTardanzas') return row.estado === 'Tardanza';
    // Si es 'empleadosAfectados' o no hay resumen activo, mostramos todos los resultados actuales
    return true;
  });

  const handleLimpiarFiltros = () => {
    setNombreCompleto('');
    setArea('Todos');
    setFechaInicio('');
    setFechaFin('');
    setTipoInasistencia('Todas');
    setResumenActivo('');
    setResultados(null);
  };

  const handleGenerarVistaPrevia = async () => {
    setLoading(true);
    setResumenActivo(''); // Reiniciamos el filtro de resumen
    
    const res = await buscarAsistencias(nombreCompleto, fechaInicio, fechaFin);
    if (res.success) {
      let data = res.data;
      if (area !== 'Todos') {
        data = data.filter((row: any) => row.cargo === area);
      }

      // Filtrar por tipo de inasistencia
      if (tipoInasistencia === 'Solo Tardanzas') {
        data = data.filter((row: any) => row.estado === 'Tardanza');
      } else if (tipoInasistencia === 'Solo Ausencias') {
        data = data.filter((row: any) => row.estado === 'Falta');
      } else { // 'Todas'
        data = data.filter((row: any) => row.estado === 'Tardanza' || row.estado === 'Falta');
      }
      
      setResultados(data);
    } else {
      setToast({ message: res.message || 'Error al obtener datos', type: 'error' });
      setResultados([]);
    }
    setLoading(false);
  };

  const handleDescargar = async () => {
    if (!resultadosFiltrados || resultadosFiltrados.length === 0) {
      setToast({ message: 'No hay datos para exportar. Por favor, genere la vista previa primero.', type: 'warning' });
      return;
    }

    // Preparar los datos a exportar según lo que se está mostrando en pantalla
    const datosExportar = resultadosFiltrados.map((row) => ({
      'Fecha': row.fecha,
      'DNI': row.dni || '-',
      'Empleado': row.empleado,
      'Área/Depto': row.cargo,
      'Estado': row.estado,
      'Observaciones': row.observaciones || '-'
    }));

    const nombreArchivo = `Reporte_Inasistencias_${fechaInicio || 'Historial'}`;

    if (formatoReporte === 'Excel') {
      await exportarExcel({
        datos: datosExportar,
        nombreArchivo,
        nombreHoja: "Inasistencias",
        configuracionColumnas: [
          { wch: 15 }, // Fecha
          { wch: 15 }, // DNI
          { wch: 35 }, // Empleado
          { wch: 25 }, // Área/Depto
          { wch: 15 }, // Estado
          { wch: 30 }  // Observaciones
        ],
        estilosCeldasAdicionales: (worksheet, range, XLSX) => {
          // Estilos dinámicos para el estado (Tardanza en naranja, Falta en rojo)
          for (let R = 1; R <= range.e.r; R++) {
            const cell_address = XLSX.utils.encode_cell({ r: R, c: 4 }); // La columna "Estado" es la de índice 4
            const cell = worksheet[cell_address];
            if (cell && cell.v) {
              if (cell.v === 'Tardanza') {
                cell.s = { font: { bold: true, color: { rgb: "D97706" } } }; // Naranja
              } else if (cell.v === 'Falta') {
                cell.s = { font: { bold: true, color: { rgb: "DC2626" } } }; // Rojo
              }
            }
          }
        }
      });
    } else {
      const filtros = [];
      if (tipoInasistencia !== 'Todas') filtros.push(`Filtro Base: ${tipoInasistencia}`);
      if (resumenActivo === 'totalAusencias') filtros.push('Vista Activa: Solo Ausencias');
      if (resumenActivo === 'totalTardanzas') filtros.push('Vista Activa: Solo Tardanzas');

      await exportarPDF({
        columnas: Object.keys(datosExportar[0]),
        filas: datosExportar.map(fila => Object.values(fila)),
        nombreArchivo,
        titulo: 'Reporte de Inasistencias',
        subtitulos: [
          (fechaInicio || fechaFin) ? `Período: ${fechaInicio || 'Inicio'} al ${fechaFin || 'Fin'}` : '',
          filtros.length > 0 ? filtros.join(' | ') : ''
        ]
      });
    }
  };

  const handleToggleResumen = (tipo: string) => {
    if (resumenActivo === tipo) {
      setResumenActivo(''); // Desactivar si se vuelve a hacer clic en el mismo
    } else {
      setResumenActivo(tipo);
    }
  };

  const columnasTabla = [
    { id: 'fecha', label: 'Fecha' },
    { id: 'dni', label: 'DNI' },
    { id: 'empleado', label: 'Empleado' },
    { id: 'cargo', label: 'Área/Depto' },
    { id: 'estado', label: 'Estado' },
    { id: 'observaciones', label: 'Observaciones' },
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado y Selección de Formato */}
      <div className="flex flex-col md:flex-row justify-start items-center gap-4 border-b border-gray-200 pb-6">
        <h2 className="text-xl font-bold text-gray-800 md:mr-4">
          Generar Reporte de Inasistencia
        </h2>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setFormatoReporte('PDF')}
            className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg transition-all duration-200 shadow-sm ${formatoReporte === 'PDF' ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <img src="/PDF.ico" alt="PDF" className="w-5 h-5" />
            <span className="text-sm font-semibold text-gray-700">PDF</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setFormatoReporte('Excel')}
            className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg transition-all duration-200 shadow-sm ${formatoReporte === 'Excel' ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <img src="/excel.ico" alt="Excel" className="w-5 h-5" />
            <span className="text-sm font-semibold text-gray-700">Excel</span>
          </button>

          <button 
            type="button" 
            onClick={handleDescargar}
            className={`${formatoReporte === 'Excel' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors duration-200 flex items-center gap-2 ml-2`}
          >
            {formatoReporte === 'Excel' ? (
              <img src="/excel.ico" alt="Excel" className="w-4 h-4 object-contain" />
            ) : (
              <img src="/PDF.ico" alt="PDF" className="w-4 h-4 object-contain" />
            )}
            Descargar
          </button>
        </div>
      </div>

      {/* Filtros del Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1.5">Nombre Completo</label>
          <input type="text" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} placeholder="Dejar en blanco para todos" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1.5">Área/Departamento</label>
          {loadingAreas ? (
            <div className="w-full p-3 h-[50px] border border-gray-300 rounded-lg bg-gray-100 animate-pulse"></div>
          ) : (
            <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800 bg-white">
              {listaCargos.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1.5">Fecha Inicio</label>
          <input type="date" value={fechaInicio} onChange={(e) => {
            setFechaInicio(e.target.value);
            if (fechaFin && e.target.value > fechaFin) {
              setFechaFin(e.target.value);
            }
          }} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800" />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1.5">Fecha Fin</label>
          <input type="date" value={fechaFin} min={fechaInicio} onChange={(e) => setFechaFin(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800" />
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:col-span-2 lg:col-span-4 mt-2">
          <button 
            type="button"
            onClick={handleLimpiarFiltros}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg shadow-sm transition-colors duration-200"
          >
            Limpiar Filtros
          </button>
          <button 
            type="button"
            onClick={handleGenerarVistaPrevia}
            disabled={loading}
            className={`flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-sm transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Cargando...' : 'Vista Previa'}
          </button>
          <button 
            type="button"
            onClick={handleDescargar}
            className={`flex-1 ${formatoReporte === 'Excel' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-3 px-6 rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center gap-2`}
          >
            {formatoReporte === 'Excel' ? (
              <img src="/excel.ico" alt="Excel" className="w-5 h-5 object-contain" />
            ) : (
              <img src="/PDF.ico" alt="PDF" className="w-5 h-5 object-contain" />
            )}
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Tipos de Inasistencia y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Tipos de Inasistencia</h3>
          <div className="flex flex-col space-y-3">
            {['Todas', 'Solo Tardanzas', 'Solo Ausencias'].map(tipo => (
              <label key={tipo} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="tipoInasistencia"
                  value={tipo}
                  checked={tipoInasistencia === tipo}
                  onChange={(e) => setTipoInasistencia(e.target.value)}
                  className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <span className="text-gray-700 font-medium">{tipo}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Resumen</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handleToggleResumen('totalAusencias')}
              className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl font-bold shadow-sm transition-all text-xs ${resumenActivo === 'totalAusencias' ? 'bg-red-600 text-white ring-2 ring-red-100 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <img src="/Cross.ico" alt="Ausencias" className="w-6 h-6" />
              <span>Total Ausencias: {countAusencias}</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleResumen('totalTardanzas')}
              className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl font-bold shadow-sm transition-all text-xs ${resumenActivo === 'totalTardanzas' ? 'bg-yellow-500 text-white ring-2 ring-yellow-100 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <img src="/reloj.ico" alt="Tardanzas" className="w-6 h-6" />
              <span>Total Tardanzas: {countTardanzas}</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleResumen('empleadosAfectados')}
              className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl font-bold shadow-sm transition-all text-xs ${resumenActivo === 'empleadosAfectados' ? 'bg-slate-800 text-white ring-2 ring-slate-200 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <img src="/person.ico" alt="Empleados" className="w-6 h-6" />
              <span>Empleados Afectados: {countEmpleados}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vista Previa (Tabla) */}
      {resultadosFiltrados === null && !loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50 border border-gray-200 rounded-xl border-dashed">
          <EmptyState icon={Search} title="Listo para generar reporte" description='Seleccione los filtros y presione "Generar Vista Previa".' />
        </div>
      ) : loading ? (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                {columnasTabla.map(col => (
                  <th key={col.id} className="p-4 font-semibold whitespace-nowrap">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50 transition-colors">
                  {columnasTabla.map(col => (
                    <td key={col.id} className="p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : resultadosFiltrados !== null && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                {columnasTabla.map(col => (
                  <th key={col.id} className="p-4 font-semibold whitespace-nowrap">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {resultadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={columnasTabla.length} className="p-12 text-center">
                    <EmptyState icon={Inbox} title="Sin resultados" description="No se encontraron inasistencias para los filtros seleccionados." />
                  </td>
                </tr>
              ) : (
                resultadosFiltrados.map((row, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm whitespace-nowrap">{row.fecha}</td>
                    <td className="p-4 text-sm">{row.dni || '-'}</td>
                    <td className="p-4 font-medium whitespace-nowrap">{row.empleado}</td>
                    <td className="p-4 text-sm text-gray-500">{row.cargo}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${row.estado === 'Tardanza' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                        {row.estado}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{row.observaciones}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
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