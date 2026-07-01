/**
 * @file GuardarMarcaciones.tsx
 * @description Componente de interfaz de usuario correspondiente al registro manual, consulta e historial de marcaciones del personal.
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
import { obtenerTodosLosEmpleados } from '@/controllers/empleado.controller';
import { Search, Inbox } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { Empleado } from '@/types/empleado';
import Toast from '@/components/ui/Toast';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function GuardarMarcaciones({ onNavigateToReport }: { onNavigateToReport?: (params: any) => void }) {
  const [empleadoBusqueda, setEmpleadoBusqueda] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [resultados, setResultados] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const [empleadosLista, setEmpleadosLista] = useState<string[]>([]);

  // Cargar los empleados reales desde la base de datos al abrir la pantalla
  useEffect(() => {
    const cargarEmpleados = async () => {
      const res = await obtenerTodosLosEmpleados();
      if (res.success && res.empleados) {
        const nombresFormateados = res.empleados.map((emp: Empleado) => `${emp.nombres} ${emp.apellidos}`);
        setEmpleadosLista(nombresFormateados);
      }
    };
    cargarEmpleados();
  }, []);

  const empleadosFiltrados = empleadosLista.filter((emp) => 
    emp.toLowerCase().includes(empleadoBusqueda.toLowerCase())
  );

  const handleBuscar = async () => {
    if (!empleadoBusqueda.trim()) {
      setToast({ message: 'Por favor ingrese o seleccione el nombre de un empleado.', type: 'warning' });
      return;
    }

    console.log('Buscando:', { empleadoBusqueda, fechaInicio, fechaFin });
    
    setLoading(true);
    const res = await buscarAsistencias(empleadoBusqueda, fechaInicio, fechaFin);
    if (res.success) {
      setResultados(res.data);
    } else {
      setToast({ message: res.message || 'Error al buscar asistencias', type: 'error' });
      setResultados([]);
    }
    setLoading(false);
  };

  // Filtramos localmente los resultados según el botón presionado
  const resultadosFiltrados = resultados === null ? null : resultados.filter((row) => {
    if (!filtroActivo || filtroActivo === 'Total de dias') return true;
    if (filtroActivo === 'Asistencias') return row.estado === 'Presente';
    if (filtroActivo === 'Tardanzas') return row.estado === 'Tardanza';
    if (filtroActivo === 'Ausencias') return row.estado === 'Falta';
    return true;
  });

  const handleExportar = (formato: string) => {
    // Extraemos el área (cargo) del primer resultado si existe
    const areaEmpleado = resultados && resultados.length > 0 ? resultados[0].cargo : 'Todos';

    if (filtroActivo === 'Tardanzas' || filtroActivo === 'Ausencias') {
      if (onNavigateToReport) {
        onNavigateToReport({ 
          targetTab: 'reporte-inasistencia',
          formato, 
          empleado: empleadoBusqueda, 
          area: areaEmpleado, 
          fechaInicio, 
          fechaFin,
          tipoInasistencia: filtroActivo === 'Tardanzas' ? 'Solo Tardanzas' : 'Solo Ausencias'
        });
      }
      return;
    }

    if (onNavigateToReport) {
      onNavigateToReport({ formato, empleado: empleadoBusqueda, area: areaEmpleado, fechaInicio, fechaFin });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">
          Consultar y Guardar Marcaciones
        </h2>

        {/* Contenedor de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end bg-gray-50 p-6 rounded-xl border border-gray-100">
          
          {/* 1. Buscador de Empleado (Combobox) */}
          <div className="flex flex-col relative">
            <label className="text-sm font-medium text-gray-600 mb-1.5">Empleado</label>
            <input 
              type="text" 
              value={empleadoBusqueda}
              onChange={(e) => {
                setEmpleadoBusqueda(e.target.value);
                setMostrarDropdown(true);
              }}
              onFocus={() => setMostrarDropdown(true)}
              // Usamos setTimeout para evitar que el dropdown desaparezca antes de registrar el clic en una opción
              onBlur={() => setTimeout(() => setMostrarDropdown(false), 200)}
              placeholder="Escriba un nombre..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800"
            />
            
            {mostrarDropdown && empleadoBusqueda && (
              <ul className="absolute top-full left-0 z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {empleadosFiltrados.length > 0 ? (
                  empleadosFiltrados.map((emp, index) => (
                    <li 
                      key={index} 
                      onClick={() => {
                        setEmpleadoBusqueda(emp);
                        setMostrarDropdown(false);
                      }}
                      className="p-3 hover:bg-red-50 cursor-pointer text-gray-700 text-sm border-b border-gray-50 last:border-0 transition-colors"
                    >
                      {emp}
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-gray-500 text-sm text-center">No hay coincidencias</li>
                )}
              </ul>
            )}
          </div>

          {/* 2. Fecha Inicio */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1.5">Fecha Inicio</label>
            <input 
              type="date" 
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value);
                // Si ya hay una fecha de fin y la nueva inicio es mayor, igualamos ambas para evitar el error lógico
                if (fechaFin && e.target.value > fechaFin) {
                  setFechaFin(e.target.value);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800"
            />
          </div>

          {/* 3. Fecha Fin */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1.5">Fecha Fin</label>
            <input 
              type="date" 
              value={fechaFin}
              min={fechaInicio} // Bloquea la UI del navegador para no elegir fechas anteriores a la de inicio
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all duration-200 text-gray-800"
            />
          </div>

          {/* 4. Botón Buscar */}
          <div className="flex flex-col">
            <button 
              onClick={handleBuscar}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-sm transition-colors duration-200"
            >
              Buscar
            </button>
          </div>

        </div>

        {/* Resumen de Asistencias (Botones) */}
        <div className="mt-8 border-t border-gray-100 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <button
              type="button"
              onClick={() => setFiltroActivo('Asistencias')}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold shadow-sm transition-all ${filtroActivo === 'Asistencias' ? 'bg-green-600 text-white ring-4 ring-green-100 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <img src="/check.ico" alt="Asistencias" className="w-8 h-8" />
              <span className="text-center">Asistencias</span>
            </button>
            
            <button
              type="button"
              onClick={() => setFiltroActivo('Tardanzas')}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold shadow-sm transition-all ${filtroActivo === 'Tardanzas' ? 'bg-yellow-500 text-white ring-4 ring-yellow-100 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <img src="/reloj.ico" alt="Tardanzas" className="w-8 h-8" />
              <span className="text-center">Tardanzas</span>
            </button>
            
            <button
              type="button"
              onClick={() => setFiltroActivo('Ausencias')}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold shadow-sm transition-all ${filtroActivo === 'Ausencias' ? 'bg-red-600 text-white ring-4 ring-red-100 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <img src="/Cross.ico" alt="Ausencias" className="w-8 h-8" />
              <span className="text-center">Ausencias</span>
            </button>
            
            <button
              type="button"
              onClick={() => setFiltroActivo('Total de dias')}
              className={`flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold shadow-sm transition-all ${filtroActivo === 'Total de dias' ? 'bg-slate-800 text-white ring-4 ring-slate-200 scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <img src="/calendario.ico" alt="Total de días" className="w-8 h-8" />
              <span className="text-center">Total de días</span>
            </button>
          </div>
        </div>

        {/* Tabla de Registro de Asistencias */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          {/* Encabezado de la tabla y Botones de Exportación */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-gray-800">
              Registro de Asistencias
            </h3>
            <div className="flex space-x-3">
              <button 
                type="button" 
                onClick={() => handleExportar('Excel')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors duration-200 flex items-center gap-2"
              >
                <span>📊</span> Exportar a Excel
              </button>
              <button 
                type="button" 
                onClick={() => handleExportar('PDF')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors duration-200 flex items-center gap-2"
              >
                <span>📄</span> Exportar a PDF
              </button>
            </div>
          </div>

          {/* Contenedor de la Tabla */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                  <th className="p-4 font-semibold">Fecha</th>
                  <th className="p-4 font-semibold">Empleado</th>
                  <th className="p-4 font-semibold">Área/Depto</th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap">Hora Entrada</th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap">Hora Salida</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                  <th className="p-4 font-semibold">Observaciones</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={`skeleton-${i}`} className="border-b border-gray-50 transition-colors">
                      {[...Array(7)].map((_, j) => (
                        <td key={`skeleton-col-${j}`} className="p-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : resultadosFiltrados === null ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <EmptyState icon={Search} title="Comience su búsqueda" description='Ingrese el nombre de un empleado y presione "Buscar" para ver sus registros.' />
                    </td>
                  </tr>
                ) : resultadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <EmptyState icon={Inbox} title="Sin resultados" description="No se encontraron asistencias para este empleado en las fechas seleccionadas." />
                    </td>
                  </tr>
                ) : (
                  resultadosFiltrados.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm whitespace-nowrap">{row.fecha}</td>
                      <td className="p-4 font-medium">{row.empleado}</td>
                      <td className="p-4 text-sm text-gray-500">{row.cargo}</td>
                      <td className="p-4 text-center text-sm font-mono">{row.hora_entrada || row.hora || '-'}</td>
                      <td className="p-4 text-center text-sm font-mono">{row.hora_salida || '-'}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.estado === 'Presente' ? 'bg-green-50 text-green-700' : row.estado === 'Tardanza' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
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
        </div>

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