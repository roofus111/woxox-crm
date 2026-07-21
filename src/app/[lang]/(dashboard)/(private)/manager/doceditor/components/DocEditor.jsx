import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Link } from '@tiptap/extension-link';
import EditorMenuBar from './EditorMenuBar';
import TableContextMenu from './TableContextMenu';
import DocumentActions from './DocumentActions';
import { exportToPdf } from '../lib/pdf-export';
import { Mark, Node, mergeAttributes } from '@tiptap/core';
import { Button, IconButton, Tooltip } from '@mui/material';

// Import our new components
import { HeaderFooterSettings, DocumentHeader, DocumentFooter } from './HeaderFooterSettings';

// Custom heading mark extension for inline headings
const HeadingMark = Mark.create({
    name: 'headingMark',
    addAttributes() {
        return {
            level: {
                default: 1,
                parseHTML: element => {
                    const level = element.getAttribute('data-heading-level');
                    return level ? parseInt(level, 10) : 1;
                },
                renderHTML: attributes => {
                    return {
                        'data-heading-level': attributes.level,
                        class: `heading-${attributes.level}`,
                        style: `
              font-size: ${attributes.level === 1 ? '2em' : attributes.level === 2 ? '1.5em' : '1.25em'};
              font-weight: bold;
              display: inline;
            `,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span.heading-1',
                attrs: { level: 1 },
            },
            {
                tag: 'span.heading-2',
                attrs: { level: 2 },
            },
            {
                tag: 'span.heading-3',
                attrs: { level: 3 },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes), 0];
    },
});

// Improved template field extension
const TemplateField = Mark.create({
    name: 'templateField',

    addAttributes() {
        return {
            key: {
                default: '',
                parseHTML: element => element.getAttribute('data-field-key'),
                renderHTML: attributes => ({ 'data-field-key': attributes.key }),
            },
            label: {
                default: '',
                parseHTML: element => element.getAttribute('data-field-label'),
                renderHTML: attributes => ({ 'data-field-label': attributes.label }),
            },
            type: {
                default: 'text',
                parseHTML: element => element.getAttribute('data-field-type'),
                renderHTML: attributes => ({ 'data-field-type': attributes.type }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span.template-field',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const attrs = mergeAttributes(HTMLAttributes, {
            class: 'template-field',
            style: 'background-color: #e9f5ff; padding: 2px 4px; border-radius: 4px; font-weight: bold; border: 1px solid #99c9ff; display: inline-block;',
            // Remove contenteditable=false to allow typing after the field
        });
        return ['span', attrs, 0];
    },

    // Make the mark non-inclusive to prevent it from spreading to adjacent text
    inclusive() {
        return false;
    },
});

// Default header and footer settings
const defaultHeaderSettings = {
    enabled: false,
    companyName: 'Company Name',
    logoUrl: '', // Optional logo URL
    address: 'Company Address\nCity, State ZIP',
    contact: 'Phone: (123) 456-7890 | Email: info@company.com',
    additionalInfo: 'Web: www.company.com',
};

const defaultFooterSettings = {
    enabled: false,
    companyName: 'Company Name',
    includePageNumbers: true,
    copyright: '© 2025 Company Name. All rights reserved.',
    additionalText: 'Confidential Document',
};

const DocEditor = ({ initialContent, onUpdate, documentTitle, onUpdateTitle, isTemplateMode = false, onSaveTemplate }) => {
    const [title, setTitle] = useState(documentTitle);
    const [tableMenuOpen, setTableMenuOpen] = useState(false);
    const [tableMenuPosition, setTableMenuPosition] = useState({ x: 0, y: 0 });
    const [templateFields, setTemplateFields] = useState([]);
    const editorWrapperRef = useRef(null);

    // Header and footer state
    const [headerSettings, setHeaderSettings] = useState(() => {
        // Try to load from localStorage first, otherwise use default
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem('documentHeaderSettings');
            return savedSettings ? JSON.parse(savedSettings) : defaultHeaderSettings;
        }
        return defaultHeaderSettings;
    });

    const [footerSettings, setFooterSettings] = useState(() => {
        // Try to load from localStorage first, otherwise use default
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem('documentFooterSettings');
            return savedSettings ? JSON.parse(savedSettings) : defaultFooterSettings;
        }
        return defaultFooterSettings;
    });

    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

    // Mock page info for the footer - in a real app this would be dynamic
    const pageInfo = {
        currentPage: 1,
        totalPages: 5
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false, // Disable default heading node
            }),
            HeadingMark, // Add our custom inline heading mark
            TemplateField, // Add template field mark
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline hover:text-blue-800',
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
                validate: href => /^https?:\/\//.test(href),
            }),
            Image,
            TextAlign.configure({
                types: ['paragraph', 'tableCell', 'tableHeader'],
            }),
            Placeholder.configure({
                placeholder: 'Start typing...',
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse border border-gray-300 w-full',
                },
                allowTableNodeSelection: true,
                handleWidth: 5,
                cellMinWidth: 50,
            }),
            TableRow.configure({
                HTMLAttributes: {
                    class: 'border-b border-gray-300',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 p-2 bg-gray-100 font-medium',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 p-2',
                },
            }),
        ],
        content: initialContent,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onUpdate(html);

            // If in template mode, extract template fields
            if (isTemplateMode) {
                extractTemplateFields(html);
            }
        },
        editorProps: {
            attributes: {
                class: 'outline-none focus:outline-none',
            },
            handleDOMEvents: {
                contextmenu: (view, event) => {
                    // Check if we're inside a table
                    const { state } = view;
                    const { selection } = state;

                    // Log information for debugging
                    console.log('Context menu triggered, selection:', selection);

                    // Improved table detection logic
                    let isInTable = false;

                    try {
                        // First, check using DOM method for direct detection
                        const targetElement = event.target;
                        if (targetElement.closest('table, th, td, tr')) {
                            console.log('Table element found in DOM');
                            isInTable = true;
                        } else {
                            // Fallback to the schema-based approach
                            let depth = selection.$anchor.depth;
                            while (depth > 0) {
                                const node = selection.$anchor.node(depth);
                                if (node && (node.type.name === 'table' ||
                                    node.type.name === 'tableRow' ||
                                    node.type.name === 'tableCell' ||
                                    node.type.name === 'tableHeader')) {
                                    console.log(`Found table element in schema: ${node.type.name}`);
                                    isInTable = true;
                                    break;
                                }
                                depth--;
                            }
                        }
                    } catch (err) {
                        console.error('Error in table detection:', err);
                    }

                    if (isInTable) {
                        event.preventDefault();

                        // Position the menu at the cursor
                        const newPosition = { x: event.clientX, y: event.clientY };
                        console.log('Opening table menu at:', newPosition);

                        setTableMenuPosition(newPosition);
                        setTableMenuOpen(true);
                        return true;
                    }

                    return false;
                },
                mousedown: (view, event) => {
                    // Only close menu if we're clicking outside of it
                    // (the menu component handles its own click handling)
                    if (tableMenuOpen && !event.target.closest('.table-context-menu')) {
                        console.log('Closing table menu due to mousedown outside');
                        setTableMenuOpen(false);
                    }
                    return false;
                },
            },
        },
    });

    // Extract template fields from HTML content
    const extractTemplateFields = (html) => {
        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Get all template field elements
        const fieldElements = tempDiv.querySelectorAll('.template-field');
        const fields = [];

        fieldElements.forEach(element => {
            const key = element.getAttribute('data-field-key');
            const label = element.getAttribute('data-field-label') || key;
            const type = element.getAttribute('data-field-type') || 'text';

            // Only add unique fields
            if (key && !fields.some(f => f.key === key)) {
                fields.push({ key, label, type });
            }
        });

        setTemplateFields(fields);
    };

    // Add a dedicated method to insert template fields
    const insertTemplateField = useCallback(({ key, label, type }) => {
        if (!editor || !key) return;

        // Store the current cursor position
        const { from } = editor.state.selection;

        // Create the field content with placeholder text
        const fieldText = `{{${key}}}`;

        // Insert the field with marks and ensure space after
        editor
            .chain()
            .focus()
            .insertContent({
                type: 'text',
                text: fieldText,
                marks: [
                    {
                        type: 'templateField',
                        attrs: {
                            key,
                            label: label || key,
                            type: type || 'text'
                        }
                    }
                ]
            })
            .insertContent(' ') // Add space after field
            .unsetAllMarks() // Clear marks for subsequent typing
            .run();

        // Ensure the cursor is positioned after the inserted field
        setTimeout(() => {
            const newPosition = from + fieldText.length + 1; // +1 for the space
            editor.commands.setTextSelection(newPosition);
            editor.commands.focus();
        }, 0);

    }, [editor]);

    // Handle template field clicks
    useEffect(() => {
        if (!editor || !isTemplateMode) return;

        const handleClick = (event) => {
            // Check if we clicked on a template field
            const templateField = event.target.closest('.template-field');
            if (templateField) {
                // Get field data
                const key = templateField.getAttribute('data-field-key');
                const label = templateField.getAttribute('data-field-label');
                const type = templateField.getAttribute('data-field-type');

                console.log(`Clicked template field: ${key} (${type})`);

                // Position cursor after the template field
                const domSelection = window.getSelection();
                if (domSelection.rangeCount > 0) {
                    const range = domSelection.getRangeAt(0);
                    range.collapse(false); // Collapse to end
                    domSelection.removeAllRanges();
                    domSelection.addRange(range);

                    // Focus editor
                    editor.commands.focus();
                }
            }
        };

        // Attach event listeners to the editor DOM
        const editorElement = editorWrapperRef.current?.querySelector('.ProseMirror');
        if (editorElement) {
            editorElement.addEventListener('click', handleClick);

            return () => {
                editorElement.removeEventListener('click', handleClick);
            };
        }
    }, [editor, isTemplateMode]);

    useEffect(() => {
        // Log for debugging
        if (editor) {
            console.log('Editor initialized with extensions:', editor.extensionManager.extensions);
        }
    }, [editor]);

    // Add global key handler to close menu on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && tableMenuOpen) {
                setTableMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [tableMenuOpen]);

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        onUpdateTitle(newTitle);
    };

    const handleExportPdf = useCallback(() => {
        if (editor) {
            // When exporting to PDF, ensure headers and footers are included
            exportToPdf(title, editor.getHTML(), headerSettings, footerSettings);
        }
    }, [editor, title, headerSettings, footerSettings]);

    const closeTableMenu = () => {
        console.log('Closing table menu');
        setTableMenuOpen(false);
    };

    const handleSaveTemplate = () => {
        if (editor && onSaveTemplate) {
            const html = editor.getHTML();
            onSaveTemplate({
                title,
                content: html,
                fields: templateFields,
                headerSettings,
                footerSettings
            });
        }
    };

    // Handler for saving header and footer settings
    const handleSaveHeaderFooterSettings = (settings) => {
        setHeaderSettings(settings.headerSettings);
        setFooterSettings(settings.footerSettings);

        // Save to localStorage with SSR check
        if (typeof window !== 'undefined') {
            localStorage.setItem('documentHeaderSettings', JSON.stringify(settings.headerSettings));
            localStorage.setItem('documentFooterSettings', JSON.stringify(settings.footerSettings));
        }
    };

    // Add a method to fix broken template fields if needed
    const fixBrokenTemplateFields = () => {
        if (!editor) return;

        // Get the current content
        const content = editor.getHTML();

        // Create a document fragment to analyze
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // Find any malformed template fields
        const brokenFields = tempDiv.querySelectorAll('span[data-field-key]');
        let hasBrokenFields = false;

        brokenFields.forEach(field => {
            if (!field.classList.contains('template-field')) {
                hasBrokenFields = true;
            }
        });

        if (hasBrokenFields) {
            console.log('Found and fixing broken template fields');
            // You can implement specific fixes here based on your specific issues

            // For example, reset all content and add a sample field:
            editor.commands.setContent('');
            editor.commands.focus();
            editor.commands.insertContent('Your name is ');

            // Insert a properly formatted template field
            insertTemplateField({
                key: 'name',
                label: 'Name',
                type: 'text'
            });
        }
    };

    if (!editor) {
        return <div className="p-4">Loading editor...</div>;
    }

    return (
        <div className="flex flex-col border border-gray-300 rounded-md shadow-sm bg-white">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className="text-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 w-full max-w-md"
                    placeholder="Untitled Document"
                />
                <div className="flex items-center space-x-2">
                    <Tooltip title="Header & Footer Settings">
                        <IconButton onClick={() => setSettingsDialogOpen(true)}>
                            <i className="ri-settings-4-line"></i>
                        </IconButton>
                    </Tooltip>

                    {isTemplateMode && (
                        <>
                            <Button
                                variant="contained"
                                onClick={handleSaveTemplate}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Save Template
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={fixBrokenTemplateFields}
                                className="px-3 py-1 rounded"
                            >
                                Fix Template Fields
                            </Button>
                        </>
                    )}
                    <DocumentActions
                        onExportPdf={handleExportPdf}
                    />
                </div>
            </div>
            <EditorMenuBar
                editor={editor}
                isTemplateMode={isTemplateMode}
                onInsertTemplateField={insertTemplateField}
            />
            <div className="relative flex-grow" ref={editorWrapperRef}>
                {editor.isActive('templateField') && (
                    <div className="absolute top-0 left-0 right-0 bg-yellow-100 text-yellow-800 p-2 text-center border-b border-yellow-300">
                        Template field mode active. Click "Clear Format" to exit.
                    </div>
                )}

                {/* Document container with header and footer */}
                <div className="p-6 min-h-screen outline-none">
                    {/* Header */}
                    <DocumentHeader settings={headerSettings} />

                    {/* Editor content */}
                    <EditorContent editor={editor} className="min-h-[60vh]" />

                    {/* Footer */}
                    <DocumentFooter settings={footerSettings} pageInfo={pageInfo} />
                </div>

                <TableContextMenu
                    editor={editor}
                    isOpen={tableMenuOpen}
                    position={tableMenuPosition}
                    onClose={closeTableMenu}
                />
            </div>

            {isTemplateMode && templateFields.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <h3 className="text-lg font-medium mb-2">Template Fields</h3>
                    <ul className="space-y-2">
                        {templateFields.map((field, index) => (
                            <li key={index} className="flex justify-between items-center p-2 bg-white border border-gray-200 rounded">
                                <span className="font-medium text-gray-700">{field.key}</span>
                                <div className="flex items-center">
                                    <span className="px-2 text-gray-600">{field.label}</span>
                                    <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-700">{field.type}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Header & Footer Settings Dialog */}
            <HeaderFooterSettings
                open={settingsDialogOpen}
                onClose={() => setSettingsDialogOpen(false)}
                headerSettings={headerSettings}
                footerSettings={footerSettings}
                onSave={handleSaveHeaderFooterSettings}
            />
        </div>
    );
};

export default DocEditor;
