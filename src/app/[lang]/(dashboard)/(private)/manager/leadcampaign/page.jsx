'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Box,
  CardHeader,
  Typography,
  Drawer,
  Paper,
  Avatar,
  List,
  ListItem,
  Chip,
  ListItemText,
  Switch,
  MenuItem
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import Leads from '../addleads/page';
import { getLocalizedUrl } from '@/utils/i18n'
import { useRouter } from 'next/navigation'
import { RiSettings3Line, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'; // Import Remix icons


const Campaign = () => {
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const [archivedIds, setArchivedIds] = useState(new Set());

  const [draw, setDraw] = useState(false);
  const [campaign, setCampaign] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [Pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open2, setOpen2] = useState(false);


  const dropdownRef = useRef(null);

  const [openSettings, setOpenSettings] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleOpenSettings = (item) => {
    if (selectedItem === item) {
      // Close settings if clicked on the same item
      setOpenSettings(false);
      setSelectedItem(null);
    } else {
      // Open settings for the clicked item
      setSelectedItem(item);
      setOpenSettings(true);
    }
  };

  const handleCloseSettings = () => {
    setOpenSettings(false); // Close settings dropdown
  };

  const handleEdit = (item) => {
    handleClickOpenEdit(item);
    handleCloseSettings(); // Close settings dropdown after edit
  };

  const handleDelete = (item) => {
    // Add your delete logic here
    handleCloseSettings();
  };

  useEffect(() => {
    // Close the settings when clicking outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenSettings(false);
        setSelectedItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const [invoices, setInvoices] = useState([]);

  // Open/Close Handlers
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [pass, setPass] = useState(true);
  const handleClickOpen2 = (item) => {
    setOpen2(true)
    setPass(item)
  }
  const handleClose2 = () => setOpen2(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    Pipeline: '',
  });


  const [editCampaign, setEditCampaign] = useState(null)

  const handleClickOpenEdit = (item) => {
    setOpenEdit(true);
    setEditCampaign(item._id);
    setFormData({
      name: item.name,
      description: item.description,
      Pipeline: item.Pipeline, // Ensure this matches the correct property name from your data.
    });
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setEditCampaign(null);
    setFormData({ name: '', description: '', Pipeline: '' }); // Reset form data
  };

  const handleSubmit = async () => {
    console.log('Form Data:', formData); // Replace with your API call or other logic

    try {
      const token = localStorage.getItem('token')
      // Example API call to submit the form
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaign/createcampaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Lead submitted successfully!')
        fetchCampaign()
      } else {
        toast.error(data.message || 'An error occurred. Please try again.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    }
    handleClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitEdit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!formData.name || !formData.description || !formData.Pipeline) {
        toast.error("Please fill out all fields!");
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campaign/updatecampaign/${editCampaign}`,
        {
          name: formData.name,
          description: formData.description,
          Pipeline: formData.Pipeline, // Ensure the correct value is sent
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success("Campaign updated successfully!");
        handleCloseEdit();

        // Update the specific campaign in the state
        setCampaign((prevCampaigns) =>
          prevCampaigns.map((campaign) =>
            campaign._id === editCampaign
              ? { ...campaign, ...formData }
              : campaign
          )
        );
      } else {
        toast.error(response.data.message || "An unknown error occurred.");
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setDraw(open);
  };

  const fetchInvoice = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token is missing');
      setLoading(false);
      return;
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      toast.error('API URL is not configured.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/count-by-campaign`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setInvoices(response.data.data);
        console.log('Invoice data:', response.data);
      } else {
        toast.error("No data fetched from API.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Error Response:", error.response.data);
        console.error("Error Status:", error.response.status);
        console.error("Error Headers:", error.response.headers);
        toast.error("An error occurred while fetching data.");
      } else {
        console.error("Error Message:", error.message);
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Fetch Campaign Data
  const fetchCampaign = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Authorization token is missing.');
      setLoading(false);
      return;
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      toast.error('API URL is not configured.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campaign/getcampaign`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {

        setCampaign(response.data);
        console.log(response.data);
      } else {
        toast.error('Unexpected response from the server.');
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        toast.error(`Error ${status}: ${data?.message || 'Failed to fetch campaign.'}`);
      } else if (error.request) {
        toast.error('No response received from the server.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setCampaign(data);
      setLoading(false);
    }
  };

  const fetchPipeline = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Authorization token is missing.');
      setLoading(false);
      return;
    }

    if (!process.env.NEXT_PUBLIC_API_URL) {
      toast.error('API URL is not configured.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/getpipeline`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const list = Array.isArray(response.data) ? response.data : [];
        setPipeline(list);
        // If still empty (e.g. company not resolved yet), create a default once.
        if (!list.length) {
          await createDefaultPipeline(true);
        }
      } else {
        toast.error('Unexpected response from the server.');
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        toast.error(`Error ${status}: ${data?.message || data?.error || 'Failed to fetch Pipeline.'}`);
      } else if (error.request) {
        toast.error('No response received from the server.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPipeline = async (silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (!silent) toast.error('Authorization token is missing.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/createpipeline`,
        {
          name: 'Sales Pipeline',
          description: 'Auto-created for lead campaigns',
          stages: [
            { name: 'New', property: 'Pending', order: 0 },
            { name: 'Contacted', property: 'Processing', order: 1 },
            { name: 'Qualified', property: 'Processing', order: 2 },
            { name: 'Won', property: 'Won', order: 3 },
            { name: 'Lost', property: 'Lost', order: 4 },
          ],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 || response.status === 200) {
        if (!silent) toast.success('Default pipeline created.');
        const refetch = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/getpipeline`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const list = Array.isArray(refetch.data) ? refetch.data : [];
        setPipeline(list);
        const createdId = response.data?._id || list[0]?._id;
        if (createdId) {
          setFormData((prev) => ({ ...prev, Pipeline: prev.Pipeline || createdId }));
        }
      }
    } catch (error) {
      if (!silent) {
        toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to create pipeline.');
      }
    }
  };

  useEffect(() => {
    fetchCampaign();
    fetchPipeline();
    fetchInvoice();
  }, []);
  // Toggle archive state
  const handleToggleArchive = (id) => {
    setArchivedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle isActive via API & update state
  const toggleStatus = async (campaign) => {
    const newStatus = !campaign.isActive;
    const token = localStorage.getItem('token');

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/campaign/updatecampaign/${campaign._id}`,
        { isActive: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        // Patch local state
        setCampaign(curr =>
          curr.map(c =>
            c._id === campaign._id ? { ...c, isActive: newStatus } : c
          )
        );
        toast.success(`Campaign ${newStatus ? 'activated' : 'archived'}`);
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };


  // Derived lists
  const activeCampaigns = campaign.filter(c => c.isActive);
  const archivedCampaigns = campaign.filter(c => !c.isActive);

  // Drawer details
  // const CampaignDetails = ({ campaign }) => (
  //   <Box sx={{ p: 4, maxWidth: 900, m: 'auto' }}>
  //     <Card sx={{ mb: 4 }}>
  //       <CardHeader
  //         title={campaign.name}
  //         subheader={campaign.description}
  //         titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
  //       />
  //       <CardContent>
  //         <Typography variant="h6">Insights</Typography>
  //         {/* Custom insights here */}
  //       </CardContent>
  //     </Card>
  //   </Box>
  // );

  // const toggleDrawer = (open) => () => setDraw(open);

  // Handlers for dialogs omitted for brevity (reuse your existing create/edit functions)

  const CampaignDetails = ({ campaign }) => {
    const {
      name,
      description,
      insights,
      PipelineInfo,
      PipelineStages,
    } = campaign;

    return (
      <Box sx={{ padding: 4, maxWidth: 900, margin: "auto" }}>
        {/* Campaign Card */}
        <Card sx={{ mb: 4 }}>
          <CardHeader
            title={name}
            titleTypographyProps={{ variant: "h5", fontWeight: "bold" }}
            subheader={description}
            subheaderTypographyProps={{ variant: "body1", color: "text.secondary" }}
          />
          <CardContent>
            {/* Insights */}
            <Typography variant="h6" gutterBottom>
              Insights
            </Typography>
            {/* <Grid container spacing={2}>
                            {[
                                { label: "Total Leads", value: insights.totalLeads, icon: <p>icon</p> },
                                { label: "Pending", value: insights.pending, icon: <p>icon</p> },
                                { label: "In Progress", value: insights.inProgress, icon: <p>icon</p> },
                                { label: "Lost", value: insights.lost, icon: <p>icon</p> },
                                { label: "Won", value: insights.won, icon: <p>icon</p> },
                            ].map((item, idx) => (
                                <Grid item xs={6} sm={4} md={2.4} key={idx}>
                                    <Paper
                                        elevation={3}
                                        sx={{
                                            padding: 2,
                                            textAlign: "center",
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Avatar sx={{ bgcolor: "primary.main", margin: "auto", mb: 1 }}>
                                            {item.icon}
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold">
                                            {item.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.label}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid> */}
          </CardContent>
        </Card>

        {/* Pipeline Information */}
        <Card>
          <CardHeader
            title="Pipeline Information"
            titleTypographyProps={{ variant: "h6", fontWeight: "bold" }}
            subheader={PipelineInfo}
            subheaderTypographyProps={{ variant: "body1", color: "text.secondary" }}
          />
          <CardContent>
            {/* Pipeline Stages */}
            <Typography variant="h6" gutterBottom>
              Pipeline Stages
            </Typography>
            <List>
              {PipelineStages.map((stage, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText
                      primary={stage.name}
                      primaryTypographyProps={{ variant: "subtitle1", fontWeight: "bold" }}
                      secondary={`Leads: ${stage.count}`}
                    />
                    <Chip
                      label={`${stage.count} Leads`}
                      color="primary"
                      size="small"
                    />
                  </ListItem>
                  {idx < PipelineStages.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const campaignData = {
    name: "Summer Campaign 2024",
    description: "Promoting summer courses for international students.",
    insights: {
      totalLeads: 150,
      pending: 40,
      inProgress: 50,
      lost: 30,
      won: 30,
    },
    PipelineInfo: "Pipeline for tracking campaign progress.",
    PipelineStages: [
      { name: "Initial Contact", count: 40 },
      { name: "Follow-Up", count: 30 },
      { name: "Negotiation", count: 20 },
      { name: "Closure", count: 10 },
      { name: "Onboarding", count: 50 },
    ],
  };
  // Drawer Content
  const DrawerList = (
    <Box sx={{ width: 700 }} role="presentation" onClick={toggleDrawer(false)}>
      <CampaignDetails campaign={campaignData} />
    </Box>
  );

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} display="flex" justifyContent="space-between">
          <h1>Campaign</h1>
          <Button variant="outlined" onClick={handleClickOpen}>
            Create Campaign
          </Button>
        </Grid>
        <Grid item xs={12} md={12} mt={4}>
          {loading ? (
            <p>Loading campaigns...</p>
          ) : activeCampaigns.length ? (
            activeCampaigns.map((item, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  boxShadow: 'none',
                  border: '1px solid #e3e1e1',
                  borderRadius: '20px'
                }}
              >
                {/* <CardHeader
                  title={item.name}
                  subheader={item.description}
                  action={<Switch
                    checked={!archivedIds.has(item._id)}
                    onChange={() => handleToggleArchive(item._id)}
                  />}
                /> */}
                <CardContent sx={{
                  boxShadow: 'none',
                  // border: '1px #6b7280'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><h3 className='text-xl font-semibold '>{item.name || `Campaign ${index + 1}`}</h3>
                      <p className='py-2 text-md font-medium'> <small>{item.description} </small></p>

                    </div>
                    {/* Toggle goes here */}
                    <Switch
                      checked={item.isActive}
                      onChange={() => toggleStatus(item)}
                    />
                  </div>
                  {/* <Divider /> */}
                  {/* <Grid container spacing={1} mt={2} mb={2}>
                                        <Grid item xs={2}>Total Leads: <b>{ite*9856+m.activeCount || 'N/A'}</b></Grid>
                                        <Grid item xs={2}>Converted: <b>{item.stageCount || 'N/A'}</b></Grid>
                                        <Grid item xs={2}>Pending : {item.insights || 'N/A'}</Grid>
                                        <Grid item xs={2}>In Progress : "{item.insights || 'N/A'}</Grid>
                                        <Grid item xs={2}>Lost : {item.insights || 'N/A'}</Grid>
                                        <Grid item xs={2}> UnAssigned : "{item.insights || 'N/A'}</Grid>
                                    </Grid> */}

                  <Divider />

                  <Grid container spacing={1} mt={2} justifyContent={'flex-end'}>
                    <Button onClick={() => { handleClickOpen2(item) }}>Add Leads</Button>
                    <Button onClick={() => router.push(getLocalizedUrl(`/manager/leads/${item._id}`, 'en'))}>View</Button>
                    {item.Pipeline && (
                      <Button
                        onClick={() =>
                          router.push(
                            getLocalizedUrl(
                              `/manager/workflow/${item.Pipeline?._id || item.Pipeline}`,
                              'en'
                            )
                          )
                        }
                      >
                        Pipeline
                      </Button>
                    )}
                    <Button
                      onClick={() => handleEdit(item)}
                      style={{
                        padding: 0,
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <RiEditLine color="green" size={20} />
                    </Button>
                    {/* <div style={{ display: 'flex', alignItems: 'center' }}>
                      <RiSettings3Line
                        size={24}
                        onClick={() => handleOpenSettings(item)} // Show settings dropdown
                        style={{ cursor: 'pointer' }}
                      />
                      {openSettings && selectedItem === item && (
                        <div
                          ref={dropdownRef}
                          initial={{ opacity: 0, y: 20 }} // Starting state (hidden)
                          animate={{ opacity: 1, y: 0 }} // Animate to visible
                          exit={{ opacity: 0, y: 20 }} // Exit animation
                          transition={{ duration: 0.3, ease: 'easeInOut' }} // Animation duration and easing
                          style={{
                            position: 'absolute',
                            padding: '16px',
                            borderRadius: '12px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            marginTop: '-102px',
                            marginLeft: '-50px',
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: '#e0f7fa',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              transition: 'background-color 0.3s', // Smooth hover effect
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b2ebf2')} // Lighter hover color
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e0f7fa')} // Reset hover color
                          >
                            <Button
                              onClick={() => handleEdit(item)}
                              style={{
                                padding: 0,
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <RiEditLine color="green" size={20} />
                            </Button>
                          </div>
                          <div
                            style={{
                              backgroundColor: '#ffcdd2',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              transition: 'background-color 0.3s', // Smooth hover effect
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ef9a9a')} // Lighter hover color
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffcdd2')} // Reset hover color
                          >
                            <Button
                              onClick={() => handleDelete(item)}
                              style={{
                                padding: 0,
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <RiDeleteBinLine color="red" size={20} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div> */}
                  </Grid>

                  <div className="mt-10 flex gap-4">
                    {loading ? (
                      <p>Loading...</p> // Show loading state
                    ) : (
                      invoices.length > 0 ? (
                        invoices.map((invoice, index) => (
                          invoice.campaignid === item._id ? (
                            <div key={index} className="flex gap-3">
                              {/* Total Leads */}
                              <div className="flex flex-col items-center w-20 h-20 border border-gray-800 rounded-lg justify-center">
                                <p className="text-xl font-bold mb-2">{invoice.totalLeads}</p>
                                <p className="text-xs text-gray-600">Total Leads</p>
                              </div>

                              {/* Unassigned */}
                              <div className="flex flex-col items-center w-20 h-20 border border-cyan-500 rounded-lg justify-center">
                                <p className="text-xl font-bold mb-2">{invoice.unassigned}</p>
                                <p className="text-xs text-gray-600">Unassigned</p>
                              </div>

                              {/* New */}
                              <div className="flex flex-col items-center w-20 h-20 border border-green-500 p-4 rounded-lg justify-center">
                                <p className="text-xl font-bold mb-2">{invoice.new}</p>
                                <p className="text-xs text-gray-600">New</p>
                              </div>

                              {/* Contacted */}
                              <div className="flex flex-col items-center w-20 h-20 border border-blue-500 p-4  rounded-lg justify-center">
                                <p className="text-xl font-bold mb-2">{invoice.contacted}</p>
                                <p className="text-xs text-gray-600">Contacted</p>
                              </div>

                              {/* In Progress */}
                              <div className="flex flex-col items-center w-20 h-20 border border-yellow-500 rounded-lg justify-center">
                                <p className="text-xl font-bold mb-2">{invoice.Interested}</p>
                                <p className="text-xs text-gray-600">In Progress</p>
                              </div>
                              <div className="flex flex-col items-center w-20 h-20 border border-green-500 rounded-lg justify-center">
                                <p className="text-xl font-bold mb-2">{invoice.Converted}</p>
                                <p className="text-xs text-gray-600">Converted</p>
                              </div>

                              {/* Won */}
                              <div className="flex flex-col items-center w-20 h-20 border border-purple-500 p-4 bg-gray-50 rounded-lg justify-center">
                                <p className="text-xl font-bold mb-2">{invoice.won}</p>
                                <p className="text-xs text-gray-600">Won</p>
                              </div>

                              {/* Lost */}
                              <div className="flex flex-col items-center w-20 h-20 border border-red-500 p-4 rounded-lg justify-center">
                                <p className="text-xl font-bold mb-2">{invoice.lost}</p>
                                <p className="text-xs text-gray-600">Lost</p>
                              </div>
                            </div>
                          ) : null
                        ))
                      ) : (
                        <p>No data available</p>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No active campaigns.</p>
          )}
        </Grid>
      </Grid>
      {/* Active Campaigns */}
      {/* <h2 className="text-2xl font-bold mb-4">Active Campaigns</h2>
      <div className="grid gap-4">
        {campaign.map((item, index) => (
          <div key={item._id} className="border p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{item.name || `Campaign ${index + 1}`}</h3>
                <p className="py-2 text-md font-medium">
                  <small>{item.description}</small>
                </p>
              </div>
              <Switch
                checked={item.isActive}
                onCheckedChange={() => toggleCampaignStatus(item)}
              />
            </div>
          </div>
        ))}
      </div> */}
      {/* Archive */}
      {archivedCampaigns.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Archive</Typography>
          {archivedCampaigns.map(item => (
            <Card key={item._id} sx={{ mb: 1, borderRadius: 2, opacity: 0.7 }}>
              <CardHeader
                title={item.name}
                subheader={item.description}
                action={<Switch
                  checked={item.isActive}
                  onChange={() => toggleStatus(item)}
                />}
              />
            </Card>
          ))}
        </Grid>
      )}


      {/* Drawer */}
      <Drawer anchor="right" open={draw} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>

      {/* Create Campaign Dialog */}
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create Campaign</DialogTitle>
        <DialogContent>
          <TextField
            className="p-2"
            id="name"
            name="name"
            autoFocus
            fullWidth
            label="Campaign Name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            className="p-2"
            id="outlined-multiline-static"
            label="Description"
            multiline
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            className="p-2"
            fullWidth
            select
            label="Choose Pipeline"
            name="Pipeline"
            value={formData.Pipeline}
            onChange={handleChange}
            disabled={!Pipeline.length}
            helperText={
              !Pipeline.length
                ? 'No pipelines yet — create one below or open Pipelines from the sidebar.'
                : ' '
            }
          >
            {Pipeline.map((item) => (
              <MenuItem key={item._id} value={item._id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
          {!Pipeline.length && (
            <Box className="p-2" display="flex" gap={1} flexWrap="wrap">
              <Button variant="contained" color="primary" onClick={createDefaultPipeline}>
                Create Default Pipeline
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push(getLocalizedUrl('/manager/pipeline', 'en'))}
              >
                Open Pipelines
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!Pipeline.length}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Edit Campaign</DialogTitle>
        <DialogContent>
          <TextField
            className="p-2"
            id="name"
            name="name"
            autoFocus
            fullWidth
            label="Campaign Name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            className="p-2"
            id="outlined-multiline-static"
            label="Description"
            multiline
            rows={4}
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            className="p-2"
            fullWidth
            select
            label="Choose Pipeline"
            name="Pipeline"
            value={formData.Pipeline}
            onChange={handleChange}
          >
            {Pipeline.map((item) => (
              <MenuItem key={item._id} value={item._id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog maxWidth open={open2} onClose={handleClose2} aria-labelledby="form-dialog-title">
        <DialogContent>
          <DialogContentText>
            <Leads campid={pass} onClose={handleClose2} />
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Campaign;
