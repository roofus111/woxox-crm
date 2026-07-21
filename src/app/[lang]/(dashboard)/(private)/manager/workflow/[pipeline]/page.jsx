"use client"

import axios from 'axios';
import { offset } from '@floating-ui/react';
import React, { useEffect, useState } from 'react';
import { Menu, MenuItem } from "@mui/material";
import { useParams } from 'next/navigation'
import PremiumWrapper from '../../leads/components/PremiumWrapper';

import { Drawer } from "@mui/material";
import { Typography } from "@mui/material";
import { IconButton, Tab, Tabs, Box, Avatar, CardContent, Chip, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material"
import { toast } from 'react-toastify';
import DocumentSection from './DocumentSection';
import { data } from 'autoprefixer';
import { useSession } from 'next-auth/react';

function App() {

    const params = useParams();
    const pipelineId = params?.pipeline;
    console.log("Pipeline ID from URL:", pipelineId);    
    const [pipelineData, setPipelineData] = useState(null);
    const [pipelineLeadData, setPipelineLeadData] = useState(null);
    const [isPremium, setIsPremium] = useState(false);

    const fetchPipelineData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Authorization token is missing.");
            return;
        }
      
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/getpipeline/${pipelineId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
      
            if (response.status === 200) {
                setPipelineData(response.data);
            } else {
                toast.error("Failed to fetch pipeline data.");
            }
        } catch (error) {
            console.error("Error fetching pipelines:", error);
            toast.error("No campaign found for the given Pipeline ID.");
        }
      };
      


      const fetchPipelineLeadData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Authorization token is missing.");
          return;
        }
      
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/leads/getworkflowLeads/${pipelineId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.status === 200) {
            setPipelineLeadData(response.data);
          } else {
            toast.error("Failed to fetch pipeline leads.");
          }
        } catch (error) {
          console.error("Error fetching pipeline leads:", error);
          // Set empty data and inform the user
          setPipelineLeadData([]);
          toast.error("No campaign linked for the given Pipeline ID.");
        }
      };
      
    useEffect(() => {
        fetchPipelineData();
        fetchPipelineLeadData();
    }, [pipelineId]);

    if (!pipelineId || !pipelineData) {
        return <div>Loading....</div>
    }

    const { stages } = pipelineData || {};  // Destructure stages from pipelineData
    const safeStages = Array.isArray(stages) ? stages : [];

    return (
        <PremiumWrapper
        isPremium={false}
        onUpgrade={() => {
            console.log("Upgrade to premium clicked");
            toast.info("Upgrade to premium feature is not implemented yet."); 
        }}
        >
        <div className='h-screen w-full bg-#F7F7F9
        text-neutral-50'>
            <h1 className='text-black'>{pipelineData?.name || "Not Found"}</h1>
            <p className='text-black'>{pipelineData?.description || "Not Found"}</p>
            <Board stages={safeStages} pipelineLeadData={pipelineLeadData} />
        </div>         
        </PremiumWrapper>
    );
};

const getRandomColor = (seed) => {
    const colors = [
        "#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3", "#33F3FF",
        "#FFA500", "#800080", "#008080", "#DC143C", "#20B2AA", "#FFD700"
    ];
    const hash = Array.from(seed || "").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}; 

const Board = ({ stages, pipelineLeadData }) => {
    const [cards, setCards] = useState([]);
    const [dataCards, setDataCards] = useState([]);

    console.log("stages:", stages);
    console.log("pipelineLeadData:", pipelineLeadData);

    useEffect(() => {
        if (!pipelineLeadData || !Array.isArray(pipelineLeadData)) return; // Prevent errors if pipelineLeadData is undefined or not an array

        const updatedCards = stages.map((stage) => {
            // Group leads by stage.order
            const filteredLeads = pipelineLeadData.filter((lead) => lead.stages === stage.order);
            return {
              stageId: stage.order,
              stageName: stage.name,
              stageProperty: stage.property, // Pass the property field here (e.g., "Won", "Lost", etc.)
              leads: filteredLeads,
            };
          });
          
        console.log("updated Cards", updatedCards);
        setCards(updatedCards);
        setDataCards(updatedCards);
    }, [stages, pipelineLeadData]); // Re-run when stages or pipelineLeadData change      

    useEffect(() => {
        if (!dataCards || !dataCards.length) return;

        // Perform additional UI-related logic here
        console.log("UI updated with new dataCards:", dataCards);

        // Example: Scroll to a specific column when dataCards change
        document.getElementById(`column-${dataCards[0]?.stageId}`)?.scrollIntoView({ behavior: "smooth" });
    }, [dataCards]);
    return (
        <div className="flex w-full gap-3 overflow-x-auto p-12">
            {dataCards.map((columnData) => (
            <Column
                key={columnData.stageId}
                title={columnData.stageName}
                stageProperty={columnData.stageProperty}  // Pass the stage property
                cards={columnData.leads}
                setCards={setCards}
                column={columnData.stageId}
                alldata={dataCards}
                setDataCards={setDataCards}
            />
            ))}
        </div>
    );
};

