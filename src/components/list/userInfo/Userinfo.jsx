import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";
import { useState, useEffect } from "react";
import { auth, db } from "../../../lib/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import DescriptionModal from "./DescriptionModal.jsx";

const Userinfo = () => {
  const { currentUser, setCurrentUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, "users", currentUser.id);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setCurrentUser({ ...currentUser, ...doc.data() });
      }
    });

    return () => unsubscribe();
  }, [currentUser, setCurrentUser]);

  const handleLogout = () => {
    auth.signOut();
  };

  const handleDescriptionSave = async (newDescription) => {
    const userDocRef = doc(db, "users", currentUser.id);
    await updateDoc(userDocRef, { description: newDescription });

    setCurrentUser({ ...currentUser, description: newDescription });
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <div>
          <h2>{currentUser.username}</h2>
          <div className="description">{currentUser.description}</div>
        </div>
      </div>
      <div className="icons">
        <img
          src="./logout.png"
          alt="Logout"
          onClick={handleLogout}
          style={{ width: "24px", height: "24px" }}
        />
        <img src="./video.png" alt="Video" />
        <img src="./edit.png" alt="Edit" onClick={toggleEditing} />
      </div>
      <DescriptionModal
        isOpen={isEditing}
        onClose={toggleEditing}
        onSave={handleDescriptionSave}
      />
    </div>
  );
};

export default Userinfo;
