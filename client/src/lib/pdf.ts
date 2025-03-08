import { jsPDF } from "jspdf";
import type { Story } from "@shared/schema";

export async function exportStoryToPDF(story: Story): Promise<void> {
  // Create PDF with font support
  const pdf = new jsPDF({
    filters: ["ASCIIHexEncode"] // This helps with Japanese text encoding
  });

  const margin = 20;
  const pageWidth = pdf.internal.pageSize.width - 2 * margin;

  // Add title
  pdf.setFontSize(24);
  pdf.setTextColor(255, 107, 107); // Match primary color from theme
  pdf.text(story.title, margin, 20, { align: "left" });

  // Add metadata
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`From ${story.sourceLanguage} to ${story.targetLanguage}`, margin, 30);
  pdf.text(`Difficulty: ${story.difficulty}`, margin, 37);

  // Add image
  try {
    // Convert image URL to Data URL
    const response = await fetch(story.imageUrl);
    const blob = await response.blob();
    const imageData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    const imageHeight = 60;
    pdf.addImage(imageData, "PNG", margin, 45, pageWidth - margin, imageHeight);

    // Add story content
    pdf.setFontSize(14);
    pdf.setTextColor(33, 33, 33);
    const contentLines = pdf.splitTextToSize(story.content, pageWidth - margin);
    pdf.text(contentLines, margin, imageHeight + 55);

    let y = imageHeight + 65 + (contentLines.length * 7);

    // Add translations section
    pdf.setFontSize(16);
    pdf.setTextColor(255, 107, 107);
    pdf.text("Key Translations", margin, y);

    // Add translations
    y += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(33, 33, 33);

    Object.entries(story.translations).forEach(([phrase, translation]) => {
      // Source phrase
      const sourceLines = pdf.splitTextToSize(phrase, pageWidth - 2 * margin);
      pdf.text(sourceLines, margin, y);
      y += sourceLines.length * 7;

      // Translation
      pdf.setTextColor(100, 100, 100);
      const translationLines = pdf.splitTextToSize(translation, pageWidth - 2 * margin);
      pdf.text(translationLines, margin, y);
      y += translationLines.length * 7 + 10;

      // Add new page if needed
      if (y > pdf.internal.pageSize.height - margin) {
        pdf.addPage();
        y = margin;
      }
    });

  } catch (error) {
    console.error("Failed to process image:", error);
    // Add content without image
    pdf.setFontSize(14);
    pdf.setTextColor(33, 33, 33);
    const contentLines = pdf.splitTextToSize(story.content, pageWidth - margin);
    pdf.text(contentLines, margin, 50);
  }

  // Save the PDF with proper encoding for Japanese characters
  pdf.save(`${story.title}.pdf`);
}