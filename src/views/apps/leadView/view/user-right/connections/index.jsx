import { useState } from 'react';
import axios from 'axios';
import { Box, Grid, Typography, TextField, Button, Paper, Avatar, Divider } from '@mui/material';
import { useSession } from 'next-auth/react';
import EntityNotesPanel from '@/components/notes/EntityNotesPanel';

const ConnectionsTab = ({ props }) => {
  const [notes, setNotes] = useState(props.viewItem?.notes || []);
  const [newNote, setNewNote] = useState('');
  const { data: session } = useSession();
  const leadId = props.viewItem?._id || props.viewItem?.id;
  const leadLabel =
    props.viewItem?.name ||
    [props.viewItem?.firstName, props.viewItem?.lastName].filter(Boolean).join(' ') ||
    'Lead';

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token not found in localStorage');
        return;
      }

      const updatedNote = {
        content: newNote,
        author: session?.user?.name || 'Anonymous',
        timestamp: new Date().toISOString(),
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/notes/${props.viewItem._id}`,
        updatedNote,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the notes list with the updated response
      if (Array.isArray(response.data.notes)) {
        setNotes(response.data.notes);
      } else {
        setNotes((prevNotes) => [...prevNotes, updatedNote]);
      }

      setNewNote('');
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  return (
    <Box p={2}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <EntityNotesPanel entityType='Lead' entityId={String(leadId || '')} entityLabel={leadLabel} />
          <Divider sx={{ my: 3 }} />
        </Grid>
        {/* Notes Display Section */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Quick lead notes
          </Typography>
          {notes.length > 0 ? (
            <Box display="flex" flexDirection="column" gap={2} mt={5}>
              {notes.map((note, index) => (
                <>
                  {/* <Typography variant="body1" sx={{ fontWeight: '500', backgroundColor: '#f6eee3' }} border={1} padding={5} borderRadius={2} borderColor={'#d6d6d6'}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '9px' }}>
                        {`${note.author || 'Unknown'}`}
                      </Typography>

                    </Box> <Divider sx={{ my: 1 }} /> {note.content}<Divider sx={{ my: 1 }} /><Typography variant="body2" color="textSecondary" sx={{ fontSize: '11px', textAlign: 'end' }}>
                      {formatTimestamp(note.timestamp)}
                    </Typography>
                  </Typography> */}

                  <div
                    key={note._id || index}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <Avatar sx={{ backgroundColor: "#28a745", color: "white" }}>
                      {typeof note.author === "string" && note.author.trim().length > 0
                        ? note.author.charAt(0).toUpperCase()
                        : "?"}
                    </Avatar>
                    <div
                      style={{
                        maxWidth: "70%",
                        width: "70%",
                        padding: "12px",
                        backgroundColor: "#f1f1f1",
                        borderRadius: "12px",
                      }}
                    >
                      <Typography
                        style={{
                          fontSize: "0.7rem",
                          color: "#888",
                          paddingBottom: "4px",
                          marginTop: "-4px",
                        }}
                      >
                        {note.author || "Unknown"}
                      </Typography>
                      <Typography>{note.content}</Typography>
                      <Typography
                        style={{
                          fontSize: "0.7rem",
                          color: "#888",
                          marginTop: "4px",
                          alignContent: "flex-end",
                          justifyContent: "flex-end",
                          textAlign: "end",
                          display: "flex",
                        }}
                      >
                        {new Date(note.timestamp).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                </>
              ))}
            </Box>
          ) : (
            <Typography color="textSecondary" mt={2}>
              No notes available
            </Typography>
          )}
        </Grid>

        {/* Add New Note Section */}
        <Grid container spacing={2} alignItems="flex-start" mt={3}>
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              placeholder="Write a new note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              multiline
              rows={3}
              variant="outlined"
              sx={{
                backgroundColor: '#fff',
                borderRadius: '8px',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              sx={{
                height: '100%',
                borderRadius: '8px',
              }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Box>

  );
};

export default ConnectionsTab;
