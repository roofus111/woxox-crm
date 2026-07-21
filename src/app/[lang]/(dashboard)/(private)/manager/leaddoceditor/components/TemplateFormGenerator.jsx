"use client";

import { useState, useEffect } from 'react';

const TemplateFormGenerator = ({ templateFields, initialValues = {}, onValueChange }) => {
    const [formValues, setFormValues] = useState({});

    useEffect(() => {
        // Initialize form with initial values or empty values for each field
        const initialFormValues = { ...initialValues };

        // Ensure all template fields have a value, even if it's empty
        templateFields.forEach(field => {
            if (initialFormValues[field.key] === undefined) {
                initialFormValues[field.key] = '';
            }
        });

        setFormValues(initialFormValues);
    }, [templateFields, initialValues]);

    const handleInputChange = (fieldKey, value) => {
        const updatedValues = {
            ...formValues,
            [fieldKey]: value
        };

        setFormValues(updatedValues);

        // Notify parent component of value changes
        if (onValueChange) {
            onValueChange(updatedValues);
        }
    };

    const renderFieldInput = (field) => {
        const value = formValues[field.key] || '';
        const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500";

        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        id={`field-${field.key}`}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className={inputClasses}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        id={`field-${field.key}`}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className={inputClasses}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        id={`field-${field.key}`}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className={inputClasses}
                    />
                );

            case 'email':
                return (
                    <input
                        type="email"
                        id={`field-${field.key}`}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className={inputClasses}
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        id={`field-${field.key}`}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className={inputClasses}
                    />
                );
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-xl font-medium mb-4 text-gray-800">Fill Template Fields</h3>

            {templateFields.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">This template has no editable fields.</p>
            ) : (
                <div className="space-y-4">
                    {templateFields.map((field) => (
                        <div key={field.key} className="mb-4">
                            <label
                                htmlFor={`field-${field.key}`}
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                {field.label || field.key}:
                            </label>
                            {renderFieldInput(field)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TemplateFormGenerator;
