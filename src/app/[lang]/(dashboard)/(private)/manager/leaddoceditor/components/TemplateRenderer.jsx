"use client";

import { useEffect, useRef } from 'react';

const TemplateRenderer = ({ templateContent, templateValues }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current && templateContent) {
            // Start with the template HTML
            let filledContent = templateContent;

            // Create a temporary div to work with the HTML content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = templateContent;

            // Find all template field elements
            const fieldElements = tempDiv.querySelectorAll('[data-field-key]');

            // Replace each field with its corresponding value
            fieldElements.forEach(element => {
                const fieldKey = element.getAttribute('data-field-key');
                if (fieldKey && templateValues[fieldKey] !== undefined) {
                    // Create a span to replace the template field
                    const valueSpan = document.createElement('span');
                    valueSpan.className = 'text-gray-900 font-normal';
                    valueSpan.textContent = templateValues[fieldKey];

                    // Replace the template field with the value span
                    element.parentNode.replaceChild(valueSpan, element);
                }
            });

            // Update the content with filled values
            filledContent = tempDiv.innerHTML;
            contentRef.current.innerHTML = filledContent;
        }
    }, [templateContent, templateValues]);

    return (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div
                ref={contentRef}
                className="prose max-w-none"
            />
        </div>
    );
};

export default TemplateRenderer;
