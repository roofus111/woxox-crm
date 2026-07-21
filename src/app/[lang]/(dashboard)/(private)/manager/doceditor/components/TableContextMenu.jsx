import { useState, useEffect, useRef } from 'react';

const TableContextMenu = ({ editor, isOpen, position, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Also close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') onClose();
            });
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', (e) => {
                if (e.key === 'Escape') onClose();
            });
        };
    }, [isOpen, onClose]);

    // If the menu shouldn't be shown, don't render it
    if (!isOpen || !editor) return null;

    // Helper function to safely execute editor commands
    const safeExecute = (command, commandName) => {
        try {
            console.log(`Attempting to execute: ${commandName}`);
            const result = command();
            console.log(`${commandName} executed, result:`, result);
            onClose();
            return result;
        } catch (err) {
            console.error(`Error executing ${commandName}:`, err);
            onClose();
            return false;
        }
    };

    // Table operations
    const addColumnBefore = () => safeExecute(() => editor.chain().focus().addColumnBefore().run(), 'addColumnBefore');
    const addColumnAfter = () => safeExecute(() => editor.chain().focus().addColumnAfter().run(), 'addColumnAfter');
    const deleteColumn = () => safeExecute(() => editor.chain().focus().deleteColumn().run(), 'deleteColumn');
    const addRowBefore = () => safeExecute(() => editor.chain().focus().addRowBefore().run(), 'addRowBefore');
    const addRowAfter = () => safeExecute(() => editor.chain().focus().addRowAfter().run(), 'addRowAfter');
    const deleteRow = () => safeExecute(() => editor.chain().focus().deleteRow().run(), 'deleteRow');
    const deleteTable = () => safeExecute(() => editor.chain().focus().deleteTable().run(), 'deleteTable');
    const mergeCells = () => safeExecute(() => editor.chain().focus().mergeCells().run(), 'mergeCells');
    const splitCell = () => safeExecute(() => editor.chain().focus().splitCell().run(), 'splitCell');
    const toggleHeaderRow = () => safeExecute(() => editor.chain().focus().toggleHeaderRow().run(), 'toggleHeaderRow');
    const toggleHeaderColumn = () => safeExecute(() => editor.chain().focus().toggleHeaderColumn().run(), 'toggleHeaderColumn');

    // Calculate position to ensure menu stays in viewport
    const menuStyle = {
        position: 'fixed',
        left: `${Math.min(position.x, window.innerWidth - 200)}px`,
        top: `${Math.min(position.y, window.innerHeight - 400)}px`,
        zIndex: 1000, // Ensure menu is above other elements
        maxHeight: '300px', // Set a default maximum height
        overflowY: 'auto', // Enable vertical scrolling when content exceeds maxHeight
        overflowX: 'hidden' // Prevent horizontal scrolling
    };

    return (
        <div className={styles.tableContextMenu} style={menuStyle} ref={menuRef}>
            <div className={styles.contextMenuGroup}>
                <h4>Columns</h4>
                <button type="button" onClick={addColumnBefore}>Add Column Before</button>
                <button type="button" onClick={addColumnAfter}>Add Column After</button>
                <button type="button" onClick={deleteColumn} className={styles.deleteBtn}>Delete Column</button>
            </div>

            <div className={styles.contextMenuGroup}>
                <h4>Rows</h4>
                <button type="button" onClick={addRowBefore}>Add Row Before</button>
                <button type="button" onClick={addRowAfter}>Add Row After</button>
                <button type="button" onClick={deleteRow} className={styles.deleteBtn}>Delete Row</button>
            </div>

            <div className={styles.contextMenuGroup}>
                <h4>Cells</h4>
                <button type="button" onClick={mergeCells}>Merge Cells</button>
                <button type="button" onClick={splitCell}>Split Cell</button>
            </div>

            <div className={styles.contextMenuGroup}>
                <h4>Headers</h4>
                <button type="button" onClick={toggleHeaderRow}>Toggle Header Row</button>
                <button type="button" onClick={toggleHeaderColumn}>Toggle Header Column</button>
            </div>

            <div className={styles.contextMenuGroup}>
                <h4>Table</h4>
                <button type="button" onClick={deleteTable} className={styles.deleteTableBtn}>Delete Table</button>
            </div>
        </div>
    );
};

export default TableContextMenu;
