/**
 * @file ArchivarExpediente.tsx
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

import React, { useState, useTransition, useEffect } from 'react';
import { archivarDocumentoAction, obtenerDatosPanelExpediente } from '@/controllers/expediente.controller';
import { Empleado } from '@/types/empleado';
import Toast from '@/components/ui/Toast';

interface Props {
  empleados: Empleado[];
  areas: any[];
}

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function ArchivarExpediente({ empleados, areas }: Props) {
  const [isPending, startTransition] = useTransition();
  const [empleadoId, setEmpleadoId] = useState('');
  const [tipoDoc, setTipoDoc] = useState('Evaluación');
  const [fecha, setFecha] = useState('');
  const [notas, setNotas] = useState('');
  const [confidencialidad, setConfidencialidad] = useState('Normal');
  const [dataPanel, setDataPanel] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Carga inicial de métricas y detalles cuando cambia el empleado
  useEffect(() => {
    const cargar = async () => {
      const res = await obtenerDatosPanelExpediente(empleadoId ? Number(empleadoId) : undefined);
      if (res.success) setDataPanel(res.data);
    };
    cargar();
  }, [empleadoId]);

  const handleArchivar = () => {
    setToast(null);
    if (!empleadoId || !fecha) {
      setToast({ type: 'warning', message: 'Empleado y fecha son obligatorios para archivar.' });
      return;
    }
    startTransition(async () => {
      const res = await archivarDocumentoAction({
        empleadoId: Number(empleadoId),
        fecha,
        tipo: tipoDoc,
        notas
      });
      if (res.success) {
        setToast({ type: 'success', message: res.message || 'Documento archivado en el expediente.' });
        setNotas('');
      } else {
        setToast({ type: 'error', message: res.error || 'Error al archivar el documento.' });
      }
    });
  };

  const handleVerExpedienteClick = () => {
    if (!empleadoId) {
      setToast({ type: 'warning', message: 'Por favor, seleccione un empleado para ver su expediente.' });
      return;
    }
    setToast({ type: 'info', message: 'Abriendo el expediente digital consolidado del trabajador...' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* 2. Diseño de Interfaz: Grid de 3 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna 1: Criterios de Emisión */}
        <aside className="lg:col-span-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Criterios de Emisión</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1">Empleado</label>
              <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-red-500 outline-none transition-all">
                <option value="">Buscar...</option>
                {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombres} {e.apellidos}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1">Tipo de Documento</label>
              <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700">
                <option>Evaluación</option>
                <option>Contrato</option>
                <option>Memorándum</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1">Descripción</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 h-24 resize-none outline-none" placeholder="Notas del documento..."></textarea>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1">Confidencialidad</label>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                {['Bajo', 'Normal', 'Crítico'].map(c => (
                  <button key={c} onClick={() => setConfidencialidad(c)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${confidencialidad === c ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Columna 2: Resultados de Evaluación (Tarjeta Central) */}
        <main className="lg:col-span-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-md h-full flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            
            {/* Avatar Placeholder */}
            <div className="w-24 h-24 bg-slate-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-4 relative z-10">
              <span className="text-3xl font-black text-slate-300">{dataPanel?.detalle?.nombres?.[0] || '?'}</span>
            </div>

            <div className="text-center mb-6 z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {dataPanel?.detalle ? `${dataPanel.detalle.nombres} ${dataPanel.detalle.apellidos}` : 'Seleccione un empleado'}
              </h2>
              <p className="text-sm font-bold text-red-600 uppercase tracking-widest">Desempeño: Bueno</p>
            </div>

            <div className="w-full space-y-2 z-10">
              {[
                { label: 'DNI', val: dataPanel?.detalle?.dni || '--' },
                { label: 'Departamento', val: dataPanel?.detalle?.depto || '--' },
                { label: 'Cargo', val: dataPanel?.detalle?.depto ? `${dataPanel.detalle.depto} G&S` : '--' },
                { label: 'Fecha Ingreso', val: dataPanel?.detalle?.fecha_inicio ? new Date(dataPanel.detalle.fecha_inicio).toLocaleDateString('es-PE') : '01/01/2026' },
                { label: 'Estado', val: dataPanel?.detalle?.estado || 'Activo', isBadge: true }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-colors">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                  {item.isBadge ? (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Activo</span>
                  ) : (
                    <span className="text-sm font-bold text-slate-700">{item.val}</span>
                  )}
                </div>
              ))}
            </div>

            <button className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Documentos Archivados: {dataPanel?.detalle?.total_documentos ?? 0}
            </button>
          </section>
        </main>

        {/* Columna 3: Documentos Recientes */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Documentos Recientes</h3>
          <div className="flex-1 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4 group hover:bg-white hover:border-red-200 transition-all cursor-pointer">
                <div className="w-10 h-10 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="text-xs font-bold text-slate-600">Doc_Anexo_0{i}.pdf</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 mt-4">
            <button onClick={handleArchivar} disabled={isPending || !empleadoId} className={`w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-200 transition-all active:scale-95 ${isPending ? 'opacity-50' : ''}`}>
              {isPending ? 'Archivando...' : 'Archivar Documento'}
            </button>
            <button onClick={handleVerExpedienteClick} className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
              Ver Expediente Completo
            </button>
          </div>
        </aside>
      </div>

      {/* Fila Inferior de Indicadores (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
        {[
          { label: 'Total Documentos', val: dataPanel?.metricas?.totalDocumentos || '0', color: 'text-slate-800', bg: 'bg-slate-100' },
          { label: 'Evaluaciones', val: dataPanel?.metricas?.totalEvaluaciones || '0', color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Reportes', val: dataPanel?.metricas?.totalReportes || '0', color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Calificación', val: '84%', color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:translate-y-[-4px] transition-all">
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />}
                {i === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />}
                {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                {i === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.088 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />}
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-xl font-black text-slate-800">{card.val}</p>
            </div>
          </div>
        ))}
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