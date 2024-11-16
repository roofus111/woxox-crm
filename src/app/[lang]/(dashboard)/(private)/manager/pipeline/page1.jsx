'use client'
import { useState } from 'react'

import { Grid, Button, Card, CardContent, Divider } from '@mui/material';
import React from 'react';
import Dialog from '@mui/material/Dialog'
import TextField from '@mui/material/TextField'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';

const Pipeline = () => {

    const [open, setOpen] = useState(false)
    const [draw, setDraw] = useState(false)

    const handleClickOpen = () => setOpen(true)

    const handleClose = () => setOpen(false)

    const toggleDrawer = (open) => (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setDraw(open);
    };

    const DrawerList = (
        <Box sx={{ width: "700px" }} role="presentation" onClick={toggleDrawer(false)} padding={5}>
            <Grid container spacing={5}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent >
                            <Box >
                                <Box>
                                    <h3>Pipe Name 1</h3>
                                    <h6>This is a paragraph that describe the characteristicsd</h6>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card>
                        <CardContent >
                            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                <Box>
                                    <h2>6</h2>
                                    <h6>Insigth</h6>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card>
                        <CardContent >
                            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                <Box>
                                    <h2>6</h2>
                                    <h6>Insigth</h6>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card>
                        <CardContent >
                            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                <Box>
                                    <h2>6</h2>
                                    <h6>Insigth</h6>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={3}>
                    <Card>
                        <CardContent >
                            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign={'center'}>
                                <Box>
                                    <h2>6</h2>
                                    <h6>Insigth</h6>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Divider />
                <Grid item xs={12}>
                    <Card>
                        <CardContent >
                            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                <h4>Stages</h4>
                                <Button>Create New</Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent >
                            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                <h4>Campaigns List</h4>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
    return (
        <><Grid container spacing={2}>
            <Grid xs={12} item display={'flex'} justifyContent={'space-between'}>
                <div>
                    <h1>Pipeline</h1>
                </div>
                <div>
                    <Button variant='outlined' onClick={handleClickOpen}>Create Pipeline</Button>
                </div>
            </Grid>
            <Grid item marginTop={10} xs={8}>
                <Card>
                    <CardContent>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div><h3>Pipe1</h3></div>
                            <div> <Button onClick={toggleDrawer("right", true)}>View</Button></div>
                        </div>
                        <Divider />
                        <Grid container spacing={2} marginTop={2}>
                            <Grid item xs={3}>Active Campaign : <b>4</b></Grid>
                            <Grid item xs={3}>Stages : <b>8</b></Grid>
                            <Grid item xs={3}> Some Insight</Grid>
                            <Grid item xs={3}>Anothe Insight</Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>

            <Drawer anchor="right" open={draw} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
            {/* create Pipeline Dialog */}

            <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
                <DialogTitle id='form-dialog-title'>Subscribe</DialogTitle>
                <DialogContent>
                    <DialogContentText className='mbe-3'>
                        To subscribe to this website, please enter your email address here. We will send updates occasionally.
                    </DialogContentText>
                    <TextField id='name' autoFocus fullWidth type='email' label='Email Address' />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='outlined' color='secondary'>
                        Disagree
                    </Button>
                    <Button onClick={handleClose} variant='contained'>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>


        </>
    );
};

export default Pipeline
