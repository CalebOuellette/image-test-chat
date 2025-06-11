import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4-turbo"),
    system:
      "Help the user understand the images they uploaded. Response with a short answer to the users question.",
    messages,
  });

  return result.toDataStreamResponse();
}
