// src/components/EditorMenuBar.js
import React, { useState } from 'react';

const EditorMenuBar = ({ editor, isTemplateMode = false, onInsertTemplateField }) => {
    const [showTemplateFldMenu, setShowTemplateFldMenu] = useState(false);
    const [fieldKey, setFieldKey] = useState('');
    const [fieldLabel, setFieldLabel] = useState('');
    const [fieldType, setFieldType] = useState('text');

    if (!editor) {
        return null;
    }

    const addTemplateField = () => {
        if (!fieldKey.trim()) return;

        // Call the parent component's method to insert the template field
        if (onInsertTemplateField) {
            onInsertTemplateField({
                key: fieldKey,
                label: fieldLabel || fieldKey,
                type: fieldType
            });

            // Clear form and close menu
            setFieldKey('');
            setFieldLabel('');
            setShowTemplateFldMenu(false);
        }
    };

    // Button styles
    const buttonStyle = "px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100";
    const activeButtonStyle = "px-2 py-1 text-sm border border-blue-500 bg-blue-100 rounded text-blue-700";

    // Check if we're currently in a template field
    const isInTemplateField = editor.isActive('templateField');

    return (
        <div className="flex flex-wrap items-center p-2 bg-white border-b border-gray-200 sticky top-0 z-10">
            {/* Bold, Italic, Underline buttons */}
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? activeButtonStyle : buttonStyle}
            >
                B
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? activeButtonStyle : buttonStyle}
            >
                I
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? activeButtonStyle : buttonStyle}
            >
                U
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? activeButtonStyle : buttonStyle}
            >
                S
            </button>

            {/* Clear formatting */}
            <button
                onClick={() => {
                    // We keep templateField mark but remove other formatting
                    if (isInTemplateField) {
                        // Preserve template field mark while removing other marks
                        const templateMark = editor.state.selection.$from.marks().find(mark =>
                            mark.type.name === 'templateField'
                        );

                        if (templateMark) {
                            editor.chain().focus()
                                .unsetAllMarks()
                                .setMark('templateField', templateMark.attrs)
                                .run();
                        }
                    } else {
                        // Remove all marks
                        editor.chain().focus().unsetAllMarks().run();
                    }
                }}
                className={buttonStyle}
                title="Clear formatting"
            >
                Clear Format
            </button>

            {/* Separator */}
            <div className="mx-2 h-6 w-px bg-gray-300" />

            {/* Paragraphs and Headings */}
            <button
                onClick={() => editor.chain().focus().unsetMark('headingMark').run()}
                className={!editor.isActive('headingMark') ? activeButtonStyle : buttonStyle}
            >
                P
            </button>
            <button
                onClick={() => editor.chain().focus().setMark('headingMark', { level: 1 }).run()}
                className={editor.isActive('headingMark', { level: 1 }) ? activeButtonStyle : buttonStyle}
            >
                H1
            </button>
            <button
                onClick={() => editor.chain().focus().setMark('headingMark', { level: 2 }).run()}
                className={editor.isActive('headingMark', { level: 2 }) ? activeButtonStyle : buttonStyle}
            >
                H2
            </button>
            <button
                onClick={() => editor.chain().focus().setMark('headingMark', { level: 3 }).run()}
                className={editor.isActive('headingMark', { level: 3 }) ? activeButtonStyle : buttonStyle}
            >
                H3
            </button>

            {/* Separator */}
            <div className="mx-2 h-6 w-px bg-gray-300" />

            {/* Lists */}
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? activeButtonStyle : buttonStyle}
            >
                • List
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? activeButtonStyle : buttonStyle}
            >
                1. List
            </button>

            {/* Separator */}
            <div className="mx-2 h-6 w-px bg-gray-300" />

            {/* Text alignment */}
            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? activeButtonStyle : buttonStyle}
            >
                ←
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? activeButtonStyle : buttonStyle}
            >
                ↔
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? activeButtonStyle : buttonStyle}
            >
                →
            </button>

            {/* Separator */}
            <div className="mx-2 h-6 w-px bg-gray-300" />

            {/* Link */}
            <button
                onClick={() => {
                    const url = window.prompt('URL');
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run();
                    }
                }}
                className={editor.isActive('link') ? activeButtonStyle : buttonStyle}
            >
                Link
            </button>
            <button
                onClick={() => editor.chain().focus().unsetLink().run()}
                disabled={!editor.isActive('link')}
                className={!editor.isActive('link') ? "px-2 py-1 text-sm border border-gray-300 rounded text-gray-400 cursor-not-allowed" : buttonStyle}
            >
                Unlink
            </button>

            {/* Separator */}
            <div className="mx-2 h-6 w-px bg-gray-300" />

            {/* Image */}
            <button
                onClick={() => {
                    const url = window.prompt('Image URL');
                    if (url) {
                        editor.chain().focus().setImage({ src: url }).run();
                    }
                }}
                className={buttonStyle}
            >
                Image
            </button>

            {/* Table */}
            <button
                onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
                }}
                className={buttonStyle}
            >
                Table
            </button>

            {/* Template Field (only in template mode) */}
            {isTemplateMode && (
                <>
                    <div className="mx-2 h-6 w-px bg-gray-300" />
                    <div className="relative">
                        <button
                            onClick={() => setShowTemplateFldMenu(!showTemplateFldMenu)}
                            className={showTemplateFldMenu ? activeButtonStyle : buttonStyle}
                        >
                            Template Field
                        </button>

                        {/* Template field status indicator */}
                        {isInTemplateField && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-xs text-blue-800 rounded">
                                Formatting template field
                            </span>
                        )}

                        {showTemplateFldMenu && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-4 z-20 w-64">
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Key:</label>
                                    <input
                                        type="text"
                                        value={fieldKey}
                                        onChange={(e) => setFieldKey(e.target.value)}
                                        placeholder="e.g. name"
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Label:</label>
                                    <input
                                        type="text"
                                        value={fieldLabel}
                                        onChange={(e) => setFieldLabel(e.target.value)}
                                        placeholder="e.g. Full Name"
                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Type:</label>
                                    <select
                                        value={fieldType}
                                        onChange={(e) => setFieldType(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="date">Date</option>
                                        <option value="email">Email</option>
                                        <option value="phone">Phone</option>
                                        <option value="longtext">Long Text</option>
                                    </select>
                                </div>
                                <div className="flex justify-between">
                                    <button
                                        onClick={addTemplateField}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                    >
                                        Add Field
                                    </button>
                                    <button
                                        onClick={() => setShowTemplateFldMenu(false)}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Separator */}
            <div className="mx-2 h-6 w-px bg-gray-300" />

            {/* Undo/Redo */}
            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className={!editor.can().undo() ? "px-2 py-1 text-sm border border-gray-300 rounded text-gray-400 cursor-not-allowed" : buttonStyle}
            >
                Undo
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className={!editor.can().redo() ? "px-2 py-1 text-sm border border-gray-300 rounded text-gray-400 cursor-not-allowed" : buttonStyle}
            >
                Redo
            </button>
        </div>
    );
};

export default EditorMenuBar;
