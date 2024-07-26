import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
// import { db } from "./firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBaVYLoAtYxp0zgPd9MUILbOjGXjdVYuLY",
  authDomain: "realtime-chat-5558d.firebaseapp.com",
  projectId: "realtime-chat-5558d",
  storageBucket: "realtime-chat-5558d.appspot.com",
  messagingSenderId: "1019578288071",
  appId: "1:1019578288071:web:037969dfa9ad92fff8fbe2",
};

const app = initializeApp(firebaseConfig);


export const deleteMessage = async (chatId, message) => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    messages: arrayRemove(message),
  });
};
export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()