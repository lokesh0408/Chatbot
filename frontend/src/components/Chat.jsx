import React, { useState, useEffect } from "react";
import axios from "axios";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch previous chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/messages");
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, []);

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/chat", {
        user_message: userMessage,
      });

      setMessages((prevMessages) => [
        { user_message: userMessage, bot_response: response.data.bot_response },
        ...prevMessages,
      ]);

      setUserMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h1>Chatbot</h1>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "1rem",
          marginBottom: "1rem",
          height: "400px",
          overflowY: "scroll",
        }}
      >
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <p>
              <strong>You:</strong> {message.user_message}
            </p>
            <p>
              <strong>Bot:</strong> {message.bot_response}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            width: "80%",
            padding: "0.5rem",
            marginRight: "1rem",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            border: "none",
            backgroundColor: loading ? "#ccc" : "#007BFF",
            color: "white",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chat;
