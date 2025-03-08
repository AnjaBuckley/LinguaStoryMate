import { jsPDF } from "jspdf";
import type { Story } from "@shared/schema";

export async function exportStoryToPDF(story: Story): Promise<void> {
  const pdf = new jsPDF();
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.width - 2 * margin;
  
  // Add title
  pdf.setFontSize(24);
  pdf.text(story.title, margin, 20);
  
  // Add metadata
  pdf.setFontSize(12);
  pdf.text(`Language: ${story.sourceLanguage} → ${story.targetLanguage}`, margin, 35);
  pdf.text(`Difficulty: ${story.difficulty}`, margin, 45);
  
  // Add content
  pdf.setFontSize(14);
  const contentLines = pdf.splitTextToSize(story.content, pageWidth);
  pdf.text(contentLines, margin, 65);
  
  let y = 65 + contentLines.length * 7;
  
  // Add translations
  pdf.setFontSize(16);
  pdf.text("Translations", margin, y + 20);
  
  y += 30;
  pdf.setFontSize(12);
  Object.entries(story.translations).forEach(([phrase, translation]) => {
    const text = `${phrase} → ${translation}`;
    const lines = pdf.splitTextToSize(text, pageWidth);
    pdf.text(lines, margin, y);
    y += lines.length * 7 + 5;
    
    // Add new page if needed
    if (y > pdf.internal.pageSize.height - margin) {
      pdf.addPage();
      y = margin;
    }
  });
  
  // Save the PDF
  pdf.save(`${story.title}.pdf`);
}
