"use client";
import { useState } from "react";
import { CoreMessage } from "ai";

import { Setup } from "./screens/setup";
import { Chat } from "./screens/chat";
import { BatchChat } from "@/types/BatchChat";
import { streamChat, mapBatchChatToCoreMessages } from "@/lib/ai/helpers";

export default function Home() {
  const [screen, setScreen] = useState<"setup" | "chat">("setup");
  const [chat, setChat] = useState<BatchChat>({
    imageCount: 0,
    messages: [],
  });

  const requestAssistant = async (currentChat: BatchChat) => {
    const messagesBlocks: CoreMessage[][] =
      mapBatchChatToCoreMessages(currentChat);

    const updates = messagesBlocks.map(async (messages, index) => {
      await streamChat(messages, (text) => {
        setChat((prevChat) => {
          const lastMessage = prevChat.messages[prevChat.messages.length - 1];
          if (lastMessage.role !== "assistant") {
            throw new Error("Last message is not assistant");
          }
          lastMessage.content[index] = text;
          return { ...prevChat, messages: [...prevChat.messages] };
        });
      });
    });

    await Promise.all(updates);
  };

  return (
    <div>
      {screen === "setup" && <Setup setChat={setChat} setScreen={setScreen} />}
      {screen === "chat" && (
        <Chat
          chat={chat}
          requestAssistant={requestAssistant}
          setChat={setChat}
        />
      )}
    </div>
  );
}
