import { useState, useRef, useEffect } from "react";
import "../App.css";


export default function Chat() {
  const [messages, setMessages] = useState([
    { user: "System", text: "Welcome to SwapStop Chat!", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() && !image) return;
    setMessages((msgs) => [
      ...msgs,
      {
        user: "You",
        text: input.trim(),
        image: image || null,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setImage(null);
  }

  return (
    <section className="card" style={{ maxWidth: 400, margin: "32px auto" }}>
      <h2>Chat</h2>
      <div
        style={{
          background: "#0b1220",
          border: "1px solid #1f2937",
          borderRadius: 12,
          height: 240,
          overflowY: "auto",
          padding: 12,
          marginBottom: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {messages.map((msg, i) => {
          const isUser = msg.user === "You";
          const isSystem = msg.user === "System";
          // Format timestamp as HH:MM
          let time = "";
          if (msg.timestamp) {
            const d = new Date(msg.timestamp);
            const h = d.getHours().toString().padStart(2, "0");
            const m = d.getMinutes().toString().padStart(2, "0");
            time = `${h}:${m}`;
          }
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginBottom: 2,
                  marginRight: isUser ? 6 : 0,
                  marginLeft: isUser ? 0 : 6,
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  fontWeight: 600,
                }}
              >
                {isSystem ? "System" : msg.user}
                {time && (
                  <span style={{ marginLeft: 8, fontWeight: 400, opacity: 0.6 }}>
                    {time}
                  </span>
                )}
              </span>
              <div
                style={{
                  background: isSystem
                    ? "#334155"
                    : isUser
                    ? "#22c55e"
                    : "#1e293b",
                  color: isUser ? "#101828" : "#e5e7eb",
                  borderRadius: 16,
                  padding: "8px 14px",
                  maxWidth: "70%",
                  fontWeight: isSystem ? 600 : 400,
                  fontSize: 15,
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  boxShadow: isSystem ? "none" : "0 2px 8px rgba(0,0,0,0.10)",
                  marginBottom: msg.image ? 6 : 0,
                }}
              >
                {msg.text}
                {msg.image && (
                  <div style={{ marginTop: msg.text ? 8 : 0, display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                    <img
                      src={msg.image}
                      alt="chat upload"
                      style={{
                        display: "block",
                        maxWidth: 100,
                        maxHeight: 80,
                        borderRadius: 8,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                        objectFit: "cover",
                        cursor: "pointer",
                        transition: "box-shadow 0.2s",
                      }}
                      onClick={() => setExpandedImage(msg.image)}
                      title="Click to expand"
                    />
                  </div>
                )}
      {/* Expanded image modal */}
      {expandedImage && (
        <div
          onClick={() => setExpandedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <img
            src={expandedImage}
            alt="expanded chat"
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: 16,
              boxShadow: "0 4px 32px rgba(0,0,0,0.35)",
              background: "#222",
            }}
          />
        </div>
      )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          className="input"
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <label style={{ cursor: "pointer", margin: 0 }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <span
            style={{
              display: "inline-block",
              background: image ? "#22c55e" : "#1e293b",
              color: image ? "#101828" : "#e5e7eb",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 14,
              marginRight: 4,
              border: image ? "1px solid #22c55e" : "1px solid #1e293b",
            }}
          >
            📷
          </span>
        </label>
        <button className="btn" type="submit">
          Send
        </button>
      </form>
      {image && (
        <div style={{ marginTop: 8, textAlign: "left", position: "relative", display: "inline-block" }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Image preview:</span>
          <button
            type="button"
            onClick={() => setImage(null)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "#1e293b",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 22,
              height: 22,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 16,
              lineHeight: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
            }}
            aria-label="Remove image"
          >
            ×
          </button>
          <img
            src={image}
            alt="preview"
            style={{
              display: "block",
              maxWidth: 100,
              maxHeight: 80,
              borderRadius: 8,
              marginTop: 4,
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
            }}
          />
        </div>
      )}
    </section>
  );
}
