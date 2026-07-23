'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { toast } from 'react-toastify'
import {
  bridgeCrmPlatformWithLegacyToken,
  createNote,
  fetchNote,
  fetchNoteTags,
  fetchNotes,
  getCrmPlatformToken,
  trashNote,
  updateNote,
} from '@/libs/crmPlatformApi'
import '@/libs/styles/tiptapEditor.css'

const FOLDERS = [
  { key: 'all', label: 'All Notes', icon: 'ri-file-list-3-line' },
  { key: 'pinned', label: 'Pinned', icon: 'ri-pushpin-line' },
  { key: 'favorites', label: 'Favorites', icon: 'ri-star-line' },
  { key: 'archive', label: 'Archive', icon: 'ri-archive-line' },
  { key: 'trash', label: 'Trash', icon: 'ri-delete-bin-line' },
]

const COLORS = ['#FFF59D', '#90CAF9', '#F48FB1', '#A5D6A7', '#FFCC80', '#CE93D8', '#FFFFFF', '#424242']

function ToolbarBtn({ onClick, active, icon, title }) {
  return (
    <Tooltip title={title}>
      <IconButton size='small' onClick={onClick} color={active ? 'primary' : 'default'}>
        <i className={icon} />
      </IconButton>
    </Tooltip>
  )
}

async function ensurePlatformAuth() {
  if (getCrmPlatformToken()) return true
  const legacy = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!legacy) return false
  try {
    await bridgeCrmPlatformWithLegacyToken(legacy)
    return Boolean(getCrmPlatformToken())
  } catch {
    return false
  }
}

