"use client";

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import TemplateFormGenerator from './TemplateFormGenerator';
import TemplateRenderer from './TemplateRenderer';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

const TemplateFiller = ({ template, onBack, folderId }) => {
    const [templateValues, setTemplateValues] = useState({});
    const [previewMode, setPreviewMode] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Extract initial values from template data if available
        if (template && template.initialValues) {
            setTemplateValues(template.initialValues);
        }
    }, [template]);

    const handleValueChange = (newValues) => {
        setTemplateValues(newValues);
    };

    const togglePreview = () => {
        setPreviewMode(!previewMode);
    };

    // Enhanced function to export content to PDF using jsPDF and html2canvas
    const exportToPdf = async (title, content) => {
        try {
            setIsExporting(true);

            // Create temporary container for rendering
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = content;
            tempContainer.style.width = '800px'; // Fixed width for better PDF formatting
            tempContainer.style.padding = '20px';
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            document.body.appendChild(tempContainer);

            // Use html2canvas to render the content to canvas
            const canvas = await html2canvas(tempContainer, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false
            });

            // Clean up temp container
            document.body.removeChild(tempContainer);

            // Initialize PDF with A4 dimensions
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add content to PDF
            let position = 0;
            pdf.setFont('helvetica');
            pdf.setFontSize(16);
            pdf.text(title, 105, 15, { align: 'center' });

            // Add image from canvas with proper dimensions
            pdf.addImage(
                canvas.toDataURL('image/png'),
                'PNG',
                0,
                20, // Start below title
                imgWidth,
                imgHeight
            );

            // Return the PDF document for further processing
            return pdf;
        } catch (error) {
            console.error('Error generating PDF:', error);
            setIsExporting(false);
            throw error;
        }
    };

    const handleExportPdf = async () => {
        // For direct PDF export of filled template
        if (template && template.content) {
            // Create a temporary div to process the content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = template.content;

            // Find all template fields and replace with values
            const fieldElements = tempDiv.querySelectorAll('.template-field');
            fieldElements.forEach(element => {
                const fieldKey = element.getAttribute('data-field-key');
                if (fieldKey && templateValues[fieldKey] !== undefined) {
                    const valueSpan = document.createElement('span');
                    valueSpan.className = 'filled-field';
                    valueSpan.textContent = templateValues[fieldKey];
                    element.parentNode.replaceChild(valueSpan, element);
                }
            });

            // Export the filled content
            const filledContent = tempDiv.innerHTML;
            try {
                const pdf = await exportToPdf(template.title || 'Filled Template', filledContent);
                pdf.save(`${template.title.replace(/\s+/g, '_')}.pdf`);
                setIsExporting(false);
            } catch (error) {
                console.error('Error exporting PDF:', error);
                setIsExporting(false);
            }
        }
    };

    const handleSaveFilledTemplate = async () => {
        if (!template || !template.content) {
            return;
        }

        setIsSaving(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setIsSaving(false);
            return;
        }

        try {
            // Create a temporary div to process the content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = template.content;

            // Find all template fields and replace with values
            const fieldElements = tempDiv.querySelectorAll('.template-field');
            fieldElements.forEach(element => {
                const fieldKey = element.getAttribute('data-field-key');
                if (fieldKey && templateValues[fieldKey] !== undefined) {
                    const valueSpan = document.createElement('span');
                    valueSpan.className = 'filled-field';
                    valueSpan.textContent = templateValues[fieldKey];
                    element.parentNode.replaceChild(valueSpan, element);
                }
            });

            // Get the filled content
            const filledContent = tempDiv.innerHTML;

            // Generate PDF first
            const pdf = await exportToPdf(template.title || 'Filled Template', filledContent);
            const pdfBlob = pdf.output('blob');

            // Create filename with timestamp to ensure uniqueness
            const filename = `${template.title || 'Filled_Template'}_${Date.now()}.pdf`;

            // Create form data for upload
            const formData = new FormData();
            formData.append('files', new File([pdfBlob], filename, { type: 'application/pdf' }));

            // Check if we're in a person's folder
            const currentPath = window.location.pathname;
            const isInPeopleFolder = currentPath.includes('/people/');

            // Only append the appropriate ID and don't send undefined values
            if (isInPeopleFolder) {
                // For lead documents
                if (folderId) {
                    formData.append('leadId', folderId);
                }
            } else {
                // For regular folder documents
                if (folderId) {
                    formData.append('parent', folderId);
                    formData.append('parentId', folderId); // Ensure parentId is always included
                }
            }

            // Upload the document
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data) {
                // Navigate back to folder view after successful save
                if (onBack) {
                    onBack(); // Go back to folder view using the provided callback
                } else {
                    // If no callback provided, manually navigate back
                    if (folderId) {
                        router.push(`/en/manager/document?folderId=${folderId}`);
                    } else {
                        router.push('/en/manager/document');
                    }
                }
            }
        } catch (err) {
            console.error('Error saving filled template:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!template) {
        return <div className="p-6 text-center text-gray-500">No template selected</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <Button
                    variant='outlined'
                    onClick={onBack}
                    className=" font-medium flex items-center"
                >
                    <span className="mr-1">←</span> Back to Templates
                </Button>
                <h2 className="text-2xl font-bold text-center flex-grow">
                    {template.title || 'Untitled Template'}
                </h2>
                <div className="flex space-x-3">
                    <Button
                        variant='outlined'
                        onClick={togglePreview}
                        className="px-4 py-2 rounded"
                    >
                        {previewMode ? 'Edit Fields' : 'Preview'}
                    </Button>
                    <Button
                        variant='outlined'
                        onClick={handleExportPdf}
                        disabled={isExporting}
                        className={`px-4 py-2 rounded ${isExporting
                            ? 'border-blue-400'
                            : 'border-blue-600'}`}
                    >
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </Button>
                    <Button
                        variant='contained'
                        color="primary"
                        onClick={handleSaveFilledTemplate}
                        disabled={isSaving}
                        className="px-4 py-2 rounded text-white"
                    >
                        {isSaving ? 'Saving...' : 'Save as PDF'}
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                {previewMode ? (
                    <TemplateRenderer
                        templateContent={template.content}
                        templateValues={templateValues}
                    />
                ) : (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                            <TemplateFormGenerator
                                templateFields={template.fields || []}
                                initialValues={templateValues}
                                onValueChange={handleValueChange}
                            />
                        </div>
                        <div className="w-full md:w-2/3 border-l pl-6">
                            <h3 className="text-lg font-medium mb-4 text-gray-700">Live Preview</h3>
                            <TemplateRenderer
                                templateContent={template.content}
                                templateValues={templateValues}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateFiller;
