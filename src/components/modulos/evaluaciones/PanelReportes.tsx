/**
 * @file PanelReportes.tsx
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

import { useState, useEffect, useTransition } from 'react';
import { obtenerMetricasReporteAction, obtenerDatosDetalladosAction, obtenerFechaMinimaAction } from '@/controllers/reporte.controller';
import { exportarExcel, exportarPDF } from '@/lib/exportUtils';
import { Empleado } from '@/types/empleado';
import Toast from '@/components/ui/Toast';
import { generarPeriodosDinamicos, PeriodoOpcion } from '@/lib/periodUtils';

interface Props {
  empleados: Empleado[];
  areas: any[];
}

const CAMPOS_COL_1 = [
  { id: 'datosEmpleado', label: 'Datos de Empleado' },
  { id: 'puntuacionCriterios', label: 'Puntuación por Criterios' },
  { id: 'fortalezas', label: 'Fortalezas Identificadas' },
  { id: 'comentarios', label: 'Comentarios del Evaluador' },
  { id: 'comparativa', label: 'Comparativa Histórica' },
];

const CAMPOS_COL_2 = [
  { id: 'resumen', label: 'Resumen Ejecutivo' },
  { id: 'graficos', label: 'Gráficos de Desempeño' },
  { id: 'mejoras', label: 'Áreas de Mejora' },
  { id: 'planDesarrollo', label: 'Plan de Desarrollo' },
  { id: 'recomendaciones', label: 'Recomendaciones' },
];

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function PanelReportes({ empleados, areas }: Props) {
  const [isPending, startTransition] = useTransition();
  const [filtros, setFiltros] = useState({ 
    periodo: '', 
    idArea: 0, 
    idEmpleado: 0,
    idAreaComparar: 0,
    idEmpleadoComparar: 0 
  });
  const [periodos, setPeriodos] = useState<PeriodoOpcion[]>([]);

  useEffect(() => {
    const cargarPeriodos = async () => {
      const res = await obtenerFechaMinimaAction();
      const minDate = res.success && res.data ? res.data : '2025-01-01';
      const options = generarPeriodosDinamicos(minDate);
      setPeriodos(options);
      if (options.length > 0) {
        setFiltros(prev => ({ ...prev, periodo: options[0].value }));
      }
    };
    cargarPeriodos();
  }, []);
  const [tipoReporte, setTipoReporte] = useState('General');
  const [metricas, setMetricas] = useState<any>(null);
  const [resultados, setResultados] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  // Estado para los campos incluidos en el reporte
  const [camposIncluidos, setCamposIncluidos] = useState<Record<string, boolean>>({
    datosEmpleado: true,
    puntuacionCriterios: true,
    fortalezas: true,
    comentarios: true,
    resumen: true,
    mejoras: true,
  });

  const cargarDatosReporte = () => {
    startTransition(async () => {
      const [resMetricas, resDetallados] = await Promise.all([
        obtenerMetricasReporteAction({ 
          periodo: filtros.periodo, 
          idArea: filtros.idArea,
          idAreaComparar: filtros.idAreaComparar,
          idEmpleado: filtros.idEmpleado,
          idEmpleadoComparar: filtros.idEmpleadoComparar
        }),
        obtenerDatosDetalladosAction({
          idArea: filtros.idArea,
          periodo: filtros.periodo,
          idEmpleado: filtros.idEmpleado,
          idAreaComparar: filtros.idAreaComparar,
          idEmpleadoComparar: filtros.idEmpleadoComparar
        })
      ]);
      if (resMetricas.success) setMetricas(resMetricas.data);
      if (resDetallados.success) setResultados(resDetallados.data);
    });
  };

  useEffect(() => {
    cargarDatosReporte();
  }, [
    filtros.idArea, 
    filtros.periodo, 
    filtros.idEmpleado,
    filtros.idAreaComparar,
    filtros.idEmpleadoComparar
  ]);

  const handleToggleCampo = (id: string) => {
    setCamposIncluidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = (val: boolean) => {
    const allFields = [...CAMPOS_COL_1, ...CAMPOS_COL_2];
    const nuevoEstado: Record<string, boolean> = {};
    allFields.forEach(f => nuevoEstado[f.id] = val);
    setCamposIncluidos(nuevoEstado);
  };

  const handleGenerar = async (formato: 'PDF' | 'EXCEL' | 'CSV') => {
    if (resultados.length === 0) {
      setToast({ message: 'Primero genere una vista previa', type: 'warning' });
      return;
    }

    const columnas: string[] = ['Fecha'];
    
    if (camposIncluidos.datosEmpleado) {
      columnas.push('Empleado', 'DNI', 'Cargo');
    }
    if (camposIncluidos.puntuacionCriterios) {
      columnas.push('Calidad', 'Equipo', 'Responsabilidad', 'Iniciativa', 'Adaptabilidad');
    }
    if (camposIncluidos.fortalezas) {
      columnas.push('Fortalezas');
    }
    if (camposIncluidos.resumen) {
      columnas.push('Resumen Ejecutivo');
    }
    if (camposIncluidos.mejoras) {
      columnas.push('Áreas de Mejora');
    }
    if (camposIncluidos.planDesarrollo) {
      columnas.push('Plan de Desarrollo');
    }
    if (camposIncluidos.recomendaciones) {
      columnas.push('Recomendaciones');
    }
    if (camposIncluidos.comentarios) {
      columnas.push('Comentarios');
    }
    if (camposIncluidos.comparativa) {
      columnas.push('Historial');
    }
    
    columnas.push('Promedio');

    const dataFilas = resultados.map(r => {
      let obs: any = {};
      try {
        obs = JSON.parse(r.observaciones || '{}');
      } catch (e) {}
      
      const notas = obs.notas_criterios || {};
      const coment = obs.comentarios_detalle || {};
      
      const fila: Record<string, any> = {};
      fila['Fecha'] = new Date(r.fecha).toLocaleDateString();
      
      if (camposIncluidos.datosEmpleado) {
        fila['Empleado'] = `${r.nombres} ${r.apellidos}`;
        fila['DNI'] = r.dni || '';
        fila['Cargo'] = r.cargo || '';
      }
      
      if (camposIncluidos.puntuacionCriterios) {
        fila['Calidad'] = notas.calidad || 0;
        fila['Equipo'] = notas.equipo || 0;
        fila['Responsabilidad'] = notas.responsabilidad || 0;
        fila['Iniciativa'] = notas.iniciativa || 0;
        fila['Adaptabilidad'] = notas.adaptabilidad || 0;
      }
      
      if (camposIncluidos.fortalezas) {
        fila['Fortalezas'] = coment.fortalezas || '';
      }
      
      if (camposIncluidos.resumen) {
        fila['Resumen Ejecutivo'] = r.puntaje >= 4.0 ? 'Excelente' : r.puntaje >= 3.0 ? 'Aceptable' : 'Requiere Mejora';
      }
      
      if (camposIncluidos.mejoras) {
        fila['Áreas de Mejora'] = coment.mejora || '';
      }
      
      if (camposIncluidos.planDesarrollo) {
        fila['Plan de Desarrollo'] = r.puntaje >= 4.0 ? 'Plan de Liderazgo' : 'Plan de Capacitación';
      }
      
      if (camposIncluidos.recomendaciones) {
        fila['Recomendaciones'] = r.puntaje >= 4.0 ? 'Recomendar Ascenso' : 'Seguimiento de Desempeño';
      }
      
      if (camposIncluidos.comentarios) {
        fila['Comentarios'] = coment.general || '';
      }
      
      if (camposIncluidos.comparativa) {
        const empEvals = resultados.filter(x => x.dni === r.dni && x.id_evaluacion !== r.id_evaluacion);
        fila['Historial'] = empEvals.map(x => `${new Date(x.fecha).getFullYear()}: ${x.puntaje}`).join(', ') || 'Sin históricos';
      }
      
      fila['Promedio'] = Number(r.puntaje || 0).toFixed(2);
      
      return fila;
    });

    if (formato === 'PDF') {
      await exportarPDF({
        columnas,
        filas: dataFilas.map(d => Object.values(d)),
        nombreArchivo: `Informe_Evaluacion_${filtros.periodo}`,
        titulo: `Informe de Desempeño - ${filtros.periodo}`
      });
    } else {
      await exportarExcel({
        datos: dataFilas,
        nombreArchivo: `Informe_Evaluacion_${filtros.periodo}`
      });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Parámetros */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Periodo</label>
          <select 
            className="w-full p-3 bg-gray-50 border-none rounded-xl font-semibold text-gray-700"
            value={filtros.periodo}
            onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
          >
            {periodos.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Área</label>
          <select 
            className="w-full p-3 bg-gray-50 border-none rounded-xl font-semibold text-gray-700"
            value={filtros.idArea}
            onChange={(e) => setFiltros({...filtros, idArea: Number(e.target.value)})}
          >
            <option value="0">Todas las áreas</option>
            {areas.map(a => <option key={a.id_area} value={a.id_area}>{a.nombre_area}</option>)}
          </select>
          {tipoReporte === 'Comparativo' && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-red-500 uppercase mb-2">Área a Comparar</label>
              <select 
                className="w-full p-3 bg-red-50/50 border border-red-100 rounded-xl font-semibold text-slate-700 focus:outline-none"
                value={filtros.idAreaComparar || 0}
                onChange={(e) => setFiltros({ ...filtros, idAreaComparar: Number(e.target.value), idEmpleado: 0, idEmpleadoComparar: 0 })}
              >
                <option value="0">Seleccione área...</option>
                {areas.filter(a => a.id_area !== filtros.idArea).map(a => (
                  <option key={a.id_area} value={a.id_area}>{a.nombre_area}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Empleado (Opcional)</label>
          <select 
            className="w-full p-3 bg-gray-50 border-none rounded-xl font-semibold text-gray-700"
            value={filtros.idEmpleado}
            onChange={(e) => {
              const val = Number(e.target.value);
              setFiltros(prev => {
                const updated = { ...prev, idEmpleado: val };
                if (val !== 0) {
                  const emp = empleados.find(x => x.id_empleado === val);
                  if (emp && emp.id_area) {
                    updated.idArea = emp.id_area;
                  }
                }
                return updated;
              });
            }}
          >
            <option value="0">Todos los empleados</option>
            {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombres} {e.apellidos}</option>)}
          </select>
          {tipoReporte === 'Comparativo' && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-red-500 uppercase mb-2">Empleado a Comparar</label>
              <select 
                className="w-full p-3 bg-red-50/50 border border-red-100 rounded-xl font-semibold text-slate-700 focus:outline-none"
                value={filtros.idEmpleadoComparar || 0}
                onChange={(e) => setFiltros({ ...filtros, idEmpleadoComparar: Number(e.target.value), idArea: 0, idAreaComparar: 0 })}
              >
                <option value="0">Seleccione empleado...</option>
                {empleados.filter(e => e.id_empleado !== filtros.idEmpleado).map(e => (
                  <option key={e.id_empleado} value={e.id_empleado}>{e.nombres} {e.apellidos}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tipo de Informe */}
      <div>
        <h3 className="text-xs font-black text-slate-400 uppercase mb-5 tracking-[0.2em] ml-1">Configuración del Informe</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['General', 'Por Área', 'Individual', 'Comparativo'].map(tipo => (
            <button 
              key={tipo}
              onClick={() => {
                setTipoReporte(tipo);
                if (tipo === 'General') {
                  setFiltros(prev => ({ ...prev, idArea: 0, idAreaComparar: 0, idEmpleado: 0, idEmpleadoComparar: 0 }));
                  setToast({ type: 'success', message: 'Mostrando informe general consolidado' });
                } else if (tipo === 'Por Área') {
                  if (filtros.idArea === 0 && areas.length > 0) {
                    setFiltros(prev => ({ ...prev, idArea: areas[0].id_area, idAreaComparar: 0, idEmpleado: 0, idEmpleadoComparar: 0 }));
                    setToast({ type: 'info', message: `Filtrando por el área de ${areas[0].nombre_area}` });
                  } else {
                    setFiltros(prev => ({ ...prev, idAreaComparar: 0, idEmpleado: 0, idEmpleadoComparar: 0 }));
                    setToast({ type: 'success', message: 'Filtrando informe por área seleccionada' });
                  }
                } else if (tipo === 'Individual') {
                  if (filtros.idEmpleado === 0 && empleados.length > 0) {
                    setFiltros(prev => ({ ...prev, idEmpleado: empleados[0].id_empleado, idAreaComparar: 0, idEmpleadoComparar: 0 }));
                    setToast({ type: 'info', message: `Mostrando reporte individual de ${empleados[0].nombres} ${empleados[0].apellidos}` });
                  } else {
                    setFiltros(prev => ({ ...prev, idAreaComparar: 0, idEmpleadoComparar: 0 }));
                    setToast({ type: 'success', message: 'Mostrando reporte del empleado seleccionado' });
                  }
                } else if (tipo === 'Comparativo') {
                  setToast({ type: 'info', message: 'Modo comparativo: Seleccione una segunda Área o un segundo Empleado abajo para contrastar resultados.' });
                }
              }}
              className={`p-6 rounded-3xl border-2 transition-all duration-300 text-left group ${tipoReporte === tipo ? 'border-red-500 bg-red-50/50 shadow-inner' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
            >
              <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center transition-all ${tipoReporte === tipo ? 'bg-red-600 text-white rotate-12' : 'bg-slate-100 text-slate-400 group-hover:rotate-6'}`}>
                {tipo[0]}
              </div>
              <span className={`font-black block text-sm ${tipoReporte === tipo ? 'text-red-700' : 'text-slate-600'}`}>{tipo}</span>
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Haga clic</span>
            </button>
          ))}
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group hover:scale-[1.02] transition-transform">
          <div className="text-2xl bg-amber-50 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:rotate-12 transition-transform">⭐</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promedio General</p>
            <p className="text-2xl font-black text-slate-800">{Number(metricas?.promedioGeneral || 0).toFixed(1)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group hover:scale-[1.02] transition-transform">
          <div className="text-2xl bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:rotate-12 transition-transform">🏆</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Excelencia</p>
            <p className="text-2xl font-black text-emerald-600">{metricas?.desempeñoExcelente || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group hover:scale-[1.02] transition-transform">
          <div className="text-2xl bg-blue-50 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:rotate-12 transition-transform">📊</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registros</p>
            <p className="text-2xl font-black text-blue-600">{metricas?.totalEvaluaciones || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 group hover:scale-[1.02] transition-transform">
          <div className="text-2xl bg-purple-50 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:rotate-12 transition-transform">📈</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satisfacción</p>
            <p className="text-2xl font-black text-purple-600">{Math.round(metricas?.indiceSatisfaccion || 0)}%</p>
          </div>
        </div>
      </div>

      {/* Selección de Campos para Incluir */}
      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Campos para Incluir en el Reporte</h3>
          <div className="flex gap-4">
            <button onClick={() => handleSelectAll(true)} className="text-[10px] font-bold text-red-600 hover:underline">Marcar todos</button>
            <button onClick={() => handleSelectAll(false)} className="text-[10px] font-bold text-slate-400 hover:underline">Desmarcar todos</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {/* Columna 1 */}
          <div className="space-y-4">
            {CAMPOS_COL_1.map((campo) => (
              <label key={campo.id} className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={camposIncluidos[campo.id] || false}
                    onChange={() => handleToggleCampo(campo.id)}
                    className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-red-500 cursor-pointer transition-colors"
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{campo.label}</span>
              </label>
            ))}
          </div>

          {/* Columna 2 */}
          <div className="space-y-4">
            {CAMPOS_COL_2.map((campo) => (
              <label key={campo.id} className="flex items-center gap-3 cursor-pointer group w-fit">
                <input 
                  type="checkbox" 
                  checked={camposIncluidos[campo.id] || false}
                  onChange={() => handleToggleCampo(campo.id)}
                  className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-red-500 cursor-pointer transition-colors"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{campo.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 p-8 rounded-[2.5rem] gap-6 shadow-2xl shadow-slate-200">
        <div className="flex gap-4">
          <button onClick={() => handleGenerar('PDF')} className="flex flex-col items-center group active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-red-500 transition-colors">
              <img src="/PDF.ico" alt="PDF" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-[10px] text-white mt-1 font-bold">PDF</span>
          </button>
          <button onClick={() => handleGenerar('EXCEL')} className="flex flex-col items-center group active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
              <img src="/excel.ico" alt="Excel" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-[10px] text-white mt-1 font-bold">EXCEL</span>
          </button>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setFiltros({ 
                periodo: '2026-I', 
                idArea: 0, 
                idEmpleado: 0,
                idAreaComparar: 0,
                idEmpleadoComparar: 0 
              });
              setTipoReporte('General');
              setToast({ type: 'success', message: 'Filtros restablecidos correctamente' });
            }}
            className="px-6 py-3 text-slate-400 hover:text-slate-200 font-bold text-sm transition-colors"
          >
            Limpiar
          </button>
          <button 
            onClick={cargarDatosReporte}
            disabled={isPending}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-sm transition-colors"
          >
            {isPending ? 'Cargando...' : 'Vista Previa'}
          </button>
          <button 
            onClick={() => handleGenerar('PDF')}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <img src="/PDF.ico" alt="PDF" className="w-5 h-5 object-contain" />
            Generar Informe
          </button>
        </div>
      </div>

      {/* Tabla Vista Previa */}
      {resultados.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
              <tr>
                <th className="p-4">Fecha</th>
                {camposIncluidos.datosEmpleado && (
                  <>
                    <th className="p-4">Empleado</th>
                    <th className="p-4">DNI</th>
                    <th className="p-4">Cargo</th>
                  </>
                )}
                {camposIncluidos.puntuacionCriterios && (
                  <>
                    <th className="p-4 text-center">Calidad</th>
                    <th className="p-4 text-center">Equipo</th>
                    <th className="p-4 text-center">Resp.</th>
                    <th className="p-4 text-center">Inic.</th>
                    <th className="p-4 text-center">Adapt.</th>
                  </>
                )}
                {camposIncluidos.fortalezas && <th className="p-4">Fortalezas</th>}
                {camposIncluidos.resumen && <th className="p-4">Resumen</th>}
                {camposIncluidos.mejoras && <th className="p-4">Áreas Mejora</th>}
                {camposIncluidos.planDesarrollo && <th className="p-4">Plan Des.</th>}
                {camposIncluidos.recomendaciones && <th className="p-4">Recom.</th>}
                {camposIncluidos.comentarios && <th className="p-4">Comentarios</th>}
                {camposIncluidos.comparativa && <th className="p-4">Historial</th>}
                <th className="p-4 text-center">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {resultados.map((r, i) => {
                let obs: any = {};
                try {
                  obs = JSON.parse(r.observaciones || '{}');
                } catch (e) {}
                const notas = obs.notas_criterios || {};
                const coment = obs.comentarios_detalle || {};
                const empEvals = resultados.filter(x => x.dni === r.dni && x.id_evaluacion !== r.id_evaluacion);
                
                return (
                  <tr key={i} className="text-sm">
                    <td className="p-4 text-gray-400 whitespace-nowrap">{new Date(r.fecha).toLocaleDateString()}</td>
                    {camposIncluidos.datosEmpleado && (
                      <>
                        <td className="p-4 font-bold text-gray-700 whitespace-nowrap">{r.nombres} {r.apellidos}</td>
                        <td className="p-4 text-gray-500 whitespace-nowrap">{r.dni}</td>
                        <td className="p-4 text-gray-500 whitespace-nowrap">{r.cargo}</td>
                      </>
                    )}
                    {camposIncluidos.puntuacionCriterios && (
                      <>
                        <td className="p-4 text-center text-gray-600">{notas.calidad || 0}</td>
                        <td className="p-4 text-center text-gray-600">{notas.equipo || 0}</td>
                        <td className="p-4 text-center text-gray-600">{notas.responsabilidad || 0}</td>
                        <td className="p-4 text-center text-gray-600">{notas.iniciativa || 0}</td>
                        <td className="p-4 text-center text-gray-600">{notas.adaptabilidad || 0}</td>
                      </>
                    )}
                    {camposIncluidos.fortalezas && <td className="p-4 text-gray-500 max-w-xs truncate">{coment.fortalezas || '-'}</td>}
                    {camposIncluidos.resumen && (
                      <td className="p-4 text-gray-500 max-w-xs truncate">
                        {r.puntaje >= 4.0 ? 'Excelente' : r.puntaje >= 3.0 ? 'Aceptable' : 'Bajo'}
                      </td>
                    )}
                    {camposIncluidos.mejoras && <td className="p-4 text-gray-500 max-w-xs truncate">{coment.mejora || '-'}</td>}
                    {camposIncluidos.planDesarrollo && (
                      <td className="p-4 text-gray-500 max-w-xs truncate">
                        {r.puntaje >= 4.0 ? 'Plan de Liderazgo' : 'Plan de Capacitación'}
                      </td>
                    )}
                    {camposIncluidos.recomendaciones && (
                      <td className="p-4 text-gray-500 max-w-xs truncate">
                        {r.puntaje >= 4.0 ? 'Recomendar Ascenso' : 'Seguimiento de Desempeño'}
                      </td>
                    )}
                    {camposIncluidos.comentarios && <td className="p-4 text-gray-500 max-w-xs truncate">{coment.general || '-'}</td>}
                    {camposIncluidos.comparativa && (
                      <td className="p-4 text-gray-400 text-xs">
                        {empEvals.map(x => `${new Date(x.fecha).getFullYear()}: ${x.puntaje}`).join(', ') || 'Sin históricos'}
                      </td>
                    )}
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-md font-bold ${r.puntaje >= 4 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {Number(r.puntaje).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
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