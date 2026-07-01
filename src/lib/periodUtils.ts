/**
 * @file periodUtils.ts
 * @description Librería utilitaria y de configuración global para el módulo de PERIODUTILS.
 * @module ExtintoresGS/lib
 * @copyright Extintores GS S.A.C. Todos los derechos reservados.
 * 
 * ============================================================================
 * SECCIÓN GENERAL DE DOCUMENTACIÓN Y RESUMEN DE FUNCIONES:
 * - Provee control reactivo y encapsulación de lógica.
 * - Asegura la consistencia en el tipado y llamado de las consultas SQL/Actions.
 * ============================================================================
 */

/**
 * Utilidades para generación dinámica de periodos analíticos
 * en base a las fechas y requerimientos corporativos.
 */

export interface PeriodoOpcion {
  value: string;
  label: string;
  tipo: 'Mes' | 'Trimestre' | 'Semestre';
}

/**
 * Genera una lista dinámica de periodos (Meses, Trimestres, Semestres)
 * que siempre incluye el mes actual, y si hay datos de hasta hace 10 años,
 * permite seleccionarlos correspondientemente.
 * 
 * @param minFechaStr Fecha mínima desde la cual hay datos registrados.
 */
export function generarPeriodosDinamicos(minFechaStr: string = '2025-01-01'): PeriodoOpcion[] {
  const periodos: PeriodoOpcion[] = [];
  const minDate = new Date(minFechaStr);
  const maxDate = new Date(); // Fecha/Mes actual
  
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  
  // 1. Generar Semestres
  for (let y = maxYear; y >= minYear; y--) {
    periodos.push({ value: `${y}-II`, label: `${y} - Segundo Semestre`, tipo: 'Semestre' });
    periodos.push({ value: `${y}-I`, label: `${y} - Primer Semestre`, tipo: 'Semestre' });
  }

  // 2. Generar Trimestres
  for (let y = maxYear; y >= minYear; y--) {
    periodos.push({ value: `${y}-T4`, label: `${y} - Cuarto Trimestre (T4)`, tipo: 'Trimestre' });
    periodos.push({ value: `${y}-T3`, label: `${y} - Tercer Trimestre (T3)`, tipo: 'Trimestre' });
    periodos.push({ value: `${y}-T2`, label: `${y} - Segundo Trimestre (T2)`, tipo: 'Trimestre' });
    periodos.push({ value: `${y}-T1`, label: `${y} - Primer Trimestre (T1)`, tipo: 'Trimestre' });
  }

  // 3. Generar Mensuales (hasta hace 10 años)
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const currentMonthIdx = maxDate.getMonth();
  const currentYear = maxDate.getFullYear();

  let y = currentYear;
  let m = currentMonthIdx;
  const targetYear = Math.max(minYear, currentYear - 10);
  
  while (y > targetYear || (y === targetYear && m >= minDate.getMonth())) {
    const monthNum = String(m + 1).padStart(2, '0');
    periodos.push({
      value: `${y}-${monthNum}`,
      label: `${y} - ${meses[m]}`,
      tipo: 'Mes'
    });
    
    m--;
    if (m < 0) {
      m = 11;
      y--;
    }
  }

  return periodos;
}
