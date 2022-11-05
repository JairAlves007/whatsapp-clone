import {
	Search,
	AttachFile,
	MoreVert,
	InsertEmoticon,
	Close,
	Send,
	Mic
} from "@material-ui/icons";
import EmojiPicker from "emoji-picker-react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import MessageItem from "../MessageItem";
import firebase from '../../services/firebase';
import "./styles.css";

export default function ChatWindow({ activeChat, user }) {
	const [messageList, setMessageList] = useState([]);
	const [users, setUsers] = useState([]);
	const [message, setMessage] = useState("");
	const [emojiOpen, setEmojiOpen] = useState(false);
	const [listening, setListening] = useState(false);

  const body = useRef();
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;

  useEffect(() => {

    setMessageList([]);
    let unsubscribe = firebase.onChatContent(activeChat.chatId, setMessageList, setUsers);
    return unsubscribe;

  }, [activeChat.chatId]);

  useEffect(() => {

    if (body.current.scrollHeight > body.current.offsetHeight) {
      body.current.scrollTop = body.current.scrollHeight - body.current.offsetHeight;
    }

  }, [messageList]);
  
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
  }

	function handleEmojiClick({ emoji }) {
		setMessage(message + emoji);
	}

	function handleSendMessage(event) {
		event.preventDefault();

		if (message.trim().length > 0) {
      firebase.sendMessage(activeChat, user.id, 'text', message, users);
			setMessage("");
      setEmojiOpen(false);
		}
	}

  function handleMicClick () {
    if (recognition) {
      recognition.onstart = () => setListening(true);

      recognition.onend = () => setListening(false);

      recognition.onresult = event => {
        setMessage(event.results[0][0].transcript);
      }

      recognition.start();
    }
  }

	return (
		<div className="chatWindow">
			<div className="chatWindow--header">
				<div className="chatWindow--header-info">
					<img
						className="chatWindow--avatar"
						src={activeChat.avatar}
						alt=""
					/>
					<div className="chatWindow--name">{activeChat.name}</div>
				</div>

				<div className="chatWindow--header-buttons">
					<div className="chatWindow--btn">
						<Search style={{ color: "#919191" }} />
					</div>

					<div className="chatWindow--btn">
						<MoreVert style={{ color: "#919191" }} />
					</div>
				</div>
			</div>

			<div ref={body} className="chatWindow--body">

        {
          messageList.map((message, key) => (
            <MessageItem 
              user={user}
              key={key}
              message={message}
            />
          ))
        }

      </div>

			<div
				className="chatWindow--emoji-area"
				style={{ height: emojiOpen ? "50%" : "0px" }}
			>
				<EmojiPicker
					onEmojiClick={handleEmojiClick}
					searchDisabled
					skinTonesDisabled
				/>
			</div>

			<div className="chatWindow--footer">
				<div className="chatWindow--left">
					<div
						className="chatWindow--btn"
						style={{ width: emojiOpen ? "40px" : "0px" }}
						onClick={() => setEmojiOpen(false)}
					>
						<Close style={{ color: "#919191" }} />
					</div>

					<div className="chatWindow--btn" onClick={() => setEmojiOpen(true)}>
						<InsertEmoticon
							style={{ color: emojiOpen ? "#009688" : "#919191" }}
						/>
					</div>

					<div className="chatWindow--btn">
						<AttachFile style={{ color: "#919191" }} />
					</div>
				</div>

				<div className="chatWindow--message-text">
					<form onSubmit={handleSendMessage}>
						<input
							type="text"
							placeholder="Mensagem"
							value={message}
							onChange={e => setMessage(e.target.value)}
						/>
					</form>
				</div>

				<div className="chatWindow--right">
					<div
						className="chatWindow--btn"
						style={{ display: message.trim().length > 0 ? "flex" : "none" }}
						onClick={handleSendMessage}
					>
						<Send style={{ color: "#919191" }} />
					</div>

					<div
						className="chatWindow--btn"
						style={{ display: message.trim().length > 0 ? "none" : "flex" }}
            onClick={handleMicClick}
					>
						<Mic style={{ color: listening ? "#126ECE" : "#919191" }} />
					</div>
				</div>
			</div>
		</div>
	);
}
