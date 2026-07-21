'use client';

import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent, CardActions, Skeleton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton,
} from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

export default function ListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchLists = async () => {
    try {
      const res = await emailApi.getLists({});
      setLists(res.data?.data || []);
    } catch {
      toast.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLists(); }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleCreate = async () => {
    try {
      await emailApi.createList({ name, type: 'static', description });
      toast.success('List created');
      setOpen(false);
      resetForm();
      fetchLists();
    } catch {
      toast.error('Failed to create list');
    }
  };

  const openEdit = (list) => {
    setEditingId(list._id);
    setName(list.name || '');
    setDescription(list.description || '');
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await emailApi.updateList(editingId, { name, description });
      toast.success('List updated');
      setEditOpen(false);
      resetForm();
      fetchLists();
    } catch {
      toast.error('Failed to update list');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact list?')) return;
    try {
      await emailApi.deleteList(id);
      toast.success('List deleted');
      fetchLists();
    } catch {
      toast.error('Failed to delete list');
    }
  };

  const handleImportLeads = async (id) => {
    try {
      const res = await emailApi.importLeadsToList(id);
      toast.success(`Imported ${res.data.data.contactCount} contacts`);
      fetchLists();
    } catch {
      toast.error('Failed to import leads');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Contact Lists</Typography>
        <Button variant="contained" onClick={() => { resetForm(); setOpen(true); }} startIcon={<i className="ri-add-line" />}>New List</Button>
      </Box>
      <Grid container spacing={2}>
        {loading ? Array.from({ length: 4 }).map((_, i) => <Grid item xs={12} md={4} key={i}><Skeleton height={120} /></Grid>) :
          lists.map((list) => (
            <Grid item xs={12} md={4} key={list._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{list.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{list.type} · {list.contactCount || 0} contacts</Typography>
                  {list.description && <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>{list.description}</Typography>}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleImportLeads(list._id)}>Import CRM Leads</Button>
                  <Button size="small" onClick={() => openEdit(list)}>Edit</Button>
                  <IconButton size="small" color="error" onClick={() => handleDelete(list._id)} title="Delete">
                    <i className="ri-delete-bin-line" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Contact List</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="List Name" sx={{ mt: 1, mb: 2 }} value={name} onChange={(e) => setName(e.target.value)} />
          <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Contact List</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="List Name" sx={{ mt: 1, mb: 2 }} value={name} onChange={(e) => setName(e.target.value)} />
          <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
