// pdf-export.js
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports the document content to PDF with header and footer
 * @param {string} title - The document title
 * @param {string} content - The HTML content of the document
 * @param {Object} headerSettings - Header configuration
 * @param {Object} footerSettings - Footer configuration 
 */
export const exportToPdf = async (title, content, headerSettings = null, footerSettings = null) => {
    try {
        // Create a temporary container with the document content
        const tempContainer = document.createElement('div');
        tempContainer.style.width = '794px'; // A4 width in pixels (72 dpi)
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.fontFamily = 'Arial, sans-serif';

        // Combine header, content, and footer
        let htmlContent = '';

        // Add header if enabled
        if (headerSettings && headerSettings.enabled) {
            htmlContent += `
        <div class="pdf-header" style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center;">
              ${headerSettings.logoUrl ?
                    `<img src="${headerSettings.logoUrl}" alt="Logo" style="max-height: 50px; margin-right: 15px;" />` :
                    ''}
              <div>
                <h1 style="margin: 0; font-size: 18px; font-weight: bold;">${headerSettings.companyName}</h1>
                ${headerSettings.address ?
                    `<p style="margin: 5px 0; font-size: 12px; color: #666;">${headerSettings.address.replace(/\n/g, '<br/>')}</p>` :
                    ''}
              </div>
            </div>
            <div style="text-align: right;">
              ${headerSettings.contact ?
                    `<p style="margin: 2px 0; font-size: 12px;">${headerSettings.contact}</p>` :
                    ''}
              ${headerSettings.additionalInfo ?
                    `<p style="margin: 2px 0; font-size: 12px; color: #666;">${headerSettings.additionalInfo}</p>` :
                    ''}
            </div>
          </div>
        </div>
      `;
        }

        // Add the main document content
        htmlContent += `<div class="pdf-content">${content}</div>`;

        // Add footer if enabled
        if (footerSettings && footerSettings.enabled) {
            htmlContent += `
        <div class="pdf-footer" style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; font-size: 10px; color: #666;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              ${footerSettings.companyName ?
                    `<span style="font-weight: 500;">${footerSettings.companyName}</span>` :
                    ''}
              ${footerSettings.copyright ?
                    `<span style="margin-left: 8px;">${footerSettings.copyright}</span>` :
                    ''}
            </div>
            <div>
              ${footerSettings.additionalText ?
                    `<span style="margin-right: 15px;">${footerSettings.additionalText}</span>` :
                    ''}
              ${footerSettings.includePageNumbers ?
                    `<span>Page <span class="pdf-page-num"></span> of <span class="pdf-page-count"></span></span>` :
                    ''}
            </div>
          </div>
        </div>
      `;
        }

        // Set the content to our container
        tempContainer.innerHTML = htmlContent;
        document.body.appendChild(tempContainer);

        // Initialize PDF document
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Split content into pages (this is a simplified approach)
        // In a production app, you would need more sophisticated logic to paginate content properly
        const contentHeight = tempContainer.querySelector('.pdf-content').offsetHeight;
        const pageHeight = 297 - 40; // A4 height (297mm) minus margins (20mm top and bottom)
        const totalPages = Math.ceil(contentHeight / pageHeight);

        // Update page numbers in the footer
        const pageNumElements = tempContainer.querySelectorAll('.pdf-page-num');
        const pageCountElements = tempContainer.querySelectorAll('.pdf-page-count');

        pageNumElements.forEach(el => {
            el.textContent = '1';
        });

        pageCountElements.forEach(el => {
            el.textContent = totalPages.toString();
        });

        // Create canvas from the container
        const canvas = await html2canvas(tempContainer, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // Enable CORS for images
            logging: false,
        });

        // Add canvas to PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        // Add multiple pages if needed
        if (totalPages > 1) {
            for (let i = 1; i < totalPages; i++) {
                pdf.addPage();

                // Update page number for this page
                pageNumElements.forEach(el => {
                    el.textContent = (i + 1).toString();
                });

                // Create new canvas for this page
                const nextCanvas = await html2canvas(tempContainer, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                });

                const nextImgData = nextCanvas.toDataURL('image/png');
                pdf.addImage(nextImgData, 'PNG', 0, 0, imgWidth, imgHeight);
            }
        }

        // Clean up
        document.body.removeChild(tempContainer);

        // Download the PDF
        pdf.save(`${title || 'document'}.pdf`);

        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);

        // Provide user feedback
        alert('There was an error generating the PDF. Please try again.');
        return false;
    }
};

