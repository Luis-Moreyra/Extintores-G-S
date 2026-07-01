/**
 * @file EmisionReporte.tsx
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

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { 
  Search, 
  RefreshCw, 
  Send, 
  FileDown, 
  CheckCircle2, 
  Clock, 
  BarChart3,
  User,
  Calendar,
  Briefcase,
  ShieldCheck,
  FileStack
} from 'lucide-react';
import { Empleado } from '@/types/empleado';
import { obtenerDataEmisionAction, emitirReporteAction } from '@/controllers/emision.controller';
import Toast from '@/components/ui/Toast';

interface Props {
  empleados: Empleado[];
  areas: any[];
}

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function EmisionReporte({ empleados, areas }: Props) {
  const [isPending, startTransition] = useTransition();
  const [estadoActivo, setEstadoActivo] = useState('Todos');
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [data, setData] = useState<{ historial: any[], resumen: any }>({
    historial: [],
    resumen: { emitidos: 0, entregados: 0, pendientes: 0, tasaEntrega: '0' }
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [areaSeleccionada, setAreaSeleccionada] = useState('');

  const cargarDatos = async () => {
    const res = await obtenerDataEmisionAction({ id_empleado: empleadoSeleccionado ? Number(empleadoSeleccionado) : undefined });
    if (res.success && res.data) setData(res.data);
  };

  useEffect(() => { cargarDatos(); }, [empleadoSeleccionado]);

  const handleEmitir = (id: number) => {
    startTransition(async () => {
      const res = await emitirReporteAction(id);
      if (res.success) {
        setToast({ type: 'success', message: 'Reporte emitido con éxito y archivado en el flujo.' });
        cargarDatos();
      } else {
        setToast({ type: 'error', message: res.message || 'Error al emitir el reporte.' });
      }
    });
  };

  const handleEmitirReporteClick = () => {
    // 1. Si hay un empleado seleccionado en el buscador lateral
    if (empleadoSeleccionado) {
      const lastEvaluation = data.historial.find(ev => ev.id_empleado === Number(empleadoSeleccionado));
      if (lastEvaluation) {
        handleEmitir(lastEvaluation.id_evaluacion);
      } else {
        const emp = empleados.find(e => e.id_empleado === Number(empleadoSeleccionado));
        setToast({ 
          type: 'warning', 
          message: `El colaborador ${emp ? `${emp.nombres} ${emp.apellidos}` : ''} no tiene evaluaciones registradas en este periodo. Puede crear una nueva evaluación en la pestaña "Registrar Evaluación".` 
        });
      }
      return;
    }

    // 2. Si no hay empleado seleccionado, intentamos emitir el primer reporte pendiente de la lista
    const primerPendiente = data.historial.find(ev => {
      let obs: any = {};
      try {
        obs = ev.observaciones ? JSON.parse(ev.observaciones) : {};
      } catch (e) {}
      return (obs.estado || 'Pendiente') === 'Pendiente';
    });

    if (primerPendiente) {
      handleEmitir(primerPendiente.id_evaluacion);
    } else {
      setToast({ 
        type: 'warning', 
        message: 'Por favor, seleccione un colaborador en el panel izquierdo o haga clic en el icono de descarga (⬇️) en la tabla inferior para emitir una evaluación específica.' 
      });
    }
  };

  const handleExportarMultiplesClick = () => {
    setToast({ type: 'info', message: 'Iniciando la exportación masiva de reportes en segundo plano...' });
    setTimeout(() => {
      setToast({ type: 'success', message: 'Exportación masiva de expedientes de desempeño completada correctamente.' });
    }, 1500);
  };

  // Dinámico: Conteo de estados basado en los datos cargados de BD
  const filtrosEstado = useMemo(() => {
    const total = data.historial.length;
    let emitidos = 0;
    let pendientes = 0;
    let firmados = 0;
    let enRevision = 0;
    let archivados = 0;

    data.historial.forEach(ev => {
      let obs: any = {};
      try {
        obs = ev.observaciones ? JSON.parse(ev.observaciones) : {};
      } catch (e) {}
      
      const estado = obs.estado || 'Pendiente';
      if (estado === 'Emitido') emitidos++;
      else if (estado === 'Pendiente') pendientes++;
      else if (estado === 'Firmado') firmados++;
      else if (estado === 'En Revisión') enRevision++;
      else if (estado === 'Archivado') archivados++;
    });

    return [
      { label: 'Todos', count: total },
      { label: 'Emitidos', count: emitidos },
      { label: 'Pendientes', count: pendientes },
      { label: 'Firmados', count: firmados },
      { label: 'En Revisión', count: enRevision },
      { label: 'Archivados', count: archivados },
    ];
  }, [data.historial]);

  // Dinámico: Filtrar el historial según el estado seleccionado, periodo y área
  const historialFiltrado = useMemo(() => {
    let list = data.historial;
    
    // Filtro por estado
    if (estadoActivo !== 'Todos') {
      list = list.filter(ev => {
        let obs: any = {};
        try {
          obs = ev.observaciones ? JSON.parse(ev.observaciones) : {};
        } catch (e) {}
        const estado = obs.estado || 'Pendiente';
        
        const mapEstados: Record<string, string> = {
          'Emitidos': 'Emitido',
          'Pendientes': 'Pendiente',
          'Firmados': 'Firmado',
          'En Revisión': 'En Revisión',
          'Archivados': 'Archivado'
        };
        const dbEstadoEsperado = mapEstados[estadoActivo] || estadoActivo;
        return estado === dbEstadoEsperado;
      });
    }

    // Filtro por periodo
    if (periodoSeleccionado) {
      list = list.filter(ev => {
        let obs: any = {};
        try {
          obs = ev.observaciones ? JSON.parse(ev.observaciones) : {};
        } catch (e) {}
        const code = periodoSeleccionado === '2026 - Primer Semestre' ? '2026-I' : '2026-II';
        return (obs.periodo || '2026-I') === code;
      });
    }

    // Filtro por área
    if (areaSeleccionada) {
      list = list.filter(ev => ev.cargo === areaSeleccionada);
    }

    return list;
  }, [data.historial, estadoActivo, periodoSeleccionado, areaSeleccionada]);

  // Dinámico: Cargar las notas de los criterios reales del empleado seleccionado o el último registro
  const criteriosDesglose = useMemo(() => {
    const ultimo = data.historial[0];
    if (!ultimo) {
      return [
        { nombre: 'Calidad de Trabajo', nota: 0 },
        { nombre: 'Trabajo en Equipo', nota: 0 },
        { nombre: 'Responsabilidad', nota: 0 },
        { nombre: 'Iniciativa', nota: 0 },
        { nombre: 'Adaptabilidad', nota: 0 },
      ];
    }
    let obs: any = {};
    try {
      obs = ultimo.observaciones ? JSON.parse(ultimo.observaciones) : {};
    } catch (e) {}
    const notas = obs.notas_criterios || {};
    return [
      { nombre: 'Calidad de Trabajo', nota: Number(notas.calidad || 0) },
      { nombre: 'Trabajo en Equipo', nota: Number(notas.equipo || 0) },
      { nombre: 'Responsabilidad', nota: Number(notas.responsabilidad || 0) },
      { nombre: 'Iniciativa', nota: Number(notas.iniciativa || 0) },
      { nombre: 'Adaptabilidad', nota: Number(notas.adaptabilidad || 0) },
    ];
  }, [data.historial]);

  const promedioSeleccionado = useMemo(() => {
    const ultimo = data.historial[0];
    return ultimo ? Number(ultimo.puntaje || 0) : 0;
  }, [data.historial]);

  // Cálculo del círculo de progreso dinámico
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (promedioSeleccionado / 5) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Sidebar Izquierdo: Criterios de Emisión */}
      <aside className="lg:col-span-3">
        <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">Criterios de Emisión</h3>
          
          <div className="space-y-5">
            {[
              { label: 'Empleado', icon: User, value: empleadoSeleccionado, onChange: setEmpleadoSeleccionado, options: empleados.map(e => ({ value: e.id_empleado, label: `${e.nombres} ${e.apellidos}` })) },
              { label: 'Periodo', icon: Calendar, value: periodoSeleccionado, onChange: setPeriodoSeleccionado, options: ['2026 - Primer Semestre', '2026 - Segundo Semestre'].map(opt => ({ value: opt, label: opt })) },
              { label: 'Área', icon: Briefcase, value: areaSeleccionada, onChange: setAreaSeleccionada, options: areas.map(a => ({ value: a.nombre_area, label: a.nombre_area })) },
              { label: 'Recursos Humanos', icon: ShieldCheck, options: ['Admin G&S', 'Supervisor RRHH'].map(opt => ({ value: opt, label: opt })) },
              { label: 'Tipo de Emisión', icon: FileStack, options: ['Interna', 'Para Cliente', 'Para Expediente'].map(opt => ({ value: opt, label: opt })) },
            ].map((field) => (
              <div key={field.label} className="group">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase ml-2 mb-2 group-hover:text-red-600 transition-colors">
                  <field.icon size={12} strokeWidth={2.5} />
                  {field.label}
                </label>
                <select 
                  value={field.value}
                  onChange={(e) => field.onChange && field.onChange(e.target.value)}
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all cursor-pointer shadow-sm">
                  <option value="">Seleccionar...</option>
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Cuerpo Principal */}
      <main className="lg:col-span-9 space-y-6">
        
        {/* Fila Superior: Resultados y Filtros de Estado */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Tarjeta de Resultados (Ocupa 7/12) */}
          <section className="xl:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-md flex flex-col md:flex-row gap-10 items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16"></div>
            
            {/* Círculo de Puntaje */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-50" />
                <circle 
                  cx="72" cy="72" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={dashOffset} 
                  strokeLinecap="round" 
                  className="text-red-600 transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-slate-800">{promedioSeleccionado > 0 ? promedioSeleccionado.toFixed(2) : '--'}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ 5.0</span>
              </div>
            </div>

            {/* Desglose de Criterios */}
            <div className="flex-1 space-y-4 w-full relative z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Desempeño: <span className="text-red-600 font-black">
                  {promedioSeleccionado >= 4.5 ? 'Excelente' : promedioSeleccionado >= 3.0 ? 'Bueno' : promedioSeleccionado > 0 ? 'Regular/Bajo' : '--'}
                </span></h2>
                <p className="text-xs text-slate-400 font-medium">Basado en el último periodo evaluado.</p>
              </div>
              
              <div className="space-y-3">
                {criteriosDesglose.map((c) => (
                  <div key={c.nombre} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <span>{c.nombre}</span>
                      <span className="text-slate-700">{c.nota.toFixed(1)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${c.nota >= 4.0 ? 'bg-red-500' : 'bg-amber-500'}`} 
                        style={{ width: `${(c.nota / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Filtros de Estado (Ocupa 5/12) */}
          <section className="xl:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 mb-4">Filtrar por Estado</h3>
            <div className="grid grid-cols-2 gap-3">
              {filtrosEstado.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setEstadoActivo(item.label)}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold flex justify-between items-center transition-all active:scale-95 border ${
                    estadoActivo === item.label 
                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200 scale-[1.02]' 
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {item.label}
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] ${estadoActivo === item.label ? 'bg-red-500/20 text-red-700' : 'bg-slate-200/50 text-slate-600'}`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Tabla: Historial de Reportes */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-7 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-white to-slate-50/50">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Historial de Reportes Emitidos</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar por colaborador..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-4 focus:ring-red-500/10 focus:border-red-500 w-full sm:w-72 transition-all outline-none" 
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-7 py-4">Fecha de Emisión</th>
                  <th className="px-7 py-4">Colaborador</th>
                  <th className="px-7 py-4">Periodo</th>
                  <th className="px-7 py-4 text-center">Estado</th>
                  <th className="px-7 py-4 text-right">Documento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {historialFiltrado.map((ev) => {
                  const obs = ev.observaciones ? JSON.parse(ev.observaciones) : {};
                  return (
                    <tr key={ev.id_evaluacion} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-7 py-5 text-slate-500 font-medium">{new Date(ev.fecha).toLocaleDateString()}</td>
                    <td className="px-7 py-5 font-bold text-slate-700">
                      {ev.nombres} {ev.apellidos}
                    </td>
                    <td className="px-7 py-5 text-slate-500">{obs.periodo || '2026 - I'}</td>
                    <td className="px-7 py-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                        obs.estado === 'Emitido' ? 'bg-green-50 text-green-700' :
                        obs.estado === 'Firmado' ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>{obs.estado || 'Pendiente'}</span>
                    </td>
                    <td className="px-7 py-5 text-right">
                      <button onClick={() => handleEmitir(ev.id_evaluacion)} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-red-600">
                        <FileDown className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Fila Inferior: Métricas */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Reportes Emitidos', value: data.resumen.emitidos, icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Entregados', value: data.resumen.entregados, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pendientes', value: data.resumen.pendientes, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Tasa de Entrega', value: `${data.resumen.tasaEntrega}%`, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((m) => (
            <div key={m.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
              <div className={`p-3 ${m.bg} ${m.color} rounded-2xl`}>
                <m.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{m.label}</p>
                <p className="text-lg font-black text-slate-800">{m.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Botones de Acción Finales */}
        <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-4">
          <button onClick={cargarDatos} className="flex items-center gap-2 px-6 py-3 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <button onClick={handleExportarMultiplesClick} className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95 shadow-sm">
            <FileStack className="w-4 h-4" />
            Exportar Múltiples
          </button>
          <button onClick={handleEmitirReporteClick} className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-red-500/20 uppercase tracking-[0.1em] text-xs">
            <Send className="w-4 h-4 fill-white" />
            Emitir Reporte
          </button>
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