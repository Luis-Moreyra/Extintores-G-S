/**
 * @file FormularioEvaluacion.tsx
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

import { useState, useTransition, useMemo, useEffect } from 'react';
import { registrarEvaluacionAction } from '@/controllers/evaluacion.controller';
import { Empleado } from '@/types/empleado';
import Toast from '@/components/ui/Toast';
import { obtenerFechaMinimaAction } from '@/controllers/reporte.controller';
import { generarPeriodosDinamicos, PeriodoOpcion } from '@/lib/periodUtils';

interface Props {
  empleados: Empleado[];
  areas: any[];
}

const CRITERIOS = [
  { id: 'calidad', nombre: 'Calidad de Trabajo', desc: 'Precisión y eficiencia en las tareas.' },
  { id: 'equipo', nombre: 'Trabajo en Equipo', desc: 'Colaboración y comunicación con colegas.' },
  { id: 'responsabilidad', nombre: 'Responsabilidad', desc: 'Cumplimiento de tareas y horarios.' },
  { id: 'iniciativa', nombre: 'Iniciativa', desc: 'Capacidad de proponer soluciones.' },
  { id: 'adaptabilidad', nombre: 'Adaptabilidad', desc: 'Flexibilidad ante cambios y retos.' },
];

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function FormularioEvaluacion({ empleados, areas }: Props) {
  const [isPending, startTransition] = useTransition();
  const [empleadoId, setEmpleadoId] = useState('');
  const [evaluadorId, setEvaluadorId] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [periodos, setPeriodos] = useState<PeriodoOpcion[]>([]);

  useEffect(() => {
    const cargarPeriodos = async () => {
      const res = await obtenerFechaMinimaAction();
      const minDate = res.success && res.data ? res.data : '2025-01-01';
      const options = generarPeriodosDinamicos(minDate);
      setPeriodos(options);
      if (options.length > 0) {
        setPeriodo(options[0].value);
      }
    };
    cargarPeriodos();
  }, []);
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [comentarios, setComentarios] = useState({ fortalezas: '', mejora: '', general: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Calcular promedio en tiempo real
  const promedio = useMemo(() => {
    const vals = Object.values(notas);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / CRITERIOS.length;
  }, [notas]);

  const empInfo = useMemo(() => {
    return empleados.find(e => String(e.id_empleado) === empleadoId);
  }, [empleadoId, empleados]);

  const evalInfo = useMemo(() => {
    return empleados.find(e => String(e.id_empleado) === evaluadorId);
  }, [evaluadorId, empleados]);

  const getColorNota = (nota: number, criterioId: string) => {
    const activa = notas[criterioId] === nota;
    if (!activa) return 'bg-gray-100 text-gray-500 hover:bg-gray-200';
    
    if (nota <= 2) return 'bg-purple-600 text-white ring-2 ring-purple-200';
    if (nota === 3) return 'bg-yellow-500 text-white ring-2 ring-yellow-200';
    return 'bg-green-600 text-white ring-2 ring-green-200';
  };

  const handleLimpiar = () => {
    setEmpleadoId('');
    setEvaluadorId('');
    setNotas({});
    setComentarios({ fortalezas: '', mejora: '', general: '' });
  };

  const handleRegistrar = () => {
    setToast(null);
    
    if (!empleadoId || !evaluadorId) {
      setToast({ type: 'warning', message: 'Por favor seleccione el empleado y el evaluador.' });
      return;
    }

    if (Object.keys(notas).length < CRITERIOS.length) {
      setToast({ type: 'warning', message: 'Por favor asigne puntuación a todos los criterios de evaluación.' });
      return;
    }

    if (empleadoId && empleadoId === evaluadorId) {
      setToast({ type: 'error', message: 'Conflicto de Interés: El empleado no puede ser su propio evaluador.' });
      return;
    }

    startTransition(async () => {
      const res = await registrarEvaluacionAction({
        empleadoId: Number(empleadoId),
        evaluadorId: Number(evaluadorId),
        periodo,
        notas,
        comentarios,
        promedio
      });
      if (res.success) {
        setToast({ type: 'success', message: res.message || 'Evaluación registrada correctamente.' });
        handleLimpiar();
      } else {
        setToast({ type: 'error', message: res.message || 'Error al registrar la evaluación.' });
      }
    });
  };

  const getScoreColor = (val: number) => {
    if (val === 0) return 'text-slate-400';
    if (val <= 2) return 'text-purple-500';
    if (val < 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in zoom-in-95 duration-500">
      {/* Información del Empleado */}
      <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
          <span className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-sm">01</span>
          Información de la Evaluación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Empleado *</label>
            <select 
              value={empleadoId} 
              onChange={(e) => {
                const val = e.target.value;
                setEmpleadoId(val);
                if (val) {
                  const emp = empleados.find(x => String(x.id_empleado) === val);
                  if (emp && emp.id_area) {
                    const peer = empleados.find(x => x.id_area === emp.id_area && String(x.id_empleado) !== val);
                    if (peer) {
                      setEvaluadorId(String(peer.id_empleado));
                    }
                  }
                }
              }} 
              className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="">Seleccionar...</option>
              {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombres} {e.apellidos}</option>)}
            </select>
            {empInfo && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs animate-in fade-in duration-300">
                <div className="flex justify-between"><span className="text-gray-400 font-bold">DNI:</span> <span className="font-bold text-gray-700">{empInfo.dni || '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 font-bold">Área:</span> <span className="font-bold text-gray-700">{areas.find(a => a.id_area === empInfo.id_area)?.nombre_area || '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 font-bold">Correo:</span> <span className="font-bold text-gray-500">{empInfo.correo || '--'}</span></div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Periodo *</label>
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none">
              {periodos.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Evaluador *</label>
            <select value={evaluadorId} onChange={(e) => setEvaluadorId(e.target.value)} className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none">
              <option value="">Seleccionar...</option>
              {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombres} {e.apellidos}</option>)}
            </select>
            {evalInfo && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs animate-in fade-in duration-300">
                <div className="flex justify-between"><span className="text-gray-400 font-bold">DNI:</span> <span className="font-bold text-gray-700">{evalInfo.dni || '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 font-bold">Área:</span> <span className="font-bold text-gray-700">{areas.find(a => a.id_area === evalInfo.id_area)?.nombre_area || '--'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 font-bold">Correo:</span> <span className="font-bold text-gray-500">{evalInfo.correo || '--'}</span></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Criterios de Evaluación */}
      <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-sm">02</span>
          Criterios de Evaluación (1-5)
        </h2>
        <div className="space-y-6">
          {CRITERIOS.map((c) => (
            <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300 group">
              <div className="mb-4 md:mb-0">
                <h4 className="font-bold text-slate-700 group-hover:text-red-600 transition-colors">{c.nombre}</h4>
                <p className="text-xs text-slate-500">{c.desc}</p>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNotas(prev => ({ ...prev, [c.id]: num }))}
                    className={`w-11 h-11 rounded-xl font-black transition-all duration-300 active:scale-90 ${getColorNota(num, c.id)}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comentarios */}
      <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm">03</span>
          Comentarios y Observaciones
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Principales Fortalezas</label>
            <textarea 
              value={comentarios.fortalezas}
              onChange={(e) => setComentarios(p => ({...p, fortalezas: e.target.value}))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none min-h-[100px] text-sm" 
              placeholder="Mencione los puntos más destacados..." 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Áreas de Mejora</label>
            <textarea 
              value={comentarios.mejora}
              onChange={(e) => setComentarios(p => ({...p, mejora: e.target.value}))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none min-h-[100px] text-sm" 
              placeholder="Identifique oportunidades de crecimiento..." 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Comentarios Generales del Evaluador</label>
            <textarea 
              value={comentarios.general}
              onChange={(e) => setComentarios(p => ({...p, general: e.target.value}))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none min-h-[100px] text-sm" 
              placeholder="Escriba comentarios u observaciones generales sobre el desempeño del empleado..." 
            />
          </div>
        </div>
      </section>

      {/* Pie de Formulario: Puntuación y Botones */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200">
        <div className="flex items-center gap-6">
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Resultado Final</p>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${promedio >= 4 ? 'bg-green-500' : promedio >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${promedio * 20}%` }}></div>
            </div>
          </div>
          <span className={`text-4xl font-black transition-colors ${getScoreColor(promedio)}`}>{promedio.toFixed(1)}</span>
        </div>

        <div className="flex gap-4">
          <button onClick={handleLimpiar} className="px-6 py-3 font-bold text-slate-400 hover:text-white transition-colors">
            Limpiar
          </button>
          <button 
            disabled={isPending}
            onClick={handleRegistrar}
            className={`px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-900/20 transition-all active:scale-95 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPending ? 'Procesando...' : 'Registrar Evaluación'}
          </button>
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