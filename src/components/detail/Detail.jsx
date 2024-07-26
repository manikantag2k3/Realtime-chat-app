import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";
import { useState } from "react";
import Photos from "./Photos";

const Detail = () => {
  const {
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
    resetChat,
  } = useChatStore();
  const { currentUser } = useUserStore();

  const [showPhotos, setShowPhotos] = useState(false);

  const handleShowPhotos = () => {
    setShowPhotos(!showPhotos);
  };

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    resetChat();
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>{user.description}</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
          </div>
        </div>
        <div className="option">
          <div className="title">
            {/* Wrap the span and Photos component in a div if necessary */}
            <div>
              <span onClick={handleShowPhotos}>Shared photos</span>
              {showPhotos && <Photos chatId={chatId} />}
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
          </div>
        </div>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User blocked"
            : "Block User"}
        </button>
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;