"use client";

import React from 'react';
import { Dialog, DialogContent, IconButton, Button, Box } from '@mui/material';

export default function ImagePreview({ open, imageUrl, onClose }) {
    // Function to handle image download
    const handleDownload = () => {
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = imageUrl;

        // Extract filename from path or use default name
        const filename = imageUrl.split('/').pop() || 'receipt-image';
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            PaperProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogContent sx={{ p: 0, position: 'relative', height: '100vh', width: '100vw' }}>
                {/* Close button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: 'white',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)'
                        },
                        zIndex: 10
                    }}
                >
                    X
                </IconButton>

                {/* Image container - takes full screen */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%'
                }}>
                    <img
                        src={imageUrl}
                        alt="Receipt"
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain'
                        }}
                    />
                </Box>

                {/* Download button */}
                <Button
                    variant="contained"
                    onClick={handleDownload}
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        zIndex: 10
                    }}
                >
                    Download
                </Button>
            </DialogContent>
        </Dialog>
    );
}