export default function NotesPage() {
  const [folder, setFolder] = useState('all')
  const [tag, setTag] = useState('')
  const [q, setQ] = useState('')
  const [tags, setTags] = useState([])
  const [notes, setNotes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveLabel, setSaveLabel] = useState('')
  const autosaveTimer = useRef(null)
  const noteRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextStyle,
      Color,
      Image,
      Placeholder.configure({ placeholder: 'Start writing…' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    onUpdate: ({ editor: ed }) => {
      scheduleAutosave({ contentHtml: ed.getHTML(), contentJson: ed.getJSON() })
    },
  })

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const ok = await ensurePlatformAuth()
      if (!ok) {
        toast.error('Platform session required for Notes. Please log in again.')
        return
      }
      const [tagList, list] = await Promise.all([
        fetchNoteTags(),
        fetchNotes({ folder, tag, q, limit: 50 }),
      ])
      setTags(Array.isArray(tagList) ? tagList : [])
      setNotes(list.items || [])
      if (!selectedId && list.items?.[0]) {
        setSelectedId(list.items[0].id)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [folder, tag, q, selectedId])

  const loadNote = useCallback(async id => {
    if (!id) {
      setNote(null)
      editor?.commands.setContent('')
      return
    }
    try {
      const data = await fetchNote(id)
      setNote(data)
      noteRef.current = data
      editor?.commands.setContent(data.contentHtml || '')
    } catch (err) {
      toast.error(err.message || 'Failed to open note')
    }
  }, [editor])

  useEffect(() => {
    loadList()
  }, [folder, tag, q])

  useEffect(() => {
    loadNote(selectedId)
  }, [selectedId, loadNote])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA' && !document.activeElement?.isContentEditable) {
        e.preventDefault()
        handleNewNote()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        flushSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const scheduleAutosave = patch => {
    if (!noteRef.current?.id) return
    noteRef.current = { ...noteRef.current, ...patch }
    setSaveLabel('Saving…')
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => flushSave(patch), 2500)
  }

  const flushSave = async (patch = {}) => {
    const current = noteRef.current
    if (!current?.id) return
    setSaving(true)
    try {
      const updated = await updateNote(current.id, {
        title: current.title,
        contentHtml: patch.contentHtml ?? current.contentHtml,
        contentJson: patch.contentJson ?? current.contentJson,
        color: current.color,
        isPinned: current.isPinned,
        isFavorite: current.isFavorite,
        isArchived: current.isArchived,
        reminderAt: current.reminderAt,
      })
      setNote(updated)
      noteRef.current = updated
      setNotes(prev => prev.map(n => (n.id === updated.id ? { ...n, ...updated } : n)))
      setSaveLabel('Saved')
    } catch (err) {
      setSaveLabel('Save failed')
      toast.error(err.message || 'Autosave failed')
    } finally {
      setSaving(false)
    }
  }

  const handleNewNote = async () => {
    try {
      const created = await createNote({ title: 'Untitled', contentHtml: '<p></p>', tagNames: tag ? [tag] : [] })
      setNotes(prev => [created, ...prev])
      setSelectedId(created.id)
      toast.success('Note created')
    } catch (err) {
      toast.error(err.message || 'Could not create note')
    }
  }

  const patchLocal = fields => {
    if (!noteRef.current) return
    const next = { ...noteRef.current, ...fields }
    setNote(next)
    noteRef.current = next
    scheduleAutosave(fields)
  }

  const handleTrash = async () => {
    if (!note?.id) return
    try {
      await trashNote(note.id)
      toast.success('Moved to trash')
      setSelectedId(null)
      loadList()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const selectedTags = useMemo(
    () => (note?.tags || []).map(t => t.tag?.name || t.name).filter(Boolean),
    [note]
  )

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 2, p: 2 }}>
      <Box sx={{ width: 220, flexShrink: 0, borderRight: 1, pr: 1, overflow: 'auto' }}>
        <Button fullWidth variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleNewNote} sx={{ mb: 2 }}>
          New Note
        </Button>
        <Typography variant='caption' color='text.secondary' sx={{ px: 1 }}>
          Folders
        </Typography>
        <List dense>
          {FOLDERS.map(f => (
            <ListItemButton key={f.key} selected={folder === f.key} onClick={() => setFolder(f.key)}>
              <i className={`${f.icon} mie-2`} />
              <ListItemText primary={f.label} />
            </ListItemButton>
          ))}
        </List>
        <Typography variant='caption' color='text.secondary' sx={{ px: 1 }}>
          Tags
        </Typography>
        <Stack direction='row' flexWrap='wrap' gap={0.5} sx={{ px: 1, mt: 1 }}>
          <Chip size='small' label='All' color={!tag ? 'primary' : 'default'} onClick={() => setTag('')} />
          {tags.map(t => (
            <Chip
              key={t.id}
              size='small'
              label={t.name}
              onClick={() => setTag(t.name)}
              color={tag === t.name ? 'primary' : 'default'}
              sx={{ bgcolor: tag === t.name ? undefined : t.color }}
            />
          ))}
        </Stack>
      </Box>

      <Box sx={{ width: 300, flexShrink: 0, displayRight: 1, pr: 1, display: 'flex', flexDirection: 'column' }}>
        <TextField
          size='small'
          placeholder='Search notes'
          value={q}
          onChange={e => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='ri-search-line' />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
        <Box sx={{ overflow: 'auto', flex: 1 }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : notes.length === 0 ? (
            <Typography color='text.secondary' sx={{ p: 2 }}>
              No notes yet
            </Typography>
          ) : (
            notes.map(n => (
              <Box
                key={n.id}
                onClick={() => setSelectedId(n.id)}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: selectedId === n.id ? 'action.selected' : 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: `4px solid ${n.color || '#FFF59D'}`,
                }}
              >
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                    {n.title || 'Untitled'}
                  </Typography>
                  <Stack direction='row' spacing={0.5}>
                    {n.isPinned ? <i className='ri-pushpin-fill' /> : null}
                    {n.isFavorite ? <i className='ri-star-fill' /> : null}
                  </Stack>
                </Stack>
                <Typography variant='caption' color='text.secondary'>
                  {n.updatedAt ? new Date(n.updatedAt).toLocaleString() : ''}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {!note ? (
          <Box sx={{ m: 'auto', textAlign: 'center' }}>
            <Typography color='text.secondary'>Select or create a note</Typography>
          </Box>
        ) : (
          <>
            <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
              <TextField
                fullWidth
                variant='standard'
                value={note.title || ''}
                onChange={e => patchLocal({ title: e.target.value })}
                placeholder='Title'
                InputProps={{ sx: { fontSize: 22, fontWeight: 700 } }}
              />
              <Typography variant='caption' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
                {saving ? 'Saving…' : saveLabel}
              </Typography>
              <Tooltip title='Pin'>
                <IconButton onClick={() => patchLocal({ isPinned: !note.isPinned })}>
                  <i className={note.isPinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'} />
                </IconButton>
              </Tooltip>
              <Tooltip title='Favorite'>
                <IconButton onClick={() => patchLocal({ isFavorite: !note.isFavorite })}>
                  <i className={note.isFavorite ? 'ri-star-fill' : 'ri-star-line'} />
                </IconButton>
              </Tooltip>
              <Tooltip title='Trash'>
                <IconButton onClick={handleTrash}>
                  <i className='ri-delete-bin-line' />
                </IconButton>
              </Tooltip>
            </Stack>

            <Stack direction='row' spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <Box
                  key={c}
                  onClick={() => patchLocal({ color: c })}
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: c,
                    border: note.color === c ? '2px solid #1976d2' : '1px solid #ccc',
                    cursor: 'pointer',
                  }}
                />
              ))}
              {selectedTags.map(name => (
                <Chip key={name} size='small' label={name} />
              ))}
            </Stack>

            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                mb: 1,
                px: 0.5,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.25,
              }}
            >
              <ToolbarBtn icon='ri-bold' title='Bold' active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()} />
              <ToolbarBtn icon='ri-italic' title='Italic' active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()} />
              <ToolbarBtn icon='ri-underline' title='Underline' active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
              <ToolbarBtn icon='ri-mark-pen-line' title='Highlight color' onClick={() => editor?.chain().focus().setColor('#FFEB3B').run()} />
              <ToolbarBtn icon='ri-list-unordered' title='Bullet list' onClick={() => editor?.chain().focus().toggleBulletList().run()} />
              <ToolbarBtn icon='ri-list-ordered' title='Number list' onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
              <ToolbarBtn icon='ri-checkbox-line' title='Task-style list' onClick={() => editor?.chain().focus().toggleBulletList().run()} />
              <ToolbarBtn icon='ri-double-quotes-l' title='Quote' onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
              <ToolbarBtn icon='ri-separator' title='Divider' onClick={() => editor?.chain().focus().setHorizontalRule().run()} />
              <ToolbarBtn
                icon='ri-image-line'
                title='Image URL'
                onClick={() => {
                  const url = window.prompt('Image URL')
                  if (url) editor?.chain().focus().setImage({ src: url }).run()
                }}
              />
              <ToolbarBtn
                icon='ri-table-line'
                title='Table'
                onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              />
              <ToolbarBtn icon='ri-arrow-go-back-line' title='Undo' onClick={() => editor?.chain().focus().undo().run()} />
              <ToolbarBtn icon='ri-arrow-go-forward-line' title='Redo' onClick={() => editor?.chain().focus().redo().run()} />
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: note.color === '#424242' ? '#303030' : 'background.paper' }}>
              <EditorContent editor={editor} className='tiptap-editor' />
            </Box>

            <Divider sx={{ my: 1 }} />
            <Typography variant='caption' color='text.secondary'>
              Created {note.createdAt ? new Date(note.createdAt).toLocaleString() : '—'} · Updated{' '}
              {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : '—'}
              {note.links?.length ? ` · Linked: ${note.links.map(l => `${l.entityType}`).join(', ')}` : ''}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  )
}
