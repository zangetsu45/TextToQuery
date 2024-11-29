import React from "react";
import "./ChatBox.css";

const generateCSV = (message) => {
  if (!message.results || message.results.length === 0) {
    alert("No data to download!");
    return;
  }
  const headers = Object.keys(message.results[0]);
  const rows = message.results.map((row) =>
    headers.map((header) => `"${row[header] || ""}"`).join(",")
  );
  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "table_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ChatBox = ({ messages }) => {
  return (
    <div className="chat-box">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`chat-message ${
            message.sender === "user" ? "user-message" : "bot-message"
          }`}
        >
          {message.isTable ? (
            <div>
              <div
                dangerouslySetInnerHTML={{ __html: message.text }}
              ></div>
              <button
                className="download-button"
                onClick={() => generateCSV(message)} 
              >
                Download
              </button>
            </div>
          ) : (
            <span>{message.text}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatBox;
