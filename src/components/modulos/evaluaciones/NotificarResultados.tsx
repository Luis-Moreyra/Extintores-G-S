/**
 * @file NotificarResultados.tsx
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

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Mail, 
  Bell, 
  Smartphone, 
  ArrowUp, 
  Check, 
  Eye, 
  BarChart, 
  Star, 
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Empleado } from '@/types/empleado';
import { enviarNotificacionResultadosAction, obtenerInfoNotificacionAction } from '@/controllers/notificacion.controller';
import Toast from '@/components/ui/Toast';

interface Props {
  empleados: Empleado[];
  areas?: any[];
}

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function NotificarResultados({ empleados, areas = [] }: Props) {
  const [isPending, startTransition] = useTransition();
  const [empleadoSeleccionadoId, setEmpleadoSeleccionadoId] = useState('');
  const [detalleEvaluacion, setDetalleEvaluacion] = useState<any>(null);
  const [metricas, setMetricas] = useState<any>({ total: 0, notificados: 0, destacados: 0 });
  const [metodoEnvio, setMetodoEnvio] = useState<'email' | 'push' | 'sms'>('email');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const empInfo = React.useMemo(() => {
    return empleados.find(e => String(e.id_empleado) === empleadoSeleccionadoId);
  }, [empleadoSeleccionadoId, empleados]);

  // Estados para el formulario
  const [config, setConfig] = useState({
    evaluacion: 'Seleccione una evaluación',
    tipo: 'Notificación Estándar',
    destinatarios: {
      empleado: true,
      supervisor: false,
      rrhh: false,
      gerencia: false
    },
    mensaje: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  // Carga inicial de estadísticas
  const cargarMetricas = async () => {
    const res = await obtenerInfoNotificacionAction();
    if (res.success && res.data) {
      setMetricas(res.data.metricas);
    }
  };

  useEffect(() => {
    cargarMetricas();
  }, []);

  // Cargar detalles al cambiar el empleado
  useEffect(() => {
    if (!empleadoSeleccionadoId) {
      setDetalleEvaluacion(null);
      setConfig(prev => ({ ...prev, evaluacion: 'Seleccione una evaluación' }));
      return;
    }
    const cargarDetalle = async () => {
      const res = await obtenerInfoNotificacionAction(Number(empleadoSeleccionadoId));
      if (res.success && res.data && res.data.detalle) {
        setDetalleEvaluacion(res.data.detalle);
        setConfig(prev => ({
          ...prev,
          evaluacion: `Evaluación de Desempeño - ${res.data.detalle.nombres} ${res.data.detalle.apellidos}`,
        }));
      } else {
        setDetalleEvaluacion(null);
        setConfig(prev => ({ ...prev, evaluacion: 'Sin evaluación registrada' }));
      }
    };
    cargarDetalle();
  }, [empleadoSeleccionadoId]);

  const handleEnviar = () => {
    setToast(null);
    if (!detalleEvaluacion) {
      setToast({ type: 'warning', message: 'Por favor, seleccione un empleado con una evaluación de desempeño registrada.' });
      return;
    }

    startTransition(async () => {
      const res = await enviarNotificacionResultadosAction(
        detalleEvaluacion.id_evaluacion,
        detalleEvaluacion.id_empleado,
        metodoEnvio
      );
      if (res.success) {
        setToast({ type: 'success', message: res.message || 'Notificación enviada correctamente.' });
        await cargarMetricas();
      } else {
        setToast({ type: 'error', message: res.error || 'Error al enviar la notificación.' });
      }
    });
  };

  const handleRestablecer = () => {
    setEmpleadoSeleccionadoId('');
    setDetalleEvaluacion(null);
    setToast(null);
    setConfig({
      evaluacion: 'Seleccione una evaluación',
      tipo: 'Notificación Estándar',
      destinatarios: { empleado: true, supervisor: false, rrhh: false, gerencia: false },
      mensaje: '',
      fecha: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMNA 1 — Configuración de Notificación */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Configuración de Notificación</h2>
            <div className="h-1 w-12 bg-green-500 mt-2"></div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Empleado a Notificar *</label>
              <div className="relative">
                <select 
                  value={empleadoSeleccionadoId}
                  onChange={(e) => setEmpleadoSeleccionadoId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccione un empleado...</option>
                  {empleados.map(e => (
                    <option key={e.id_empleado} value={e.id_empleado}>{e.nombres} {e.apellidos}</option>
                  ))}
                </select>
              </div>
              {empInfo && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs animate-in fade-in duration-300">
                  <div className="flex justify-between"><span className="text-gray-400 font-bold">DNI:</span> <span className="font-bold text-gray-700">{empInfo.dni || '--'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-bold">Área:</span> <span className="font-bold text-gray-700">{areas.find(a => a.id_area === empInfo.id_area)?.nombre_area || '--'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 font-bold">Correo:</span> <span className="font-bold text-gray-500">{empInfo.correo || '--'}</span></div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Evaluación Seleccionada</label>
              <input 
                type="text" 
                readOnly
                value={config.evaluacion}
                className="w-full p-3 bg-slate-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Notificación</label>
              <div className="relative">
                <select 
                  value={config.tipo}
                  onChange={(e) => setConfig({...config, tipo: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  <option>Notificación Estándar</option>
                  <option>Notificación Urgente</option>
                  <option>Retroalimentación</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { id: 'empleado', label: 'Empleado Evaluado' },
                { id: 'supervisor', label: 'Supervisor Directo' },
                { id: 'rrhh', label: 'Recursos Humanos' },
                { id: 'gerencia', label: 'Gerencia General' }
              ].map(dest => (
                <label key={dest.id} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    checked={(config.destinatarios as any)[dest.id]}
                    onChange={(e) => setConfig({
                      ...config, 
                      destinatarios: {...config.destinatarios, [dest.id]: e.target.checked}
                    })}
                  />
                  <span className="text-sm text-gray-600">{dest.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje Personalizado (Opcional)</label>
              <textarea 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm h-24 resize-none focus:outline-none"
                placeholder="Escriba un mensaje adicional..."
                value={config.mensaje}
                onChange={(e) => setConfig({...config, mensaje: e.target.value})}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Envío</label>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
                  value={config.fecha}
                  onChange={(e) => setConfig({...config, fecha: e.target.value})}
                />
              </div>
            </div>
          </div>
        </section>

        {/* COLUMNA 2 — Vista Previa de la Notificación */}
        <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Vista Previa de la Notificación</h2>
            <div className="h-1 w-12 bg-green-500 mt-2"></div>
          </div>

          {/* Simulación de Email */}
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                {detalleEvaluacion ? detalleEvaluacion.nombres[0] : 'E'}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Resultados de tu Evaluación</p>
                <p className="text-xs text-gray-500">Periodo: {detalleEvaluacion ? '2026-I' : 'Noviembre 2025'}</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-green-600 font-bold">
                Hola {detalleEvaluacion ? `${detalleEvaluacion.nombres} ${detalleEvaluacion.apellidos}` : 'Juan Carlos Pérez López'},
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Nos complace compartir contigo los resultados de tu evaluación de desempeño laboral. Agradecemos tu compromiso y dedicación.
              </p>

              {/* Tarjeta de Puntuación */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center max-w-[200px] mx-auto">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Tu Puntuación</p>
                <p className="text-5xl font-black text-green-600 mb-2">
                  {detalleEvaluacion ? Number(detalleEvaluacion.puntaje || 0).toFixed(2) : '4.25'}
                </p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-normal">
                  {detalleEvaluacion 
                    ? (detalleEvaluacion.puntaje >= 4.0 ? 'Desempeño Excelente' : detalleEvaluacion.puntaje >= 3.0 ? 'Desempeño Bueno' : 'En Desarrollo')
                    : 'Desempeño Bueno'}
                </p>
              </div>

              {config.mensaje && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs italic text-gray-600 leading-relaxed">
                  "{config.mensaje}"
                </div>
              )}
            </div>
          </div>
        </section>

        {/* COLUMNA 3 — Método de Envío + Estadísticas */}
        <section className="space-y-8">
          {/* Métodos de Envío */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'push', label: 'Notificación Push', icon: Bell },
                { id: 'sms', label: 'SMS', icon: Smartphone }
              ].map(metodo => (
                <div 
                  key={metodo.id} 
                  onClick={() => setMetodoEnvio(metodo.id as any)}
                  className={`flex-1 min-w-[100px] p-6 border rounded-xl text-center flex flex-col items-center gap-3 shadow-sm transition-all cursor-pointer ${
                    metodoEnvio === metodo.id 
                      ? 'border-green-600 bg-green-50 text-green-700' 
                      : 'bg-white border-gray-200 text-gray-400 hover:border-green-300'
                  }`}
                >
                  <metodo.icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{metodo.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Notificaciones Enviadas', value: String(metricas.notificados || 0), icon: ArrowUp },
              { label: 'Entregadas', value: String(metricas.notificados || 0), icon: Check },
              { label: 'Leídas', value: String(Math.round((metricas.notificados || 0) * 0.9)), icon: Eye },
              { label: 'Tasa de Apertura', value: (metricas.notificados || 0) > 0 ? '90%' : '0%', icon: BarChart }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3 relative overflow-hidden">
                <div className="text-green-500 mb-1">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* PIE DE PÁGINA — Acciones */}
      <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-100">
        <button 
          onClick={handleRestablecer}
          className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
        >
          Restablecer
        </button>
        <button 
          onClick={handleEnviar}
          disabled={isPending}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-black uppercase tracking-widest shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? 'Enviando...' : 'Enviar Notificación'}
        </button>
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