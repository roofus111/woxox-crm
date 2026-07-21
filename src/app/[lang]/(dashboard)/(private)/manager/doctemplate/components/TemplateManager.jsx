"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import DocEditor from './DocEditor';
import TemplateFiller from './TemplateFiller';
import TemplateLibrary from './TemplateLibrary';
import { Button } from '@mui/material';

const TemplateManager = ({ folderId, onClose }) => {
    const [templates, setTemplates] = useState([]);
    const [view, setView] = useState('library'); // 'library', 'create', 'edit', 'fill'
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [editorContent, setEditorContent] = useState('');
    const [documentTitle, setDocumentTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper function to extract fields from content
    const extractFieldsFromContent = (content) => {
        if (!content) return [];

        // Simple regex to extract fields like {{fieldName}}
        const fieldMatches = content.match(/{{([^}]+)}}/g) || [];
        const extractedFields = fieldMatches.map(match => {
            const fieldName = match.replace(/{{|}}/g, '');
            return {
                key: fieldName,
                label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
                type: 'text' // Default type
            };
        });

        // Remove duplicates based on key
        const uniqueFields = extractedFields.filter((field, index, self) =>
            index === self.findIndex((f) => f.key === field.key)
        );

        return uniqueFields;
    };

    useEffect(() => {
        // Fetch templates from API
        const fetchTemplates = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/template/getAllTemplates`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                // Transform API response to match our template structure
                const formattedTemplates = response.data.map(template => ({
                    id: template._id,
                    title: template.title,
                    content: template.body,
                    author: template.author,
                    // Extract fields from content - simplified version
                    fields: extractFieldsFromContent(template.body),
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt
                }));
                setTemplates(formattedTemplates);
            } catch (err) {
                console.error("Error fetching templates:", err);
                setError("Failed to load templates");
                // Fallback to local storage or sample templates if API fails
                const storedTemplates = localStorage.getItem('documentTemplates');
                if (storedTemplates) {
                    setTemplates(JSON.parse(storedTemplates));
                } else {
                    setTemplates(SAMPLE_TEMPLATES);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    // Save templates to localStorage whenever they change
    useEffect(() => {
        if (templates.length > 0) {
            localStorage.setItem('documentTemplates', JSON.stringify(templates));
        }
    }, [templates]);

    // Function to refresh templates from API
    const refreshTemplates = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/template/getAllTemplates`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Transform API response to match our template structure
            const formattedTemplates = response.data.map(template => ({
                id: template._id,
                title: template.title,
                content: template.body,
                author: template.author,
                fields: extractFieldsFromContent(template.body),
                createdAt: template.createdAt,
                updatedAt: template.updatedAt
            }));
            setTemplates(formattedTemplates);
        } catch (err) {
            console.error("Error refreshing templates:", err);
            setError("Failed to refresh templates");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTemplate = async (template, action = 'view') => {
        setError(null);
        setLoading(true);

        try {
            // Fetch the latest template data from the API by ID
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/template/getTemplateById/${template.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Format the template data
            const updatedTemplate = {
                id: response.data._id,
                title: response.data.title,
                content: response.data.body,
                author: response.data.author,
                fields: extractFieldsFromContent(response.data.body),
                createdAt: response.data.createdAt,
                updatedAt: response.data.updatedAt
            };

            setCurrentTemplate(updatedTemplate);

            if (action === 'edit') {
                setEditorContent(updatedTemplate.content);
                setDocumentTitle(updatedTemplate.title);
                setView('edit');
            } else if (action === 'fill') {
                setView('fill');
            } else {
                setView('view');
            }
        } catch (err) {
            console.error("Error fetching template details:", err);
            setError("Failed to load template details. Please try again.");
            // Fall back to using the template data we already have
            setCurrentTemplate(template);

            if (action === 'edit') {
                setEditorContent(template.content);
                setDocumentTitle(template.title);
                setView('edit');
            } else if (action === 'fill') {
                setView('fill');
            } else {
                setView('view');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplate = async (template) => {
        setLoading(true);
        setError(null);

        try {
            // Call API to delete the template
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/template/deleteTemplate/${template.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Refresh templates to update the list
            await refreshTemplates();

        } catch (err) {
            console.error("Error deleting template:", err);
            setError("Failed to delete template. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = () => {
        setCurrentTemplate(null);
        setEditorContent('');
        setDocumentTitle('New Template');
        setView('create');
    };

    const handleUpdateContent = (content) => {
        setEditorContent(content);
    };

    // Add the missing handleUpdateTitle function
    const handleUpdateTitle = (title) => {
        setDocumentTitle(title);
    };

    const handleSaveTemplate = async (templateData) => {
        const { title, content, fields } = templateData;
        if (!title || !content) {
            setError("Title and content are required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiData = {
                title,
                author: getCurrentUserName(), // Replace with your actual function or state to fetch the current user
                body: content,
                fields: fields || [], // Optional field handling
            };

            const headers = {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            };

            if (currentTemplate) {
                // Update existing template
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/template/editTemplate/${currentTemplate.id}`,
                    apiData,
                    { headers }
                );
            } else {
                // Create new template
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/template/createTemplate`,
                    apiData,
                    { headers }
                );
            }

            await refreshTemplates(); // Refresh templates
            setView('library'); // Navigate to library view
        } catch (err) {
            console.error("Error saving template:", err);
            setError(err.response?.data?.message || "Failed to save template. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderView = () => {
        switch (view) {
            case 'create':
            case 'edit':
                return (
                    <div className="w-full">
                        <Button
                            variant='outlined'
                            onClick={handleBackToLibrary}
                            className="text-blue-600 hover:text-blue-800 font-medium mb-4 flex items-center"
                            disabled={loading}
                        >
                            <span className="mr-1">←</span> Back to Templates
                        </Button>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <DocEditor
                            initialContent={editorContent}
                            onUpdate={handleUpdateContent}
                            documentTitle={documentTitle}
                            onUpdateTitle={handleUpdateTitle}
                            isTemplateMode={true}
                            onSaveTemplate={handleSaveTemplate}
                            loading={loading}
                        />
                    </div>
                );

            case 'fill':
                return (
                    <TemplateFiller
                        template={currentTemplate}
                        onBack={handleBackToLibrary}
                    />
                );

            case 'library':
            default:
                return (
                    <TemplateLibrary
                        templates={templates}
                        onSelectTemplate={handleSelectTemplate}
                        onCreateTemplate={handleCreateTemplate}
                        onDeleteTemplate={handleDeleteTemplate}
                        loading={loading}
                    />
                );
        }
    };

    const handleBackToLibrary = () => {
        setView('library');
        setCurrentTemplate(null);
        setError(null);
    };

    // Helper function to get the current user name
    const getCurrentUserName = () => {
        // This should be replaced with your actual implementation to get the current user
        // For example, from your auth state/context
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return user?.name || 'Unknown User';
        } catch (err) {
            console.error("Error getting current user:", err);
            return 'Unknown User';
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {error && view === 'library' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <button
                        className="ml-4 text-red-700 font-bold underline"
                        onClick={refreshTemplates}
                    >
                        Try Again
                    </button>
                </div>
            )}
            {renderView()}
        </div>
    );
};

export default TemplateManager;
