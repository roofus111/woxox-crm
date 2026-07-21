'use client';

import { useState } from 'react';
import {
  Box, Typography, Grid, Paper, Button, List, ListItem, ListItemText, IconButton, TextField, Divider,
} from '@mui/material';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: 'ri-heading' },
  { type: 'text', label: 'Text', icon: 'ri-text' },
  { type: 'button', label: 'Button', icon: 'ri-checkbox-blank-circle-line' },
  { type: 'image', label: 'Image', icon: 'ri-image-line' },
  { type: 'divider', label: 'Divider', icon: 'ri-separator' },
  { type: 'spacer', label: 'Spacer', icon: 'ri-space' },
  { type: 'hero', label: 'Hero Banner', icon: 'ri-layout-top-line' },
  { type: 'columns', label: 'Columns', icon: 'ri-layout-column-line' },
  { type: 'social', label: 'Social Icons', icon: 'ri-share-line' },
  { type: 'footer', label: 'Footer', icon: 'ri-layout-bottom-line' },
];

const DEFAULT_BLOCKS = {
  heading: { type: 'heading', content: 'Your Heading', styles: { fontSize: 28, color: '#333', textAlign: 'center' } },
  text: { type: 'text', content: 'Add your text content here. Use {{FirstName}} for personalization.', styles: { fontSize: 16, color: '#555' } },
  button: { type: 'button', content: 'Click Here', url: '#', styles: { backgroundColor: '#6366f1', color: '#fff', borderRadius: 6, padding: '12px 24px' } },
  image: { type: 'image', src: 'https://via.placeholder.com/600x200', alt: 'Image', styles: { width: '100%' } },
  divider: { type: 'divider', styles: { borderColor: '#e5e7eb', margin: '16px 0' } },
  spacer: { type: 'spacer', styles: { height: 32 } },
  hero: { type: 'hero', content: 'Hero Banner Title', subtitle: 'Supporting text', styles: { backgroundColor: '#6366f1', color: '#fff', padding: 48 } },
  columns: { type: 'columns', columns: [{ content: 'Column 1' }, { content: 'Column 2' }], styles: {} },
  social: { type: 'social', icons: ['facebook', 'twitter', 'linkedin'], styles: { textAlign: 'center' } },
  footer: { type: 'footer', content: '© {{CompanyName}} · {{CompanyAddress}}', styles: { fontSize: 12, color: '#999', textAlign: 'center' } },
};

function SortableBlock({ block, index, selected, onSelect, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <Paper ref={setNodeRef} style={style} sx={{ p: 2, mb: 1, cursor: 'grab', border: selected ? '2px solid' : '1px solid', borderColor: selected ? 'primary.main' : 'divider' }}
      onClick={() => onSelect(index)} {...attributes} {...listeners}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">{block.type}</Typography>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRemove(index); }}><i className="ri-delete-bin-line" /></IconButton>
      </Box>
      {block.type === 'heading' && <Typography variant="h5" sx={block.styles}>{block.content}</Typography>}
      {block.type === 'text' && <Typography sx={block.styles}>{block.content}</Typography>}
      {block.type === 'button' && <Button sx={block.styles}>{block.content}</Button>}
      {block.type === 'image' && <Box component="img" src={block.src} alt={block.alt} sx={block.styles} />}
      {block.type === 'divider' && <Divider sx={block.styles} />}
      {block.type === 'spacer' && <Box sx={{ height: block.styles.height }} />}
      {block.type === 'hero' && (
        <Box sx={{ ...block.styles, textAlign: 'center', borderRadius: 1 }}>
          <Typography variant="h4">{block.content}</Typography>
          <Typography>{block.subtitle}</Typography>
        </Box>
      )}
      {block.type === 'footer' && <Typography sx={block.styles}>{block.content}</Typography>}
    </Paper>
  );
}

