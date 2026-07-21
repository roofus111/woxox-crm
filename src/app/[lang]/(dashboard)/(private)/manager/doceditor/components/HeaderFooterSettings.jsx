// HeaderFooterSettings.jsx
import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Grid,
    Typography,
    Tabs,
    Tab,
    Box
} from '@mui/material';

export const HeaderFooterSettings = ({ open, onClose, headerSettings, footerSettings, onSave }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [localHeaderSettings, setLocalHeaderSettings] = useState(headerSettings);
    const [localFooterSettings, setLocalFooterSettings] = useState(footerSettings);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSave = () => {
        onSave({
            headerSettings: localHeaderSettings,
            footerSettings: localFooterSettings
        });
        onClose();
    };

    const handleHeaderChange = (field, value) => {
        setLocalHeaderSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFooterChange = (field, value) => {
        setLocalFooterSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Header & Footer Settings</DialogTitle>
            <DialogContent>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab label="Header" />
                    <Tab label="Footer" />
                </Tabs>

                {activeTab === 0 && (
                    <Box mt={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={localHeaderSettings.enabled}
                                            onChange={(e) => handleHeaderChange('enabled', e.target.checked)}
                                        />
                                    }
                                    label="Enable header"
                                />
                            </Grid>

                            {localHeaderSettings.enabled && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Company Name"
                                            value={localHeaderSettings.companyName}
                                            onChange={(e) => handleHeaderChange('companyName', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Logo URL (optional)"
                                            value={localHeaderSettings.logoUrl}
                                            onChange={(e) => handleHeaderChange('logoUrl', e.target.value)}
                                            helperText="Enter image URL or leave blank to use text only"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Address"
                                            multiline
                                            rows={2}
                                            value={localHeaderSettings.address}
                                            onChange={(e) => handleHeaderChange('address', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Contact Info"
                                            value={localHeaderSettings.contact}
                                            onChange={(e) => handleHeaderChange('contact', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Additional Info"
                                            value={localHeaderSettings.additionalInfo}
                                            onChange={(e) => handleHeaderChange('additionalInfo', e.target.value)}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box mt={2}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={localFooterSettings.enabled}
                                            onChange={(e) => handleFooterChange('enabled', e.target.checked)}
                                        />
                                    }
                                    label="Enable footer"
                                />
                            </Grid>

                            {localFooterSettings.enabled && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Company Name"
                                            value={localFooterSettings.companyName}
                                            onChange={(e) => handleFooterChange('companyName', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={localFooterSettings.includePageNumbers}
                                                    onChange={(e) => handleFooterChange('includePageNumbers', e.target.checked)}
                                                />
                                            }
                                            label="Include page numbers"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Copyright Text"
                                            value={localFooterSettings.copyright}
                                            onChange={(e) => handleFooterChange('copyright', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Additional Footer Text"
                                            multiline
                                            rows={2}
                                            value={localFooterSettings.additionalText}
                                            onChange={(e) => handleFooterChange('additionalText', e.target.value)}
                                        />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSave} color="primary" variant="contained">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// DocumentHeader.jsx
export const DocumentHeader = ({ settings }) => {
    if (!settings.enabled) return null;

    return (
        <div className="document-header border-b border-gray-300 pb-3 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {settings.logoUrl && (
                        <img
                            src={settings.logoUrl}
                            alt={`${settings.companyName} logo`}
                            className="max-h-16 mr-4"
                        />
                    )}
                    <div>
                        <h1 className="text-xl font-bold">{settings.companyName}</h1>
                        {settings.address && (
                            <p className="text-sm text-gray-600">{settings.address}</p>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    {settings.contact && (
                        <p className="text-sm">{settings.contact}</p>
                    )}
                    {settings.additionalInfo && (
                        <p className="text-sm text-gray-600">{settings.additionalInfo}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// DocumentFooter.jsx
export const DocumentFooter = ({ settings, pageInfo }) => {
    if (!settings.enabled) return null;

    return (
        <div className="document-footer border-t border-gray-300 pt-3 mt-6">
            <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                    {settings.companyName && (
                        <span className="font-medium">{settings.companyName}</span>
                    )}
                    {settings.copyright && (
                        <span className="ml-2">{settings.copyright}</span>
                    )}
                </div>
                <div className="flex items-center">
                    {settings.additionalText && (
                        <span className="mr-4">{settings.additionalText}</span>
                    )}
                    {settings.includePageNumbers && pageInfo && (
                        <span>Page {pageInfo.currentPage} of {pageInfo.totalPages}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
