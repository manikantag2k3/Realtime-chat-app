import React from "react";
import ChatList from "./chatList/ChatList";
import Userinfo from "./userInfo/Userinfo";
import "./list.css";

const List = ({ onChatSelect , onBack}) => {
  return (
    <div className="list">
      <Userinfo onBack={onBack} />
      <ChatList onChatSelect={onChatSelect} />
    </div>
  );
};

export default List;