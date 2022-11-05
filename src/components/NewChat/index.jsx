import { ArrowBack } from '@material-ui/icons';
import './styles.css';
import { useState } from 'react';
import { useEffect } from 'react';
import firebase from '../../services/firebase';

export default function NewChat ({ user, chatList, show, setShowNewChat }) {

  const [list, setList] = useState([]);
  
  useEffect(() => {
    const getList = async () => {
      if (user) {
        let results = await firebase.getContactList(user.id);
        setList(results);
      }
    }

    getList();

  }, [user]);

  const addNewChat = async (secondPerson) => {
    await firebase.addNewChat(user, secondPerson);

    setShowNewChat(false);
  }

  return (
    <div className="newChat" style={{ left: show ? '0' : '-100%' }}>
      <div className="newChat--head">
        <div className="newChat--back-button" onClick={() => setShowNewChat(false)}>
          <ArrowBack style={{ color: "#FFF" }} />
        </div>
        <div className="newChat--head-title">
          Nova conversa
        </div>
      </div>
      <div className="newChat--list">
        {
          list.length > 0 && list.map((chat, key) => (
            <div className="newChat--item" key={key} onClick={() => addNewChat(chat)}>
              <img src={chat.avatar} alt="" className="newChat--item-avatar" />
              <div className="newChat--item-name">{chat.name}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}