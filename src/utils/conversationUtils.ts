// utils/conversationUtils.ts
import { db } from "@/firebase/config";
import { Conversation, Message, Specialty } from "@/utils/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

export const createConversation = async (
  userId: string,
  name: string
): Promise<Conversation> => {
  const userConversationsRef = collection(db, "users", userId, "conversations");

  const newConversation: Conversation = {
    id: crypto.randomUUID(),
    userId,
    name,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    messages: [],
    status: "open",
    recommendedSpecialty: null,
    appointmentId: null,
  };

  await setDoc(doc(userConversationsRef, newConversation.id), newConversation);

  return newConversation;
};

export const addMessage = async (
  userId: string,
  conversation: Conversation,
  message: Message
): Promise<Conversation> => {
  const conversationRef = doc(
    db,
    "users",
    userId,
    "conversations",
    conversation.id
  );

  const updatedConversation = await runTransaction(db, async (transaction) => {
    const conversationSnapshot = await transaction.get(conversationRef);

    const currentMessages: Message[] = conversationSnapshot.exists()
      ? (conversationSnapshot.data().messages as Message[]) || []
      : [];

    // Add new message to existing messages
    const updatedMessages = [...currentMessages, message];

    // Prepare updated conversation object
    const newConversationData = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: Timestamp.now(),
    };

    // Update the document within the transaction
    transaction.update(conversationRef, {
      messages: updatedMessages,
      updatedAt: newConversationData.updatedAt,
    });

    return newConversationData;
  })
    .then((result) => {
      return result;
    })
    .catch((error) => {
      console.error("Error al agregar el mensaje:", error);
      return conversation;
    });

  return updatedConversation;
};

export const getUserConversations = async (
  userId: string
): Promise<Conversation[]> => {
  const userConversationsRef = collection(db, "users", userId, "conversations");
  const snapshot = await getDocs(userConversationsRef);

  const conversations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Conversation[];

  return conversations;
};

export const getUserConversation = async (
  userId: string,
  conversationId: string
): Promise<Conversation | null> => {
  try {
    const conversationDocRef = doc(
      db,
      "users",
      userId,
      "conversations",
      conversationId
    );
    const conversationDoc = await getDoc(conversationDocRef);

    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data() as Conversation;

      return conversationData || null; // Retornar la conversaci贸n o null si no se encuentra
    } else {
      console.log("Usuario no encontrado.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener los mensajes de la conversaci贸n:", error);
    return null; // Retornar null en caso de error
  }
};

export const editConversation = async (
  userId: string,
  conversation: Conversation,
  newName?: string,
  newStatus?: "open" | "closed"
): Promise<Conversation> => {
  const conversationRef = doc(
    db,
    "users",
    userId,
    "conversations",
    conversation.id
  );

  const updatedConversation = {
    ...conversation,
    name: newName || conversation.name,
    status: newStatus || conversation.status,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(conversationRef, {
    name: updatedConversation.name,
    status: updatedConversation.status,
    updatedAt: updatedConversation.updatedAt,
  });

  return updatedConversation;
};

export const deleteConversation = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  const conversationRef = doc(
    db,
    "users",
    userId,
    "conversations",
    conversationId
  );
  await deleteDoc(conversationRef);
  return;
};

export const addSpecialtyRecommendation = async (
  userId: string,
  conversation: Conversation,
  specialty: Specialty | null
): Promise<void> => {
  try {
    const conversationRef = doc(
      db,
      "users",
      userId,
      "conversations",
      conversation.id
    );

    await runTransaction(db, async (transaction) => {
      const conversationDoc = await transaction.get(conversationRef);
      if (!conversationDoc.exists()) {
        throw new Error("La conversaci贸n no existe.");
      }

      transaction.update(conversationRef, {
        recommendedSpecialty: specialty,
        updatedAt: Timestamp.now(),
      });
    });
  } catch (error) {
    console.error("Error al agregar la recomendaci贸n:", error);
  }
};
