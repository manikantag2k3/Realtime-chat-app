
import React from "react";
import { useUserStore } from "../../lib/userStore";
import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import ChatList from "./chatList/ChatList";
import Userinfo from "./userInfo/Userinfo";
import "./list.css";

const List = () => {
  const { currentUser, setCurrentUser } = useUserStore();

  const handleEmojiClick = async () => {
    const newDescription = prompt("Enter new description:");
    if (newDescription) {
      const userDocRef = doc(db, "users", currentUser.id);
      await updateDoc(userDocRef, { description: newDescription });

      setCurrentUser({ ...currentUser, description: newDescription });
    }
  };

  return (
    <div className="list">
      <Userinfo />
      <ChatList />
    </div>
  );
};

export default List;