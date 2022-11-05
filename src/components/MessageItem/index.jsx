import { useEffect, useState } from 'react';
import './styles.css'

export default function MessageItem ({ message, user }) {
  const [time, setTime] = useState('');
  
  useEffect(() => {

    if (message.date && message.date.seconds > 0) {
      const date = new Date(message.date.seconds * 1000);
      const hour = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      setTime(`${hour}:${minutes}`);
    }

  }, [message]);

  return (
    <div className="messageLine" style={{ justifyContent: message.authorId === user.id ? "flex-end" : "flex-start" }}>
      <div className="messageItem" style={{ backgroundColor: message.authorId === user.id ? '#DCF8C6' : '#FFF' }}>
        <div className="messageText">
          {
            message.body
          }
        </div>
        <div className="messageHour">
          {
            time
          }
        </div>
      </div>
    </div>
  );
}