/**
 * Enhanced version of exportToPdf that supports proper pagination
 * This is a more sophisticated implementation that would be used in production
 */
export const exportToPdfAdvanced = async (title, content, headerSettings = null, footerSettings = null) => {
    try {
        // Create PDF document
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Set document properties
        pdf.setProperties({
            title: title || 'Document',
            subject: 'Generated Document',
            creator: 'Document Editor',
        });

        // Constants for positioning
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margin = 15; // Margins in mm
        const contentWidth = pageWidth - (margin * 2);
        const headerHeight = headerSettings?.enabled ? 25 : 0;
        const footerHeight = footerSettings?.enabled ? 15 : 0;
        const contentMaxHeight = pageHeight - (margin * 2) - headerHeight - footerHeight;

        // Create a temporary DOM element to hold and measure the content
        const tempContainer = document.createElement('div');
        tempContainer.style.width = `${contentWidth}mm`;
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.fontFamily = 'Arial, sans-serif';
        tempContainer.innerHTML = content;
        document.body.appendChild(tempContainer);

        // Function to render header
        const renderHeader = (pageNum) => {
            if (!headerSettings?.enabled) return;

            // Save current state
            pdf.saveGraphicsState();

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(headerSettings.companyName, margin, margin);

            if (headerSettings.address) {
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');

                // Split address into lines if it contains newlines
                const addressLines = headerSettings.address.split('\n');
                let y = margin + 6;

                addressLines.forEach(line => {
                    pdf.text(line, margin, y);
                    y += 3;
                });
            }

            if (headerSettings.contact) {
                pdf.setFontSize(8);
                pdf.text(headerSettings.contact, pageWidth - margin, margin, { align: 'right' });
            }

            if (headerSettings.additionalInfo) {
                pdf.setFontSize(8);
                pdf.text(headerSettings.additionalInfo, pageWidth - margin, margin + 5, { align: 'right' });
            }

            // Draw separator line
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, margin + headerHeight - 5, pageWidth - margin, margin + headerHeight - 5);

            // Restore saved state
            pdf.restoreGraphicsState();
        };

        // Function to render footer
        const renderFooter = (pageNum, totalPages) => {
            if (!footerSettings?.enabled) return;

            // Save current state
            pdf.saveGraphicsState();

            // Position for footer - at bottom of page
            const footerY = pageHeight - margin - 5;

            // Draw separator line
            pdf.setDrawColor(200, 200, 200);
            pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

            // Footer text
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');

            // Company name and copyright
            let footerText = '';
            if (footerSettings.companyName) {
                footerText += footerSettings.companyName;
            }
            if (footerSettings.copyright) {
                footerText += footerText ? ' ' + footerSettings.copyright : footerSettings.copyright;
            }

            if (footerText) {
                pdf.text(footerText, margin, footerY);
            }

            // Page numbers
            if (footerSettings.includePageNumbers) {
                pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
            }

            // Additional text
            if (footerSettings.additionalText) {
                const centerX = pageWidth / 2;
                pdf.text(footerSettings.additionalText, centerX, footerY, { align: 'center' });
            }

            // Restore saved state
            pdf.restoreGraphicsState();
        };

        // Simplified approach for this demo - render entire content as an image
        // In a real implementation, you'd want to parse the HTML and add text/elements directly
        // for better quality and searchability
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
        });

        // Cleanup
        document.body.removeChild(tempContainer);

        // Calculate total pages needed
        const contentImgWidth = contentWidth;
        const contentImgHeight = (canvas.height * contentImgWidth) / canvas.width;
        const totalPages = Math.ceil(contentImgHeight / contentMaxHeight);

        // Generate each page
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            if (pageNum > 1) {
                pdf.addPage();
            }

            // Add header
            renderHeader(pageNum);

            // Calculate content position and clipping for this page
            const contentStartY = margin + headerHeight;
            const yOffset = contentMaxHeight * (pageNum - 1);

            // Add page content
            const imgData = canvas.toDataURL('image/png');

            // Add clipped portion of the content
            pdf.addImage(
                imgData,
                'PNG',
                margin,
                contentStartY - yOffset, // Adjust position to show correct portion
                contentImgWidth,
                contentImgHeight,
                null,
                'FAST',
                0
            );

            // Add footer
            renderFooter(pageNum, totalPages);
        }

        // Download the PDF
        pdf.save(`${title || 'document'}.pdf`);

        return true;
    } catch (error) {
        console.error('Error generating PDF with pagination:', error);
        alert('There was an error generating the PDF. Please try again.');
        return false;
    }
};
