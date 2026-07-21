"use client";

import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const TemplateLibrary = ({ templates, onSelectTemplate, onCreateTemplate, onDeleteTemplate, loading }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTemplates, setFilteredTemplates] = useState([]);
    const [localLoading, setLocalLoading] = useState(false);

    // Use provided loading state or local loading state
    const isLoading = loading !== undefined ? loading : localLoading;

    useEffect(() => {
        // Filter templates based on search query
        if (templates) {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const filtered = templates.filter(template =>
                    template.title.toLowerCase().includes(query)
                );
                setFilteredTemplates(filtered);
            } else {
                setFilteredTemplates(templates);
            }
        }
    }, [templates, searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="bg-white rounded-2xl border p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b">
                <h2 className="text-2xl font-bold mb-4 md:mb-0">Template Library</h2>
                <div className="w-full md:w-auto flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {/* <Button
                        onClick={onCreateTemplate}
                        variant="contained"
                        className="bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        disabled={isLoading}
                    >
                        Create New Template
                    </Button> */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full text-center py-10">
                        <CircularProgress />
                        <p className="mt-4 text-gray-600">Loading templates...</p>
                    </div>
                ) : filteredTemplates.length > 0 ? (
                    filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className="rounded-xl border hover:shadow-md transition-shadow"
                            onClick={() => onSelectTemplate(template)}
                        >
                            <div className="p-4">
                                <h3 className="text-lg font-medium mb-2 text-gray-800">{template.title || 'Untitled Template'}</h3>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>
                                        {template.fields ? template.fields.length : 0} fields
                                    </span>
                                    <span>
                                        {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'New'}
                                    </span>
                                </div>
                                {template.author && (
                                    <div className="text-sm text-gray-500 mt-1">
                                        By: {template.author}
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t flex justify-between">
                                <Button
                                    variant='outlined'
                                    className="px-3 py-1 cursor-pointer text-sm rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectTemplate(template, 'fill');
                                    }}
                                >
                                    Fill Template
                                </Button>
                                <div>
                                    {/* <Button
                                        variant='contained'
                                        className="px-3 py-1 text-sm rounded mr-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectTemplate(template, 'edit');
                                        }}
                                    >
                                        Edit
                                    </Button> */}
                                    {/* <Button
                                        variant='outlined'
                                        color="error"
                                        className="px-3 py-1 text-sm rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onDeleteTemplate) onDeleteTemplate(template);
                                        }}
                                    >
                                        Delete
                                    </Button> */}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-gray-500 italic">
                        {searchQuery ? 'No templates match your search.' : 'No templates found. Create your first template!'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TemplateLibrary;
