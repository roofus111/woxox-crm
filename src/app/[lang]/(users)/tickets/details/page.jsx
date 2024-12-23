"use client";

import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

export default function TicketDetails() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState([
    {
      file: new File([], "example1.pdf", { type: "application/pdf" }),
      preview: "", // Initially empty
    },
    {
      file: new File([], "example2.pdf", { type: "application/pdf" }),
      preview: "", // Initially empty
    },
    {
        file: new File([], "example3.pdf", { type: "application/pdf" }),
        preview: "", // Initially empty
      },
  ]);

  const handleFileDownload = (file) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileDelete = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleAddNote = () => {
    alert(`Note added: ${note}`);
    setNote("");
    setIsModalOpen(false);
  };

  const loadPDFPreview = async (file, index) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const pdfData = new Uint8Array(fileReader.result);
      const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
      const page = await pdfDoc.getPage(1); // Get the first page
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 0.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
      const previewUrl = canvas.toDataURL();
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index].preview = previewUrl;
        return updatedFiles;
      });
    };
    fileReader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    files.forEach((file, index) => {
      if (!file.preview && file.file.type === "application/pdf") {
        loadPDFPreview(file.file, index);
      }
    });
  }, [files]);

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+123456789",
    profilePic: "",
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 min-h-screen p-8 gap-8">
      {/* Left Section */}
      <div className="flex-1 bg-white rounded-3xl p-8 space-y-8 border border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">#Ticket Number</h1>
          <span className="px-4 py-1 bg-gray-500 text-white rounded-full text-sm font-semibold">
            High Priority
          </span>
        </div>
        <p className="text-gray-600 text-sm">Issue Category / Subcategory</p>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Subject</h2>
          <p className="mt-4 p-6 bg-gray-100 rounded-lg text-gray-700">
            This is the detailed description of the issue. You can provide
            additional context or information about the ticket here.
          </p>
        </div>

        {/* PDF Previews */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Files</h2>
          <div className="grid grid-cols-3 gap-4">
            {files.map((fileObj, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center bg-white rounded-lg p-2 w-24 hover:shadow-lg transition-all"
              >
                {/* PDF Preview */}
                <div className="w-16 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md flex items-center justify-center">
                  {fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt="PDF Preview"
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

                {/* File Name */}
                <p className="mt-2 text-sm text-gray-800 font-medium truncate">
                  {fileObj.file.name}
                </p>

                {/* Buttons */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    className="bg-green-100 text-green-600 p-2 rounded-full cursor-pointer hover:bg-green-200 transition-all"
                    onClick={() => handleFileDownload(fileObj.file)}
                    title="Download"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 11.25L12 15.75m0 0l4.5-4.5M12 15.75V3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Note Section */}
        <div>
          <button
            className="mt-4  bg-blue-500 text-white py-2 px-6 cursor-pointer rounded-lg hover:shadow-lg transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            Add Note
          </button>
        </div>

        {/* Notes Section */}
        <div className="space-y-4">
        {/* Sender's message (You) */}
        <div className="flex justify-end">
            <div className="relative w-[80%] p-4 bg-blue-100 rounded-lg">
            <h3 className="text-sm text-blue-800 font-semibold">You</h3>
            <p className="text-gray-700">This is an example note.</p>
            <span className="text-xs text-gray-500">12:30 PM</span>
            {/* Curved Tail Arrow for Sender */}
            <div className="absolute right-[-10px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-l-8 border-transparent border-t-blue-100 border-l-blue-100"></div>
            </div>
        </div>

        {/* Receiver's message (Author) */}
        <div className="flex justify-start">
            <div className="relative w-[80%] p-4 bg-yellow-100 rounded-lg">
            <h3 className="text-sm text-yellow-800 font-semibold">Author</h3>
            <p className="text-gray-700">This is another example note.</p>
            <span className="text-xs text-gray-500">12:31 PM</span>
            {/* Curved Tail Arrow for Receiver */}
            <div className="absolute left-[-10px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-r-8 border-transparent border-t-yellow-100 border-r-yellow-100"></div>
            </div>
        </div>
        </div>
        </div>


      {/* Right Section: User Profile */}
      <div className="w-full lg:w-1/3 bg-white rounded-3xl border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-800">User Profile</h2>
        <div className="mt-6 w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-pink-400 to-red-500 flex items-center justify-center text-white text-2xl font-semibold">
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt={`${user.name}'s Profile`}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="mt-6 space-y-4 text-center">
          <p className="text-gray-700">
            <strong className="font-semibold">Name:</strong> {user.name}
          </p>
          <p className="text-gray-700">
            <strong className="font-semibold">Email:</strong> {user.email}
          </p>
          <p className="text-gray-700">
            <strong className="font-semibold">Phone:</strong> {user.phone}
          </p>
        </div>
      </div>

      {/* Modal for Adding Notes */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-96">
            <h2 className="text-lg font-bold text-gray-800">Add a Note</h2>
            <textarea
              className="w-full p-4 mt-4 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-400 text-gray-700"
              placeholder="Write your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="bg-gray-200 text-gray-800 py-2 px-6 cursor-pointer rounded-lg hover:bg-gray-300"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white py-2 px-6 rounded-lg cursor-pointer hover:bg-blue-600"
                onClick={handleAddNote}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