const Column = ({ title, headingColor, column, cards, setCards, alldata, setDataCards, stageProperty }) => {
    const [active, setActive] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [color, setColor] = useState('black');
    const [newNote, setNewNote] = useState(" ");
    const [openNoteDialog, setOpenNoteDialog] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [selectedRequestedDocument, setSelectedRequestedDocument] = useState(null);
    const [openDocDialog, setOpenDocDialog] = useState(false);
    const [requestedDocument, setRequestedDocument] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const { data: session, status } = useSession();  // Fetch session data - Important: moved up

    const handleCardClick = (card, color) => {
        setSelectedCard(card);
        setColor(color);
        setOpenDrawer(true);
    };

    const handleDrawerClose = () => {
        setOpenDrawer(false);
        setSelectedCard(null);
    }

    const handleDownloadInvoice = () => {
        console.log("Downloading invoice...");
    };

    const handleViewInvoice = () => {
        console.log("Viewing invoice...");
    };

    const handleDragStart = (e, id) => {
        e.dataTransfer.setData("cardId", id);  // Store the card ID when dragging
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        highlightIndicator(e);
        setActive(true);
    };

    const handleDragLeave = () => {
        setActive(false);
        clearHighlights();
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleAction = (action) => {
        console.log(action); // Replace with your action logic
        handleClose();
    };

    const userAvatarColor = getRandomColor(selectedCard?.name);

    function updateLeadStageOrder(stages, leadId, newStageOrder) {
        for (const stage of stages) {
            for (const lead of stage.leads) {
                if (lead.id === leadId) {
                    lead.stageOrder = newStageOrder;
                    return;
                }
            }
        }
    }
    
    function moveLead(leadId, targetStageId) {
        let updatedData = [...alldata]; // Create a shallow copy of alldata

        // Find and remove the lead from its current stage
        let leadToMove = null;
        updatedData = updatedData.map(stage => {
            const leadIndex = stage.leads.findIndex(lead => lead._id === leadId);
            if (leadIndex !== -1) {
                leadToMove = stage.leads[leadIndex];
                return {
                    ...stage,
                    leads: stage.leads.filter((_, index) => index !== leadIndex),
                };
            }
            return stage;
        });

        // Add the lead to the target stage
        if (leadToMove) {
            updatedData = updatedData.map(stage => {
                if (stage.stageId === targetStageId) {
                    return {
                        ...stage,
                        leads: [...stage.leads, leadToMove],
                    };
                }
                return stage;
            });
        }

        // Update state with the new data
        setDataCards(updatedData);
    }


    const handleDragEnd = async (e) => {
        setActive(false);
        clearHighlights();

        const cardId = e.dataTransfer.getData("cardId");
        const indicators = getindicators();
        const nearestIndicator = getNearesIndicator(e, indicators);

        const before = nearestIndicator ? nearestIndicator.dataset.before : "-1";

        if (before !== cardId) {
            let copy = [...alldata];
            let copydata = [];
            copy.map((item) => {
                copydata.push(...item.leads);
            })

            let cardToTransfer = copydata.find((c) => c._id === cardId);

            if (!cardToTransfer) return;

            // Update the card's stage (stageOrder) when dropped into another column
            cardToTransfer.stageOrder = column

            updateLeadStageOrder(alldata, cardToTransfer._id, cardToTransfer.stageOrder);
            moveLead(cardToTransfer._id, column, alldata);

            // After updating the card's stage in the frontend, update the backend
            try {
                const token = localStorage.getItem("token");
                const response = await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${cardId}/stages`,
                    { stages: column }, // Send the updated stage
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (response.status === 200) {
                    setCards(copy);
                } else {
                    toast.error("Failed to update lead stage on the server.");
                }
            } catch (error) {
                console.error("Error updating lead stage:", error);
                toast.error("An error occurred while updating the lead stage.");
            }
        }
    };


    const highlightIndicator = (e) => {
        const indicators = getindicators();
        clearHighlights(indicators);
        const el = getNearesIndicator(e, indicators);

        if (el) {
            el.style.opacity = "1";
        }
    };

    const clearHighlights = (els) => {
        const indicators = els || getindicators();

        indicators.forEach((i) => {
            i.style.opacity = "0";
        });
    };

    const getNearesIndicator = (e, indicators) => {
        const DISTANCE_OFFSET = 50;

        const nearest = indicators.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = e.clientY - (box.top + DISTANCE_OFFSET);
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            },
            { offset: Number.NEGATIVE_INFINITY, element: null }
        );

        return nearest.element;
    };

    const getindicators = () => {
        return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
    };

    const handleOpenNoteDialog = (leadId) => {
        setOpenNoteDialog(true);
        setSelectedLeadId(leadId);
    }

    const handleCloseNoteDialog = () => {
        setOpenNoteDialog(false);
    }

    const handleAddNote = async (leadId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Absence of Token");
            return;
        }
        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/notes/${leadId}`,
                { content: newNote, author: session?.user?.name },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                toast.success("Note added successfully");
                setOpenNoteDialog(false);
                console.log("Added note", response.data);

                setSelectedCard((prev) => ({
                    ...prev,
                    notes: response.data.lead.notes,
                }));
                setNewNote("")
            } else {
                toast.error("Failed to add note.");
            }
        } catch (error) {
            console.error("Error adding note:", error);
            toast.error("An error occurred while adding the note.");
        }
    };

    const currentUser = session?.user?.id;    

    // Show loading state while session is being fetched
    if (status === "loading") {
        return <div>Loading...</div>;
    }      

    const getBackgroundColor = () => {
        if (stageProperty === "Won") {
          return "#d4edda"; // light green
        } else if (stageProperty === "Lost") {
          return "#f8d7da"; // light red
        }
        return "#E5E7EB"; 
    };

    return (
        <div
        className="w-56 shrink-0 rounded-lg p-1 border border-gray-200"
        style={{ backgroundColor: getBackgroundColor() }}
      >  
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 ">
            <h5 className={`p-2 font-medium text-gray-800`}>{title}</h5>
            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-gray-50 text-xs text-neutral-600">
              {cards.length}
            </span>
          </div>
          {/* Additional header controls can remain unchanged */}
                <div className="flex items-center space-x-2">
                    <button className="h-5 w-5 flex items-center justify-center rounded-full bg-transparent">
                        {/* <i class="ri-add-line text-blue-500 cursor-pointer"></i> */}
                    </button>
                    <div>
                        {/* Three-dot button */}
                        {/* <button
                            onClick={handleClick}
                            className="h-4 w-4 flex items-center justify-center rounded-full bg-transparent text-neutral-600 hover:text-black"
                            aria-controls={open ? "dropdown-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? "true" : undefined}
                        >
                            <i className="ri-more-2-line cursor-pointer"></i>
                        </button> */}

                        {/* Dropdown Menu */}
                        <Menu
                            id="dropdown-menu"
                            anchorEl={anchorEl}
                            open={open}
                            sx={{ boxShadow: "none", }}
                            onClose={handleClose}
                            MenuListProps={{
                                "aria-labelledby": "basic-button",
                            }}
                        >
                            <MenuItem onClick={() => handleAction("Edit")}>
                                <i className="ri-edit-line mr-2 text-blue-500"></i>
                            </MenuItem>
                            <MenuItem onClick={() => handleAction("Delete")}>
                                <i className="ri-delete-bin-line mr-2 text-red-500"></i>
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </div>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDragEnd}
                className={`h-full w-full rounded-lg transition-colors ${active ? "bg-transparent" : ""}`}
                style={{
                    maxHeight: "60vh",
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {/* <style>
                    {`
                div::-webkit-scrollbar {
                    display: none;
                }
                `}
                </style> */}
                {cards.map((c) => (
                        <Card
                            key={c._id}
                            id={c._id}
                            column={column}
                            title={c.name}
                            data={c}
                            handleDragStart={handleDragStart}
                            avatar={c.avatar}
                            handleCardClick={(color) => handleCardClick(c, color)}
                        />
                        ))}
                        <DropIndicator beforeId="-1" column={column} />
                    </div>

                    <Drawer anchor="right" open={openDrawer} onClose={handleDrawerClose}>
                    <div style={{ width: "600px", padding: "16px" }}>
                        {/* Profile Card */}
                        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                        {/* Header section with profile info */}
                        <div className="p-4 sm:p-6 relative">
                            <div className="flex items-center gap-3">
                            <div
                                className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center"
                                style={{ backgroundColor: userAvatarColor, color: "#fff" }}
                            >
                                <span className="text-xl font-semibold text-white">
                                {selectedCard?.name?.charAt(0) || "?"}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                {selectedCard?.name || "User"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                {selectedCard?.email || "No email available"}
                                </p>
                                <p className="text-sm text-gray-500">
                                Phone: {selectedCard?.phone || "Not available"}
                                </p>
                            </div>
                            </div>
                            {selectedCard?.assignedTo && (
                            <div className="absolute top-4 right-4 flex flex-col items-center">
                                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
                                {selectedCard.assignedTo.firstName?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <span className="text-xs text-gray-500 mt-1">
                                {selectedCard.assignedTo
                                    ? `Assigned: ${selectedCard.assignedTo.firstName}`
                                    : "Unassigned"}
                                </span>
                            </div>
                            )}
                        </div>
                        {/* Info grid */}
                        <div className="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50">
                            <div className="px-4 py-3">
                            <p className="text-xs text-gray-500">Campaign</p>
                            <p className="text-sm font-medium truncate">
                                {selectedCard?.campaignid?.name || "Not available"}
                            </p>
                            </div>
                            <div className="px-4 py-3">
                            <p className="text-xs text-gray-500">Stage</p>
                            <p className="text-sm font-medium">
                                {stageProperty || "Not available"}
                            </p>
                            </div>
                            <div className="px-4 py-3">
                            <p className="text-xs text-gray-500">Status</p>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                selectedCard?.status === "Converted"
                                    ? "bg-green-100 text-green-800"
                                    : selectedCard?.status === "Active"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                            >
                                {selectedCard?.status || "Not available"}
                            </span>
                            </div>
                        </div>
                        {/* Tags section */}
                        <div className="px-4 py-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                            {selectedCard?.tags && selectedCard.tags.length > 0 ? (
                                selectedCard.tags.map((tag, index) => (
                                    <span
                                    key={index}
                                    className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 flex items-center gap-1"
                                    >
                                    <i className="ri-price-tag-3-fill text-sm"
                                        style={{
                                        backgroundColor: tag.color,
                                    }}
                                    ></i>
                                    {tag.name}
                                    </span>
                                ))
                                ) : (
                                <span className="text-xs text-gray-500">No tags available</span>
                                )}
                            </div>
                        </div>
                        </div>

                        {/* Tabs Section */}
                        <Tabs
                        value={tabValue}
                        onChange={(event, newValue) => setTabValue(newValue)}
                        aria-label="User Details Tabs"
                        style={{ marginBottom: "16px" }}
                        >
                        <Tab label="Note" />
                        <Tab label="Documents" />
                        <Tab label="Invoice" />
                        </Tabs>
                        {/* Conditionally render only the active tab panel */}
                        {tabValue === 0 && (
                        <Box style={{ display: "flex", flexDirection: "column", height: "500px" }}>
                            {/* Chat Messages */}
                            <div
                            style={{
                                flexGrow: 1,
                                overflowY: "auto",
                                padding: "8px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                backgroundColor: "#f9f9f9",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                            }}
                            >
                            {selectedCard?.notes?.map((note, index) => (
                                <div
                                key={note._id || index}
                                style={{
                                    display: "flex",
                                    justifyContent:
                                    note.author === session.user?.name ? "flex-end" : "flex-start",
                                }}
                                >
                                <div
                                    style={{
                                    backgroundColor:
                                        note.author === session.user?.name ? "#dcf8c6" : "#fff",
                                    padding: "10px 14px",
                                    borderRadius: "18px",
                                    maxWidth: "70%",
                                    boxShadow: "0px 1px 2px rgba(0,0,0,0.15)",
                                    }}
                                >
                                    <Typography variant="body2" style={{ margin: 0 }}>
                                    {note.content}
                                    </Typography>
                                    <Typography
                                    variant="caption"
                                    style={{
                                        display: "block",
                                        textAlign: "right",
                                        marginTop: "4px",
                                    }}
                                    >
                                    {new Date(note.timestamp).toLocaleString()}
                                    </Typography>
                                </div>
                                </div>
                            ))}
                            </div>
                            {/* Input Field */}
                            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                            <TextField
                            fullWidth
                            placeholder="Type a message..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddNote(selectedCard._id);
                                }
                            }}
                            />
                            <Button variant="contained" color="primary" onClick={() => handleAddNote(selectedCard._id)}>
                            Send
                            </Button>
                            </div>
                        </Box>
                        )}
                        {tabValue === 1 && (
                            <DocumentSection selectedCard={selectedCard} session={session} />
                        )}
                        {tabValue === 2 && (
                        <Box>
                            <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 3,
                                paddingBottom: 2,
                            }}
                            >
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                Status
                                </Typography>
                                <Typography variant="body2">Pending</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                Amount
                                </Typography>
                                <Typography variant="body2">0.00</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                Amount Paid
                                </Typography>
                                <Typography variant="body2">0.00</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                Balance
                                </Typography>
                                <Typography variant="body2">0.00</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                <Button variant="contained" color="primary" sx={{ width: "100%" }} onClick={handleDownloadInvoice}>
                                Download
                                </Button>
                                <Button variant="outlined" color="primary" sx={{ width: "100%" }} onClick={handleViewInvoice}>
                                View Invoice
                                </Button>
                            </Box>
                            </Box>
                            {/* Additional invoice content */}
                        </Box>
                        )}
                    </div>
                </Drawer>
        </div >
    );
};

