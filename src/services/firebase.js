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

export default {
  auth,
	loginWithGoogle: async () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		return await auth.signInWithPopup(provider);
	},
	createUser: async user => {
		await db.collection("users").doc(user.id).set({
      name: user.name,
      avatar: user.avatar
    }, { merge: true });
	},
  getContactList: async (userId) => {
    let list = [];

    let res = await db.collection('users').get();

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
    let newChat = await db.collection('chats').add({
      messages: [],
      users: [user.id, secondPerson.id]
    });

    db.collection('users').doc(user.id).update({
      chats: firebase.firestore.FieldValue.arrayUnion({
        chatId: newChat.id,
        name: secondPerson.name,
        avatar: secondPerson.avatar,
        with: secondPerson.id
      })
    });

    db.collection('users').doc(secondPerson.id).update({
      chats: firebase.firestore.FieldValue.arrayUnion({
        chatId: newChat.id,
        name: user.name,
        avatar: user.avatar,
        with: user.id
      })
    });
  },
  onChatList: (userId, setChatList) => {
    return db.collection('users').doc(userId).onSnapshot(query => {
      if (query.exists) {
        let data = query.data();

        if (data.chats) {

          let chats = [...data.chats];
          chats.sort((a, b) => {
            if (!a.lastMessageDate || !b.lastMessageDate) {
              return -1;
            }
            
            return (a.lastMessageDate.seconds < b.lastMessageDate.seconds) ? 1 : -1;
          });

          setChatList(chats);
        }
      }
    });
  },
  onChatContent: (chatId, setMessageList, setUsers) => {
    return db.collection('chats').doc(chatId).onSnapshot(query => {
      if (query.exists) {
        let data = query.data();
        setMessageList(data.messages);
        setUsers(data.users);
      }
    });
  },
  sendMessage: async (chatData, userId, type, body, users) => {
    const now = new Date();
    db.collection('chats').doc(chatData.chatId).update({
      messages: firebase.firestore.FieldValue.arrayUnion({
        type,
        authorId: userId,
        body,
        date: now
      })
    });

    users.forEach(async (item) => {
      let user = await db.collection('users').doc(item).get();
      let userData = user.data();

      if (userData.chats) {
        let chats = [...userData.chats];

        chats.forEach(chat => {
          if (chat.chatId === chatData.chatId) {
            chat.lastMessage = body;
            chat.lastMessageDate = now;
          }
        });

        await db.collection('users').doc(item).update({
          chats
        });
      }
    });
  }
};
