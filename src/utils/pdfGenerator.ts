import jsPDF from 'jspdf';

interface ProjectData {
  projectName: string;
  usBuilding: string;
  totalSurface: string;
  evacuationHeight: string;
  floors: string;
  maxOccupancy: string;
  buildingLocation: string;
}

interface SIResult {
  title: string;
  compliance: boolean;
  calculations: { label: string; value: string }[];
  recommendations: string[];
}

export const generatePDFReport = (projectData: ProjectData, siResults: SIResult[]) => {
  const pdf = new jsPDF();
  let yPos = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;

  // Títol principal
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORME CTE DB-SI', margin, yPos);
  
  yPos += 10;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text(projectData.projectName || 'Projecte sense nom', margin, yPos);

  yPos += 15;

  // Funció per afegir nova pàgina si cal
  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
    }
  };

  // Secció 1: Dades de partida
  checkPageBreak(50);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1. DADES DE PARTIDA', margin, yPos);
  yPos += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const datosPartida = [
    { label: 'Nom del projecte:', value: projectData.projectName },
    { label: 'Ús de l\'edifici:', value: getUsageLabel(projectData.usBuilding) },
    { label: 'Superfície total:', value: `${projectData.totalSurface} m²` },
    { label: 'Alçada d\'evacuació:', value: `${projectData.evacuationHeight} m` },
    { label: 'Número de plantes:', value: projectData.floors },
    { label: 'Ocupació màxima:', value: `${projectData.maxOccupancy} persones` },
    { label: 'Ubicació:', value: getLocationLabel(projectData.buildingLocation) },
  ];

  datosPartida.forEach(dato => {
    checkPageBreak(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(dato.label, margin, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(dato.value || 'No especificat', margin + 60, yPos);
    yPos += 7;
  });

  yPos += 10;

  // Secció 2: Justificació de cada SI
  checkPageBreak(50);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2. JUSTIFICACIÓ PER SECCIONS SI', margin, yPos);
  yPos += 15;

  siResults.forEach((si, index) => {
    checkPageBreak(40);
    
    // Títol del SI
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`2.${index + 1} ${si.title}`, margin, yPos);
    yPos += 10;

    // Estat de compliment
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    const textColor = si.compliance ? [0, 120, 0] : [200, 0, 0];
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.text(`Estat: ${si.compliance ? 'COMPLEIX' : 'NO COMPLEIX'}`, margin, yPos);
    pdf.setTextColor(0, 0, 0);
    yPos += 8;

    // Càlculs
    if (si.calculations.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Càlculs:', margin, yPos);
      yPos += 6;
      
      si.calculations.forEach(calc => {
        checkPageBreak(6);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`• ${calc.label}: ${calc.value}`, margin + 5, yPos);
        yPos += 5;
      });
      yPos += 3;
    }

    // Recomanacions
    if (si.recommendations.length > 0) {
      checkPageBreak(15);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recomanacions:', margin, yPos);
      yPos += 6;
      
      si.recommendations.forEach(rec => {
        checkPageBreak(6);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`• ${rec}`, margin + 5, yPos);
        yPos += 5;
      });
    }

    yPos += 10;
  });

  // Peu de pàgina amb data
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generat el ${new Date().toLocaleDateString('ca-ES')} - Pàgina ${i} de ${totalPages}`, 
      margin, pageHeight - 10);
  }

  // Descarregar el PDF
  const fileName = `${projectData.projectName.replace(/[^a-zA-Z0-9]/g, '_')}_CTE_DB_SI.pdf`;
  pdf.save(fileName);
};

const getUsageLabel = (value: string): string => {
  const usages: { [key: string]: string } = {
    residential: 'Residencial',
    office: 'Oficines',
    commercial: 'Comercial',
    industrial: 'Industrial',
    educational: 'Educatiu',
    healthcare: 'Sanitari',
    hotel: 'Hoteler',
  };
  return usages[value] || value;
};

const getLocationLabel = (value: string): string => {
  const locations: { [key: string]: string } = {
    urban: 'Urbà',
    rural: 'Rural',
    industrial: 'Polígon industrial',
  };
  return locations[value] || value;
};