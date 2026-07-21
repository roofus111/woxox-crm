import { useState } from 'react';
import styles from '../styles/editor.module.css';

const DocumentList = ({
    documents,
    activeDocId,
    onOpenDocument,
    onDeleteDocument,
    onUpdateTitle
}) => {
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    const startEditing = (doc) => {
        setEditingId(doc.id);
        setEditTitle(doc.title);
    };

    const saveTitle = (docId) => {
        onUpdateTitle(docId, editTitle);
        setEditingId(null);
    };

    const handleKeyDown = (e, docId) => {
        if (e.key === 'Enter') {
            saveTitle(docId);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    return (
        <div className={styles.documentList}>
            {documents.length === 0 ? (
                <div className={styles.noDocuments}>
                    <p>No documents found.</p>
                </div>
            ) : (
                documents.map(doc => (
                    <div
                        key={doc.id}
                        className={`${styles.documentItem} ${activeDocId === doc.id ? styles.activeDocument : ''}`}
                    >
                        <div
                            className={styles.documentInfo}
                            onClick={() => onOpenDocument(doc)}
                        >
                            {editingId === doc.id ? (
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={() => saveTitle(doc.id)}
                                    onKeyDown={(e) => handleKeyDown(e, doc.id)}
                                    className={styles.titleInput}
                                    autoFocus
                                />
                            ) : (
                                <div className={styles.documentTitle}>{doc.title}</div>
                            )}
                        </div>
                        <div className={styles.documentActions}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(doc);
                                }}
                                className={styles.editBtn}
                                title="Rename"
                            >
                                ✎
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteDocument(doc.id);
                                }}
                                className={styles.deleteBtn}
                                title="Delete"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default DocumentList;
