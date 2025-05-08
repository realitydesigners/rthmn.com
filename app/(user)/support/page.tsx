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
}: { message: Message; isUser: boolean }) => {
	const { userDetails } = useAuth();

	return (
		<div
			className={cn(
				"flex items-end gap-2",
				isUser ? "flex-row-reverse" : "flex-row",
			)}
		>
			<div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#1C1E23] bg-[#111]">
				{userDetails?.avatar_url && isUser ? (
					<Image
						src={userDetails.avatar_url}
						alt={message.sender_name}
						width={32}
						height={32}
						className="h-full w-full object-cover"
					/>
				) : (
					<LuUser className="h-4 w-4 text-white/50" />
				)}
			</div>
			<div
				className={cn(
					"group relative max-w-[80%] space-y-1 rounded-2xl px-4 py-3",
					isUser ? "bg-blue-500/10" : "bg-[#1C1E23]",
					"transition-all duration-200",
				)}
			>
				<div className="flex items-center gap-2">
					<div className="font-outfit text-sm font-medium text-white/90">
						{message.sender_name}
					</div>
					<div className="font-outfit text-xs text-white/40">
						{new Date(message.created_at || "").toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</div>
				</div>
				<div className="font-outfit text-sm text-white/80">
					{message.content}
				</div>
			</div>
		</div>
	);
};

export default function SupportPage() {
	const [threads, setThreads] = useState<SupportThread[]>([]);
	const [selectedThread, setSelectedThread] = useState<SupportThread | null>(
		null,
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
									: thread,
							),
						);
					}
				},
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
				},
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
		<div className="min-h-screen bg-[#0a0a0a] pt-16">
			<div className="p-4 lg:p-8">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8 flex items-center gap-3">
						<div className="rounded-md bg-[#1C1E23] p-2">
							<LuHelpCircle className="h-6 w-6 text-white" />
						</div>
						<h1 className="font-outfit text-2xl font-bold text-white">
							Support Center
						</h1>
					</div>

					{error && (
						<div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
							<p className="font-outfit text-sm text-red-500">{error}</p>
						</div>
					)}

					{!selectedThread && !isCreatingThread ? (
						<div>
							<button
								onClick={() => setIsCreatingThread(true)}
								className="group mb-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#111] px-6 py-3 text-white transition-all duration-200 hover:bg-[#1C1E23] lg:w-auto"
							>
								<LuPlus className="h-4 w-4 text-white" />
								<span className="font-outfit">Create New Support Thread</span>
							</button>
							<div className="space-y-4">
								{threads.map((thread) => (
									<div
										key={thread.id}
										onClick={() => setSelectedThread(thread)}
										className="cursor-pointer rounded-lg border border-[#1C1E23] bg-[#111] p-4 transition-all duration-200 hover:bg-[#151515]"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<LuMessageSquare className="h-4 w-4 text-zinc-400" />
												<h3 className="font-outfit text-white">
													{thread.subject || "No Subject"}
												</h3>
											</div>
											<span className="font-outfit text-sm text-zinc-400">
												{new Date(
													thread.last_message_time || "",
												).toLocaleDateString()}
											</span>
										</div>
										{thread.last_message && (
											<p className="font-outfit mt-2 text-sm text-zinc-400">
												{thread.last_message}
											</p>
										)}
										<div className="mt-2 flex items-center gap-2">
											{thread.status === "open" ? (
												<span className="font-outfit text-xs text-blue-400">
													Open
												</span>
											) : (
												<span className="font-outfit text-xs text-zinc-500">
													Closed
												</span>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					) : isCreatingThread ? (
						<div className="mx-auto max-w-2xl">
							<div className="mb-8">
								<label className="font-outfit block text-sm text-zinc-400">
									Subject
								</label>
								<input
									type="text"
									value={newThreadSubject}
									onChange={(e) => setNewThreadSubject(e.target.value)}
									className="font-outfit mt-2 block w-full rounded-lg border border-blue-500/20 bg-[#111] px-4 py-3 text-white placeholder-zinc-400 transition-all duration-200 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
									placeholder="Enter subject"
									disabled={isLoading}
								/>
							</div>
							<div className="flex flex-col gap-3 lg:flex-row">
								<button
									type="submit"
									onClick={handleCreateThread}
									disabled={isLoading}
									className="font-outfit flex w-full items-center justify-center rounded-lg bg-[#111] px-6 py-3 text-white transition-all duration-200 hover:bg-[#1C1E23] disabled:opacity-50"
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
									className="font-outfit flex w-full items-center justify-center rounded-lg border border-[#1C1E23] px-6 py-3 text-white transition-all duration-200 hover:bg-[#1C1E23] disabled:opacity-50"
								>
									Cancel
								</button>
							</div>
						</div>
					) : (
						<div className="flex h-[calc(100vh-200px)] flex-col overflow-hidden rounded-lg border border-[#1C1E23] bg-[#111]">
							<div className="border-b border-[#1C1E23] p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<LuMessageSquare className="h-4 w-4 text-zinc-400" />
										<h2 className="font-outfit text-white">
											{selectedThread.subject}
										</h2>
									</div>
									<button
										onClick={() => setSelectedThread(null)}
										className="font-outfit text-sm text-zinc-400 transition-colors hover:text-white"
									>
										Back
									</button>
								</div>
							</div>
							<div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1C1E23] flex-1 space-y-4 overflow-y-auto p-4">
								{messages.map((message) => (
									<MessageBubble
										key={message.id}
										message={message}
										isUser={message.sender_type === "user"}
									/>
								))}
							</div>
							<form
								onSubmit={handleSendMessage}
								className="border-t border-[#1C1E23] p-4"
							>
								<div className="flex gap-3">
									<input
										type="text"
										value={newMessage}
										onChange={(e) => setNewMessage(e.target.value)}
										placeholder="Type your message..."
										className="font-outfit flex-1 rounded-lg border border-blue-500/20 bg-[#111] px-4 py-3 text-white placeholder-zinc-400 transition-all duration-200 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 focus:outline-none"
									/>
									<button
										type="submit"
										className="font-outfit flex items-center justify-center rounded-lg bg-[#111] px-6 py-3 text-white transition-all duration-200 hover:bg-[#1C1E23]"
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
