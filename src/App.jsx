import { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState([]);
  const chatBoxRef = useRef(null);

  
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [conversation]);

  async function sendMessage() {
    if (!question.trim()) return;

    const userMessage = { sender: "User", text: question };
    setConversation((prev) => [...prev, userMessage]);
    setQuestion("");

    const botMessage = { sender: "Bot", text: "Thinking...", floating: true, imageUrl: "public/image.png" };
    setConversation((prev) => [...prev, botMessage]);

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`,
        method: "post",
        data: {
          contents: [
            { parts: [{ text: userMessage.text }] },
          ],
        },
      });
      
      const botReply =
        response.data.candidates[0]?.content?.parts[0]?.text || "Sorry, I couldn't respond.";
      
      simulateTyping(botReply);
    } catch (error) {
      setConversation((prev) => [
        ...prev.slice(0, prev.length - 1),
        { sender: "Bot", text: "An error occurred. Please try again." },
      ]);
      console.error(error);
    }
  }

  function simulateTyping(text) {
    let index = 0;
    const typingSpeed = 20; 

    const intervalId = setInterval(() => {
      setConversation((prev) => [
        ...prev.slice(0, prev.length - 1),
        { sender: "Bot", text: text.slice(0, index + 1) },
      ]);
      index++;

      if (index === text.length) {
        clearInterval(intervalId);
      }
    }, typingSpeed);
  }

  return (
    <div className="app">
      <header>
        <div className="logo-header">
          <img src="public/image.png" alt="logo" className="logo" />
          <h1> Chatbot</h1>
        </div>
      </header>
      <main>
        <div className="chatbox" ref={chatBoxRef}>
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === "User" ? "user" : "bot"} ${msg.floating ? "floating" : ""}`}
            >
              {msg.imageUrl && <img src={msg.imageUrl} alt="thinking" />}
              <p className="para">
                {msg.text}
              </p>
            </div>
          ))}
        </div>
        <div className="input-section">
          <input
            type="text"
            placeholder="Type your message..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </main>
    </div>
  );
}

export default App;