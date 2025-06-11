import { CoreMessage } from "ai";
import { BatchChat } from "@/types/BatchChat";

export async function streamChat(
  messages: CoreMessage[],
  onUpdate: (text: string) => void
): Promise<void> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chat response");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("No reader available");
  }

  let fullText = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("0:")) {
          const text = line.slice(2);
          if (text) {
            fullText += text.substring(1, text.length - 1);
            onUpdate(fullText);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function mapBatchChatToCoreMessages(chat: BatchChat): CoreMessage[][] {
  const messagesBlocks: CoreMessage[][] = [];

  for (let i = 0; i < chat.imageCount; i++) {
    const messages: CoreMessage[] = chat.messages.map((message) => {
      if (message.role === "user") {
        if (!message.images) {
          return {
            role: "user" as const,
            content: message.content,
          };
        } else {
          const buffer = message.images[i];
          const base64Data = buffer.toString("base64");
          const msg: CoreMessage = {
            role: "user" as const,
            content: [{ type: "image", image: base64Data }],
          };
          return msg;
        }
      } else {
        return {
          role: "assistant" as const,
          content: message.content[i],
        };
      }
    });
    messagesBlocks.push(messages);
  }
  return messagesBlocks;
}
