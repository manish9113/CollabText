import React, { useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Stylesheet for Quill's "snow" theme
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

// Toolbar configuration for Quill
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // Text formatting
  ["blockquote", "code-block"], // Block-level formatting
  ["link", "image", "video", "formula"], // Media and formulas

  [{ header: 1 }, { header: 2 }], // Headers
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }], // Lists
  [{ script: "sub" }, { script: "super" }], // Subscript/superscript
  [{ indent: "-1" }, { indent: "+1" }], // Indentation
  [{ direction: "rtl" }], // Text direction

  [{ size: ["small", false, "large", "huge"] }], // Font sizes
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // Header levels

  [{ color: [] }, { background: [] }], // Text and background colors
  [{ font: [] }], // Font families
  [{ align: [] }], // Text alignment

  ["clean"], // Remove formatting
];

function Editor() {
  const [socket, setSocket] = useState(null); // State to manage the WebSocket connection
  const [quill, setQuill] = useState(null); // State to manage the Quill editor instance
  const {id} = useParams();
  // Initialize Quill editor
  useEffect(() => {
    const quillInstance = new Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions, // Use the custom toolbar
      },
    });
     quillInstance.disable();
     quillInstance.setText("Loading the document...");
    setQuill(quillInstance); // Save the Quill instance in state

    return () => {
      quillInstance.off("text-change"); // Cleanup listeners when component unmounts
    };
  }, []);

  // Connect to Socket.IO server
  useEffect(() => {
    const socketInstance = io("http://localhost:9000"); // Connect to server at localhost:9000
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect(); // Disconnect the socket when component unmounts
    };
  }, []);

  // Send text changes to the server
  useEffect(() => {
    if (socket === null || quill === null) return; // Ensure both socket and quill are ready

    const handleTextChange = (delta, oldDelta, source) => {
      if (source !== "user") return; // Ignore changes that aren't from the user
      socket.emit("send-changes", delta); // Send changes to the server
    };

    quill.on("text-change", handleTextChange); // Listen for text changes

    return () => {
      quill.off("text-change", handleTextChange); // Cleanup listener on unmount
    };
  }, [quill, socket]);

  // Receive text changes from the server
  useEffect(() => {
    if (socket === null || quill === null) return; // Ensure both socket and quill are ready

    const handleReceiveChanges = (delta) => {
      quill.updateContents(delta); // Apply changes to the editor
    };

    socket.on("receive-changes", handleReceiveChanges); // Listen for changes from the server

    return () => {
      socket.off("receive-changes", handleReceiveChanges); // Cleanup listener on unmount
    };
  }, [quill, socket]);


   useEffect(() => {
     if (socket === null || quill === null) return;

     const interval = setInterval(() => {
       socket.emit("save-document", quill.getContents());
     }, 2000);

     return () => {
       clearInterval(interval);
     };
   }, [socket, quill]);

    useEffect(() => {
      if (quill === null || socket === null) return;

      
        socket.once("load-document", (document) => {
          quill.setContents(document);
          quill.enable();
        });

        socket.emit("get-document", id);
    }, [quill, socket, id]);

  // Render the editor container
  return (
    <div
      className="container"
      id="editor"
      style={{
        height: "300px",
        border: "1px solid #ccc",
        marginTop: "20px",
        padding: "10px",
      }}
    />
  );
}

export default Editor;
