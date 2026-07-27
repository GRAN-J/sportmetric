// =============================================================================
// Utilidades de exportacion (PDF y CSV)
// =============================================================================
// Genera la Ficha Tecnica de una evaluacion o un reporte de varias
// evaluaciones en formatos portables.
//
// Importante: las evaluaciones se desacoplan del modelo User. Los nombres del
// evaluado y evaluador viven en `results.{evaluado, evaluador}` (Ficha Tecnica
// base). Por eso se leen desde ahi.
// =============================================================================

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Exporta una evaluacion individual a PDF (Ficha Tecnica).
 */
export const exportEvaluationToPDF = (evaluation) => {
  const doc = new jsPDF();
  const date = new Date(evaluation.date).toLocaleDateString();
  const evaluado = evaluation.results?.evaluado || 'Sin evaluado';
  const evaluador = evaluation.results?.evaluador || '—';

  // Encabezado
  doc.setFontSize(20);
  doc.setTextColor(0, 128, 128); // Teal
  doc.text('SportMetric Academic', 105, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Ficha Tecnica de Evaluacion', 105, 30, { align: 'center' });

  // Informacion General
  doc.setFontSize(10);
  doc.text(`Protocolo: ${evaluation.protocol?.title || '—'}`, 20, 45);
  doc.text(`Estudiante: ${evaluado}`, 20, 52);
  doc.text(`Evaluador: ${evaluador}`, 20, 59);
  doc.text(`Fecha: ${date}`, 20, 66);

  // Resultados (Tabla Dinamica)
  const resultRows = Object.entries(evaluation.results || {}).map(([key, value]) => [
    String(key).toUpperCase().replace(/_/g, ' '),
    value
  ]);

  doc.autoTable({
    startY: 75,
    head: [['Parametro', 'Resultado']],
    body: resultRows,
    theme: 'striped',
    headStyles: { fillStyle: [0, 128, 128] }
  });

  if (evaluation.notes) {
    const finalY = doc.lastAutoTable?.finalY || 80;
    doc.text('Observaciones:', 20, finalY + 15);
    doc.setFontSize(9);
    doc.text(evaluation.notes, 20, finalY + 22, { maxWidth: 170 });
  }

  const safeTitle = (evaluation.protocol?.title || 'evaluacion').replace(/\s+/g, '_');
  doc.save(`Evaluacion_${safeTitle}_${date}.pdf`);
};

/**
 * Exporta una lista de evaluaciones a CSV (Excel).
 */
export const exportEvaluationsToCSV = (evaluations) => {
  if (!evaluations || !evaluations.length) return;

  // Encabezados
  const headers = ['Fecha', 'Protocolo', 'Estudiante', 'Resultados', 'Notas'];

  const rows = evaluations.map((ev) => [
    new Date(ev.date).toLocaleDateString(),
    ev.protocol?.title || '—',
    ev.results?.evaluado || '—',
    JSON.stringify(ev.results || {}).replace(/"/g, '""'),
    ev.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.map((c) => `"${c}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `Reporte_SportMetric_${new Date().toLocaleDateString()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
