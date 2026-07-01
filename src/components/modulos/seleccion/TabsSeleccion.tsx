/**
 * @file TabsSeleccion.tsx
 * @description Componente de interfaz de usuario correspondiente a los procesos de Selección, Convocatoria y Contratación de Postulantes.
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

import { useState } from 'react';
import dynamic from 'next/dynamic';

const RegistroSolicitud = dynamic(() => import('./RegistroSolicitud'));
const PublicarConvocatoria = dynamic(() => import('./PublicarConvocatoria'));
const ClasificarPostulantes = dynamic(() => import('./ClasificarPostulantes'));
const RegistroEntrevista = dynamic(() => import('./RegistroEntrevista'));
const EvaluarCandidatos = dynamic(() => import('./EvaluarCandidatos'));
const GestionarContrato = dynamic(() => import('./GestionarContrato'));

const pestañas = [
  { id: 'solicitud', titulo: 'Registrar Solicitud de Contratación' },
  { id: 'convocatoria', titulo: 'Publicar Convocatoria' },
  { id: 'postulantes', titulo: 'Clasificar Postulantes' },
  { id: 'entrevista', titulo: 'Registrar Entrevista' },
  { id: 'evaluacion', titulo: 'Evaluar Candidatos' },
  { id: 'contrato', titulo: 'Gestionar Contrato' },
];

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function TabsSeleccion() {
  const [tabActiva, setTabActiva] = useState(pestañas[0].id);

  return (
    <div className="space-y-6">
      {/* Menú de Pestañas (Estilo Cápsula Premium) */}
      <div className="flex overflow-x-auto gap-1 p-1.5 bg-white rounded-3xl border border-slate-100 shadow-sm no-scrollbar backdrop-blur-sm bg-white/80 sticky top-0 z-20">
        {pestañas.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className={`px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
              tabActiva === tab.id
                ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-[1.02]'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.titulo}
          </button>
        ))}
      </div>

      {/* Contenedor dinámico de tarjeta premium unificada */}
      <div className="bg-white p-8 border border-slate-100 rounded-3xl shadow-sm min-h-[400px]">
        <div key={tabActiva} className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          {tabActiva === 'solicitud' ? (
            <RegistroSolicitud />
          ) : tabActiva === 'convocatoria' ? (
            <PublicarConvocatoria />
          ) : tabActiva === 'postulantes' ? (
            <ClasificarPostulantes />
          ) : tabActiva === 'entrevista' ? (
            <RegistroEntrevista />
          ) : tabActiva === 'evaluacion' ? (
            <EvaluarCandidatos />
          ) : tabActiva === 'contrato' ? (
            <GestionarContrato />
          ) : (
            <div className="flex h-full min-h-[350px] items-center justify-center">
              <p className="text-gray-400 font-medium">Contenido de la pestaña en construcción...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
