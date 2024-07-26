import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export const updateUserSchema = async () => {
  const userCollectionRef = collection(db, "users");
  const userDocs = await getDocs(userCollectionRef);

  const updatePromises = userDocs.docs.map(async (userDoc) => {
    const userRef = doc(db, "users", userDoc.id);
    await updateDoc(userRef, {
      description: userDoc.data().description || "", // Add description field if it doesn't exist
    });
  });

  await Promise.all(updatePromises);
};