const handleVerifyDocument = (doc) => {
    if (!doc) return;
    // Insert your verification logic here.
    // For example, mark it as verified in your backend or show a success message.
    toast.success(`Document "${doc.name}" verified successfully.`);
    setOpenDocDialog(false);
  }

const Card = ({ id, column, title, data, handleDragStart, handleCardClick }) => {
    const name = data.name || "Unnamed"; // Fallback for name
    const randomColor = getRandomColor(name); // Generate color based on the name

    return (
        <div
            draggable
            onDragStart={(e) => handleDragStart(e, id)}
            onClick={() => handleCardClick(randomColor)}
            className="cursor-pointer mb-2 flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-2"
        >
            {/* Avatar */}
            <div
                className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold"
                style={{
                    backgroundColor: randomColor,
                    fontSize: "1rem",
                }}
            >
                {name.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex flex-col">
                <Typography variant="body1" className="text-neutral-800 text-xs">
                    {name}
                </Typography>
                <div className="flex items-center space-x-1 text-[0.7rem] text-neutral-500">
                    <i className="ri-flag-line w-4 h-4"></i>
                    <span>{data.campaignid.name}</span>
                </div>
            </div>
        </div>
    );
};


const DropIndicator = ({ beforeId, column }) => {
    return (
        <div
            data-before={beforeId || "-1"}
            data-column={column}
            className='my-0.5 h-0.5 w-full
        bg-violet-400 opacity-0'
        />
    );
}

// const AddCard = ({ column, setCards }) => {
//     const [title, setTitle] = useState('');
//     const [adding, setAdding] = useState(false);
//     const [text, setText] = useState('');


//     const handleSubmit = (e) => {
//         e.preventDefault();

//         if (!text.trim().length) return;

//         const newCard = {
//             column,
//             title: text.trim(),
//             id: Math.random().toString(),
//         };

//         setCards((pv) => [...pv, newCard]);

//         setAdding(false);
//     };

//     return (
//         <>
//             {adding ? (
//                 <form onSubmit={handleSubmit}>
//                     <textarea
//                         onChange={(e) => setText(e.target.value)}
//                         autoFocus
//                         placeholder='Add new task...'
//                         className='w-full rounded border
//                     border-violet-400 bg-violet-400/20 p-3
//                     text-sm text-black
//                     placeholder-violet-300 focus:outline-0'
//                     />
//                     <div className='mt-1.5 flex items-center
//                     justify-end gap-1.5'>
//                         <button
//                             onClick={() => setAdding(false)}
//                             className='px-3 py-1.5 text-xs
//                         text-neutral-400 transition-colors
//                         hover:text-black bg-transparent cursor-pointer'
//                         >
//                             Close
//                         </button>
//                         <button
//                             type='submit'
//                             className='flex items-center gap-1.5
//                         rounded bg-neutral-50 px-3 py-1.5
//                         text-xs text-neutral-950
//                         transition-colors hover:bg-neutral-200 cursor-pointer'
//                         >
//                             <span>Add</span>
//                         </button>
//                     </div>
//                 </form>
//             ) : (
//                 <button
//                     onClick={() => setAdding(true)}
//                     className='flex w-full items-center gap-1.5
//     px-3 py-1.5 text-xs text-neutral-400
//     transition-colors hover:text-black bg-transparent cursor-pointer'>
//                     <span>Add card</span>
//                     {/* <FiPlus /> */}
//                 </button>
//             )}
//         </>
//     );
// }

export default App;
