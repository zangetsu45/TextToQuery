import React from "react";
import "./ChatInput.css";

const ChatInput = ({ input, setInput, handleSend }) => {
  return (
    <div className="chat-input-container">
      <input
        type="text"
        placeholder="Type your query..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="chat-input"
      />
      <button onClick={handleSend} className="send-button">
        Send
      </button>
    </div>
  );
};

export default ChatInput;
