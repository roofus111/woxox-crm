"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import DocEditor from './components/DocEditor';
import TemplateManager from './components/TemplateManager';
import { Button } from '@mui/material';
import DocumentActions from './components/DocumentActions';

const Dashboard = () => {
    const router = useRouter();
    // Initialize state
    const [view, setView] = useState('documents'); // 'documents', 'templates'
    const [currentView, setCurrentView] = useState('list'); // 'list', 'editor'
    const [documents, setDocuments] = useState([]);
    const [currentDocumentId, setCurrentDocumentId] = useState(null);
    const [editorContent, setEditorContent] = useState('');
    const [documentTitle, setDocumentTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all documents on component mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    // Fetch documents from API
    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/files/getdocuments`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            // Validate the response structure to avoid null errors
            if (!data || !Array.isArray(data.documents)) {
                console.warn('Unexpected API response format:', data);
                setDocuments([]);
                return;
            }

            // Normalize API fields to what your UI expects:
            const docs = data.documents.map(doc => {
                // Make sure we have valid data before accessing properties
                if (!doc) return null;

                return {
                    id: doc._id || '',
                    title: doc.docName || doc.title || 'Untitled', // Check for both docName and title
                    content: doc.content || '',
                    fileUrl: doc.fileUrl || '',
                };
            }).filter(Boolean); // Remove any null entries

            setDocuments(docs);
        } catch (err) {
            console.error('Error fetching documents:', err);
            setError('Failed to load documents. Please try again.');
            setDocuments([]); // Set to empty array on error
        } finally {
            setLoading(false);
        }
    };

    // Fetch a single document by ID
    const fetchDocumentById = async (documentId) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching document with ID:', documentId);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/files/getdocuments/${documentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Validate the response to avoid null errors
            if (!response || !response.data) {
                console.warn('Empty response when fetching document:', documentId);
                setError('Document could not be loaded - empty response');
                return null;
            }

            // Log the response to help debug
            console.log('Document fetch response:', response.data);

            // Check if the document is in a nested 'document' property
            const document = response.data.document || response.data;

            if (!document) {
                console.warn('Document not found in response:', response.data);
                setError('Document data could not be found in the response');
                return null;
            }

            const formattedDoc = {
                id: document._id || documentId,
                title: document.docName || document.title || 'Untitled', // Check for both docName and title
                content: document.content || '<p></p>'
            };

            console.log('Formatted document for editor:', formattedDoc);
            return formattedDoc;
        } catch (err) {
            console.error(`Error fetching document ${documentId}:`, err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(`Failed to load document: ${err.response.data.message}`);
            } else if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to load document: ${err.response.data.error}`);
            } else {
                setError('Failed to load document. Please try again.');
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleViewChange = (newView) => {
        setView(newView);
        // When switching views, go back to list view
        setCurrentView('list');
    };

    const handleSelectDocument = async (documentId) => {
        const document = await fetchDocumentById(documentId);
        if (document) {
            console.log('Setting document for editing:', document);
            setCurrentDocumentId(documentId);
            setEditorContent(document.content || '<p></p>');
            setDocumentTitle(document.title || 'Untitled');
            setCurrentView('editor');
        } else {
            // If we couldn't load the document, show an error
            setError('Could not load the selected document. Please try again.');
        }
    };

    const handleCreateNewDocument = () => {
        setCurrentDocumentId(null);
        setEditorContent('');
        setDocumentTitle('Untitled Document');
        setCurrentView('editor');
    };

    const handleBackToList = () => {
        setCurrentView('list');
    };

    const handleUpdateContent = (content) => {
        setEditorContent(content);
    };

    const handleUpdateTitle = (title) => {
        setDocumentTitle(title);
    };

    const handleSaveDocument = async () => {
        try {
            setLoading(true);
            setError(null);

            if (currentDocumentId) {
                // Update existing document
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/files/documents/${currentDocumentId}`, {
                    docName: documentTitle,
                    title: documentTitle, // Include both title and docName
                    content: editorContent
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Update the document in the local state
                const updatedDocuments = documents.map(doc =>
                    doc.id === currentDocumentId
                        ? { ...doc, title: documentTitle, content: editorContent }
                        : doc
                );
                setDocuments(updatedDocuments);
            } else {
                // Create new document
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/files/documents`, {
                    docName: documentTitle,
                    title: documentTitle, // Include both title and docName
                    content: editorContent || '<p></p>' // Ensure we're not sending null content
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Make sure we handle the response properly
                if (response && response.data) {
                    // Check if the response contains a document property
                    const newDocument = response.data.document || response.data;

                    // Check if newDocument is null before accessing properties
                    if (newDocument) {
                        const formattedNewDoc = {
                            id: newDocument._id || newDocument.id,
                            title: newDocument.docName || newDocument.title || documentTitle,
                            content: newDocument.content || editorContent || '<p></p>',
                        };
                        setDocuments([...documents, formattedNewDoc]);
                        setCurrentDocumentId(formattedNewDoc.id);

                        // Show success message or notification here
                        console.log('Document created successfully:', formattedNewDoc);
                    } else {
                        console.error('Document creation succeeded but returned null document');
                        setError('Document was created but could not be loaded. Please refresh.');
                    }
                } else {
                    throw new Error('Received empty response from server');
                }
            }

            setLoading(false);
        } catch (err) {
            console.error('Error saving document:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(`Failed to save document: ${err.response.data.message}`);
            } else if (err.response && err.response.data && err.response.data.error) {
                setError(`Failed to save document: ${err.response.data.error}`);
            } else {
                setError('Failed to save document. Please try again.');
            }
            setLoading(false);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/files/documents/${documentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Remove document from local state
            setDocuments(documents.filter(doc => doc.id !== documentId));

            // If the deleted document was currently being edited, return to list view
            if (currentDocumentId === documentId) {
                setCurrentDocumentId(null);
                setEditorContent('');
                setDocumentTitle('');
                setCurrentView('list');
            }

            setLoading(false);
        } catch (err) {
            console.error('Error deleting document:', err);
            setError('Failed to delete document. Please try again.');
            setLoading(false);
        }
    };

    // Export as PDF function stub (to be implemented)
    const handleExportPdf = () => {
        console.log('Export as PDF clicked');
        // Implementation would go here
    };

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <header className="flex w-[92%] ml-12 items-center justify-between px-6 py-4 bg-white border rounded-xl">
                <nav className="flex space-x-4">
                    <Button
                        className={`px-4 py-2 rounded-md transition-colors ${view === 'documents' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        onClick={() => handleViewChange('documents')}
                    >
                        Documents
                    </Button>
                    <Button
                        className={`px-4 py-2 rounded-md transition-colors ${view === 'templates' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        onClick={() => handleViewChange('templates')}
                    >
                        Templates
                    </Button>
                </nav>
                <div>
                    {/* User profile button could go here */}
                </div>
            </header>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 mx-6">
                    <span className="block sm:inline">{error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <title>Close</title>
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                        </svg>
                    </span>
                </div>
            )}

            <div className="p-6">
                {loading && (
                    <div className="flex justify-center items-center h-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {view === 'documents' ? (
                    currentView === 'editor' ? (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <Button
                                        onClick={handleBackToList}
                                        className="mr-4 text-gray-600 hover:text-gray-900"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </Button>
                                    <input
                                        type="text"
                                        value={documentTitle}
                                        onChange={(e) => handleUpdateTitle(e.target.value)}
                                        className="text-2xl font-bold border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2"
                                        placeholder="Document Title"
                                    />
                                </div>
                                <DocumentActions onExportPdf={handleExportPdf} />
                            </div>
                            <DocEditor
                                initialContent={editorContent}
                                onUpdate={handleUpdateContent}
                                documentTitle={documentTitle}
                                onUpdateTitle={handleUpdateTitle}
                                key={currentDocumentId || 'new-doc'} // Add key to force re-render on document change
                            />
                            <div className="mt-6 flex space-x-4">
                                <button
                                    onClick={handleSaveDocument}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Document'}
                                </button>
                                {/* <button
                                    onClick={handleCreateNewDocument}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                    disabled={loading}
                                >
                                    New Document
                                </button> */}
                                {currentDocumentId && (
                                    <button
                                        onClick={() => handleDeleteDocument(currentDocumentId)}
                                        className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                                        disabled={loading}
                                    >
                                        Delete Document
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Your Documents</h2>
                                <Button
                                    onClick={handleCreateNewDocument}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    disabled={loading}
                                >
                                    Create New Document
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {documents.length === 0 && !loading ? (
                                    <div className="col-span-3 text-center text-gray-500 py-8">
                                        No documents found. Create a new document to get started.
                                    </div>
                                ) : (
                                    documents.map(doc => (
                                        <div
                                            key={doc.id}
                                            className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow relative group"
                                            onClick={() => handleSelectDocument(doc.id)}
                                        >
                                            <h3 className="text-lg font-medium text-gray-800 mb-2">{doc.title}</h3>
                                            <div className="text-gray-600 text-sm overflow-hidden h-20">
                                                {doc.content ? (
                                                    <div dangerouslySetInnerHTML={{ __html: doc.content.substring(0, 100) + '...' }} />
                                                ) : (
                                                    <p>No content</p>
                                                )}
                                            </div>
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteDocument(doc.id);
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                    disabled={loading}
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    <TemplateManager />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
