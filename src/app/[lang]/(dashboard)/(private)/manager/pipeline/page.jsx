'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Card,
  CardContent,
  Stack,
} from '@mui/material'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { toast } from 'react-toastify'
import { useParams, useRouter } from 'next/navigation'
import {
  addPipelineStage,
  addStageAutomation,
  addStageChecklistItem,
  addStagePermission,
  applyPipelineTemplate,
  bridgeCrmPlatformWithLegacyToken,
  clonePipeline,
  createPipeline,
  deletePipeline,
  deletePipelineStage,
  deleteStageAutomation,
  deleteStageChecklistItem,
  deleteStageDocument,
  deleteStageField,
  deleteStagePermission,
  duplicatePipelineStage,
  exportPipeline,
  fetchPipeline,
  fetchPipelineAudit,
  fetchPipelineTemplates,
  fetchPipelines,
  getCrmPlatformToken,
  importPipeline,
  publishPipeline,
  reorderPipelineStages,
  savePipelineAsTemplate,
  updatePipeline,
  updatePipelineStage,
  upsertStageDocument,
  upsertStageField,
  upsertTransitionRule,
} from '@/libs/crmPlatformApi'
import { getLocalizedUrl } from '@/utils/i18n'

const MODULES = [
  { value: 'crm', label: 'CRM' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'support', label: 'Support' },
  { value: 'hrms', label: 'HR' },
  { value: 'legalos', label: 'LegalOS' },
  { value: 'finance', label: 'Finance' },
  { value: 'projects', label: 'Projects' },
  { value: 'academy', label: 'Academy' },
  { value: 'custom', label: 'Custom' },
]

function SortableStage({ stage, selected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stage.id })
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    borderLeft: `4px solid ${stage.color || '#0288d1'}`,
    background: selected ? 'rgba(2,136,209,0.08)' : undefined,
    cursor: 'pointer',
  }

  return (
    <Card ref={setNodeRef} style={style} sx={{ mb: 1 }} onClick={() => onSelect(stage.id)}>
      <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
        <Stack direction='row' alignItems='center' spacing={1}>
          <IconButton size='small' {...attributes} {...listeners} onClick={e => e.stopPropagation()}>
            <i className='ri-draggable' />
          </IconButton>
          <Box flex={1} minWidth={0}>
            <Typography variant='subtitle2' noWrap>
              {stage.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {stage.stageType || 'open'} · {stage.probability ?? 0}%
            </Typography>
          </Box>
          {(stage.isWon || stage.isSuccess) && <Chip size='small' color='success' label='Won' />}
          {stage.isLost && <Chip size='small' color='error' label='Lost' />}
        </Stack>
      </CardContent>
    </Card>
  )
}

function TabPanel({ value, index, children }) {
  if (value !== index) return null
  return <Box sx={{ pt: 2 }}>{children}</Box>
}

