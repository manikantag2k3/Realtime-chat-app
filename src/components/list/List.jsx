
import React from "react";
import { useUserStore } from "../../lib/userStore";
import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import ChatList from "./chatList/ChatList";
import Userinfo from "./userInfo/Userinfo";
import "./list.css";

const List = () => {
 
  return (
    <div className="list">
      <Userinfo />
      <ChatList />
    </div>
  );
};

export default List;