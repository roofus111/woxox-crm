'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge, Background, Controls, MiniMap, useEdgesState, useNodesState, Handle, Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Paper, Typography, Button, Drawer, TextField, MenuItem, Chip } from '@mui/material';
import emailApi from '@/utils/emailApi';
import { toast } from 'react-toastify';

const NODE_TYPES_CONFIG = {
  trigger: { label: 'Trigger', color: '#6366f1', icon: 'ri-flashlight-line' },
  send_email: { label: 'Send Email', color: '#22c55e', icon: 'ri-mail-send-line' },
  delay: { label: 'Delay', color: '#f59e0b', icon: 'ri-time-line' },
  condition: { label: 'Condition', color: '#8b5cf6', icon: 'ri-git-branch-line' },
  tag: { label: 'Add Tag', color: '#06b6d4', icon: 'ri-price-tag-3-line' },
  webhook: { label: 'Webhook', color: '#ec4899', icon: 'ri-webhook-line' },
  update_crm: { label: 'Update CRM', color: '#64748b', icon: 'ri-database-2-line' },
};

function CustomNode({ data, selected }) {
  const cfg = NODE_TYPES_CONFIG[data.nodeType] || NODE_TYPES_CONFIG.send_email;
  return (
    <Paper sx={{ p: 1.5, minWidth: 160, border: selected ? `2px solid ${cfg.color}` : '1px solid #e5e7eb', borderRadius: 2 }}>
      <Handle type="target" position={Position.Top} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <i className={cfg.icon} style={{ color: cfg.color }} />
        <Typography variant="subtitle2">{data.label || cfg.label}</Typography>
      </Box>
      {data.subtitle && <Typography variant="caption" color="text.secondary">{data.subtitle}</Typography>}
      <Handle type="source" position={Position.Bottom} />
    </Paper>
  );
}

const nodeTypes = { custom: CustomNode };

const PALETTE = Object.entries(NODE_TYPES_CONFIG).map(([type, cfg]) => ({ type, ...cfg }));

export default function AutomationFlowBuilder({ automationId, onSaved }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [automation, setAutomation] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!automationId) return;
    emailApi.getAutomation(automationId).then((res) => {
      const a = res.data.data;
      setAutomation(a);
      if (a.flowData?.nodes?.length) {
        setNodes(a.flowData.nodes.map((n) => ({ ...n, type: 'custom' })));
        setEdges(a.flowData.edges || []);
      } else {
        setNodes([{
          id: 'trigger-1', type: 'custom', position: { x: 250, y: 50 },
          data: { nodeType: 'trigger', label: 'Trigger', subtitle: a.trigger?.type?.replace(/_/g, ' ') },
        }]);
      }
    }).catch(() => toast.error('Failed to load workflow'));
  }, [automationId, setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const addNode = (type) => {
    const cfg = NODE_TYPES_CONFIG[type];
    const id = `${type}-${Date.now()}`;
    setNodes((nds) => [...nds, {
      id, type: 'custom', position: { x: 150 + Math.random() * 200, y: 150 + nds.length * 80 },
      data: { nodeType: type, label: cfg.label },
    }]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await emailApi.updateAutomation(automationId, {
        flowData: {
          nodes: nodes.map(({ id, type, position, data }) => ({ id, type, position, data })),
          edges,
        },
        steps: nodes.filter((n) => n.data.nodeType !== 'trigger').map((n) => ({
          type: n.data.nodeType,
          config: n.data.config || {},
          position: n.position,
        })),
      });
      toast.success('Workflow saved');
      onSaved?.();
    } catch {
      toast.error('Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const updateSelectedNode = (field, value) => {
    if (!selectedNode) return;
    setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? {
      ...n, data: { ...n.data, [field]: value, config: { ...n.data.config, [field]: value } },
    } : n));
    setSelectedNode((prev) => ({ ...prev, data: { ...prev.data, [field]: value } }));
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{automation?.name || 'Workflow Builder'}</Typography>
          {automation?.trigger?.type && <Chip label={automation.trigger.type.replace(/_/g, ' ')} size="small" sx={{ mt: 0.5 }} />}
        </Box>
        <Button variant="contained" onClick={handleSave} disabled={saving}>Save Workflow</Button>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ width: 200, borderRight: '1px solid', borderColor: 'divider', p: 1.5, bgcolor: 'background.paper' }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary">ADD STEP</Typography>
          {PALETTE.filter((p) => p.type !== 'trigger').map((item) => (
            <Button key={item.type} fullWidth size="small" sx={{ justifyContent: 'flex-start', mb: 0.5, mt: 0.5 }}
              onClick={() => addNode(item.type)} startIcon={<i className={item.icon} style={{ color: item.color }} />}>
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </Box>

        <Drawer anchor="right" open={!!selectedNode} onClose={() => setSelectedNode(null)} variant="persistent"
          PaperProps={{ sx: { width: 280, position: 'relative', height: '100%' } }}>
          {selectedNode && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Edit Step</Typography>
              <TextField fullWidth size="small" label="Label" sx={{ mb: 2 }} value={selectedNode.data.label || ''}
                onChange={(e) => updateSelectedNode('label', e.target.value)} />
              {selectedNode.data.nodeType === 'send_email' && (
                <>
                  <TextField fullWidth size="small" label="Subject" sx={{ mb: 1 }} value={selectedNode.data.config?.subject || ''}
                    onChange={(e) => updateSelectedNode('subject', e.target.value)} />
                  <TextField fullWidth size="small" multiline rows={3} label="HTML" value={selectedNode.data.config?.htmlContent || ''}
                    onChange={(e) => updateSelectedNode('htmlContent', e.target.value)} />
                </>
              )}
              {selectedNode.data.nodeType === 'delay' && (
                <TextField fullWidth size="small" type="number" label="Delay (hours)" value={selectedNode.data.config?.hours || 24}
                  onChange={(e) => updateSelectedNode('hours', parseInt(e.target.value))} />
              )}
              {selectedNode.data.nodeType === 'condition' && (
                <TextField fullWidth select size="small" label="Field" value={selectedNode.data.config?.field || 'leadStatus'}
                  onChange={(e) => updateSelectedNode('field', e.target.value)}>
                  {['leadStatus', 'visaStatus', 'country', 'intake'].map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </TextField>
              )}
            </Box>
          )}
        </Drawer>
      </Box>
    </Box>
  );
}
