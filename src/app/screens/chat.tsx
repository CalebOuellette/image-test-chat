import { useState, useRef } from "react";
import { toast } from "sonner";

import { BatchChat } from "@/types/BatchChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PreviewImage } from "@/components/PreviewImage";

export function Chat({
  setChat,
  chat,
  requestAssistant,
}: {
  chat: BatchChat;
  setChat: (chat: BatchChat) => void;
  requestAssistant: (chat: BatchChat) => Promise<void>;
}) {
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "Are there any visual defects in this image?",
    "Is this image of a used product or new?",
    "If text is present, is it readable?",
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSuggestionClick = async (suggestion: string) => {
    if (streaming) return;
    setSuggestions((prev) => prev.filter((s) => s !== suggestion));
    setInput("");
    await sendMessage(suggestion);
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    setStreaming(true);

    const newMessage = {
      role: "user" as const,
      content: messageText,
    };

    const emptyMessages: string[] = Array.from({
      length: chat.imageCount,
    }).fill("") as string[];

    const emptyAssistantMessages = {
      role: "assistant" as const,
      content: emptyMessages,
    };
    const newChat = {
      ...chat,
      messages: [...chat.messages, newMessage, emptyAssistantMessages],
    };

    setChat(newChat);
    try {
      await requestAssistant(newChat);
    } catch (error) {
      console.error("Error requesting assistant:", error);
      toast.error(
        "An error occurred while requesting the assistant. Please try again.",
      );
    }
    setStreaming(false);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen relative px-0  ">
      <header className="bg-white  border-gray-200 px-6 py-4 border-b">
        <div className="flex items-center justify-start">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Image Tester Chat
            </h1>
          </div>
        </div>
      </header>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-scroll p-4 space-y-4   pb-40  md:px-10 lg:px-30"
      >
        {chat.messages.map((message, index) => (
          <div key={index} className="space-y-2">
            {message.role === "user" && message.content && (
              <div className="flex justify-end fade-in">
                <div className="bg-emerald-50 text-emerald-900 text-lg rounded-lg px-4 py-2 max-w-xs border border-emerald-200">
                  {message.content}
                </div>
              </div>
            )}

            {message.role === "user" && "images" in message && (
              <div className="grid grid-cols-4 gap-10 fade-in">
                {message.images &&
                  message.images.map((imageBuffer, imageIndex) => (
                    <PreviewImage
                      key={imageIndex}
                      imageBuffer={imageBuffer}
                      alt={`Uploaded image ${imageIndex + 1}`}
                    />
                  ))}
              </div>
            )}

            {message.role === "assistant" && (
              <div className="grid grid-cols-4 gap-10 fade-in">
                {message.content.map((response, responseIndex) => (
                  <div key={responseIndex}>
                    <div className="bg-gray-100 text-gray-800 text-lg rounded-lg px-4 py-2 border border-gray-200">
                      {response || "Loading..."}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center p-10 bottom-0 absolute  left-0 right-0">
        <div className="border shadow-lg rounded-xl w-full max-w-4xl p-4 bg-white">
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="suggestion"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm"
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex space-x-2">
            <Input
              type="text"
              disabled={streaming}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the images..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 border-none shadow-none text-lg"
            />
            <Button
              onClick={handleSendMessage}
              className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 "
              disabled={streaming}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
