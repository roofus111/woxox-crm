'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Paper, IconButton, Chip, CircularProgress, Tabs, Tab,
} from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import debounce from 'lodash.debounce';
import { useSearchParams } from 'next/navigation';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

function ToolbarButton({ onClick, active, icon, title }) {
  return (
    <IconButton size="small" onClick={onClick} color={active ? 'primary' : 'default'} title={title}>
      <i className={icon} />
    </IconButton>
  );
}

export default function ComposePage() {
  const searchParams = useSearchParams();
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [sending, setSending] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [previewTab, setPreviewTab] = useState(0);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [checkResults, setCheckResults] = useState(null);
  const [checking, setChecking] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, Link, TextStyle, Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '<p>Write your email...</p>',
  });

  const saveDraft = useCallback(debounce(async (content) => {
    try {
      const res = await emailApi.saveDraft({
        _id: draftId,
        to: to ? [{ email: to }] : [],
        cc: cc ? [{ email: cc }] : [],
        bcc: bcc ? [{ email: bcc }] : [],
        subject, fromName, fromEmail, replyTo, htmlContent: content,
      });
      if (!draftId) setDraftId(res.data.data._id);
    } catch { /* silent autosave */ }
  }, 3000), [to, cc, bcc, subject, fromName, fromEmail, replyTo, draftId]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => saveDraft(editor.getHTML());
    editor.on('update', handler);
    return () => editor.off('update', handler);
  }, [editor, saveDraft]);

  useEffect(() => {
    const id = searchParams.get('draftId');
    if (!id || !editor) return;
    emailApi.getDraft(id)
      .then((res) => {
        const draft = res.data.data;
        setDraftId(draft._id);
        setTo(draft.to?.[0]?.email || '');
        setCc(draft.cc?.[0]?.email || '');
        setBcc(draft.bcc?.[0]?.email || '');
        setSubject(draft.subject || '');
        setFromName(draft.fromName || '');
        setFromEmail(draft.fromEmail || '');
        setReplyTo(draft.replyTo || '');
        if (draft.cc?.length) setShowCc(true);
        if (draft.bcc?.length) setShowBcc(true);
        if (draft.htmlContent) editor.commands.setContent(draft.htmlContent);
      })
      .catch(() => toast.error('Failed to load draft'));
  }, [searchParams, editor]);

  const handleCheck = async () => {
    try {
      setChecking(true);
      const res = await emailApi.runEmailChecks({
        subject, fromEmail, htmlContent: editor?.getHTML(),
      });
      setCheckResults(res.data.data);
      toast.success('Email checks completed');
    } catch {
      toast.error('Failed to run checks');
    } finally {
      setChecking(false);
    }
  };

  const handleSend = async () => {
    if (!to || !subject) return toast.error('To and Subject are required');
    try {
      setSending(true);
      await emailApi.sendEmail({
        to: [{ email: to }],
        cc: cc ? [{ email: cc }] : [],
        bcc: bcc ? [{ email: bcc }] : [],
        subject, fromName, fromEmail, replyTo,
        htmlContent: editor?.getHTML(),
      });
      toast.success('Email sent successfully');
      setTo(''); setSubject('');
      editor?.commands.setContent('<p></p>');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Compose Email</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleCheck} disabled={checking}>
            {checking ? 'Checking...' : 'Spam & Accessibility Check'}
          </Button>
          <Button variant="outlined" onClick={() => saveDraft(editor?.getHTML())}>Save Draft</Button>
          <Button variant="contained" onClick={handleSend} disabled={sending} startIcon={sending ? <CircularProgress size={16} /> : <i className="ri-send-plane-fill" />}>
            Send
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="To" value={to} onChange={(e) => setTo(e.target.value)} />
            <Box sx={{ mt: 0.5 }}>
              {!showCc && <Button size="small" onClick={() => setShowCc(true)}>Cc</Button>}
              {!showBcc && <Button size="small" onClick={() => setShowBcc(true)}>Bcc</Button>}
            </Box>
          </Grid>
          {showCc && <Grid item xs={12}><TextField fullWidth size="small" label="Cc" value={cc} onChange={(e) => setCc(e.target.value)} /></Grid>}
          {showBcc && <Grid item xs={12}><TextField fullWidth size="small" label="Bcc" value={bcc} onChange={(e) => setBcc(e.target.value)} /></Grid>}
          <Grid item xs={12} md={6}><TextField fullWidth size="small" label="From Name" value={fromName} onChange={(e) => setFromName(e.target.value)} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth size="small" label="From Email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} /></Grid>
          <Grid item xs={12}><TextField fullWidth size="small" label="Reply To" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} /></Grid>
          <Grid item xs={12}><TextField fullWidth size="small" label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></Grid>
        </Grid>

        <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
            <ToolbarButton icon="ri-bold" title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} />
            <ToolbarButton icon="ri-italic" title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} />
            <ToolbarButton icon="ri-underline" title="Underline" onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} />
            <ToolbarButton icon="ri-list-unordered" title="Bullet List" onClick={() => editor?.chain().focus().toggleBulletList().run()} />
            <ToolbarButton icon="ri-list-ordered" title="Ordered List" onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
            <ToolbarButton icon="ri-align-left" title="Align Left" onClick={() => editor?.chain().focus().setTextAlign('left').run()} />
            <ToolbarButton icon="ri-align-center" title="Align Center" onClick={() => editor?.chain().focus().setTextAlign('center').run()} />
            <ToolbarButton icon="ri-link" title="Link" onClick={() => { const url = prompt('URL'); if (url) editor?.chain().focus().setLink({ href: url }).run(); }} />
            <ToolbarButton icon="ri-code-line" title="Code Block" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} />
          </Box>
          <Box sx={{ p: 2, minHeight: 300, display: previewTab === 0 ? 'block' : 'none' }}>
            <EditorContent editor={editor} />
          </Box>
          <Box sx={{ p: 2, display: previewTab === 1 ? 'block' : 'none', bgcolor: '#f5f5f5' }}>
            <Box dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} />
          </Box>
        </Box>

        <Tabs value={previewTab} onChange={(_, v) => setPreviewTab(v)} sx={{ mt: 1 }}>
          <Tab label="Edit" />
          <Tab label="Preview" />
          <Tab label="Mobile Preview" />
        </Tabs>
        {draftId && <Chip label="Autosaved" size="small" color="success" sx={{ mt: 1 }} />}

        {checkResults && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, border: '1px solid', borderColor: checkResults.spam.rating === 'good' ? 'success.main' : 'warning.main' }}>
                <Typography variant="subtitle1" gutterBottom>Spam Score: {checkResults.spam.score}/100</Typography>
                <Chip label={checkResults.spam.rating.replace('_', ' ')} size="small" color={checkResults.spam.score < 25 ? 'success' : 'warning'} sx={{ mb: 1 }} />
                {checkResults.spam.issues.slice(0, 5).map((issue, i) => (
                  <Typography key={i} variant="caption" display="block" color="text.secondary">• {issue.message}</Typography>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, border: '1px solid', borderColor: checkResults.accessibility.rating === 'good' ? 'success.main' : 'warning.main' }}>
                <Typography variant="subtitle1" gutterBottom>Accessibility: {checkResults.accessibility.score}/100</Typography>
                <Chip label={checkResults.accessibility.rating.replace('_', ' ')} size="small" color={checkResults.accessibility.score >= 80 ? 'success' : 'warning'} sx={{ mb: 1 }} />
                {checkResults.accessibility.issues.slice(0, 5).map((issue, i) => (
                  <Typography key={i} variant="caption" display="block" color="text.secondary">• {issue.message}</Typography>
                ))}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
}
