import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send } from "lucide-react";
import { useAuth } from "./AuthContext";
import { MarkdownFormatter } from "./MarkdownFormatter";
import type { Message } from "../types";

interface ChatAreaProps {
  readonly messages: Message[];
  readonly onSendMessage: (message: string) => void;
  readonly sessionTitle: string;
}

export function ChatArea({ messages, onSendMessage, sessionTitle }: ChatAreaProps) {
  const { user } = useAuth();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b p-4 dark:border-slate-800">
        <h2 className="dark:text-slate-100">{sessionTitle}</h2>
      </div>
      
      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "human" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-600">AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === "human"
                      ? "bg-blue-500 text-white dark:bg-blue-600"
                      : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  }`}
                >
                  {message.sender === "ai" ? (
                    <MarkdownFormatter content={message.messages} />
                  ) : (
                    <p>{message.messages}</p>
                  )}
                  <p className={`mt-1 text-xs ${message.sender === "human" ? "text-blue-100 dark:text-blue-200" : "text-slate-500 dark:text-slate-400"}`}>
                    {message.timestamp}
                  </p>
                </div>
                {message.sender === "human" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-700 text-white dark:bg-slate-600">
                      {user?.name.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="flex-shrink-0 border-t p-4 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
