import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

const Photos = ({ chatId }) => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (doc) => {
      const chatData = doc.data();
      const photoMessages = chatData.messages.filter((msg) => msg.img);
      const photoUrls = photoMessages.map((msg) => msg.img);
      setPhotos(photoUrls);
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  return (
    <div className="photos">
      {photos.map((url, index) => (
        <img key={index} src={url} alt="Chat Photo" />
      ))}
    </div>
  );
};

export default Photos;
