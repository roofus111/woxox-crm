"use client";

import { useState, useRef, useEffect } from 'react';

const TemplateFieldButton = ({ editor }) => {
    const [showFieldDialog, setShowFieldDialog] = useState(false);
    const [fieldKey, setFieldKey] = useState('');
    const [fieldLabel, setFieldLabel] = useState('');
    const [fieldType, setFieldType] = useState('text');
    const dialogRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target)) {
                setShowFieldDialog(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const insertTemplateField = () => {
        if (!fieldKey) return;

        // Format the field placeholder with curly braces
        const fieldPlaceholder = `{{${fieldKey}}}`;

        // Create a span with data attributes to store field metadata
        editor.chain().focus()
            .insertContent(`<span class="bg-blue-100 px-1 py-0.5 rounded font-bold" 
                                 data-field-key="${fieldKey}" 
                                 data-field-label="${fieldLabel || fieldKey}" 
                                 data-field-type="${fieldType}">
                             ${fieldPlaceholder}
                           </span>`)
            .run();

        // Reset and close dialog
        setFieldKey('');
        setFieldLabel('');
        setFieldType('text');
        setShowFieldDialog(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            insertTemplateField();
        } else if (e.key === 'Escape') {
            setShowFieldDialog(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowFieldDialog(true)}
                className={`px-3 py-1.5 rounded text-sm ${showFieldDialog ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                title="Insert Template Field"
            >
                Template Field
            </button>

            {showFieldDialog && (
                <div
                    ref={dialogRef}
                    className="absolute z-10 top-10 left-0 bg-white border border-gray-300 rounded shadow-lg p-4 w-64"
                >
                    <h3 className="text-lg font-medium mb-3">Insert Template Field</h3>
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Key:</label>
                        <input
                            type="text"
                            value={fieldKey}
                            onChange={e => setFieldKey(e.target.value)}
                            placeholder="e.g. firstName"
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Label:</label>
                        <input
                            type="text"
                            value={fieldLabel}
                            onChange={e => setFieldLabel(e.target.value)}
                            placeholder="e.g. First Name"
                            onKeyDown={handleKeyDown}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Type:</label>
                        <select
                            value={fieldType}
                            onChange={e => setFieldType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="email">Email</option>
                        </select>
                    </div>
                    <div className="flex justify-between">
                        <button
                            onClick={insertTemplateField}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Insert Field
                        </button>
                        <button
                            onClick={() => setShowFieldDialog(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateFieldButton;
