import React, { useEffect, useState } from 'react';
import { 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  MenuItem, TextField, Typography 
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

const DocumentSection = ({ selectedCard, session }) => {
  // State for files requested/uploaded
  const [requestedDocument, setRequestedDocument] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedRequestedDocument, setSelectedRequestedDocument] = useState(null);
  const [openDocRequestDialog, setOpenDocRequestDialog] = useState(false);
  const [newDocRequestName, setNewDocRequestName] = useState('');
  const [newDocRequestType, setNewDocRequestType] = useState('application/pdf');
  const [loading, setLoading] = useState(false);

  // Fetch files when the component mounts or selectedCard (lead) changes
  useEffect(() => {
    if (selectedCard && selectedCard._id) {
      fetchRequestedFile();
    }
  }, [selectedCard]);

  // Function to fetch requested files using the leadId from /api/files/files/:id
  const fetchRequestedFile = async () => {
    if (!selectedCard || !selectedCard._id) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/files/${selectedCard._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response && response.data.files) {
        setRequestedDocument(
          Array.isArray(response.data.files) ? response.data.files : []
        );
        console.log("Fetched requested files:", response.data.files);
      } else {
        toast.error('Failed to fetch document requests.');
        setRequestedDocument([]);
      }
    } catch (error) {
      console.error('Error fetching requested files:', error);
      toast.error('Error fetching document requests.');
      setRequestedDocument([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to request a document upload via the absolute URL
  const requestDocumentUpload = async (leadId, docName, fileType = "application/pdf") => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }
    
    // Data sent to the backend, including the requester id from session
    const requestData = {
      leadId,
      docName,
      fileType,
      requestBy: session?.user?.id
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/requestupload`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response && response.data) {
        toast.success(`Document "${docName}" requested successfully.`);
        // Optionally refresh the file list after successful request.
        fetchRequestedFile();
      } else {
        toast.error('Failed to request document.');
      }
    } catch (error) {
      console.error("Error requesting document upload:", error);
      toast.error(`Error requesting document: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleViewLeadDocument = async (fileId, fileType = 'application/pdf') => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/docs/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Use the passed fileType rather than forcing PDF
      const fileBlob = new Blob([response.data], { type: fileType });
      const fileURL = window.URL.createObjectURL(fileBlob);
      window.open(fileURL, '_blank');
      
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Error fetching document details.");
    }
  };
  

  // Other functions (upload, cancel, delete, download) remain largely the same.
  const handleUploadDocument = async () => {
    if (!fileToUpload) {
      toast.error("Please select a file to upload.");
      return;
    }
    if (!selectedCard || !selectedCard._id) {
      toast.error("Lead information is missing.");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }
  
    const formData = new FormData();
    formData.append("files", fileToUpload);
    formData.append("leadId", selectedCard._id);
    
    // Use document ID if available
    const requestedDocumentId = selectedRequestedDocument ? selectedRequestedDocument._id : null;
    if (!requestedDocumentId && selectedRequestedDocument) {
      toast.error("Document ID is missing.");
      return;
    }
    
    try {
      const url = requestedDocumentId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/files/upload/${requestedDocumentId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`;
      
      const response = await axios.post(
        url,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response) {
        toast.success("File uploaded successfully.");
        fetchRequestedFile();
        setOpenUploadDialog(false);
        setFileToUpload(null);
        setSelectedRequestedDocument(null);
      } else {
        toast.error("Failed to upload file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(`Upload failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleOpenUploadDialog = () => {
    setSelectedRequestedDocument(null);
    setOpenUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    setFileToUpload(null);
    setSelectedRequestedDocument(null);
  };

  // Cancel pending upload request
  const handleCancelUpload = async (requestId) => {
    if (!requestId) {
      toast.error("Request ID is missing.");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }
  
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/uploadcancel/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response) {
        toast.success("Document request canceled successfully.");
        fetchRequestedFile();
      } else {
        toast.error("Failed to cancel document request.");
      }
    } catch (error) {
      console.error("Error canceling document request:", error);
      toast.error(`Error canceling document: ${error.response?.data?.message || error.message}`);
    }
  };

  // Delete an uploaded document
  const handleDeleteDocument = async (fileId) => {
    if (!fileId) {
      toast.error("File ID is missing.");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authorization token is missing.");
      return;
    }
    
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/file/${fileId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response) {
        toast.success("Document deleted successfully.");
        fetchRequestedFile();
      } else {
        toast.error("Failed to delete the document.");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(`Error deleting document: ${error.response?.data?.message || error.message}`);
    }
  };

  // File download remains the same
  const handleDownloadDocument = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', fileName || 'document');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 mb-4">
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<i className="ri-add-line"></i>}
          onClick={handleOpenUploadDialog}
          className="flex-1"
        >
          New Document
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<i className="ri-file-search-line"></i>}
          onClick={() => {
            if (selectedCard && selectedCard._id) {
              setOpenDocRequestDialog(true);
            } else {
              toast.error("No lead selected.");
            }
          }}
          className="flex-1"
        >
          Request Document
        </Button>
      </div>

      {!selectedCard && (
        <Typography variant="body2" className="text-gray-500">
          Please select a lead to view documents.
        </Typography>
      )}

      {selectedCard && (
        <div className="space-y-6">
          {/* Requested Documents Section */}
          <div>
            <Typography variant="h6" className="mb-2 font-medium flex items-center">
              <i className="ri-file-list-line mr-2"></i>
              Requested Documents
            </Typography>
            {loading ? (
              <div className="flex justify-center items-center p-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (Array.isArray(requestedDocument) && 
                      requestedDocument.filter(doc => !doc.fileUrl).length > 0) ? (
              <div className="space-y-2">
                {requestedDocument
                  .filter(doc => !doc.fileUrl)
                  .map((doc) => (
                    <div 
                      key={doc._id} 
                      className="border rounded-lg p-3 bg-white flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className="bg-amber-100 text-amber-700 p-2 rounded-full mr-3">
                          <i className="ri-file-warning-line"></i>
                        </div>
                        <div>
                          <Typography variant="body1" className="font-medium">
                            {doc.docName}
                          </Typography>
                          <Typography variant="body2" className="text-gray-500">
                            {doc.fileType?.split('/')[1]?.toUpperCase() || "Document"} • 
                            Requested: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          onClick={() => {
                            setSelectedRequestedDocument(doc);
                            setOpenUploadDialog(true);
                          }}
                        >
                          Upload
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => handleCancelUpload(doc._id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <Typography 
                variant="body2" 
                className="text-gray-500 italic bg-gray-50 p-3 rounded"
              >
                No pending document requests.
              </Typography>
            )}
          </div>

          {/* Uploaded Documents Section */}
          <div>
            <Typography variant="h6" className="mb-2 font-medium flex items-center">
              <i className="ri-file-list-3-line mr-2"></i>
              Uploaded Documents
            </Typography>
            {loading ? (
              <div className="flex justify-center items-center p-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (Array.isArray(requestedDocument) &&
                      requestedDocument.filter(doc => doc.fileUrl).length > 0) ? (
              <div className="space-y-2">
                {requestedDocument
                  .filter(doc => doc.fileUrl)
                  .map((doc) => (
                    <div 
                      key={doc._id} 
                      className="border rounded-lg p-3 bg-white flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className="bg-green-100 text-green-700 p-2 rounded-full mr-3">
                          <i className="ri-file-check-line"></i>
                        </div>
                        <div>
                          <Typography variant="body1" className="font-medium">
                            {doc.docName}
                          </Typography>
                          <Typography variant="body2" className="text-gray-500">
                            {doc.fileType?.split('/')[1]?.toUpperCase() || "Document"} • 
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleViewLeadDocument(doc._id, doc.fileType)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined" 
                          size="small"                        
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadDocument(doc.fileUrl, doc.docName);
                          }}
                        >
                          Download
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error"
                          size="small"
                          onClick={() => handleDeleteDocument(doc._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <Typography 
                variant="body2" 
                className="text-gray-500 italic bg-gray-50 p-3 rounded"
              >
                No documents have been uploaded yet.
              </Typography>
            )}
          </div>
        </div>
      )}

      {/* Upload Document Dialog */}
      <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog}>
        <DialogTitle>
          {selectedRequestedDocument ? 'Upload Requested Document' : 'Upload New Document'}
        </DialogTitle>
        <DialogContent>
          {selectedRequestedDocument ? (
            <Typography variant="body2" className="mb-4">
              Uploading: <strong>{selectedRequestedDocument.docName}</strong>
            </Typography>
          ) : (
            <>
              <TextField
                select
                fullWidth
                margin="dense"
                label="Document Type"
                variant="outlined"
                value={newDocRequestType}
                onChange={(e) => setNewDocRequestType(e.target.value)}
              >
                <MenuItem value="application/pdf">PDF Document</MenuItem>
                <MenuItem value="image/jpeg">Image (JPEG)</MenuItem>
                <MenuItem value="image/png">Image (PNG)</MenuItem>
                <MenuItem value="application/msword">Word Document</MenuItem>
                <MenuItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (DOCX)</MenuItem>
                <MenuItem value="application/vnd.ms-excel">Excel Spreadsheet</MenuItem>
                <MenuItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Spreadsheet (XLSX)</MenuItem>
              </TextField>
            </>
          )}
          <div className="mt-4">
            <Typography variant="body2" className="mb-2">Select File</Typography>
            <input 
              type="file" 
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleUploadDocument} 
            color="primary"
            disabled={!fileToUpload}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Request Document Dialog */}
      <Dialog open={openDocRequestDialog} onClose={() => setOpenDocRequestDialog(false)}>
        <DialogTitle>Request Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document Name"
            fullWidth
            variant="outlined"
            value={newDocRequestName}
            onChange={(e) => setNewDocRequestName(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            label="File Type"
            fullWidth
            variant="outlined"
            value={newDocRequestType}
            onChange={(e) => setNewDocRequestType(e.target.value)}
          >
            <MenuItem value="application/pdf">PDF Document</MenuItem>
            <MenuItem value="image/jpeg">Image (JPEG)</MenuItem>
            <MenuItem value="image/png">Image (PNG)</MenuItem>
            <MenuItem value="application/msword">Word Document</MenuItem>
            <MenuItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (DOCX)</MenuItem>
            <MenuItem value="application/vnd.ms-excel">Excel Spreadsheet</MenuItem>
            <MenuItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Spreadsheet (XLSX)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDocRequestDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (selectedCard && selectedCard._id && newDocRequestName) {
                // Call the new function to request a document
                requestDocumentUpload(selectedCard._id, newDocRequestName, newDocRequestType);
                setOpenDocRequestDialog(false);
                setNewDocRequestName('');
                setNewDocRequestType('application/pdf');
              } else {
                toast.error("Please enter a document name.");
              }
            }} 
            color="primary"
            disabled={!newDocRequestName}
          >
            Request Document
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DocumentSection;
