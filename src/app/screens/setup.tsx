import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PreviewImage } from "@/components/PreviewImage";
import { BatchChat } from "@/types/BatchChat";
import { toast } from "sonner";

export function Setup({
  setScreen,
  setChat,
}: {
  setScreen: (screen: "setup" | "chat") => void;
  setChat: (chat: BatchChat) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Buffer[]>([]);
  const [error, setError] = useState<string>("");

  const processFiles = async (files: FileList) => {
    const imageBuffers: Buffer[] = [];
    const nonImageFiles: string[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageBuffers.push(buffer);
      } else {
        nonImageFiles.push(file.name);
      }
    }

    if (nonImageFiles.length > 0) {
      toast.error(
        `Only image files are allowed. Rejected: ${nonImageFiles.join(", ")}`,
      );
      return;
    }

    if (imageBuffers.length > 4) {
      toast.error("Maximum of 4 images allowed. Please select fewer images.");
      return;
    }

    if (imageBuffers.length > 0) {
      setSelectedImages(imageBuffers);
      setError("");
    }
  };

  const startChatting = () => {
    if (selectedImages.length > 0) {
      const batchChat: BatchChat = {
        messages: [
          {
            role: "user" as const,
            images: selectedImages,
            content: "",
          },
        ],
        imageCount: selectedImages.length,
      };

      setChat(batchChat);
      setScreen("chat");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    await processFiles(files);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files) {
      await processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="flex flex-col  items-center pt-30 min-h-screen p-8">
      <div className="w-lg flex flex-col">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome to Image Tester!
          </h1>
          <h2 className=" text-gray-600">
            Upload up to 4 images to get started.
          </h2>

          <div
            className={`mt-8 border-2 border-dashed rounded-lg p-12 transition-colors ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4">
                <p className="text-lg text-gray-600">
                  {isDragOver
                    ? "Drop your images here!"
                    : "Drag and drop images here"}
                </p>
                <p className="text-sm text-gray-500 mt-2">or</p>
              </div>
              <div className="mt-4">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  value={""}
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {selectedImages.length > 0 && (
            <div className="mt-8 w-full max-w-4xl">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {selectedImages.map((imageBuffer, index) => (
                  <PreviewImage
                    key={index}
                    imageBuffer={imageBuffer}
                    alt={`Selected image ${index + 1}`}
                  />
                ))}
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={startChatting}
                  className="py-3 text-lg font-semibold cursor-pointer bg-emerald-700 hover:bg-emerald-800 "
                >
                  Start Chatting
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
