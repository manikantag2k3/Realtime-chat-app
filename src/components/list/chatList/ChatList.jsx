import React, { useState, useEffect } from "react";
import "./chatList.css";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = ({ onChatSelect }) => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const [icon, setIcon] = useState("plus.png");
  const [lastMessages, setLastMessages] = useState({});

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  useEffect(() => {
    const unSubscribes = chats.map((chat) => {
      const chatDocRef = doc(db, "chats", chat.chatId);
      return onSnapshot(chatDocRef, (res) => {
        const chatData = res.data();
        if (chatData?.messages?.length > 0) {
          const lastMessage = chatData.messages[chatData.messages.length - 1];
          setLastMessages((prev) => ({
            ...prev,
            [chat.chatId]: lastMessage.text,
          }));
          setChats((prevChats) => {
            return prevChats.map((c) => {
              if (c.chatId === chat.chatId) {
                return {
                  ...c,
                  isSeen:
                    lastMessage.senderId !== currentUser.id ? false : c.isSeen,
                };
              }
              return c;
            });
          });
        }
      });
    });

    return () => {
      unSubscribes.forEach((unSub) => unSub());
    };
  }, [chats, currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
      onChatSelect();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  const handleToggleAddUser = () => {
    setAddMode(!addMode);
    setIcon(addMode ? "plus.png" : "minus.png");
  };

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="search icon" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={`./${icon}`}
          alt="toggle icon"
          className="add"
          onClick={handleToggleAddUser}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt="avatar"
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}
            </span>
            <p>{lastMessages[chat.chatId] || ""}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser setAddMode={setAddMode} setIcon={setIcon} />}
    </div>
  );
};

export default ChatList;