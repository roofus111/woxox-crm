"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from 'next-auth/react';  // Importing useSession hook
import { useSearchParams } from "next/navigation";

function formatTimeToHHMM(time) {
  const date = new Date(time);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

export default function TicketDetails() {
  const [ticketData, setTicketData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const { data: session } = useSession();
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState([]);
  
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("ticketId");

  // Console log the session and current user
  console.log("Session Data:", session);
  const currentUser = session?.user?.id;
  console.log("Current User ID:", currentUser);

  useEffect(() => {
    if (!ticketId) return;

    const fetchTicketData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(
          `${apiUrl}/api/ticket/gettickets/${ticketId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data) {
          setTicketData(response.data);
          setNotes(response.data.notes || []);
          setFiles(response.data.issue_details.attachments || []);
        }
      } catch (error) {
        console.error("Error fetching ticket data:", error);
      }
    };

    fetchTicketData();
  }, [ticketId]);

  const handleAddNote = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(
        `${apiUrl}/api/ticket/createnotes`,
        {
          ticketId,
          author: currentUser,
          content: note,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        // alert("Note successfully added!");
        setNote("");
        setIsModalOpen(false);
        setNotes((prevNotes) => [
          ...prevNotes,
          {
            author: currentUser,
            content: note,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        alert("Failed to add the note. Please try again.");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      alert("An error occurred while adding the note.");
    }
  };

  const handleFileDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    files.forEach(async (file, index) => {
      if (!file.preview && file.fileType.startsWith("image/")) {
        await loadImagePreview(file, index);
      }
    });
  }, [files]);

  const loadImagePreview = async (file, index) => {
    let blob = file;
    if (typeof file.fileUrl === "string") {
      const response = await fetch(file.fileUrl);
      blob = await response.blob();
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      files[index].preview = e.target.result;
      setFiles([...files]);
    };
    reader.readAsDataURL(blob);
  };

  if (!ticketData) {
    return <div>Loading...</div>;
  }

  function truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;
    const extIndex = name.lastIndexOf(".");
    const extension = extIndex !== -1 ? name.slice(extIndex) : "";
    const baseName = extIndex !== -1 ? name.slice(0, extIndex) : name;
    return `${baseName.slice(0, maxLength - extension.length - 3)}...${extension}`;
  }

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen p-8 gap-8">
      {/* Left Section */}
      <div className="flex-1 bg-white rounded-3xl p-8 space-y-8 border border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{ticketData.ticket_id}</h1>
          <span className="px-4 py-1 bg-gray-500 text-white rounded-full text-sm font-semibold">
            {ticketData.issue_details?.status}
          </span>
        </div>
        <p className="text-gray-600 text-sm">
          {ticketData.issue_details?.category} / {ticketData.issue_details?.sub_category}
        </p>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Subject</h2>
          <p className="mt-4 p-6 bg-gray-100 rounded-lg text-gray-700">
            {ticketData.issue_details?.subject}
          </p>
        </div>

        {/* Uploaded Files */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Files</h2>
          <div className="grid grid-cols-3 gap-4">
            {files.map((fileObj, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center bg-white rounded-lg p-2 w-24 hover:shadow-lg transition-all"
              >
                <div className="w-16 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md flex items-center justify-center">
                  {fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt="File Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8 text-gray-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m-3-12v12m8 4H6a2 2 0 01-2-2V4a2 2 0 012-2h7.5a2 2 0 011.5.586l4.5 4.5A2 2 0 0121 8.5V18a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-800 font-medium truncate">
                  {truncateFileName(fileObj.fileName, 15)}
                </p>
                <button
                  className="bg-green-100 text-green-600 p-2 rounded-full cursor-pointer hover:bg-green-200 transition-all"
                  onClick={() => handleFileDownload(fileObj.fileUrl, fileObj.fileName)}
                  title="Download"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Note Button */}
        <button
          className="mt-4 bg-blue-500 text-white py-2 px-6 cursor-pointer rounded-lg hover:shadow-lg transition-all"
          onClick={() => setIsModalOpen(true)}
        >
          Add Note
        </button>

        {/* Notes Section */}
        <div className="space-y-4">
          {notes.map((noteItem, index) => {
            const isUserNote = noteItem.author === currentUser;
            return (
              <div key={index} className={`flex ${isUserNote ? "justify-end" : "justify-start"}`}>
                <div
                  className={`relative w-[80%] p-4 rounded-lg ${
                    isUserNote ? "bg-blue-100" : "bg-yellow-100"
                  }`}
                >
                  <h3
                    className={`text-sm font-semibold ${
                      isUserNote ? "text-blue-800" : "text-yellow-800"
                    }`}
                  >
                    {noteItem.author}
                  </h3>
                  <p className="text-gray-700">{noteItem.content}</p>
                  <span className="text-xs text-gray-500">
                    {formatTimeToHHMM(noteItem.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Section: User Profile */}
        {/* Right Section: User Profile */}
        <div className="w-full lg:w-1/3 bg-white rounded-3xl border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-800">User Profile</h2>
        <div className="mt-6 w-32 h-32 mx-auto rounded-full overflow-hidden">
          {ticketData.customer?.profilePicture ? (
            <img
              src={ticketData.customer.profilePicture}
              alt="User Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-pink-400 to-red-500 flex items-center justify-center text-white text-2xl font-semibold">
              {ticketData.customer?.firstName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="mt-6 space-y-4 text-center">
          <p className="text-gray-700">
            <strong className="font-semibold">Name:</strong> {ticketData.customer?.firstName}
          </p>
          <p className="text-gray-700">
            <strong className="font-semibold">Email:</strong> {ticketData.customer?.email}
          </p>
          <p className="text-gray-700">
            <strong className="font-semibold">Phone:</strong> {ticketData.customer?.phone}
          </p>
        </div>
      </div>

      {/* Modal for Adding Notes */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-96">
            <h2 className="text-lg font-bold text-gray-800">Add a Note</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full mt-4 p-2 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Write your note here"
            />
            <div className="mt-4 flex justify-end space-x-4">
              <button
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded-lg cursor-pointer"
                onClick={handleAddNote}
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
