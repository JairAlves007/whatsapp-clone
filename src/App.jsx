import { Chat, MoreVert, Search, Menu } from "@material-ui/icons";
import { useEffect, useState } from "react";
import "./App.css";
import ChatIntro from "./components/ChatIntro";
import ChatListItem from "./components/ChatListItem";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import NewChat from "./components/NewChat";
import SubMenu from "./components/SubMenu";
import firebase from "./services/firebase";

export default function App() {
	const [user, setUser] = useState(null);
	const [chatList, setChatList] = useState([]);
	const [activeChat, setActiveChat] = useState({});
	const [showNewChat, setShowNewChat] = useState(false);
	const [showSubMenu, setShowSubMenu] = useState(false);
	const [hideSideBar, setHideSideBar] = useState(false);
	const [notificationIsGranted, setNotificationIsGranted] = useState(false);

	const handleNewUser = async user => {
		let newUser = {
			id: user.uid,
			name: user.displayName,
			avatar: user.photoURL
		};

		await firebase.createUser(newUser);
		setUser(newUser);
	};

	useEffect(() => {
		firebase.auth.onAuthStateChanged(userGoogle => {
			if (userGoogle) {
				let newUserGoogle = {
					id: userGoogle.uid,
					name: userGoogle.displayName,
					avatar: userGoogle.photoURL
				};

				setUser(newUserGoogle);
			}
		});
	}, []);

	useEffect(() => {
		if ("Notification" in window) {
			Notification.requestPermission().then(notification => {
				setNotificationIsGranted(notification === "granted");
			});
		}
	});

	useEffect(() => {
		if (user) {
			let unsubscribe = firebase.onChatList(user.id, setChatList);

			if (notificationIsGranted) {
				let notification = firebase.receiveNotification(user.id);
			}

			return () => {
				unsubscribe();

				if (notificationIsGranted) {
					notification();
				}
			};
		}
	}, [user, notificationIsGranted]);

	if (!user) {
		return <Login onReceive={handleNewUser} />;
	}

	return (
		<div className="app-window">
			<div
				className="header--btn menu"
				onClick={() => setHideSideBar(!hideSideBar)}
			>
				<Menu style={{ color: "#919191" }} />
			</div>
			<div className={`sidebar ${hideSideBar ? "hide" : ""}`}>
				<NewChat
					chatList={chatList}
					user={user}
					show={showNewChat}
					setShowNewChat={setShowNewChat}
				/>
				<SubMenu show={showSubMenu} setUser={setUser} />
				<header>
					<div className="header--user-infos">
						<img className="header--avatar" src={user?.avatar} alt="" />
						<div className="header--user-name">{user?.name}</div>
					</div>

					<div className="header--buttons">
						<div className="header--btn" onClick={() => setShowNewChat(true)}>
							<Chat style={{ color: "#919191" }} />
						</div>

						<div
							className="header--btn"
							onClick={() => setShowSubMenu(!showSubMenu)}
						>
							<MoreVert style={{ color: "#919191" }} />
						</div>
					</div>
				</header>

				<div className="search">
					<div className="search--input">
						<Search fontSize="small" style={{ color: "#919191" }} />
						<input
							type="search"
							placeholder="Procurar ou iniciar uma nova conversa..."
						/>
					</div>
				</div>

				<div className="chat-list">
					{chatList.map((chat, key) => (
						<ChatListItem
							key={key}
							chat={chat}
							active={activeChat.chatId === chat.chatId}
							onClick={() => {
								setActiveChat(chat);
								setHideSideBar(true);
							}}
						/>
					))}
				</div>
			</div>

			<div className="content-area">
				{activeChat.chatId ? (
					<ChatWindow
						activeChat={activeChat}
						user={user}
						notificationIsGranted={notificationIsGranted}
					/>
				) : (
					<ChatIntro />
				)}
			</div>
		</div>
	);
}
