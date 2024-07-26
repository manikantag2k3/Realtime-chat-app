
import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";
import { deleteMessage } from "../../lib/firebase";

const Chat = ({ infoprop }) => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const { currentUser } = useUserStore();
  const { showDeleteButtons } = useChatStore(); // Get the state
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleDelete = async (message) => {
    try {
      await deleteMessage(chatId, message);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file && !audioBlob) return;

    let imgUrl = null;
    let audioUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      if (audioBlob) {
        const audioFile = new File([audioBlob], "audio.mp3", {
          type: "audio/mpeg",
        });
        audioUrl = await upload(audioFile);
        setAudioBlob(null);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          text,
          img: imgUrl,
          audio: audioUrl,
          senderId: currentUser.id,
          createdAt: new Date(),
        }),
      });

      setText("");
      setImg({ file: null, url: "" });
      setAudioBlob(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCameraOpen = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  const handleCapture = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    canvasRef.current.toBlob(async (blob) => {
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const imgUrl = URL.createObjectURL(file);
      setImg({ file, url: imgUrl });
      setCameraOpen(false);
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    });
  };

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      setIsRecording(true);
    }
  };

  useEffect(() => {
    if (!isRecording) return;
    const handle = setTimeout(() => setIsRecording(false), 10000); // Stop recording after 10 seconds
    return () => clearTimeout(handle);
  }, [isRecording]);

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{user?.description}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img
            src="./info.png"
            onClick={() => {
              infoprop();
            }}
            alt=""
          />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={index}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              {message.audio && <audio controls src={message.audio}></audio>}
              {message.text && <p>{message.text}</p>}
              <span>{format(message.createdAt.toDate())}</span>
              {showDeleteButtons && message.senderId === currentUser?.id && (
                <button className="del-button" onClick={() => handleDelete(message)}>Delete</button>
              )}
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        {audioBlob && (
          <div className="message own">
            <div className="texts">
              <audio controls src={URL.createObjectURL(audioBlob)}></audio>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <div className="emoji">
            <img
              src="./emoji.png"
              alt=""
              onClick={() => setOpen((prev) => !prev)}
            />
            <div className="picker">
              <EmojiPicker open={open} onEmojiClick={handleEmoji} />
            </div>
          </div>
          <input
            type="file"
            style={{ display: "none" }}
            id="file"
            onChange={handleImg}
          />

          <img src="./camera.png" alt="camera" onClick={handleCameraOpen} />
          <img src="./mic.png" alt="mic" onClick={handleMicClick} />
        </div>
        {isRecording && <p>Recording...</p>}
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <button
          className="sendButton"
          onClick={() => {
            handleSend();
            setCameraOpen(false);
            setImg({ file: null, url: "" });
          }}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
      {cameraOpen && (
        <div className="camera">
          <video ref={videoRef} autoPlay width="300" height="300"></video>
          <button onClick={handleCapture}>Capture Photo</button>
          <button onClick={() => setCameraOpen(false)}>Close</button>
          <canvas
            ref={canvasRef}
            width="300"
            height="300"
            style={{ display: "none" }}
          ></canvas>
        </div>
      )}
      {img.url && (
        <div className="captured-photo">
          <img src={img.url} alt="Captured" />
          <button onClick={() => setImg({ file: null, url: "" })}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Chat;