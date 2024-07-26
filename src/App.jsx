import { useEffect ,useState} from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { updateUserSchema } from "./components/list/userInfo/updateUserSchema";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [info,setInfo]=useState(false);
  const handleInfo=()=>{
    setInfo(!info);
  }

  useEffect(() => {
    // console.log("Setting up auth state changed listener");
    const unSub = onAuthStateChanged(auth, (user) => {
      // console.log("Auth state changed", user);
      fetchUserInfo(user?.uid);
    });

    const updateSchema = async () => {
      await updateUserSchema();
    };

    updateSchema();

    return () => {
      // console.log("Cleaning up auth state changed listener");
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) {
    // console.log("App is loading");
    return <div className="loading">Loading...</div>;
  }

  // console.log("Rendering App", { currentUser, chatId });

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat infoprop={handleInfo}/>}
          {chatId&& info && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