function blocksToHtml(blocks) {
  return blocks.map((b) => {
    switch (b.type) {
      case 'heading': return `<h1 style="font-size:${b.styles.fontSize}px;color:${b.styles.color};text-align:${b.styles.textAlign}">${b.content}</h1>`;
      case 'text': return `<p style="font-size:${b.styles.fontSize}px;color:${b.styles.color}">${b.content}</p>`;
      case 'button': return `<a href="${b.url}" style="display:inline-block;background:${b.styles.backgroundColor};color:${b.styles.color};padding:${b.styles.padding};border-radius:${b.styles.borderRadius}px;text-decoration:none">${b.content}</a>`;
      case 'image': return `<img src="${b.src}" alt="${b.alt}" style="width:${b.styles.width}" />`;
      case 'divider': return '<hr />';
      case 'spacer': return `<div style="height:${b.styles.height}px"></div>`;
      case 'hero': return `<div style="background:${b.styles.backgroundColor};color:${b.styles.color};padding:${b.styles.padding}px;text-align:center"><h1>${b.content}</h1><p>${b.subtitle}</p></div>`;
      case 'footer': return `<p style="font-size:${b.styles.fontSize}px;color:${b.styles.color};text-align:${b.styles.textAlign}">${b.content}</p>`;
      default: return '';
    }
  }).join('\n');
}

export default function EmailBuilderPage() {
  const [blocks, setBlocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [templateName, setTemplateName] = useState('');

  const sensors = useSensors(useSensor(PointerSensor));

  const addBlock = (type) => {
    const block = { ...DEFAULT_BLOCKS[type], id: `block-${Date.now()}` };
    setBlocks([...blocks, block]);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      setBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const handleSave = async () => {
    if (!templateName) return toast.error('Enter a template name');
    try {
      await emailApi.createTemplate({
        name: templateName,
        htmlContent: blocksToHtml(blocks),
        jsonDesign: { blocks },
        category: 'Custom',
        status: 'draft',
      });
      toast.success('Template saved from builder');
    } catch {
      toast.error('Failed to save');
    }
  };

  const selectedBlock = selected !== null ? blocks[selected] : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" fontWeight={700}>Email Builder</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Template name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
          <Button variant="outlined" onClick={() => { navigator.clipboard.writeText(blocksToHtml(blocks)); toast.success('HTML copied'); }}>Export HTML</Button>
          <Button variant="contained" onClick={handleSave}>Save Template</Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Blocks</Typography>
            <List dense>
              {BLOCK_TYPES.map((bt) => (
                <ListItem key={bt.type} button onClick={() => addBlock(bt.type)} sx={{ borderRadius: 1, mb: 0.5 }}>
                  <i className={bt.icon} style={{ marginRight: 8 }} />
                  <ListItemText primary={bt.label} primaryTypographyProps={{ fontSize: 13 }} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, minHeight: 500, bgcolor: '#f8fafc' }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 10 }}>
                    <i className="ri-drag-drop-line" style={{ fontSize: 48, color: '#ccc' }} />
                    <Typography color="text.secondary">Drag blocks from the left panel to build your email</Typography>
                  </Box>
                ) : blocks.map((block, index) => (
                  <SortableBlock key={block.id} block={block} index={index} selected={selected === index}
                    onSelect={setSelected} onRemove={(i) => setBlocks(blocks.filter((_, idx) => idx !== i))} />
                ))}
              </SortableContext>
            </DndContext>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Properties</Typography>
            {selectedBlock ? (
              <>
                {(selectedBlock.type === 'heading' || selectedBlock.type === 'text' || selectedBlock.type === 'hero') && (
                  <TextField fullWidth size="small" label="Content" multiline rows={3} sx={{ mb: 2 }}
                    value={selectedBlock.content} onChange={(e) => {
                      const updated = [...blocks];
                      updated[selected].content = e.target.value;
                      setBlocks(updated);
                    }} />
                )}
                <TextField fullWidth size="small" type="color" label="Color" sx={{ mb: 2 }}
                  value={selectedBlock.styles?.color || selectedBlock.styles?.backgroundColor || '#333'}
                  onChange={(e) => {
                    const updated = [...blocks];
                    updated[selected].styles = { ...updated[selected].styles, color: e.target.value };
                    setBlocks(updated);
                  }} />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">Select a block to edit properties</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
