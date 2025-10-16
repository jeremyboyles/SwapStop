import React, { useState } from 'react';
import './Chat.css';


const Chat = ({ messages = [], onSendMessage }) => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '' && !image) return;
    if (onSendMessage) {
      onSendMessage({ text: input, image });
    }
    setInput('');
    setImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              'chat-message' + (msg.sender === 'You' ? ' chat-message-user' : '')
            }
          >
            <strong>{msg.sender}: </strong>{msg.text}
            {msg.image && (
              <div style={{ marginTop: 6 }}>
                <img src={msg.image} alt="chat upload" style={{ maxWidth: 180, maxHeight: 120, borderRadius: 6 }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="chat-image-upload"
          onChange={handleImageChange}
        />
        <label htmlFor="chat-image-upload" className="btn outline" style={{ marginRight: 8, cursor: 'pointer' }}>
          📷
        </label>
        <button type="submit">Send</button>
      </form>
      {image && (
        <div style={{ margin: '8px 0 0 0', textAlign: 'right' }}>
          <img src={image} alt="preview" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 4 }} />
          <button className="btn outline" style={{ marginLeft: 8 }} onClick={() => setImage(null)} type="button">Remove</button>
        </div>
      )}
    </div>
  );
};

export default Chat;
