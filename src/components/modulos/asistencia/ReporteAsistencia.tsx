/**
 * @file ReporteAsistencia.tsx
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
import EmptyState from '@/components/ui/EmptyState';
import { exportarExcel, exportarPDF } from '@/lib/exportUtils';
import Toast from '@/components/ui/Toast';

// Función auxiliar para calcular el tiempo transcurrido
const calcularTotalHoras = (entrada: string, salida: string) => {
  if (!entrada || !salida || entrada === '-' || salida === '-') return '-';
  const [hE, mE] = entrada.split(':').map(Number);
  const [hS, mS] = salida.split(':').map(Number);
  let minutosTotal = (hS * 60 + mS) - (hE * 60 + mE);
  if (minutosTotal < 0) minutosTotal += 24 * 60; // Para turnos que cruzan la medianoche
  const horas = Math.floor(minutosTotal / 60);
  const minutos = minutosTotal % 60;
  return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
};

// Función auxiliar para validar si trabajó menos de 8 horas (480 minutos)
const esMenorA8Horas = (entrada: string, salida: string) => {
  if (!entrada || !salida || entrada === '-' || salida === '-') return false;
  const [hE, mE] = entrada.split(':').map(Number);
  const [hS, mS] = salida.split(':').map(Number);
  let minutosTotal = (hS * 60 + mS) - (hE * 60 + mE);
  if (minutosTotal < 0) minutosTotal += 24 * 60;
  return minutosTotal < 480; 
};

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function ReporteAsistencia({ initialParams }: { initialParams?: any }) {
  const [formatoReporte, setFormatoReporte] = useState(initialParams?.formato || 'PDF');
  const [fechaInicio, setFechaInicio] = useState(initialParams?.fechaInicio || '');
  const [fechaFin, setFechaFin] = useState(initialParams?.fechaFin || '');
  const [nombreCompleto, setNombreCompleto] = useState(initialParams?.empleado || '');
  const [area, setArea] = useState(initialParams?.area || 'Todos');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const camposDisponibles = [
    { id: 'fecha', label: 'Fecha' },
    { id: 'dni', label: 'DNI' },
    { id: 'empleado', label: 'Empleado' },
    { id: 'area', label: 'Área/Depto' },
    { id: 'hora_entrada', label: 'Hora de Entrada' },
    { id: 'hora_salida', label: 'Hora de Salida' },
    { id: 'total_horas', label: 'Total Horas' },
    { id: 'estado', label: 'Estado' },
    { id: 'observaciones', label: 'Observaciones' }
  ];

  const [columnasSeleccionadas, setColumnasSeleccionadas] = useState<string[]>(
    camposDisponibles.map(c => c.id)
  );

  const [resultados, setResultados] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialParams) {
      if (initialParams.formato) setFormatoReporte(initialParams.formato);
      if (initialParams.empleado) setNombreCompleto(initialParams.empleado);
      if (initialParams.area) setArea(initialParams.area);
      if (initialParams.fechaInicio) setFechaInicio(initialParams.fechaInicio);
      if (initialParams.fechaFin) setFechaFin(initialParams.fechaFin);
    }
  }, [initialParams]);

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

  const handleCheckboxChange = (id: string) => {
    setColumnasSeleccionadas(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleLimpiarFiltros = () => {
    setNombreCompleto('');
    setArea('Todos');
    setFechaInicio('');
    setFechaFin('');
    setResultados(null);
    setColumnasSeleccionadas(camposDisponibles.map(c => c.id));
  };

  const handleGenerarVistaPrevia = async () => {
    setLoading(true);
    const res = await buscarAsistencias(nombreCompleto, fechaInicio, fechaFin);
    if (res.success) {
      let data = res.data;
      if (area !== 'Todos') {
        data = data.filter((row: any) => row.cargo === area);
      }

      // Filtrar para mostrar únicamente las Asistencias (omitir Tardanzas y Ausencias)
      data = data.filter((row: any) => row.estado === 'Presente');
      
      setResultados(data);
    } else {
      setToast({ message: res.message || 'Error al obtener datos', type: 'error' });
      setResultados([]);
    }
    setLoading(false);
  };

  const handleDescargar = async () => {
    if (!resultados || resultados.length === 0) {
      setToast({ message: 'No hay datos para exportar. Por favor, genere la vista previa primero.', type: 'warning' });
      return;
    }

    // Preparar los datos filtrando exactamente las columnas que el usuario seleccionó
    const datosExportar = resultados.map((row: any) => {
      const filaExportar: any = {};
      camposDisponibles.forEach((campo) => {
        if (columnasSeleccionadas.includes(campo.id)) {
          if (campo.id === 'area') filaExportar[campo.label] = row.cargo;
          else if (campo.id === 'dni') filaExportar[campo.label] = row.dni || '-';
          else if (campo.id === 'hora_entrada') filaExportar[campo.label] = row.hora_entrada;
          else if (campo.id === 'hora_salida') filaExportar[campo.label] = row.hora_salida;
          else if (campo.id === 'total_horas') filaExportar[campo.label] = calcularTotalHoras(row.hora_entrada, row.hora_salida);
          else filaExportar[campo.label] = row[campo.id] || '-';
        }
      });
      return filaExportar;
    });

    if (formatoReporte === 'Excel') {
      const columnasActivas = camposDisponibles.filter(c => columnasSeleccionadas.includes(c.id));
      
      await exportarExcel({
        datos: datosExportar,
        nombreArchivo: `Reporte_Asistencias_${fechaInicio || 'Historial'}`,
        nombreHoja: "Asistencias",
        configuracionColumnas: columnasActivas.map(c => ({ wch: c.id === 'observaciones' ? 30 : 15 })),
        estilosCeldasAdicionales: (worksheet, range, XLSX) => {
          const idxTotalHoras = columnasActivas.findIndex(c => c.id === 'total_horas');
          if (idxTotalHoras !== -1) {
            for (let R = 1; R <= range.e.r; R++) {
              const cell_address = { c: idxTotalHoras, r: R };
              const cell = worksheet[worksheet['!ref'] ? XLSX.utils.encode_cell(cell_address) : ''];
              if (cell && cell.v && cell.v !== '-') {
                 const originalRow = resultados[R - 1];
                 const menosDe8 = originalRow ? esMenorA8Horas(originalRow.hora_entrada, originalRow.hora_salida) : false;
                 cell.s = { font: { bold: true, color: { rgb: menosDe8 ? "DC2626" : "334155" } } };
              }
            }
          }
        }
      });
    } else {
      const columnas = camposDisponibles.filter(c => columnasSeleccionadas.includes(c.id)).map(c => c.label);
      const filas = datosExportar.map(fila => columnas.map(col => fila[col]));

      await exportarPDF({
        columnas,
        filas,
        nombreArchivo: `Reporte_Asistencias_${fechaInicio || 'Historial'}`,
        titulo: 'Reporte de Asistencias',
        subtitulos: [(fechaInicio || fechaFin) ? `Período: ${fechaInicio || 'Inicio'} al ${fechaFin || 'Fin'}` : '']
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Selección de Formato (Alineados a la izquierda) */}
      <div className="flex flex-col md:flex-row justify-start items-center gap-4 border-b border-gray-200 pb-6">
        <h2 className="text-xl font-bold text-gray-800 md:mr-4">
          Generar Reporte de Asistencia
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
          <input type="text" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} placeholder="Ej. Juan Pérez..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800" />
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

      {/* Selección de Columnas para el Reporte */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Columnas a incluir en el reporte:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {camposDisponibles.map((campo) => (
            <label key={campo.id} className="flex items-center space-x-2 cursor-pointer hover:opacity-80">
              <input
                type="checkbox"
                checked={columnasSeleccionadas.includes(campo.id)}
                onChange={() => handleCheckboxChange(campo.id)}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
              />
              <span className="text-sm text-gray-800 font-medium">{campo.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Vista Previa (Tabla dinámica) */}
      {resultados === null ? (
        <div className="p-16 flex flex-col items-center justify-center text-center bg-gray-50 border border-gray-200 rounded-xl border-dashed">
          <EmptyState icon={Search} title="Listo para generar reporte" description='Seleccione los filtros, marque las columnas deseadas y presione "Generar Vista Previa".' />
        </div>
      ) : loading ? (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                {camposDisponibles.map(campo => (
                  columnasSeleccionadas.includes(campo.id) && (
                    <th key={campo.id} className="p-4 font-semibold whitespace-nowrap">{campo.label}</th>
                  )
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50 transition-colors">
                  {camposDisponibles.map(campo => (
                    columnasSeleccionadas.includes(campo.id) && (
                      <td key={campo.id} className="p-4">
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
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                {camposDisponibles.map(campo => (
                  columnasSeleccionadas.includes(campo.id) && (
                    <th key={campo.id} className="p-4 font-semibold whitespace-nowrap">{campo.label}</th>
                  )
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {resultados.length === 0 ? (
                <tr>
                  <td colSpan={columnasSeleccionadas.length} className="p-12 text-center">
                    <EmptyState icon={Inbox} title="Sin resultados" description="No se encontraron asistencias para los filtros seleccionados." />
                  </td>
                </tr>
              ) : (
                resultados.map((row, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    {camposDisponibles.map(campo => {
                      if (!columnasSeleccionadas.includes(campo.id)) return null;
                      switch(campo.id) {
                        case 'fecha': return <td key={campo.id} className="p-4 text-sm whitespace-nowrap">{row.fecha}</td>;
                        case 'dni': return <td key={campo.id} className="p-4 text-sm">{row.dni || '-'}</td>;
                        case 'empleado': return <td key={campo.id} className="p-4 font-medium whitespace-nowrap">{row.empleado}</td>;
                        case 'area': return <td key={campo.id} className="p-4 text-sm text-gray-500">{row.cargo}</td>;
                        case 'hora_entrada': return <td key={campo.id} className="p-4 text-center font-mono text-sm">{row.hora_entrada}</td>;
                        case 'hora_salida': return <td key={campo.id} className="p-4 text-center font-mono text-sm">{row.hora_salida}</td>;
                        case 'total_horas': {
                          const menosDe8 = esMenorA8Horas(row.hora_entrada, row.hora_salida);
                          return <td key={campo.id} className={`p-4 text-center font-mono text-sm font-semibold ${menosDe8 ? 'text-red-600' : 'text-slate-700'}`}>{calcularTotalHoras(row.hora_entrada, row.hora_salida)}</td>;
                        }
                        case 'estado': return (
                          <td key={campo.id} className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${row.estado === 'Presente' ? 'bg-green-50 text-green-700' : row.estado === 'Tardanza' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                              {row.estado}
                            </span>
                          </td>
                        );
                        case 'observaciones': return <td key={campo.id} className="p-4 text-sm text-gray-500">{row.observaciones}</td>;
                        default: return null;
                      }
                    })}
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