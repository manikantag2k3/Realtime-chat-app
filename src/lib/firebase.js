import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, arrayRemove } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";

console.log('API Key:', process.env.REACT_APP_API_KEY);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "realtime-chat-5558d.firebaseapp.com",
  projectId: "realtime-chat-5558d",
  storageBucket: "realtime-chat-5558d.appspot.com",
  messagingSenderId: "1019578288071",
  appId: "1:1019578288071:web:037969dfa9ad92fff8fbe2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();

export const deleteMessage = async (chatId, message) => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    messages: arrayRemove(message),
  });

  // Delete associated file from storage if it exists
  if (message.img || message.audio) {
    const fileUrl = message.img || message.audio;
    const fileRef = ref(storage, fileUrl);

    try {
      await deleteObject(fileRef);
      console.log("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }
};
