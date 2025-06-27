"use client";

import { FAQBlock } from "@/components/PageBuilder/blocks/faqBlock";
import { sanityFetch } from "@/lib/sanity/lib/client";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/SupabaseProvider";
import type { Database } from "@/types/supabase";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LuHelpCircle, LuMessageSquare, LuPlus, LuUser } from "react-icons/lu";

type SupportThread = Database["public"]["Tables"]["support_threads"]["Row"];
type Message = Database["public"]["Tables"]["support_messages"]["Row"];

interface FAQ {
  _id: string;
  question: string;
  answer: any[];
  category: string;
  isPublished: boolean;
}

const MessageBubble = ({
  message,
  isUser,
}: {
  message: Message;
  isUser: boolean;
}) => {
  const { userDetails } = useAuth();

  return (
    <div
      className={cn(
        "flex items-end gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-all duration-200"
        style={{
          borderColor: "#1C1E23",
          background: "linear-gradient(180deg, #1A1D22 -10.71%, #0F1114 100%)",
          boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.35)",
        }}
      >
        {userDetails?.avatar_url && isUser ? (
          <Image
            src={userDetails.avatar_url}
            alt={message.sender_name}
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        ) : (
          <LuUser className="h-4 w-4 text-[#545963]" />
        )}
      </div>
      <div
        className={cn(
          "group relative max-w-[80%] space-y-2 px-4 py-3 transition-all duration-200",
          isUser ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md"
        )}
        style={
          isUser
            ? {
                background:
                  "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.35)",
              }
            : {
                background:
                  "linear-gradient(180deg, #1A1D22 -10.71%, #0F1114 100%)",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.35)",
              }
        }
      >
        <div className="flex items-center gap-2">
          <div className="font-outfit text-sm font-medium text-white">
            {message.sender_name}
          </div>
          <div className="font-outfit text-xs text-[#545963]">
            {new Date(message.created_at || "").toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div className="font-outfit text-sm text-white leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default function SupportPage() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<SupportThread | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newThreadSubject, setNewThreadSubject] = useState("");
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const query = `*[_type == "faq"] {
                    _id,
                    question,
                    answer,
                    category,
                    isPublished
                }`;
        const data = await sanityFetch<FAQ[]>({ query });
        setFaqs(data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      }
    };

    fetchFaqs();
  }, []);

  useEffect(() => {
    const fetchThreads = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("support_threads")
        .select("*")
        .eq("user_id", user.id)
        .order("last_message_time", { ascending: false });

      if (error) {
        console.error("Error fetching threads:", error);
        return;
      }

      setThreads(data);
    };

    fetchThreads();

    const subscription = supabase
      .channel("user_threads")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_threads",
          filter: `user_id=eq.${supabase.auth.getUser()}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setThreads((prev) => [payload.new as SupportThread, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setThreads((prev) =>
              prev.map((thread) =>
                thread.id === payload.new.id
                  ? (payload.new as SupportThread)
                  : thread
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectedThread) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("thread_id", selectedThread.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data);
    };

    fetchMessages();

    const subscription = supabase
      .channel(`messages:${selectedThread.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `thread_id=eq.${selectedThread.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedThread]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadSubject.trim()) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("support_threads")
        .insert({
          product_id: "prod_QnoSc9uLqG4nJ8", // Required due to database constraints - default product for support
          user_id: user.id,
          user_name: user.user_metadata?.full_name || "User",
          user_email: user.email,
          subject: newThreadSubject.trim(),
          status: "open",
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      if (!data || data.length === 0)
        throw new Error("No data returned from insert");

      setIsCreatingThread(false);
      setNewThreadSubject("");
      setSelectedThread(data[0]);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const newMessageData = {
        thread_id: selectedThread.id,
        sender_id: user.id,
        sender_name: user.user_metadata?.full_name || "User",
        sender_type: "user",
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("support_messages")
        .insert(newMessageData)
        .select();

      if (error) throw error;

      // Immediately update the messages state with the new message
      if (data) {
        setMessages((prev) => [...prev, data[0]]);
      }

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0B0D] to-[#070809] pt-16">
      <div className="p-4 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-200"
              style={{
                background:
                  "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
              }}
            >
              <LuHelpCircle className="h-6 w-6 text-[#4EFF6E]" />
            </div>
            <div>
              <h1 className="font-outfit text-2xl font-bold text-white">
                Support Center
              </h1>
              <p className="font-outfit text-sm text-[#545963] mt-1">
                Get help with your trading platform
              </p>
            </div>
          </div>

          {error && (
            <div
              className="mb-6 rounded-lg border p-4 transition-all duration-200"
              style={{
                borderColor: "#FF4444",
                background:
                  "linear-gradient(180deg, #FF4444/10 -10.71%, #FF4444/5 100%)",
                boxShadow: "0px 4px 4px 0px rgba(255, 68, 68, 0.15)",
              }}
            >
              <p className="font-outfit text-sm text-[#FF6B6B] font-medium">
                {error}
              </p>
            </div>
          )}

          {!selectedThread && !isCreatingThread ? (
            <div>
              <button
                onClick={() => setIsCreatingThread(true)}
                className="group mb-8 flex w-full items-center justify-center gap-3 px-6 py-3 text-white transition-all duration-200 lg:w-auto rounded-lg"
                style={{
                  background:
                    "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)",
                  boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                }}
              >
                <LuPlus className="h-4 w-4 text-[#4EFF6E] group-hover:scale-110 transition-transform duration-200" />
                <span className="font-outfit font-medium">
                  Create New Support Thread
                </span>
              </button>
              <div className="space-y-3">
                {threads.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 text-center rounded-lg"
                    style={{
                      background:
                        "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                      boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    <div className="mb-4 text-4xl opacity-50">💬</div>
                    <div className="font-outfit text-lg font-medium text-white mb-2">
                      No support threads yet
                    </div>
                    <div className="font-outfit text-sm text-[#545963]">
                      Create your first support thread to get help
                    </div>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className="group cursor-pointer rounded-lg p-4 transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        background:
                          "linear-gradient(180deg, #1A1D22 -10.71%, #0F1114 100%)",
                        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.35)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110"
                            style={{
                              background:
                                "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                              boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.35)",
                            }}
                          >
                            <LuMessageSquare className="h-4 w-4 text-[#4EFF6E]" />
                          </div>
                          <h3 className="font-outfit font-medium text-white group-hover:text-[#4EFF6E] transition-colors duration-200">
                            {thread.subject || "No Subject"}
                          </h3>
                        </div>
                        <span className="font-outfit text-sm text-[#32353C]">
                          {new Date(
                            thread.last_message_time || ""
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {thread.last_message && (
                        <p className="font-outfit text-sm text-[#545963] mb-3 line-clamp-2">
                          {thread.last_message}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        {thread.status === "open" ? (
                          <span
                            className="font-outfit text-xs font-medium px-2 py-1 rounded-full"
                            style={{
                              background:
                                "linear-gradient(180deg, #4EFF6E/15 -10.71%, #4EFF6E/8 100%)",
                              color: "#4EFF6E",
                            }}
                          >
                            Open
                          </span>
                        ) : (
                          <span
                            className="font-outfit text-xs font-medium px-2 py-1 rounded-full"
                            style={{
                              background:
                                "linear-gradient(180deg, #32353C/20 -10.71%, #32353C/10 100%)",
                              color: "#32353C",
                            }}
                          >
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : isCreatingThread ? (
            <div className="mx-auto max-w-2xl">
              <div
                className="p-6 rounded-lg mb-6"
                style={{
                  background:
                    "linear-gradient(180deg, #1A1D22 -10.71%, #0F1114 100%)",
                  boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.35)",
                }}
              >
                <div className="mb-6">
                  <label className="font-outfit block text-sm font-medium text-white mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newThreadSubject}
                    onChange={(e) => setNewThreadSubject(e.target.value)}
                    className="font-outfit block w-full rounded-lg px-4 py-3 text-white placeholder-[#32353C] transition-all duration-200 focus:outline-none border-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                      boxShadow: "inset 0px 2px 4px 0px rgba(0, 0, 0, 0.35)",
                    }}
                    placeholder="Enter your support request subject..."
                    disabled={isLoading}
                  />
                </div>
                <div className="flex flex-col gap-3 lg:flex-row">
                  <button
                    type="submit"
                    onClick={handleCreateThread}
                    disabled={isLoading}
                    className="font-outfit font-medium flex w-full items-center justify-center rounded-lg px-6 py-3 text-white transition-all duration-200 disabled:opacity-50 hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                      boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.35)",
                    }}
                  >
                    {isLoading ? "Creating..." : "Create Thread"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingThread(false);
                      setError(null);
                    }}
                    disabled={isLoading}
                    className="font-outfit font-medium flex w-full items-center justify-center rounded-lg px-6 py-3 text-[#545963] transition-all duration-200 disabled:opacity-50 hover:scale-[1.02] hover:text-white border"
                    style={{
                      borderColor: "#1C1E23",
                      background:
                        "linear-gradient(180deg, #1A1D22/40 -10.71%, #0F1114/40 100%)",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-lg"
              style={{
                background:
                  "linear-gradient(180deg, #1A1D22 -10.71%, #0F1114 100%)",
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.35)",
              }}
            >
              <div
                className="p-4 border-b"
                style={{
                  borderColor: "#1C1E23",
                  background:
                    "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{
                        background:
                          "linear-gradient(180deg, #1A1D22 -10.71%, #0F1114 100%)",
                        boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.35)",
                      }}
                    >
                      <LuMessageSquare className="h-4 w-4 text-[#4EFF6E]" />
                    </div>
                    <h2 className="font-outfit font-medium text-white">
                      {selectedThread.subject}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedThread(null)}
                    className="font-outfit text-sm text-[#818181] transition-colors hover:text-white px-3 py-1 rounded-lg hover:bg-[#24282D]/50"
                  >
                    ← Back
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="mb-4 text-4xl opacity-50">💭</div>
                    <div className="font-outfit text-lg font-medium text-white mb-2">
                      Start the conversation
                    </div>
                    <div className="font-outfit text-sm text-[#545963]">
                      Send your first message to get help from our support team
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isUser={message.sender_type === "user"}
                    />
                  ))
                )}
              </div>
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t"
                style={{ borderColor: "#1C1E23" }}
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="font-outfit flex-1 rounded-lg px-4 py-3 text-white placeholder-[#32353C] transition-all duration-200 focus:outline-none border-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                      boxShadow: "inset 0px 2px 4px 0px rgba(0, 0, 0, 0.35)",
                    }}
                  />
                  <button
                    type="submit"
                    className="font-outfit font-medium flex items-center justify-center rounded-lg px-6 py-3 text-white transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background:
                        "linear-gradient(180deg, #24282D -10.71%, #111316 100%)",
                      boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.35)",
                    }}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      {!selectedThread && !isCreatingThread && (
        <FAQBlock
          _type="faqBlock"
          _key="support-faq"
          title="Frequently Asked Questions"
          items={faqs}
        />
      )}
    </div>
  );
}
