import { useState } from 'react';
import { DocumentHeader, DocumentFooter } from './HeaderFooterSettings';
import {
    Card,
    Typography,
    Switch,
    FormControlLabel,
    TextField,
    Button,
    Box,
    Grid,
    Divider
} from '@mui/material';

const HeaderFooterPreview = () => {
    // Example header and footer settings
    const [headerSettings, setHeaderSettings] = useState({
        enabled: true,
        companyName: 'Acme Corporation',
        logoUrl: '/api/placeholder/100/40', // Placeholder logo
        address: '123 Business Avenue\nCity, State 12345',
        contact: 'Phone: (555) 123-4567 | Email: info@acme.com',
        additionalInfo: 'www.acmecorp.com',
    });

    const [footerSettings, setFooterSettings] = useState({
        enabled: true,
        companyName: 'Acme Corporation',
        includePageNumbers: true,
        copyright: '© 2025 Acme Corporation. All rights reserved.',
        additionalText: 'Confidential Document',
    });

    // Mock page info for footer
    const pageInfo = {
        currentPage: 2,
        totalPages: 7
    };

    return (
        <div className="p-4">
            <Typography variant="h5" gutterBottom>
                Header & Footer Interactive Preview
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Header Settings
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={headerSettings.enabled}
                                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                                />
                            }
                            label="Enable header"
                        />

                        {headerSettings.enabled && (
                            <Box mt={2}>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    value={headerSettings.companyName}
                                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, companyName: e.target.value }))}
                                    margin="dense"
                                />

                                <TextField
                                    fullWidth
                                    label="Logo URL"
                                    value={headerSettings.logoUrl}
                                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                                    margin="dense"
                                    helperText="Leave blank for text-only header"
                                />

                                <TextField
                                    fullWidth
                                    label="Address"
                                    value={headerSettings.address}
                                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, address: e.target.value }))}
                                    margin="dense"
                                    multiline
                                    rows={2}
                                />

                                <TextField
                                    fullWidth
                                    label="Contact Info"
                                    value={headerSettings.contact}
                                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, contact: e.target.value }))}
                                    margin="dense"
                                />

                                <TextField
                                    fullWidth
                                    label="Additional Info"
                                    value={headerSettings.additionalInfo}
                                    onChange={(e) => setHeaderSettings(prev => ({ ...prev, additionalInfo: e.target.value }))}
                                    margin="dense"
                                />
                            </Box>
                        )}
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Footer Settings
                        </Typography>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={footerSettings.enabled}
                                    onChange={(e) => setFooterSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                                />
                            }
                            label="Enable footer"
                        />

                        {footerSettings.enabled && (
                            <Box mt={2}>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    value={footerSettings.companyName}
                                    onChange={(e) => setFooterSettings(prev => ({ ...prev, companyName: e.target.value }))}
                                    margin="dense"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={footerSettings.includePageNumbers}
                                            onChange={(e) => setFooterSettings(prev => ({ ...prev, includePageNumbers: e.target.checked }))}
                                        />
                                    }
                                    label="Include page numbers"
                                />

                                <TextField
                                    fullWidth
                                    label="Copyright Text"
                                    value={footerSettings.copyright}
                                    onChange={(e) => setFooterSettings(prev => ({ ...prev, copyright: e.target.value }))}
                                    margin="dense"
                                />

                                <TextField
                                    fullWidth
                                    label="Additional Text"
                                    value={footerSettings.additionalText}
                                    onChange={(e) => setFooterSettings(prev => ({ ...prev, additionalText: e.target.value }))}
                                    margin="dense"
                                />
                            </Box>
                        )}
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card className="p-4">
                        <Typography variant="h6" gutterBottom>
                            Live Preview
                        </Typography>

                        <Box className="border border-gray-300 p-4 bg-white min-h-[400px]">
                            {/* Header Preview */}
                            <DocumentHeader settings={headerSettings} />

                            {/* Sample Content */}
                            <Box className="my-4 min-h-[200px] border border-dashed border-gray-300 p-4 bg-gray-50">
                                <Typography variant="body2" color="textSecondary" align="center">
                                    Document content appears here
                                </Typography>
                            </Box>

                            {/* Footer Preview */}
                            <DocumentFooter settings={footerSettings} pageInfo={pageInfo} />
                        </Box>

                        <Box mt={2} display="flex" justifyContent="space-between">
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => {
                                    // Reset to defaults
                                    setHeaderSettings({
                                        enabled: true,
                                        companyName: 'Acme Corporation',
                                        logoUrl: '/api/placeholder/100/40',
                                        address: '123 Business Avenue\nCity, State 12345',
                                        contact: 'Phone: (555) 123-4567 | Email: info@acme.com',
                                        additionalInfo: 'www.acmecorp.com',
                                    });

                                    setFooterSettings({
                                        enabled: true,
                                        companyName: 'Acme Corporation',
                                        includePageNumbers: true,
                                        copyright: '© 2025 Acme Corporation. All rights reserved.',
                                        additionalText: 'Confidential Document',
                                    });
                                }}
                            >
                                Reset to Default
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    alert('Settings saved!');
                                    // In a real app, you would save these settings to localStorage or your backend
                                }}
                            >
                                Save Settings
                            </Button>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default HeaderFooterPreview;
