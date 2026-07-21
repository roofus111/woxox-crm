import { Mark, mergeAttributes } from '@tiptap/core';

// Enhanced template field extension that preserves formatting
const TemplateField = Mark.create({
    name: 'templateField',

    priority: 1000, // Higher priority to ensure it works with other marks

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
            style: 'background-color: #e9f5ff; padding: 2px 4px; border-radius: 4px; border: 1px solid #99c9ff; display: inline-block;',
        });
        return ['span', attrs, 0];
    },

    // Allow other marks to be applied to template fields
    excludes: '', // Don't exclude any marks

    // Make the mark non-inclusive to prevent it from spreading to adjacent text
    inclusive() {
        return false;
    },
});

export default TemplateField;