const PipelineBuilder = () => {
  const params = useParams()
  const router = useRouter()
  const locale = params?.lang || 'en'

  const [loading, setLoading] = useState(true)
  const [pipelines, setPipelines] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [pipeline, setPipeline] = useState(null)
  const [selectedStageId, setSelectedStageId] = useState(null)
  const [tab, setTab] = useState(0)
  const [audit, setAudit] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', moduleKey: 'crm', templateId: '' })
  const [busy, setBusy] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const selectedStage = useMemo(
    () => pipeline?.stages?.find(s => s.id === selectedStageId) || null,
    [pipeline, selectedStageId]
  )

  const ensurePlatformAuth = async () => {
    if (!getCrmPlatformToken()) {
      const legacy = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (legacy) await bridgeCrmPlatformWithLegacyToken(legacy)
    }
  }

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      await ensurePlatformAuth()
      const [list, tpls] = await Promise.all([fetchPipelines(), fetchPipelineTemplates()])
      setPipelines(Array.isArray(list) ? list : [])
      setTemplates(Array.isArray(tpls) ? tpls : [])
      if (!selectedId && list?.[0]?.id) setSelectedId(list[0].id)
    } catch (err) {
      toast.error(err.message || 'Failed to load pipelines from platform API')
    } finally {
      setLoading(false)
    }
  }, [selectedId])

  const loadDetail = useCallback(async id => {
    if (!id) return
    try {
      await ensurePlatformAuth()
      const detail = await fetchPipeline(id)
      setPipeline(detail)
      setSelectedStageId(detail?.stages?.[0]?.id || null)
      const logs = await fetchPipelineAudit(id).catch(() => [])
      setAudit(Array.isArray(logs) ? logs : [])
    } catch (err) {
      toast.error(err.message || 'Failed to load pipeline')
    }
  }, [])

  useEffect(() => {
    loadList()
  }, [])

  useEffect(() => {
    if (selectedId) loadDetail(selectedId)
  }, [selectedId, loadDetail])

  const refresh = async () => {
    await loadList()
    if (selectedId) await loadDetail(selectedId)
  }

  const onDragEnd = async event => {
    const { active, over } = event
    if (!over || active.id === over.id || !pipeline) return
    const oldIndex = pipeline.stages.findIndex(s => s.id === active.id)
    const newIndex = pipeline.stages.findIndex(s => s.id === over.id)
    const next = arrayMove(pipeline.stages, oldIndex, newIndex)
    setPipeline({ ...pipeline, stages: next })
    try {
      await reorderPipelineStages(
        pipeline.id,
        next.map(s => s.id)
      )
    } catch (err) {
      toast.error(err.message || 'Reorder failed')
      loadDetail(pipeline.id)
    }
  }

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      toast.error('Name is required')
      return
    }
    setBusy(true)
    try {
      await ensurePlatformAuth()
      let created
      if (createForm.templateId) {
        created = await applyPipelineTemplate({
          templateId: createForm.templateId,
          name: createForm.name,
        })
      } else {
        created = await createPipeline({
          name: createForm.name,
          moduleKey: createForm.moduleKey,
        })
      }
      toast.success('Pipeline created')
      setCreateOpen(false)
      setCreateForm({ name: '', moduleKey: 'crm', templateId: '' })
      setSelectedId(created.id)
      await loadList()
    } catch (err) {
      toast.error(err.message || 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  const saveMeta = async patch => {
    if (!pipeline) return
    try {
      const updated = await updatePipeline(pipeline.id, patch)
      setPipeline(updated)
      toast.success('Saved')
      loadList()
    } catch (err) {
      toast.error(err.message || 'Save failed')
    }
  }

  const saveStage = async patch => {
    if (!pipeline || !selectedStage) return
    try {
      await updatePipelineStage(pipeline.id, selectedStage.id, patch)
      await loadDetail(pipeline.id)
      toast.success('Stage updated')
    } catch (err) {
      toast.error(err.message || 'Stage update failed')
    }
  }

  const handlePublish = async () => {
    if (!pipeline) return
    setBusy(true)
    try {
      const email =
        typeof window !== 'undefined'
          ? localStorage.getItem('userEmail') || undefined
          : undefined
      const result = await publishPipeline(pipeline.id, { legacyCompanyEmail: email })
      toast.success(
        result?.legacySync?.ok
          ? `Published v${result.pipeline.publishedVersion} (synced to legacy)`
          : `Published v${result.pipeline.publishedVersion}`
      )
      await loadDetail(pipeline.id)
    } catch (err) {
      toast.error(err.message || 'Publish failed')
    } finally {
      setBusy(false)
    }
  }

  const handleExport = async () => {
    if (!pipeline) return
    try {
      const data = await exportPipeline(pipeline.id)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${pipeline.name.replace(/\s+/g, '-').toLowerCase()}-pipeline.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err.message || 'Export failed')
    }
  }

  const handleImportFile = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const created = await importPipeline({
        snapshot: json.snapshot || json,
        name: json.snapshot?.name || json.name,
      })
      toast.success('Pipeline imported')
      setSelectedId(created.id)
      await loadList()
    } catch (err) {
      toast.error(err.message || 'Import failed')
    } finally {
      e.target.value = ''
    }
  }

  if (loading && !pipeline) {
    return (
      <Box display='flex' justifyContent='center' p={6}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={3} flexWrap='wrap' gap={1}>
        <Box>
          <Typography variant='h4'>Pipeline Builder</Typography>
          <Typography color='text.secondary'>
            Configure stages, validations, permissions, and automations for any WOXOX module.
          </Typography>
        </Box>
        <Stack direction='row' spacing={1} flexWrap='wrap'>
          <Button variant='outlined' component='label'>
            Import
            <input hidden type='file' accept='application/json' onChange={handleImportFile} />
          </Button>
          <Button variant='outlined' onClick={() => setTemplateOpen(true)}>
            Templates
          </Button>
          <Button variant='contained' onClick={() => setCreateOpen(true)}>
            New Pipeline
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant='subtitle2' gutterBottom>
                Pipelines
              </Typography>
              <Stack spacing={1}>
                {pipelines.map(p => (
                  <Box
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      cursor: 'pointer',
                      bgcolor: selectedId === p.id ? 'action.selected' : 'transparent',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                      <Typography variant='body2' fontWeight={600}>
                        {p.name}
                      </Typography>
                      {p.isDefault && <Chip size='small' label='Default' />}
                    </Stack>
                    <Typography variant='caption' color='text.secondary'>
                      {p.moduleKey} · v{p.version}
                      {p.publishedVersion ? ` · pub ${p.publishedVersion}` : ''}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          {!pipeline ? (
            <Card>
              <CardContent>
                <Typography>Select or create a pipeline to begin.</Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Stack direction='row' justifyContent='space-between' gap={2} flexWrap='wrap'>
                    <Grid container spacing={2} sx={{ flex: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Pipeline Name'
                          defaultValue={pipeline.name}
                          key={`name-${pipeline.id}-${pipeline.version}`}
                          onBlur={e => {
                            if (e.target.value !== pipeline.name) saveMeta({ name: e.target.value })
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          select
                          fullWidth
                          label='Module'
                          value={pipeline.moduleKey || 'crm'}
                          onChange={e => saveMeta({ moduleKey: e.target.value })}
                        >
                          {MODULES.map(m => (
                            <MenuItem key={m.value} value={m.value}>
                              {m.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label='Color'
                          type='color'
                          value={pipeline.color || '#0288d1'}
                          onChange={e => saveMeta({ color: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Description'
                          multiline
                          minRows={2}
                          defaultValue={pipeline.description || ''}
                          key={`desc-${pipeline.id}-${pipeline.version}`}
                          onBlur={e => {
                            if (e.target.value !== (pipeline.description || '')) {
                              saveMeta({ description: e.target.value })
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    <Stack spacing={1} minWidth={160}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!pipeline.isDefault}
                            onChange={e => saveMeta({ isDefault: e.target.checked })}
                          />
                        }
                        label='Default'
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={pipeline.isActive !== false}
                            onChange={e => saveMeta({ isActive: e.target.checked })}
                          />
                        }
                        label='Active'
                      />
                      <Button variant='contained' disabled={busy} onClick={handlePublish}>
                        Publish
                      </Button>
                      <Button
                        variant='outlined'
                        onClick={async () => {
                          const cloned = await clonePipeline(pipeline.id, {
                            name: `${pipeline.name} (copy)`,
                          })
                          toast.success('Cloned')
                          setSelectedId(cloned.id)
                          refresh()
                        }}
                      >
                        Clone
                      </Button>
                      <Button variant='outlined' onClick={handleExport}>
                        Export
                      </Button>
                      <Button
                        variant='outlined'
                        onClick={async () => {
                          const name = window.prompt('Template name', `${pipeline.name} Template`)
                          if (!name) return
                          await savePipelineAsTemplate(pipeline.id, { name })
                          toast.success('Saved as template')
                          loadList()
                        }}
                      >
                        Save Template
                      </Button>
                      <Button
                        variant='outlined'
                        onClick={() =>
                          router.push(getLocalizedUrl(`/manager/workflow/${pipeline.legacyMongoId || pipeline.id}`, locale))
                        }
                      >
                        Open Board
                      </Button>
                      {!pipeline.isDefault && (
                        <Button
                          color='error'
                          variant='text'
                          onClick={async () => {
                            if (!window.confirm('Archive this pipeline?')) return
                            await deletePipeline(pipeline.id)
                            toast.success('Archived')
                            setSelectedId(null)
                            setPipeline(null)
                            refresh()
                          }}
                        >
                          Archive
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Stack direction='row' justifyContent='space-between' mb={1}>
                        <Typography variant='subtitle1'>Stages</Typography>
                        <Button
                          size='small'
                          onClick={async () => {
                            await addPipelineStage(pipeline.id, { name: 'New Stage' })
                            loadDetail(pipeline.id)
                          }}
                        >
                          Add
                        </Button>
                      </Stack>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext
                          items={(pipeline.stages || []).map(s => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {(pipeline.stages || []).map(stage => (
                            <SortableStage
                              key={stage.id}
                              stage={stage}
                              selected={stage.id === selectedStageId}
                              onSelect={setSelectedStageId}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      {!selectedStage ? (
                        <Typography color='text.secondary'>Select a stage to configure.</Typography>
                      ) : (
                        <>
                          <Stack direction='row' justifyContent='space-between' alignItems='center' mb={1}>
                            <Typography variant='h6'>{selectedStage.name}</Typography>
                            <Stack direction='row' spacing={1}>
                              <Tooltip title='Duplicate'>
                                <IconButton
                                  onClick={async () => {
                                    await duplicatePipelineStage(pipeline.id, selectedStage.id)
                                    loadDetail(pipeline.id)
                                  }}
                                >
                                  <i className='ri-file-copy-line' />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Delete'>
                                <IconButton
                                  color='error'
                                  onClick={async () => {
                                    if (!window.confirm('Delete stage?')) return
                                    await deletePipelineStage(pipeline.id, selectedStage.id)
                                    loadDetail(pipeline.id)
                                  }}
                                >
                                  <i className='ri-delete-bin-line' />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>

                          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant='scrollable'>
                            <Tab label='Basic' />
                            <Tab label='Business' />
                            <Tab label='Fields' />
                            <Tab label='Documents' />
                            <Tab label='Checklist' />
                            <Tab label='Permissions' />
                            <Tab label='Automations' />
                            <Tab label='Transitions' />
                            <Tab label='Audit' />
                          </Tabs>
                          <Divider />

                          <TabPanel value={tab} index={0}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label='Stage Name'
                                  defaultValue={selectedStage.name}
                                  key={`sn-${selectedStage.id}`}
                                  onBlur={e => saveStage({ name: e.target.value })}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  select
                                  fullWidth
                                  label='Stage Type'
                                  value={selectedStage.stageType || 'open'}
                                  onChange={e => saveStage({ stageType: e.target.value })}
                                >
                                  {['open', 'success', 'lost', 'closed', 'custom'].map(t => (
                                    <MenuItem key={t} value={t}>
                                      {t}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label='Description'
                                  multiline
                                  minRows={2}
                                  defaultValue={selectedStage.description || ''}
                                  key={`sd-${selectedStage.id}`}
                                  onBlur={e => saveStage({ description: e.target.value })}
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  fullWidth
                                  label='Color'
                                  type='color'
                                  value={selectedStage.color || '#90caf9'}
                                  onChange={e => saveStage({ color: e.target.value })}
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={!!(selectedStage.isWon || selectedStage.isSuccess)}
                                      onChange={e =>
                                        saveStage({ isWon: e.target.checked, isSuccess: e.target.checked })
                                      }
                                    />
                                  }
                                  label='Success / Won'
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={!!selectedStage.isLost}
                                      onChange={e => saveStage({ isLost: e.target.checked })}
                                    />
                                  }
                                  label='Lost'
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={!!selectedStage.requiresApproval}
                                      onChange={e => saveStage({ requiresApproval: e.target.checked })}
                                    />
                                  }
                                  label='Requires Approval'
                                />
                              </Grid>
                            </Grid>
                          </TabPanel>

                          <TabPanel value={tab} index={1}>
                            <Grid container spacing={2}>
                              <Grid item xs={6} sm={4}>
                                <TextField
                                  fullWidth
                                  type='number'
                                  label='Win Probability %'
                                  defaultValue={selectedStage.winProbability ?? selectedStage.probability ?? 0}
                                  key={`wp-${selectedStage.id}`}
                                  onBlur={e => {
                                    const n = Number(e.target.value) || 0
                                    saveStage({ probability: n, winProbability: n })
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <TextField
                                  fullWidth
                                  type='number'
                                  label='SLA (hours)'
                                  defaultValue={selectedStage.slaHours ?? ''}
                                  key={`sla-${selectedStage.id}`}
                                  onBlur={e => saveStage({ slaHours: Number(e.target.value) || null })}
                                />
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <TextField
                                  fullWidth
                                  type='number'
                                  label='Est. Duration (hours)'
                                  defaultValue={selectedStage.estimatedDuration ?? ''}
                                  key={`ed-${selectedStage.id}`}
                                  onBlur={e =>
                                    saveStage({ estimatedDuration: Number(e.target.value) || null })
                                  }
                                />
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <TextField
                                  fullWidth
                                  type='number'
                                  label='Revenue %'
                                  defaultValue={selectedStage.revenuePercent ?? ''}
                                  key={`rp-${selectedStage.id}`}
                                  onBlur={e =>
                                    saveStage({ revenuePercent: Number(e.target.value) || null })
                                  }
                                />
                              </Grid>
                            </Grid>
                          </TabPanel>

                          <TabPanel value={tab} index={2}>
                            <Stack spacing={1} mb={2}>
                              {(selectedStage.fields || []).map(f => (
                                <Stack key={f.id} direction='row' spacing={1} alignItems='center'>
                                  <Chip label={f.isRequired ? 'Required' : 'Optional'} size='small' />
                                  <Typography flex={1}>
                                    {f.label} <Typography component='span' color='text.secondary'>({f.fieldKey})</Typography>
                                  </Typography>
                                  <IconButton
                                    size='small'
                                    onClick={async () => {
                                      await deleteStageField(pipeline.id, selectedStage.id, f.id)
                                      loadDetail(pipeline.id)
                                    }}
                                  >
                                    <i className='ri-close-line' />
                                  </IconButton>
                                </Stack>
                              ))}
                            </Stack>
                            <Button
                              variant='outlined'
                              onClick={async () => {
                                const label = window.prompt('Field label')
                                if (!label) return
                                const fieldKey = label.toLowerCase().replace(/\s+/g, '_')
                                await upsertStageField(pipeline.id, selectedStage.id, {
                                  fieldKey,
                                  label,
                                  isRequired: true,
                                })
                                loadDetail(pipeline.id)
                              }}
                            >
                              Add Required Field
                            </Button>
                          </TabPanel>

                          <TabPanel value={tab} index={3}>
                            <Stack spacing={1} mb={2}>
                              {(selectedStage.documents || []).map(d => (
                                <Stack key={d.id} direction='row' spacing={1} alignItems='center'>
                                  <Chip label={d.isRequired ? 'Required' : 'Optional'} size='small' />
                                  <Typography flex={1}>{d.label}</Typography>
                                  <IconButton
                                    size='small'
                                    onClick={async () => {
                                      await deleteStageDocument(pipeline.id, selectedStage.id, d.id)
                                      loadDetail(pipeline.id)
                                    }}
                                  >
                                    <i className='ri-close-line' />
                                  </IconButton>
                                </Stack>
                              ))}
                            </Stack>
                            <Button
                              variant='outlined'
                              onClick={async () => {
                                const label = window.prompt('Document label')
                                if (!label) return
                                const docKey = label.toLowerCase().replace(/\s+/g, '_')
                                await upsertStageDocument(pipeline.id, selectedStage.id, {
                                  docKey,
                                  label,
                                  isRequired: true,
                                })
                                loadDetail(pipeline.id)
                              }}
                            >
                              Add Required Document
                            </Button>
                          </TabPanel>

                          <TabPanel value={tab} index={4}>
                            <Stack spacing={1} mb={2}>
                              {(selectedStage.checklist || []).map(c => (
                                <Stack key={c.id} direction='row' spacing={1} alignItems='center'>
                                  <Chip label={c.isRequired ? 'Required' : 'Optional'} size='small' />
                                  <Typography flex={1}>{c.label}</Typography>
                                  <IconButton
                                    size='small'
                                    onClick={async () => {
                                      await deleteStageChecklistItem(pipeline.id, selectedStage.id, c.id)
                                      loadDetail(pipeline.id)
                                    }}
                                  >
                                    <i className='ri-close-line' />
                                  </IconButton>
                                </Stack>
                              ))}
                            </Stack>
                            <Button
                              variant='outlined'
                              onClick={async () => {
                                const label = window.prompt('Checklist item')
                                if (!label) return
                                await addStageChecklistItem(pipeline.id, selectedStage.id, {
                                  label,
                                  isRequired: true,
                                })
                                loadDetail(pipeline.id)
                              }}
                            >
                              Add Checklist Item
                            </Button>
                          </TabPanel>

                          <TabPanel value={tab} index={5}>
                            <Stack spacing={1} mb={2}>
                              {(selectedStage.permissions || []).map(p => (
                                <Stack key={p.id} direction='row' spacing={1} alignItems='center'>
                                  <Typography flex={1}>
                                    Role: {p.role || 'ANY'} · Fwd:{String(p.canMoveFwd)} · Back:
                                    {String(p.canMoveBack)} · Approve:{String(p.canApprove)}
                                  </Typography>
                                  <IconButton
                                    size='small'
                                    onClick={async () => {
                                      await deleteStagePermission(pipeline.id, selectedStage.id, p.id)
                                      loadDetail(pipeline.id)
                                    }}
                                  >
                                    <i className='ri-close-line' />
                                  </IconButton>
                                </Stack>
                              ))}
                            </Stack>
                            <Button
                              variant='outlined'
                              onClick={async () => {
                                const role = window.prompt('Role (ADMIN, USER, ...)', 'USER')
                                if (!role) return
                                await addStagePermission(pipeline.id, selectedStage.id, {
                                  role,
                                  canView: true,
                                  canMoveFwd: true,
                                  canMoveBack: true,
                                  canApprove: role === 'ADMIN',
                                })
                                loadDetail(pipeline.id)
                              }}
                            >
                              Add Permission
                            </Button>
                          </TabPanel>

                          <TabPanel value={tab} index={6}>
                            <Typography variant='body2' color='text.secondary' mb={2}>
                              Automations are stored in Phase 1. Execution ships in Phase 4.
                            </Typography>
                            <Stack spacing={1} mb={2}>
                              {(selectedStage.automations || []).map(a => (
                                <Stack key={a.id} direction='row' spacing={1} alignItems='center'>
                                  <Typography flex={1}>
                                    {a.name} · trigger: {a.trigger} · {a.isEnabled ? 'on' : 'off'}
                                  </Typography>
                                  <IconButton
                                    size='small'
                                    onClick={async () => {
                                      await deleteStageAutomation(pipeline.id, selectedStage.id, a.id)
                                      loadDetail(pipeline.id)
                                    }}
                                  >
                                    <i className='ri-close-line' />
                                  </IconButton>
                                </Stack>
                              ))}
                            </Stack>
                            <Button
                              variant='outlined'
                              onClick={async () => {
                                const name = window.prompt('Automation name', 'Send reminder on enter')
                                if (!name) return
                                await addStageAutomation(pipeline.id, selectedStage.id, {
                                  name,
                                  trigger: 'enter',
                                  action: { type: 'notification', payload: { message: name } },
                                  isEnabled: true,
                                })
                                loadDetail(pipeline.id)
                              }}
                            >
                              Add Automation Definition
                            </Button>
                          </TabPanel>

                          <TabPanel value={tab} index={7}>
                            <Typography variant='body2' color='text.secondary' mb={2}>
                              Optional explicit edges. If none exist, any stage-to-stage move is allowed
                              (subject to validation).
                            </Typography>
                            <Stack spacing={1} mb={2}>
                              {(selectedStage.transitionsFrom || []).map(r => {
                                const to = pipeline.stages.find(s => s.id === r.toStageId)
                                return (
                                  <Typography key={r.id}>
                                    → {to?.name || r.toStageId} {r.isActive ? '' : '(inactive)'}
                                  </Typography>
                                )
                              })}
                            </Stack>
                            <Button
                              variant='outlined'
                              onClick={async () => {
                                const names = pipeline.stages
                                  .filter(s => s.id !== selectedStage.id)
                                  .map(s => s.name)
                                  .join(', ')
                                const toName = window.prompt(`Allow transition to which stage?\n${names}`)
                                const to = pipeline.stages.find(
                                  s => s.name.toLowerCase() === String(toName || '').toLowerCase()
                                )
                                if (!to) return toast.error('Stage not found')
                                await upsertTransitionRule(pipeline.id, {
                                  fromStageId: selectedStage.id,
                                  toStageId: to.id,
                                  blockUnlessValid: true,
                                })
                                loadDetail(pipeline.id)
                              }}
                            >
                              Allow Transition To…
                            </Button>
                          </TabPanel>

                          <TabPanel value={tab} index={8}>
                            <Stack spacing={1} maxHeight={320} overflow='auto'>
                              {audit.map(a => (
                                <Box key={a.id} sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
                                  <Typography variant='body2'>
                                    {a.action} · {a.entity}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {new Date(a.createdAt).toLocaleString()}
                                  </Typography>
                                </Box>
                              ))}
                              {!audit.length && (
                                <Typography color='text.secondary'>No audit entries yet.</Typography>
                              )}
                            </Stack>
                          </TabPanel>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Grid>
      </Grid>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Create Pipeline</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label='Name'
              fullWidth
              value={createForm.name}
              onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
            />
            <TextField
              select
              label='Module'
              fullWidth
              value={createForm.moduleKey}
              onChange={e => setCreateForm({ ...createForm, moduleKey: e.target.value })}
            >
              {MODULES.map(m => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label='Start from template (optional)'
              fullWidth
              value={createForm.templateId}
              onChange={e => setCreateForm({ ...createForm, templateId: e.target.value })}
            >
              <MenuItem value=''>Blank (New / In Progress / Won / Lost)</MenuItem>
              {templates.map(t => (
                <MenuItem key={t.id} value={t.id}>
                  {t.isSystem ? 'System · ' : ''}
                  {t.name} ({t.moduleKey})
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant='contained' disabled={busy} onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={templateOpen} onClose={() => setTemplateOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Pipeline Templates</DialogTitle>
        <DialogContent>
          <Stack spacing={1} mt={1}>
            {templates.map(t => (
              <Box
                key={t.id}
                sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Box>
                    <Typography fontWeight={600}>
                      {t.name}{' '}
                      <Chip size='small' label={t.moduleKey} sx={{ ml: 1 }} />
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {t.description}
                    </Typography>
                  </Box>
                  <Button
                    size='small'
                    variant='contained'
                    onClick={async () => {
                      const name = window.prompt('Pipeline name', t.name)
                      if (!name) return
                      const created = await applyPipelineTemplate({ templateId: t.id, name })
                      toast.success('Created from template')
                      setTemplateOpen(false)
                      setSelectedId(created.id)
                      refresh()
                    }}
                  >
                    Use
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PipelineBuilder
