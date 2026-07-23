"use client";

import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { FaFile, FaChevronRight, FaEllipsisV } from "react-icons/fa";
import { toast } from "react-toastify";
import TemplateFormGenerator from "../doceditor/components/TemplateFormGenerator";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRouter } from 'next/navigation';
import { Button } from "@mui/material";

const Page = () => {
    const [currentPath, setCurrentPath] = useState(["Yours"]);
    const [fileStructure, setFileStructure] = useState({
        Yours: {
            type: "folder",
            children: {
                People: {
                    type: "folder",
                    icon: "ri-team-fill",
                    children: {},
                    _id: "people",
                    folderName: "People",
                    root: true,
                    access: "private",
                    shared: [],
                    isDefault: true
                }
            }
        }
    });
    const [currentFolderId, setCurrentFolderId] = useState(null);

    const [selectedItem, setSelectedItem] = useState(null);
    const [openMenu, setOpenMenu] = useState(null); // Track only the open menu
    const [clipboard, setClipboard] = useState(null); // For copy-paste functionality
    const menuRef = useRef(null);
    const [folders, setFolders] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [selectedFileType, setSelectedFileType] = useState(null);

    // Add new state for file upload
    const [isUploading, setIsUploading] = useState(false);

    // New states for document generation
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateFormValues, setTemplateFormValues] = useState({});
    const [documentPreview, setDocumentPreview] = useState('');
    const [isTemplateFormVisible, setIsTemplateFormVisible] = useState(false);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const documentPreviewRef = useRef(null);

    const router = useRouter();

    const navigateTo = (folder, folderId) => {
        setCurrentPath((prevPath) => [...prevPath, folder]);
        setCurrentFolderId(folderId);
    };

    const goBackTo = (index) => {
        setCurrentPath((prevPath) => {
            const newPath = prevPath.slice(0, index + 1);
            // If we're going back to root
            if (index === 0) {
                setCurrentFolderId(null);
            } else {
                // Get the parent folder's content
                let current = fileStructure;
                // Navigate to the parent folder to get its ID
                for (let i = 0; i < index; i++) {
                    current = current[newPath[i]]?.children || {};
                }
                const parentFolder = current[newPath[index]];
                setCurrentFolderId(parentFolder?._id || null);
            }
            return newPath;
        });
    };

    const formatFileName = (filename) => {
        return filename.replace(/(_\d{13})\.\w+$/, (match, p1) => match.replace(p1, ''));
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return "ri-file-text-line";

        if (fileType.startsWith('image/')) return "ri-image-line";
        if (fileType === 'application/pdf') return "ri-file-pdf-line";
        if (fileType.includes('word') || fileType.includes('doc')) return "ri-file-word-line";
        if (fileType.includes('excel') || fileType.includes('sheet')) return "ri-file-excel-line";
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return "ri-file-ppt-line";
        if (fileType.includes('text/html')) return "ri-html5-line";

        return "ri-file-text-line";
    };

    const FilePreview = ({ item }) => {
        // Determine if we can show a thumbnail preview
        const canShowThumbnail = item.fileType?.startsWith('image/');
        const iconClass = getFileIcon(item.fileType);

        return (
            <div className="flex flex-col items-center justify-center">
                {canShowThumbnail ? (
                    <div className="w-16 h-16 rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                        <img
                            src={item.fileUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-md bg-blue-50 flex items-center justify-center">
                        <i className={`${iconClass} text-3xl text-blue-500`}></i>
                    </div>
                )}
            </div>
        );
    };

    const GenerateDocumentButton = () => {
        return (
            <button
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 ease-in-out flex items-center"
                onClick={openGenerateDocument}
            >
                <i className="ri-file-add-line mr-2"></i>
                Generate Document
            </button>
        );
    };

    const addFolder = (folderName) => {
        if (!folderName) return;

        setFileStructure((prevStructure) => {
            const newStructure = { ...prevStructure };
            let current = newStructure;

            // Traverse the current path to find the correct parent folder
            currentPath.forEach((segment) => {
                current = current[segment]?.children || {};
            });

            // Determine if the folder is a root folder
            const isRoot = currentPath.length === 1; // Root folder has only one segment in the path
            const parentFolderId = isRoot
                ? null
                : currentPath[currentPath.length - 1]._id; // Use parent folder's ID for subfolders

            // Add the new folder under the correct parent
            current[folderName] = {
                type: "folder",
                icon: "ri-folder-fill",
                children: {},
                schema: {
                    folderName,
                    root: isRoot,
                    parent: parentFolderId,
                    access: "private",
                    shared: [],
                },
            };
            return newStructure;
        });
    };

    // New function to add a file
    const addFile = (fileName) => {
        if (!fileName) return;

        setFileStructure((prevStructure) => {
            const newStructure = { ...prevStructure };
            let current = newStructure;

            // Traverse the current path to find the correct parent folder
            currentPath.forEach((segment) => {
                current = current[segment]?.children || {};
            });

            // Add the new file under the correct parent
            current[fileName] = {
                type: "file",
                icon: "ri-file-text-line",
                content: "", // Optionally you could add content or other file-specific data here
            };
            return newStructure;
        });

        toast.success(`File "${fileName}" created successfully`);
    };

    const deleteFolder = async (folderId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("No token found");
            return;
        }
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/folders/${folderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response) {
                toast.success("Folder deleted successfully");
                fetchFolder(); // Refresh folder list after deletion
            } else {
                console.error("Error deleting folder:", response);
                toast.error("Error deleting folder");
            }
        } catch (error) {
            console.error("Failed to delete folder:", error.response || error.message);
            toast.error(`Failed to delete folder: ${error.response?.data?.message || error.message || "Unknown error"}`);
        }
    };

    const deleteFile = async (fileId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("No token found");
            return;
        }
        try {
            const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/files/file/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response) {
                toast.success("File deleted successfully");
                fetchFolder(); // Refresh file list after deletion
            } else {
                console.error("Error deleting file:", response);
                toast.error("Error deleting file");
            }
        } catch (error) {
            console.error("Failed to delete file:", error.response || error.message);
            toast.error(`Failed to delete file: ${error.response?.data?.message || error.message || "Unknown error"}`);
        }
    };

    const deleteItem = (itemName) => {
        const currentItem = currentFolderContent[itemName];
        const isFolder = currentItem.type === "folder";

        if (isFolder) {
            const folderId = currentItem._id;
            deleteFolder(folderId);
        } else {
            const fileId = currentItem._id;
            deleteFile(fileId); // Call API to delete file
        }
    };

    const getCurrentFolderContent = () => {
        let current = fileStructure;
        currentPath.forEach((segment) => {
            current = current[segment]?.children || {};
        });
        return current;
    };

    const currentFolderContent = getCurrentFolderContent();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const postFolders = async (folderName) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("No token found");
            return;
        }
        // Determine if the folder is root or a subfolder
        const isRoot = currentPath.length === 1;
        let parentFolderId = null;
        if (!isRoot) {
            parentFolderId = currentFolderId
        }
        const isInPeopleFolder = currentPath[currentPath.length - 1] === "People";
        let folderData = {};
        if (isInPeopleFolder) {
            folderData = {
                folderName,
                root: isRoot,
                leadId: parentFolderId, // Parent ID for backend
            };
        }
        else {
            folderData = {
                folderName,
                root: isRoot,
                parent: parentFolderId, // Parent ID for backend
            };
        }

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/folders/postfolder`,
                folderData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response) {

                toast.success("Folder created successfully");
                fetchFolder(); // Refresh the folder structure
            } else {
                console.error("Error creating folder:", response);
                toast.error("Error creating folder");
            }
        } catch (error) {
            console.error("Failed to create folder:", error.response || error.message);
            toast.error(`Failed to create folder: ${error.response?.data?.message || error.message || "Unknown error"}`);
        }
    };

    const updateFolder = async (folderId, newFolderName, oldFolderName) => {

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("No token found");
            return;
        }

        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/folders/${folderId}`,
                { folderId, folderName: newFolderName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response && response.data) {

                toast.success("Folder renamed successfully");
                fetchFolder(); // Refresh the folder structure
            } else {
                console.error("Error updating folder:", response);
                toast.error("Error updating folder");
            }
        } catch (error) {
            console.error("Failed to update folder:", error.response || error.message);
            toast.error(`Failed to update folder: ${error.response?.data?.message || error.message || "Unknown error"}`);
        }
    };

    const fetchPeople = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("No token");
            return;
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/files/leads`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response?.data) {
                // Create folder structure for people
                setFileStructure(prevStructure => {
                    const newStructure = { ...prevStructure };
                    let current = newStructure;

                    // Navigate to the People folder
                    currentPath.forEach((segment, index) => {
                        if (index < currentPath.length - 1) {
                            current = current[segment]?.children || {};
                        }
                    });

                    // Create folders for each person
                    const peopleFolder = current[currentPath[currentPath.length - 1]];
                    peopleFolder.children = {};

                    response.data.leads?.forEach(person => {
                        peopleFolder.children[person.name] = {
                            type: "folder",
                            icon: "ri-user-fill",
                            children: {},
                            _id: person._id,
                            folderName: person.name,
                            root: false,
                            access: "private",
                            shared: [],
                            personData: person // Store additional person data if needed
                        };
                    });

                    return newStructure;
                });
                toast.success("People fetched successfully");
            } else {
                toast.error("Error fetching people");
            }
        } catch (error) {
            console.error("Failed to fetch people:", error.response || error.message);
            toast.error("Failed to fetch people");
        }
    };

    const fetchDocumentByLead = async (personId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("No token");
            return;
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/files/files/${personId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response?.data) {
                // Update file structure with the fetched files
                setFileStructure(prevStructure => {
                    const newStructure = { ...prevStructure };
                    let current = newStructure;

                    // Navigate to the current folder
                    currentPath.forEach((segment, index) => {
                        if (index < currentPath.length - 1) {
                            current = current[segment]?.children || {};
                        }
                    });

                    // Get the current folder
                    const currentFolder = current[currentPath[currentPath.length - 1]];
                    currentFolder.children = {};

                    // Add each file to the folder's children
                    response.data.files.forEach(file => {
                        currentFolder.children[file.docName] = {
                            type: "file",
                            fileName: file.fileName,
                            fileUrl: file.fileUrl,
                            fileType: file.fileType,
                            uploadedAt: file.uploadedAt,
                            _id: file._id,
                            access: file.access,
                            shared: file.shared
                        };
                    });

                    return newStructure;
                });
                toast.success("Documents fetched successfully");
            } else {
                toast.error("Error fetching documents");
            }
        } catch (error) {
            console.error("Failed to fetch documents:", error.response || error.message);
            toast.error("Failed to fetch documents");
        }
    };

    const fetchFolder = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("No token");
            return;
        }

        // Don't fetch for the People folder since it's a default folder
        if (currentPath[currentPath.length - 1] === "People") {
            fetchPeople()
            return;
        }
        if (currentPath[currentPath.length - 2] === "People") {
            fetchDocumentByLead(currentFolderId)
            return;
        }

        let urlpath = `${process.env.NEXT_PUBLIC_API_URL}/api/files/getfiles`;
        if (currentFolderId) {
            urlpath += `?parentId=${currentFolderId}`;
        }

        try {
            const response = await axios.get(urlpath, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response?.data) {
                const fetchedFolders = response.data.folders;
                const fetchedFiles = response.data.files || [];

                // Create a simplified folder structure
                const folderStructure = {
                    // Maintain the People folder in root
                    ...(currentPath.length === 1 ? {
                        People: {
                            type: "folder",
                            icon: "ri-team-fill",
                            children: {},
                            _id: "people",
                            folderName: "People",
                            root: true,
                            access: "private",
                            shared: [],
                            isDefault: true
                        }
                    } : {}),
                };

                // Add fetched folders
                fetchedFolders.forEach((folder) => {
                    folderStructure[folder.folderName] = {
                        type: "folder",
                        icon: "ri-folder-user-fill",
                        children: {},
                        _id: folder._id,
                        ...folder
                    };
                });

                // Add fetched files
                fetchedFiles.forEach((file) => {
                    folderStructure[file.docName] = {
                        type: "file",
                        fileName: file.fileName,
                        fileUrl: file.fileUrl,
                        fileType: file.fileType,
                        uploadedAt: file.uploadedAt,
                        _id: file._id,
                        access: file.access,
                        shared: file.shared
                    };
                });

                // Update the file structure for the current path
                setFileStructure((prevStructure) => {
                    const newStructure = { ...prevStructure };
                    let current = newStructure;

                    // Navigate to the current folder
                    currentPath.forEach((segment, index) => {
                        if (index < currentPath.length - 1) {
                            current = current[segment]?.children || {};
                        }
                    });

                    // Set the children of the current folder
                    if (currentPath.length === 1) {
                        // For root level, merge with existing default folders
                        newStructure.Yours.children = {
                            ...newStructure.Yours.children,
                            ...folderStructure
                        };
                    } else {
                        // For nested folders
                        const currentFolder = currentPath[currentPath.length - 1];
                        current[currentFolder].children = folderStructure;
                    }

                    return newStructure;
                });
            }
        } catch (error) {
            console.error("Failed to fetch folders:", error);
            toast.error("Failed to fetch folders");
        }
    };

    useEffect(() => {
        fetchFolder();
    }, [currentPath]);

    // Add file upload handler
    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        setIsUploading(true);
        const token = localStorage.getItem("token");

        try {
            const formData = new FormData();
            formData.append('files', files[0]);

            // Check if we're in a person's folder (child of People folder)
            const isInPeopleFolder = currentPath[currentPath.length - 2] === "People";

            let uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`;
            if (isInPeopleFolder) {
                // Use the leads document upload endpoint
                formData.append('leadId', currentFolderId); // Add leadId for people documents
            } else if (currentFolderId) {
                formData.append('parent', currentFolderId);
            } else {
                formData.append('root', 'true');
            }

            const response = await axios.post(
                uploadUrl,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                        // Let browser/axios set multipart boundary — do not force Content-Type
                    }
                }
            );

            if (response.data) {
                toast.success('File uploaded successfully');
                fetchFolder(); // Refresh the folder contents
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error(`Upload failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    // New function to fetch templates
    const fetchTemplates = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("No token found");
            return;
        }

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/template/getAllTemplates`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data) {
                // Extract fields from content
                const formattedTemplates = response.data.map(template => ({
                    id: template._id,
                    title: template.title,
                    content: template.body,
                    author: template.author,
                    fields: extractFieldsFromContent(template.body),
                    createdAt: template.createdAt,
                    updatedAt: template.updatedAt
                }));
                setTemplates(formattedTemplates);
            }
        } catch (error) {
            console.error("Failed to fetch templates:", error);
            toast.error("Failed to fetch templates");
        }
    };

    // Function to extract fields from template content
    const extractFieldsFromContent = (content) => {
        if (!content) return [];

        // Regex to extract fields like {{fieldName}}
        const fieldMatches = content.match(/{{([^}]+)}}/g) || [];
        const extractedFields = fieldMatches.map(match => {
            const fieldName = match.replace(/{{|}}/g, '');
            return {
                key: fieldName,
                label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
                type: 'text' // Default type
            };
        });

        // Remove duplicates
        const uniqueFields = extractedFields.filter((field, index, self) =>
            index === self.findIndex((f) => f.key === field.key)
        );

        return uniqueFields;
    };

    // Function to handle template selection
    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        setIsTemplateFormVisible(true);
        setIsTemplateModalOpen(false); // Close template selection modal
    };

    // Function to handle form value changes
    const handleFormValueChange = (values) => {
        setTemplateFormValues(values);
    };

    // Function to generate document preview
    const generateDocumentPreview = () => {
        if (!selectedTemplate) return;

        let previewContent = selectedTemplate.content;

        // Replace template variables with form values
        Object.entries(templateFormValues).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            previewContent = previewContent.replace(regex, value);
        });

        setDocumentPreview(previewContent);
        setIsTemplateFormVisible(false);
        setIsPreviewVisible(true);
    };

    // Function to save generated document
    const saveGeneratedDocument = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("No token found");
            return;
        }

        try {
            // Create a unique filename with timestamp
            const filename = `${selectedTemplate.title}_${Date.now()}.html`;

            // Create document content as HTML
            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 30px; }
                </style>
            </head>
            <body>
                ${documentPreview}
            </body>
            </html>`;

            // Create a Blob from the HTML content
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const file = new File([blob], filename, { type: 'text/html' });

            // Create form data for upload
            const formData = new FormData();
            formData.append('files', file);

            // Add appropriate parent ID
            const isInPeopleFolder = currentPath[currentPath.length - 2] === "People";
            if (isInPeopleFolder) {
                formData.append('leadId', currentFolderId);
            } else if (currentFolderId) {
                formData.append('parent', currentFolderId);
            } else {
                formData.append('root', 'true');
            }

            // Upload the document
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                toast.success('Document saved successfully');
                fetchFolder(); // Refresh the folder contents

                // Reset states and close modal
                setIsPreviewVisible(false);
                setSelectedTemplate(null);
                setTemplateFormValues({});
                setDocumentPreview('');
            }
        } catch (error) {
            console.error('Document save failed:', error);
            toast.error(`Save failed: ${error.response?.data?.message || error.message}`);
        }
    };

    // Function to download document as PDF
    const downloadAsPdf = async () => {
        if (!documentPreviewRef.current) return;

        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4'
            });

            const canvas = await html2canvas(documentPreviewRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = doc.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            doc.save(`${selectedTemplate.title}_document.pdf`);

            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('PDF generation failed:', error);
            toast.error('Failed to generate PDF');
        }
    };

    // Function to open template modal
    const openGenerateDocument = () => {
        const isInPeopleFolder = currentPath[currentPath.length - 2] === "People";

        if (isInPeopleFolder) {
            router.push(`/en/manager/doctemplate?leadId=${currentFolderId}`);
        } else {
            router.push(`/en/manager/doctemplate?folderId=${currentFolderId}`);
        }
    };

    // Add this helper function to determine if we're in root
    const isRootDirectory = () => {
        return currentPath.length === 1;
    };

    // Add helper function to check if we're in People folder or its children
    const isInPeopleSection = () => {
        return currentPath.includes("People");
    };

    return (
        <div className="p-4">
            {/* Breadcrumbs */}
            <div className="flex rounded-sm h-7 items-center gap-2 mb-1 p-2">
                {currentPath.map((folder, index) => (
                    <div key={index} className="flex items-center">
                        <button
                            className="text-blue-500 text-sm font-base cursor-pointer hover:underline"
                            onClick={() => goBackTo(index)}
                        >
                            {folder}
                        </button>
                        {index < currentPath.length - 1 && (
                            <FaChevronRight className="mx-2 text-gray-500" />
                        )}
                    </div>
                ))}
            </div>

            {/* Menu */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg w-[80%] max-w-4xl max-h-[80%] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Select a Template</h2>
                            <button
                                onClick={() => setIsTemplateModalOpen(false)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>

                        {templates.length === 0 ? (
                            <p className="text-center text-gray-500 my-8">Loading templates...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates.map(template => (
                                    <div
                                        key={template.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleSelectTemplate(template)}
                                    >
                                        <h3 className="font-semibold">{template.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {template.fields.length} field{template.fields.length !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Template Form Modal */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg w-[80%] max-w-4xl max-h-[80%] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Select a Template</h2>
                            <button
                                onClick={() => setIsTemplateModalOpen(false)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <i className="ri-close-line text-2xl"></i>
                            </button>
                        </div>

                        {templates.length === 0 ? (
                            <p className="text-center text-gray-500 my-8">Loading templates...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {templates.map(template => (
                                    <div
                                        key={template.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleSelectTemplate(template)}
                                    >
                                        <h3 className="font-semibold">{template.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {template.fields?.length || 0} field{template.fields?.length !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {isPreviewVisible && documentPreview && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg w-[80%] max-w-4xl max-h-[80%] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Preview: {selectedTemplate?.title}</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={downloadAsPdf}
                                    className="text-gray-600 hover:text-gray-800 flex items-center"
                                >
                                    <i className="ri-download-line mr-1"></i> Download PDF
                                </button>
                                <button
                                    onClick={() => setIsPreviewVisible(false)}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    <i className="ri-close-line text-2xl"></i>
                                </button>
                            </div>
                        </div>

                        <div
                            ref={documentPreviewRef}
                            className="border border-gray-200 rounded-lg p-8 bg-white min-h-[50vh]"
                            dangerouslySetInnerHTML={{ __html: documentPreview }}
                        ></div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                onClick={() => {
                                    setIsPreviewVisible(false);
                                    setIsTemplateFormVisible(true);
                                }}
                            >
                                Back to Form
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                onClick={saveGeneratedDocument}
                            >
                                Save Document
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isRootDirectory() && (
                <Button
                    variant="contained"
                    className="mb-4 mt-2"
                    onClick={openGenerateDocument}
                >
                    <i className="ri-file-add-line mr-1"></i>
                    Generate Document
                </Button>
            )}

            {/* Folder and file view */}
            <div className="grid grid-cols-8">
                {Object.entries(currentFolderContent).map(([itemName, item]) => {
                    // Format the display name to remove timestamps
                    const displayName = item.type === "file" ? formatFileName(itemName) : itemName;

                    return (
                        <div
                            key={itemName}
                            className={`relative flex flex-col items-center p-4 rounded-lg ${selectedItem === itemName ? "bg-blue-50" : "hover:bg-gray-50"
                                } transition-all duration-200 ease-in-out cursor-pointer`}
                            onClick={() => setSelectedItem(itemName)}
                            onDoubleClick={() => {
                                if (item.type === "folder") {
                                    navigateTo(itemName, item._id);
                                } else if (item.type === "file") {
                                    setSelectedFileUrl(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/docs/${item._id}`);
                                    setSelectedFileType(item.fileType);
                                    setIsModalOpen(true);
                                }
                            }}
                        >
                            {/* Preview or Icon */}
                            {item.type === "folder" ? (
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <i className={`${item.icon || "ri-folder-fill"} text-4xl text-yellow-500`}></i>
                                </div>
                            ) : (
                                <FilePreview item={item} />
                            )}

                            {/* File/Folder Name */}
                            <span className="mt-2 text-center font-medium text-gray-700 w-full truncate text-sm">
                                {displayName}
                            </span>

                            {/* Three-dot menu */}
                            <button
                                className="absolute top-2 right-2 bg-transparent p-1 rounded-full hover:bg-gray-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenu(openMenu === itemName ? null : itemName);
                                }}
                            >
                                <FaEllipsisV className="cursor-pointer text-gray-500 hover:text-blue-600" />
                            </button>

                            {/* Dropdown Menu - Keep your existing menu code */}
                            <div
                                ref={menuRef}
                                className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg w-36 z-10 overflow-hidden transition-all shadow-lg"
                                style={{
                                    maxHeight: openMenu === itemName ? "300px" : "0",
                                    opacity: openMenu === itemName ? "1" : "0",
                                    transition: "max-height 0.3s ease, opacity 0.3s ease"
                                }}
                            >

                                {/* Edit Option */}
                                <div className="p-2 font-semibold hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        const newFolderName = prompt(`Rename folder "${itemName}" to:`);
                                        if (newFolderName && newFolderName.trim() !== "") {
                                            const folderId = item._id; // Get folder ID
                                            updateFolder(folderId, newFolderName, itemName); // Pass both the new name and the old folder name
                                        } else {
                                            toast.error("Invalid folder name");
                                        }
                                    }}
                                >
                                    Edit
                                </div>

                                <div
                                    className="p-2 font-semibold text-red-500 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => deleteItem(itemName)}
                                >
                                    Delete
                                </div>

                                <div
                                    className="p-2 font-semibold hover:bg-gray-100 cursor-pointer"
                                    onClick={() => copyItem(itemName)}
                                >
                                    Copy
                                </div>
                                {clipboard && clipboard.name && (
                                    <div
                                        className="p-2 font-semibold hover:bg-gray-100 cursor-pointer"
                                        onClick={() => pasteItem()}
                                    >
                                        Paste
                                    </div>
                                )}
                                <div
                                    className="p-2 font-semibold hover:bg-gray-100 cursor-pointer"
                                // onClick={() => copyItem(item)}
                                >
                                    Share
                                </div>
                                <div
                                    className="p-2 font-semibold hover:bg-gray-100 cursor-pointer"
                                // onClick={() => copyItem(item)}
                                >
                                    Archive
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
                    <div className="bg-white rounded-xl w-11/12 max-w-6xl h-5/6 shadow-2xl flex flex-col">
                        {/* Header */}
                        <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-medium text-lg text-gray-800 truncate max-w-[80%]">
                                {selectedFileUrl && formatFileName(Object.keys(currentFolderContent).find(key =>
                                    currentFolderContent[key].fileUrl === selectedFileUrl ||
                                    `${process.env.NEXT_PUBLIC_API_URL}/api/leads/docs/${currentFolderContent[key]._id}` === selectedFileUrl
                                ) || '')}
                            </h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.open(selectedFileUrl, '_blank')}
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                    title="Download"
                                >
                                    <i className="ri-download-line text-xl"></i>
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-600 hover:text-red-600 transition-colors"
                                    title="Close"
                                >
                                    <i className="ri-close-line text-xl"></i>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow overflow-auto bg-gray-50 p-0">
                            {selectedFileType?.startsWith('image/') ? (
                                /* image preview as you already have */
                                <div className="w-full h-full flex items-center justify-center bg-white">
                                    <img src={selectedFileUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                                </div>
                            ) : selectedFileType === 'application/pdf' ? (
                                /* PDF preview */
                                <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedFileUrl)}&embedded=true`}
                                    className="w-full h-full border-0"
                                    title="PDF Viewer"
                                />
                            ) : selectedFileType === 'text/html' ? (
                                /* HTML preview */
                                <iframe
                                    src={selectedFileUrl}
                                    className="w-full h-full border-0"
                                    title="HTML Document"
                                    sandbox="allow-same-origin allow-scripts"
                                />
                            ) : (
                                /* Office docs (Word, Excel, PowerPoint) */
                                <iframe
                                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedFileUrl)}`}
                                    classN ame="w-full h-full border-0"
                                    title="Office Document Viewer"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;
