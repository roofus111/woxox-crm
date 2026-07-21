import styles from '../styles/editor.module.css';

const DocumentActions = ({ onExportPdf }) => {
    return (
        <div className={styles.documentActions}>
            <button
                onClick={onExportPdf}
                className={styles.exportBtn}
            >
                Export to PDF
            </button>
        </div>
    );
};

export default DocumentActions;
