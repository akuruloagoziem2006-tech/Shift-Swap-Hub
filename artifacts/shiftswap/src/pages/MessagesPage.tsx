import { useState, useEffect, useRef } from "react";
import { useSearch } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useListConversations,
  useGetMessages,
  useSendMessage,
  getGetMessagesQueryKey,
  getListConversationsQueryKey,
} from "@workspace/api-client-react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function MessagesPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const withUserId = params.get("with");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: conversations, isLoading: convsLoading } = useListConversations();
  const { data: messages, isLoading: msgsLoading } = useGetMessages(activeConvId!, {
    query: { enabled: !!activeConvId, queryKey: getGetMessagesQueryKey(activeConvId!) },
  });
  const sendMessage = useSendMessage();

  // Auto-open conversation from URL param
  useEffect(() => {
    if (withUserId && user) {
      const ids = [user.id, withUserId].sort();
      setActiveConvId(ids.join("_"));
    }
  }, [withUserId, user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || !activeConvId) return;
    sendMessage.mutate(
      { conversationId: activeConvId, data: { content: messageText.trim() } },
      {
        onSuccess: () => {
          setMessageText("");
          queryClient.invalidateQueries({ queryKey: getGetMessagesQueryKey(activeConvId!) });
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
        },
        onError: () => toast({ title: "Failed to send message", variant: "destructive" }),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeConv = conversations?.find((c) => c.conversationId === activeConvId);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations list */}
      <div className={cn(
        "flex flex-col border-r border-border bg-card",
        "w-full md:w-80 shrink-0",
        activeConvId ? "hidden md:flex" : "flex"
      )}>
        <div className="px-4 py-4 border-b border-border">
          <h2 className="font-bold text-foreground text-lg">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="space-y-3 p-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Message a shift poster from a shift's detail page.
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.conversationId}
                onClick={() => setActiveConvId(conv.conversationId)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors",
                  activeConvId === conv.conversationId ? "bg-muted" : ""
                )}
                data-testid={`conversation-${conv.conversationId}`}
              >
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={conv.otherUser?.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {conv.otherUser?.displayName?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {conv.otherUser?.displayName ?? "User"}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {timeAgo(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-primary rounded-full text-primary-foreground text-xs flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message thread */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        !activeConvId ? "hidden md:flex" : "flex"
      )}>
        {!activeConvId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
              <button
                className="md:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                onClick={() => setActiveConvId(null)}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <Avatar className="w-8 h-8">
                <AvatarImage src={activeConv?.otherUser?.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {activeConv?.otherUser?.displayName?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {activeConv?.otherUser?.displayName ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeConv?.otherUser?.jobRole}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-3/4" />)}
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No messages yet. Say hi!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderClerkUserId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex gap-2", isMe ? "flex-row-reverse" : "flex-row")}
                      data-testid={`message-${msg.id}`}
                    >
                      {!isMe && (
                        <Avatar className="w-7 h-7 shrink-0 mt-0.5">
                          <AvatarImage src={msg.senderProfile?.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-xs bg-muted">
                            {msg.senderProfile?.displayName?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-card flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1"
                data-testid="input-message-text"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!messageText.trim() || sendMessage.isPending}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
