export type BatchChat = {
  messages: BatchMessage[];
  imageCount: number;
};

type BatchMessage = BatchUserMessage | BatchAssistantMessage;

type BatchUserMessage = {
  role: "user";
  content: string;
  images?: Buffer[];
};

type BatchAssistantMessage = {
  role: "assistant";
  content: string[];
};
