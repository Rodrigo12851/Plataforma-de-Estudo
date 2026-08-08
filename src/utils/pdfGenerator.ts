import { jsPDF } from 'jspdf';
import { ClassLesson } from '../types';

export function generateLessonPdf(lesson: ClassLesson) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TubeStudy AI — Apostila de Estudo Completa', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} | Categoria: ${lesson.category}`, margin, 20);

  y = 36;

  // Title Section
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const titleLines = doc.splitTextToSize(lesson.title, pageWidth - margin * 2);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 2;

  // Channel & Metadata
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Canal: ${lesson.channel} | Duração: ${lesson.duration} | Link: ${lesson.youtubeUrl}`, margin, y);
  y += 10;

  // Horizontal Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // 1. Resumo da Aula
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. RESUMO EXECUTIVO DA AULA', margin + 4, y + 5.5);
  y += 13;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(lesson.summary, pageWidth - margin * 2);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 8;

  // Check Page Break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 280) {
      doc.addPage();
      y = 20;
    }
  };

  // 2. Pontos-Chave
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. PRINCIPAIS CONCEITOS (KEY TAKEAWAYS)', margin + 4, y + 5.5);
  y += 13;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  lesson.keyTakeaways.forEach((takeaway) => {
    checkPageBreak(12);
    const bulletLines = doc.splitTextToSize(`• ${takeaway}`, pageWidth - margin * 2 - 4);
    doc.text(bulletLines, margin + 2, y);
    y += bulletLines.length * 5 + 2;
  });
  y += 6;

  // 3. Marcadores de Tempo
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. ÍNDICE DE CONTEÚDO POR TIMESTAMP', margin + 4, y + 5.5);
  y += 13;

  lesson.timestamps.forEach((ts) => {
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text(`[${ts.time}] ${ts.topic}`, margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const tsLines = doc.splitTextToSize(ts.summary, pageWidth - margin * 2 - 4);
    doc.text(tsLines, margin + 4, y);
    y += tsLines.length * 4.5 + 4;
  });
  y += 6;

  // 4. Flashcards de Fixação
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. FLASHCARDS DE REPETIÇÃO ESPAÇADA (10 CARDS)', margin + 4, y + 5.5);
  y += 13;

  lesson.flashcards.forEach((fc, idx) => {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const frontLines = doc.splitTextToSize(`Card ${idx + 1}: ${fc.front}`, pageWidth - margin * 2);
    doc.text(frontLines, margin, y);
    y += frontLines.length * 4.5 + 1;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const backLines = doc.splitTextToSize(`R: ${fc.back}`, pageWidth - margin * 2 - 4);
    doc.text(backLines, margin + 4, y);
    y += backLines.length * 4 + 4;
  });
  y += 6;

  // 5. Quiz & Gabarito
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('5. EXERCÍCIOS DE FIXAÇÃO E GABARITO COMENTADO', margin + 4, y + 5.5);
  y += 13;

  lesson.quiz.forEach((q, idx) => {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const qLines = doc.splitTextToSize(`Q${idx + 1}: ${q.question} ${q.timestampRef ? `(Ref: min ${q.timestampRef})` : ''}`, pageWidth - margin * 2);
    doc.text(qLines, margin, y);
    y += qLines.length * 4.5 + 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    q.options.forEach((opt, oIdx) => {
      checkPageBreak(6);
      const isCorrect = oIdx === q.correctAnswer;
      if (isCorrect) {
        doc.setTextColor(22, 101, 52); // Green 800
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
      }
      const optText = `  ${String.fromCharCode(65 + oIdx)}) ${opt} ${isCorrect ? ' [GABARITO]' : ''}`;
      const optLines = doc.splitTextToSize(optText, pageWidth - margin * 2 - 4);
      doc.text(optLines, margin + 2, y);
      y += optLines.length * 4 + 1;
    });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const expLines = doc.splitTextToSize(`Explicação: ${q.explanation}`, pageWidth - margin * 2 - 4);
    doc.text(expLines, margin + 4, y + 2);
    y += expLines.length * 4 + 6;
  });

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`TubeStudy AI - Página ${i} de ${totalPages}`, pageWidth - margin - 25, 290);
  }

  const filename = `Apostila_${lesson.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}.pdf`;
  doc.save(filename);
}
