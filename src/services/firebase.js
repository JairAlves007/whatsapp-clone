import firebase from "firebase";
import "firebase/firebase-auth";
import "firebase/firebase-firestore";

const firebaseConfig = {
	apiKey: import.meta.env.VITE_API_KEY,
	authDomain: import.meta.env.VITE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_APP_ID
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

const formateDate = date => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hour = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
};

export default {
	auth,
	loginWithGoogle: async () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		return await auth.signInWithPopup(provider);
	},
	createUser: async user => {
		await db.collection("users").doc(user.id).set(
			{
				name: user.name,
				avatar: user.avatar
			},
			{ merge: true }
		);
	},
	getContactList: async userId => {
		let list = [];

		let res = await db.collection("users").get();

		res.forEach(item => {
			const user = item.data();
			if (item.id !== userId) {
				list.push({
					id: item.id,
					name: user.name,
					avatar: user.avatar
				});
			}
		});

		return list;
	},
	addNewChat: async (user, secondPerson) => {
		let newChat = await db.collection("chats").add({
			messages: [],
			users: [user.id, secondPerson.id]
		});

		db.collection("users")
			.doc(user.id)
			.update({
				chats: firebase.firestore.FieldValue.arrayUnion({
					chatId: newChat.id,
					name: secondPerson.name,
					avatar: secondPerson.avatar,
					with: secondPerson.id
				})
			});

		db.collection("users")
			.doc(secondPerson.id)
			.update({
				chats: firebase.firestore.FieldValue.arrayUnion({
					chatId: newChat.id,
					name: user.name,
					avatar: user.avatar,
					with: user.id
				})
			});
	},
	onChatList: (userId, setChatList) => {
		return db
			.collection("users")
			.doc(userId)
			.onSnapshot(query => {
				if (query.exists) {
					let data = query.data();

					if (data.chats) {
						let chats = [...data.chats];
						chats.sort((a, b) => {
							if (!a.lastMessageDate || !b.lastMessageDate) {
								return -1;
							}

							return a.lastMessageDate.seconds < b.lastMessageDate.seconds
								? 1
								: -1;
						});

						setChatList(chats);
					}
				}
			});
	},
	onChatContent: (chatId, setMessageList, setUsers) => {
		return db
			.collection("chats")
			.doc(chatId)
			.onSnapshot(query => {
				if (query.exists) {
					let data = query.data();
					setMessageList(data.messages);
					setUsers(data.users);
				}
			});
	},
	sendMessage: async (chatData, userId, type, body, users) => {
		const now = new Date();
		db.collection("chats")
			.doc(chatData.chatId)
			.update({
				messages: firebase.firestore.FieldValue.arrayUnion({
					type,
					authorId: userId,
					body,
					date: now
				})
			});

		users.forEach(async item => {
			let user = await db.collection("users").doc(item).get();
			let userData = user.data();

			if (userData.chats) {
				let chats = [...userData.chats];
				chats.forEach(async chat => {
					if (chat.chatId === chatData.chatId) {
						chat.lastMessage = body;
						chat.lastMessageDate = now;

						if (item !== chatData.with) {
							const notificationsDoc = db
								.collection("notifications")
								.doc(chatData.with);
							const notificationExists = !!(
								await notificationsDoc.get()
							).data();

							const data = {
								notifications: firebase.firestore.FieldValue.arrayUnion({
									avatar: userData.avatar,
									messageSendedAt: now,
									body
								})
							};

							if (notificationExists) {
								notificationsDoc.update(data);
							} else {
								notificationsDoc.set(data);
							}
						}
					}
				});

				await db.collection("users").doc(item).update({
					chats
				});
			}
		});
	},
	receiveNotification: userId => {
		return db
			.collection("notifications")
			.doc(userId)
			.onSnapshot(notification => {
				if (notification.exists) {
					const notifications = [...notification.data().notifications];

					if (notifications.length > 0) {
						notifications.forEach(item => {
							if (item) {
								const now = formateDate(new Date());
								const messageSendedAt = formateDate(
									new Date(item.messageSendedAt.seconds * 1000 + 1000)
								);

								if (messageSendedAt >= now) {
									const audio = new Audio("/public/audios/notification.mp3");
									audio.volume = 0.5;
									audio.play();
								}
							}
						});
					}
				}
			});
	}
};
