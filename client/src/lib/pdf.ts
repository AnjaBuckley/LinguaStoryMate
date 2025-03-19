import { jsPDF } from "jspdf";
import type { Story } from "@shared/schema";

// Validate image URL to prevent CPU DoS attacks
function isValidImageUrl(url: string): boolean {
  // Check if it's a data URL
  if (url.startsWith('data:')) {
    // Only allow specific image formats
    return /^data:image\/(jpeg|png|gif);base64,/.test(url);
  }
  // For HTTP URLs, ensure they are from trusted domains
  try {
    const urlObj = new URL(url);
    // Add your trusted domains here
    const trustedDomains = ['replit.com', 'api.openai.com'];
    return trustedDomains.some(domain => urlObj.hostname.endsWith(domain));
  } catch {
    return false;
  }
}

export async function exportStoryToPDF(story: Story): Promise<void> {
  const pdf = new jsPDF();
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.width - 2 * margin;

  // Set fonts and styles
  pdf.setFont("helvetica");

  // Add title
  pdf.setFontSize(24);
  pdf.setTextColor(255, 107, 107); // Match primary color from theme
  pdf.text(story.title, margin, 20, { align: "left" });

  // Add metadata
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`From ${story.sourceLanguage} to ${story.targetLanguage}`, margin, 30);
  pdf.text(`Difficulty: ${story.difficulty}`, margin, 37);

  // Add image with validation
  try {
    if (story.imageUrl && isValidImageUrl(story.imageUrl)) {
      const imageHeight = 60;
      pdf.addImage(story.imageUrl, "JPEG", margin, 45, pageWidth - margin, imageHeight);

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
        pdf.setFont("helvetica", "bold");
        const sourceLines = pdf.splitTextToSize(phrase, pageWidth - 2 * margin);
        pdf.text(sourceLines, margin, y);
        y += sourceLines.length * 7;

        // Translation
        pdf.setFont("helvetica", "normal");
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
    } else {
      // If image URL is invalid, continue without the image
      console.warn("Invalid image URL detected, skipping image in PDF");

      // Add content without image
      pdf.setFontSize(14);
      pdf.setTextColor(33, 33, 33);
      const contentLines = pdf.splitTextToSize(story.content, pageWidth - margin);
      pdf.text(contentLines, margin, 50);
    }
  } catch (error) {
    console.error("Failed to process image:", error);

    // Continue without the image
    pdf.setFontSize(14);
    pdf.setTextColor(33, 33, 33);
    const contentLines = pdf.splitTextToSize(story.content, pageWidth - margin);
    pdf.text(contentLines, margin, 50);
  }

  // Save the PDF
  pdf.save(`${story.title}.pdf`);
}