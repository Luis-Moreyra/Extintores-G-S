/**
 * @file GestionarContrato.tsx
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

import { useState, useEffect } from 'react';
import { gestionarContrato, guardarBorradorContrato, obtenerContratos, obtenerPostulantes, obtenerConvocatorias, firmarYContratarPostulanteAction, obtenerTodosLosPostulantesAction } from '@/controllers/seleccion.controller';
import { AlertCircle, CheckCircle, Download } from 'lucide-react';

// ==========================================
// COMPONENTE PRINCIPAL DE LA VISTA
// ==========================================
export default function GestionarContrato() {
  const [formData, setFormData] = useState({
    idPostulante: '',
    tipoContrato: 'Indefinido',
    fechaInicio: '',
    fechaTermino: '',
    salario: '',
    cargo: '',
    area: '',
    modalidad: 'Presencial',
    periodoPrueba: '3 meses',
    beneficios: '',
  });

  const [convocatorias, setConvocatorias] = useState<any[]>([]);
  const [postulantes, setPostulantes] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [idConvocatoriaSeleccionada, setIdConvocatoriaSeleccionada] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [accion, setAccion] = useState<'enviar' | 'borrador' | 'descargar'>('enviar');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resConvocatorias = await obtenerConvocatorias();
        if (resConvocatorias.success) {
          setConvocatorias(resConvocatorias.data);
          if (resConvocatorias.data.length > 0) {
            setIdConvocatoriaSeleccionada(resConvocatorias.data[0].id_convocatoria);
          }
        }

        const resContratos = await obtenerContratos();
        if (resContratos.success) {
          setContratos(resContratos.data);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoadingInicial(false);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    cargarPostulantesAprobados();
  }, []);

  const cargarPostulantesAprobados = async () => {
    try {
      const res = await obtenerTodosLosPostulantesAction();
      if (res.success) {
        const aprobados = res.data.filter((p: any) => p.estado === 'Aprobado');
        setPostulantes(aprobados);
      }
    } catch (error) {
      console.error('Error cargando postulantes:', error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'idPostulante' && value) {
        const cand = postulantes.find(p => String(p.id_postulante) === value);
        if (cand) {
          const conv = convocatorias.find(c => String(c.id_convocatoria) === String(cand.id_convocatoria));
          if (conv) {
            updated.cargo = conv.cargo || '';
            const cargoL = (conv.cargo || '').toLowerCase();
            if (cargoL.includes('sistemas') || cargoL.includes('desarrollador') || cargoL.includes('it')) {
              updated.area = 'Sistemas';
            } else if (cargoL.includes('ventas') || cargoL.includes('comercial')) {
              updated.area = 'Ventas';
            } else if (cargoL.includes('contable') || cargoL.includes('contabilidad') || cargoL.includes('finanzas')) {
              updated.area = 'Contabilidad';
            } else if (cargoL.includes('operaciones') || cargoL.includes('logistica')) {
              updated.area = 'Operaciones';
            } else if (cargoL.includes('recursos') || cargoL.includes('talento') || cargoL.includes('rrhh') || cargoL.includes('personal')) {
              updated.area = 'Recursos Humanos';
            } else {
              updated.area = 'Administración';
            }
          }
        }
      }
      return updated;
    });
  };

  const handleDescargarPDF = async () => {
    if (!formData.idPostulante) {
      setTipoMensaje('error');
      setMensaje('Debe seleccionar un candidato primero');
      setTimeout(() => setMensaje(''), 5000);
      return;
    }
    const cand = postulantes.find(p => String(p.id_postulante) === formData.idPostulante);
    if (!cand) return;

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    const COLOR_PRIMARY = [220, 38, 38]; // Rojo Corporativo
    const COLOR_TEXT = [30, 41, 59]; // Gris Oscuro

    // Fondo blanco limpio
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Título y Cabecera Decorativa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text('CONTRATO INDIVIDUAL DE TRABAJO', 15, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(`Extintores GS - Documento de Contratación Digital`, 15, 31);
    doc.text(`Fecha de Redacción: ${new Date().toLocaleDateString()}`, 15, 36);

    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.8);
    doc.line(15, 40, 195, 40);

    // --- Detalles del Candidato ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
    doc.text('I. PARTES CONTRATANTES', 15, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`El presente documento contractual se celebra entre EXTINTORES GS (en adelante "El Empleador") y el/la colaborador(a):`, 15, 56);
    doc.text(`Colaborador(a): ${cand.nombre_completo}`, 15, 61);
    doc.text(`DNI / Documento: ${cand.dni || '--'}`, 15, 66);
    doc.text(`Correo Electrónico: ${cand.email || '--'}`, 15, 71);

    // --- Condiciones Generales ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('II. CONDICIONES LABORALES Y BENEFICIOS', 15, 82);

    doc.setFont('helvetica', 'normal');
    doc.text(`Cargo Asignado: ${formData.cargo || cand.cargo || 'Operador'}`, 15, 88);
    doc.text(`Área / Departamento: ${formData.area || 'Operaciones'}`, 15, 93);
    doc.text(`Tipo de Contrato: ${formData.tipoContrato}`, 15, 98);
    doc.text(`Modalidad de Trabajo: ${formData.modalidad}`, 15, 103);
    doc.text(`Salario Mensual: S/ ${parseFloat(formData.salario || '0').toFixed(2)}`, 15, 108);
    doc.text(`Período de Prueba: ${formData.periodoPrueba}`, 15, 113);
    doc.text(`Fecha de Inicio: ${formData.fechaInicio}`, 15, 118);

    doc.setFont('helvetica', 'bold');
    doc.text('Beneficios y Cláusulas Adicionales:', 15, 126);
    doc.setFont('helvetica', 'normal');
    const splitBeneficios = doc.splitTextToSize(formData.beneficios || 'Ingreso a planilla con todos los beneficios de ley correspondientes.', 170);
    doc.text(splitBeneficios, 15, 131);

    // Firmas
    const firmaY = 220;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(25, firmaY, 85, firmaY);
    doc.line(125, firmaY, 185, firmaY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Firma del Colaborador', 40, firmaY + 5);
    doc.text('Firma de Extintores GS', 140, firmaY + 5);

    doc.save(`Contrato_${cand.nombre_completo.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');

    if (!formData.idPostulante || !formData.tipoContrato || !formData.fechaInicio || !formData.fechaTermino || !formData.salario) {
      setTipoMensaje('error');
      setMensaje('Se han encontrado datos inválidos o incompletos');
      setLoading(false);
      setTimeout(() => setMensaje(''), 5000);
      return;
    }

    if (formData.fechaTermino <= formData.fechaInicio) {
      setTipoMensaje('error');
      setMensaje('La fecha de término debe ser mayor a la fecha de inicio');
      setLoading(false);
      setTimeout(() => setMensaje(''), 5000);
      return;
    }

    let result;
    if (accion === 'borrador') {
      result = await guardarBorradorContrato({
        idPostulante: parseInt(formData.idPostulante),
        tipoContrato: formData.tipoContrato,
        fechaInicio: formData.fechaInicio,
        fechaTermino: formData.fechaTermino,
        salario: parseFloat(formData.salario),
        cargo: formData.cargo,
        area: formData.area,
        modalidad: formData.modalidad,
        periodoPrueba: formData.periodoPrueba,
        beneficios: formData.beneficios,
      });
    } else {
      result = await gestionarContrato({
        idPostulante: parseInt(formData.idPostulante),
        tipoContrato: formData.tipoContrato,
        fechaInicio: formData.fechaInicio,
        fechaTermino: formData.fechaTermino,
        salario: parseFloat(formData.salario),
        cargo: formData.cargo,
        area: formData.area,
        modalidad: formData.modalidad,
        periodoPrueba: formData.periodoPrueba,
        beneficios: formData.beneficios,
      });
    }

    setTipoMensaje(result.success ? 'success' : 'error');
    setMensaje(result.message);

    if (result.success) {
      const resContratos = await obtenerContratos();
      if (resContratos.success) {
        setContratos(resContratos.data);
      }
    }

    setLoading(false);
    setTimeout(() => setMensaje(''), 5000);
  };

  const handleFirmarContrato = async (idPostulante: number) => {
    if (window.confirm('¿Está seguro de que desea firmar este contrato y dar de alta al empleado?')) {
      setLoading(true);
      setMensaje('');
      const res = await firmarYContratarPostulanteAction(idPostulante);
      setLoading(false);
      setTipoMensaje(res.success ? 'success' : 'error');
      setMensaje(res.message);
      if (res.success) {
        const resContratos = await obtenerContratos();
        if (resContratos.success) {
          setContratos(resContratos.data);
        }
        await cargarPostulantesAprobados();
      }
      setTimeout(() => setMensaje(''), 5000);
    }
  };

  if (loadingInicial) {
    return <div className="text-center text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Gestionar Contrato</h3>

        {mensaje && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${tipoMensaje === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {tipoMensaje === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {mensaje}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Candidato seleccionado *</label>
          <select
            name="idPostulante"
            value={formData.idPostulante}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          >
            <option value="">Seleccionar candidato</option>
            {postulantes.map(post => (
              <option key={post.id_postulante} value={post.id_postulante}>{post.nombre_completo}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de contrato *</label>
            <select
              name="tipoContrato"
              value={formData.tipoContrato}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            >
              <option value="Indefinido">Indefinido</option>
              <option value="Determinado">Determinado</option>
              <option value="Practicante">Practicante</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad de trabajo *</label>
            <select
              name="modalidad"
              value={formData.modalidad}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            >
              <option value="Presencial">Presencial</option>
              <option value="Remoto">Remoto</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
            <input
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Término *</label>
            <input
              type="date"
              name="fechaTermino"
              value={formData.fechaTermino}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo/Posición *</label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área/Departamento *</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salario ofrecido (S/.) *</label>
            <input
              type="number"
              name="salario"
              value={formData.salario}
              onChange={handleChange}
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período de prueba *</label>
            <select
              name="periodoPrueba"
              value={formData.periodoPrueba}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
            >
              <option value="Sin prueba">Sin prueba</option>
              <option value="1 mes">1 mes</option>
              <option value="2 meses">2 meses</option>
              <option value="3 meses">3 meses</option>
              <option value="6 meses">6 meses</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beneficios Adicionales</label>
          <textarea
            name="beneficios"
            value={formData.beneficios}
            onChange={handleChange}
            rows={3}
            placeholder="Seguro, bono, comisiones, etc."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-600 focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAccion('borrador')}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Guardar Borrador
          </button>
          <button
            type="button"
            onClick={handleDescargarPDF}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Descargar PDF
          </button>
          <button
            type="submit"
            onClick={() => setAccion('enviar')}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors font-medium"
          >
            {loading ? 'Enviando...' : 'Enviar para Firma'}
          </button>
        </div>
      </form>

      {/* Listado de contratos */}
      {contratos.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Contratos Gestionados</h3>
          <div className="space-y-3">
            {contratos.map((cont: any) => (
              <div key={cont.id_contrato} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{cont.nombre_completo}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cont.estado === 'Enviado para firma' ? 'bg-yellow-100 text-yellow-700' :
                    cont.estado === 'Firmado' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {cont.estado}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
                  <p><strong>Cargo:</strong> {cont.cargo}</p>
                  <p><strong>Salario:</strong> S/ {(typeof cont.salario === 'string' ? parseFloat(cont.salario) : cont.salario || 0).toFixed(2)}</p>
                  <p><strong>Inicio:</strong> {new Date(cont.fecha_inicio).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400">Modalidad: {cont.modalidad}</div>
                  {cont.estado === 'Enviado para firma' && (
                    <button
                      onClick={() => handleFirmarContrato(cont.id_postulante)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all"
                    >
                      ✍️ Firmar y Contratar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
