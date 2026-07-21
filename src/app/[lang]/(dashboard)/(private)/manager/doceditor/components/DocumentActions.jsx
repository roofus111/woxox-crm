// DocumentActions.jsx
import { useState } from 'react';
import {
    Menu,
    MenuItem,
    IconButton,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';

const DocumentActions = ({
    onExportPdf,
    onOpenHeaderFooterSettings = null,
    onCopyContent = null,
    onDownloadHtml = null
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action) => {
        handleClose();

        switch (action) {
            case 'export-pdf':
                onExportPdf && onExportPdf();
                break;
            case 'copy-content':
                onCopyContent && onCopyContent();
                break;
            case 'download-html':
                onDownloadHtml && onDownloadHtml();
                break;
            case 'header-footer':
                onOpenHeaderFooterSettings && onOpenHeaderFooterSettings();
                break;
            default:
                break;
        }
    };

    return (
        <div>
            <IconButton
                aria-label="document actions"
                aria-controls={open ? 'document-actions-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                size="small"
            >
                <i class="ri-expand-vertical-line"></i>
            </IconButton>

            <Menu
                id="document-actions-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'document-actions-button',
                }}
            >
                {onOpenHeaderFooterSettings && (
                    <MenuItem onClick={() => handleAction('header-footer')}>
                        <ListItemIcon>
                            <i class="ri-menu-line"></i>
                        </ListItemIcon>
                        <ListItemText>Header & Footer</ListItemText>
                    </MenuItem>
                )}

                <MenuItem onClick={() => handleAction('export-pdf')}>
                    <ListItemIcon>
                        <i class="ri-file-pdf-2-line"></i>
                    </ListItemIcon>
                    <ListItemText>Export as PDF</ListItemText>
                </MenuItem>

                {(onCopyContent || onDownloadHtml) && <Divider />}

                {onCopyContent && (
                    <MenuItem onClick={() => handleAction('copy-content')}>
                        <ListItemIcon>
                            <i class="ri-file-copy-line"></i>
                        </ListItemIcon>
                        <ListItemText>Copy Content</ListItemText>
                    </MenuItem>
                )}

                {onDownloadHtml && (
                    <MenuItem onClick={() => handleAction('download-html')}>
                        <ListItemIcon>
                            <i class="ri-download-cloud-line"></i>
                        </ListItemIcon>
                        <ListItemText>Download HTML</ListItemText>
                    </MenuItem>
                )}
            </Menu>
        </div>
    );
};

export default DocumentActions;
