import { useEffect } from "react";
import { useState } from "react";
import "./styles.css";

export default function ChatListItem({ onClick, active, chat }) {
	
  const [time, setTime] = useState('');
  
  useEffect(() => {

    if (chat.lastMessageDate && chat.lastMessageDate.seconds > 0) {
      const date = new Date(chat.lastMessageDate.seconds * 1000);
      const hour = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      setTime(`${hour}:${minutes}`);
    }

  }, [chat]);

  return (
    <div 
      className={`chatListItem ${active ? 'active' : ''}`}
      onClick={onClick}
    >

      <img className="chatListItem--avatar" src={chat.avatar} alt="" />
      <div className="chatListItem--lines">

        <div className="chatListItem--line">
          <div className="chatListItem--name">
            {
              chat.name
            }
          </div>
          <div className="chatListItem--date">
            {
              time
            }
          </div>
        </div>

        <div className="chatListItem--line">
          <div className="chatListItem--last-message">
            <p>
              {
                chat.lastMessage
              }
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
