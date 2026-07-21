import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPdf = async (title, htmlContent) => {
    // Create a temporary div to render the HTML content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.width = '800px';
    tempContainer.style.padding = '20px';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    try {
        // Use html2canvas to capture the content as an image
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            logging: false,
            useCORS: true
        });

        // Create a new PDF document
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Calculate dimensions to fit the content on the page
        const imgWidth = 210 - 20; // A4 width (210mm) - margins
        const pageHeight = 297; // A4 height
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add the title to the PDF
        pdf.setFontSize(16);
        pdf.text(title, 10, 10);

        // Add the content image
        let heightLeft = imgHeight;
        let position = 20; // Start below the title

        // Add the first page of content
        pdf.addImage(
            canvas.toDataURL('image/png'),
            'PNG',
            10,
            position,
            imgWidth,
            imgHeight
        );
        heightLeft -= pageHeight - position;

        // Add new pages if content overflows
        while (heightLeft > 0) {
            position = 10; // Reset position for new page
            pdf.addPage();
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                10,
                position - imgHeight + (pageHeight - position),
                imgWidth,
                imgHeight
            );
            heightLeft -= (pageHeight - position);
        }

        // Save the PDF
        const fileName = `${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
        pdf.save(fileName);

    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('Failed to export document to PDF. Please try again.');
    } finally {
        // Clean up the temporary container
        document.body.removeChild(tempContainer);
    }
};
