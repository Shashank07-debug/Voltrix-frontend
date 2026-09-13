import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, ThumbsUp, ThumbsDown, Copy, RotateCcw, MoreHorizontal, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useStreamParser } from "../hooks/use-stream-parser";
import { ChatEventRenderer, FileEditGroup, ReasoningBlock, FinalResponse, parseChatTurnSections } from './ChatEventRenderer';
import { ChatEvent } from "@/lib/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  createdAt?: string;
  events?: ChatEvent[]; // Structured events from the database
  editedFiles?: string[];
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function ChatPanel({ messages, onSendMessage, isStreaming, isLoading, readOnly }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    onSendMessage(input.trim());
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div className="flex flex-col h-full bg-[#060913] dark:bg-[#060913] light:bg-[#F8FAFC]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-[#4F8CFF]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center h-full text-center p-8 overflow-hidden">
            {/* Ambient Spot Glow & Grid Overlay */}
            <div className="absolute w-48 h-48 rounded-full bg-[#4F8CFF]/10 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] light:bg-[radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

            <div className="relative mb-4 z-10 group">
              {/* Ambient Glow Backdrop */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#3B72FF] to-[#7C3CFF] opacity-35 blur-md group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />
              <div className="relative w-14 h-14 rounded-2xl bg-[#0D1424] dark:bg-[#0D1424] light:bg-[#F1F5F9] border border-[#4F8CFF]/50 dark:border-[#4F8CFF]/50 light:border-[#4F8CFF]/60 flex items-center justify-center shadow-[0_0_25px_rgba(79,140,255,0.3)] text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7] transition-transform duration-300 group-hover:scale-105">
                <Bot className="w-7 h-7 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]" />
              </div>
            </div>
            <h3 className="text-base font-extrabold text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] mb-1.5 relative z-10">Start a conversation</h3>
            <p className="text-xs text-[#94A3B8] dark:text-[#94A3B8] light:text-[#475569] max-w-xs leading-relaxed relative z-10">
              Describe what you want to build or modify, and the Voltrix AI agent will generate and edit code in real-time.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message}
                isStreaming={isStreaming && message.isStreaming} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-3 border-t border-white/10 dark:border-white/10 light:border-black/10 bg-[#080C19] dark:bg-[#080C19] light:bg-[#FFFFFF]">
        {readOnly && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] dark:bg-white/[0.04] light:bg-black/[0.04] border border-white/10 dark:border-white/10 light:border-black/10 text-xs text-[#94A3B8] dark:text-[#94A3B8] light:text-[#475569] mb-2 font-mono">
            <Bot className="w-4 h-4 text-[#4F8CFF] shrink-0" />
            <span>View-only mode — code inspection permitted, prompt edits restricted.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={readOnly ? "Prompt edits restricted" : "Describe what you want to build..."}
            className="min-h-[48px] max-h-[200px] pr-12 resize-none bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-[#F1F5F9] border-white/10 dark:border-white/10 light:border-black/10 focus:border-[#4F8CFF]/60 text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] placeholder:text-[#5B657E] dark:placeholder:text-[#5B657E] light:placeholder:text-[#94A3B8] rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
            disabled={isStreaming || readOnly}
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming || readOnly}
            className="absolute right-2 bottom-2 h-8 w-8 rounded-lg voltrix-btn-primary cursor-pointer disabled:opacity-40"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-1 text-[11px] text-[#64748B] dark:text-[#64748B] light:text-[#64748B] font-mono">
            <span>✨ AI-Powered React Sandbox</span>
          </div>
          {isStreaming && (
            <span className="text-[11px] text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569] flex items-center gap-1 font-mono">
              <Loader2 className="w-3 h-3 animate-spin text-[#4F8CFF]" />
              Thinking...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Inner Component to handle logic per message
function MessageItem({ message, isStreaming }: { message: ChatMessage, isStreaming: boolean }) {
  // Use the stream parser to turn raw XML text into Event objects live
  // 1. Parse content live if we are streaming OR if we don't have DB events yet
  const liveEvents = useStreamParser(message.content || "");

  // 2. Logic: If we have DB events, use them. Otherwise, use the parsed content.
  const eventsToRender = (message.events && message.events.length > 0)
    ? message.events
    : liveEvents;

  return (
    <div className={`p-5 border-b border-border/10 ${message.role === 'user' ? 'bg-muted/10' : 'bg-background'}`}>
      <div className="max-w-4xl mx-auto">
        {message.role === "user" ? (
          <div className="flex flex-col items-end gap-2">
            <div className="bg-primary/10 text-primary-foreground text-[14px] leading-[1.5] py-2.5 px-4 rounded-2xl rounded-tr-none border border-primary/20 max-w-[85%]">
              <p className="text-foreground text-[14px] leading-[1.5] whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.createdAt && (
              <span className="text-[10px] text-muted-foreground px-1 uppercase tracking-tight">
                {format(new Date(message.createdAt), "HH:mm")}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Render granular events (ReasoningBlock, FileEditGroup, Tool, FinalResponse) */}
            <div className="flex flex-col gap-2">
              {parseChatTurnSections(eventsToRender).map((section, idx, array) => {
                const isLast = idx === array.length - 1;

                if (section.type === 'REASONING_BLOCK' && section.events) {
                  return (
                    <ReasoningBlock
                      key={idx}
                      events={section.events}
                      isLoading={isStreaming && isLast}
                    />
                  );
                }

                if (section.type === 'FILE_EDIT_GROUP' && section.fileEdits) {
                  return (
                    <FileEditGroup
                      key={idx}
                      fileEdits={section.fileEdits}
                      isLoading={isStreaming && isLast}
                    />
                  );
                }

                if (section.type === 'FINAL_RESPONSE' && section.event) {
                  return (
                    <FinalResponse
                      key={idx}
                      event={section.event}
                      isLoading={isStreaming && isLast}
                    />
                  );
                }

                if (section.event) {
                  return (
                    <ChatEventRenderer
                      key={idx}
                      event={section.event}
                      isLoading={isStreaming && isLast}
                    />
                  );
                }

                return null;
              })}
            </div>

            {/* Action buttons for assistant message */}
            {!message.isStreaming && eventsToRender.length > 0 && (
              <div className="flex items-center gap-1 pt-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <ThumbsUp className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}