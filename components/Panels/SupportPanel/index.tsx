"use client";

import { createClient } from "@/lib/supabase/client";
import {
	createSupportThread,
	getSupportMessages,
	getSupportThreads,
	sendSupportMessage,
} from "@/lib/supabase/queries";
import type { Database } from "@/types/supabase";
import { useEffect, useState } from "react";
import { LuHelpCircle, LuMessageSquare, LuX } from "react-icons/lu";

type SupportThread = Database["public"]["Tables"]["support_threads"]["Row"];
type Message = Database["public"]["Tables"]["support_messages"]["Row"];

interface SupportPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

export const SupportPanel = ({ isOpen, onClose }: SupportPanelProps) => {
	const [threads, setThreads] = useState<SupportThread[]>([]);
	const [selectedThread, setSelectedThread] = useState<SupportThread | null>(
		null,
	);
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [newThreadSubject, setNewThreadSubject] = useState("");
	const [isCreatingThread, setIsCreatingThread] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const supabase = createClient();

	const clearError = () => {
		setError(null);
	};

	useEffect(() => {
		const fetchThreads = async () => {
			try {
				const data = await getSupportThreads(supabase);
				if (data) {
					setThreads(data);
				}
			} catch (error) {
				console.error("Error fetching threads:", error);
				setError(
					error instanceof Error
						? error.message
						: "Failed to load support threads",
				);
			}
		};

		if (isOpen) {
			fetchThreads();
		}

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
	}, [isOpen]);

	useEffect(() => {
		if (!selectedThread) return;

		const fetchMessages = async () => {
			try {
				const data = await getSupportMessages(supabase, selectedThread.id);
				if (data) {
					setMessages(data);
				}
			} catch (error) {
				console.error("Error fetching messages:", error);
				setError(
					error instanceof Error ? error.message : "Failed to load messages",
				);
			}
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

		setIsLoading(true);
		clearError();
		try {
			const data = await createSupportThread(supabase, newThreadSubject);
			if (data) {
				setIsCreatingThread(false);
				setNewThreadSubject("");
				setSelectedThread(data);
			}
		} catch (error) {
			console.error("Error creating thread:", error);
			setError(
				error instanceof Error
					? error.message
					: "Failed to create support thread",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMessage.trim() || !selectedThread) return;

		setIsLoading(true);
		clearError();
		try {
			const data = await sendSupportMessage(
				supabase,
				selectedThread.id,
				newMessage,
			);
			if (data) {
				setMessages((prev) => [...prev, data]);
				setNewMessage("");
			}
		} catch (error) {
			console.error("Error sending message:", error);
			setError(
				error instanceof Error ? error.message : "Failed to send message",
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed top-0 right-0 z-[200] h-full w-96 transform transition-transform duration-300 ease-in-out">
			<div className="flex h-full flex-col bg-[#0a0a0a]">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-[#1C1E23] p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-md bg-[#1C1E23] p-2">
							<LuHelpCircle className="h-4 w-4 text-white" />
						</div>
						<h2 className="font-outfit text-xl font-bold text-white">
							Support
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-md p-2 text-zinc-400 hover:bg-[#1C1E23] hover:text-white"
					>
						<LuX className="h-5 w-5" />
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="border-b border-red-500/20 bg-red-500/10 p-4">
						<p className="font-outfit text-sm text-red-500">{error}</p>
					</div>
				)}

				{/* Content */}
				<div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1C1E23] flex-1 overflow-y-auto">
					{!selectedThread && !isCreatingThread ? (
						<div className="p-4">
							<button
								onClick={() => setIsCreatingThread(true)}
								disabled={isLoading}
								className="mb-4 w-full rounded-full bg-blue-600 px-4 py-2 text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
							>
								{isLoading ? "Creating..." : "Create New Support Thread"}
							</button>
							<div className="space-y-4">
								{threads.map((thread) => (
									<div
										key={thread.id}
										onClick={() => setSelectedThread(thread)}
										className="cursor-pointer rounded-lg border border-[#1C1E23] p-4 transition-all duration-200 hover:bg-[#1C1E23]"
									>
										<div className="flex items-center justify-between">
											<h3 className="font-outfit font-medium text-white">
												{thread.subject || "No Subject"}
											</h3>
											<span className="font-outfit text-sm text-zinc-400">
												{new Date(
													thread.last_message_time || "",
												).toLocaleDateString()}
											</span>
										</div>
										<p className="font-outfit mt-2 text-sm text-zinc-400">
											{thread.last_message}
										</p>
										<div className="mt-2 flex items-center gap-2">
											{thread.status === "open" ? (
												<span className="font-outfit text-xs text-blue-500">
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
						<form onSubmit={handleCreateThread} className="p-4">
							<div>
								<label className="font-outfit block text-sm font-medium text-zinc-400">
									Subject
								</label>
								<input
									type="text"
									value={newThreadSubject}
									onChange={(e) => setNewThreadSubject(e.target.value)}
									disabled={isLoading}
									className="font-outfit mt-1 block w-full rounded-md border border-[#1C1E23] bg-[#1C1E23] px-3 py-2 text-white placeholder-zinc-400 disabled:opacity-50"
									placeholder="Enter subject"
								/>
							</div>
							<div className="mt-4 flex gap-2">
								<button
									type="submit"
									disabled={isLoading}
									className="font-outfit flex-1 rounded-full bg-blue-600 px-4 py-2 text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
								>
									{isLoading ? "Creating..." : "Create Thread"}
								</button>
								<button
									type="button"
									onClick={() => setIsCreatingThread(false)}
									disabled={isLoading}
									className="font-outfit rounded-full border border-[#1C1E23] px-4 py-2 text-white transition-all duration-200 hover:bg-[#1C1E23] disabled:opacity-50"
								>
									Cancel
								</button>
							</div>
						</form>
					) : (
						<div className="flex h-full flex-col">
							<div className="border-b border-[#1C1E23] p-4">
								<div className="flex items-center justify-between">
									<h3 className="font-outfit font-medium text-white">
										{selectedThread.subject}
									</h3>
									<button
										onClick={() => setSelectedThread(null)}
										className="font-outfit text-sm text-zinc-400 hover:text-white"
									>
										Back
									</button>
								</div>
							</div>
							<div className="flex-1 space-y-4 overflow-y-auto p-4">
								{messages.map((message) => (
									<div
										key={message.id}
										className={`flex ${message.sender_type === "support_team" ? "justify-start" : "justify-end"}`}
									>
										<div
											className={`font-outfit max-w-[80%] rounded-lg p-3 ${
												message.sender_type === "support_team"
													? "bg-[#1C1E23] text-white"
													: "bg-blue-600 text-white"
											}`}
										>
											<div className="mb-1 text-sm font-medium">
												{message.sender_name}
											</div>
											<div className="text-sm">{message.content}</div>
											<div className="mt-1 text-xs opacity-70">
												{new Date(
													message.created_at || "",
												).toLocaleTimeString()}
											</div>
										</div>
									</div>
								))}
							</div>
							<form
								onSubmit={handleSendMessage}
								className="border-t border-[#1C1E23] p-4"
							>
								<div className="flex gap-2">
									<input
										type="text"
										value={newMessage}
										onChange={(e) => setNewMessage(e.target.value)}
										disabled={isLoading}
										placeholder="Type your message..."
										className="font-outfit flex-1 rounded-md border border-[#1C1E23] bg-[#1C1E23] px-4 py-2 text-white placeholder-zinc-400 disabled:opacity-50"
									/>
									<button
										type="submit"
										disabled={isLoading}
										className="font-outfit rounded-full bg-blue-600 px-4 py-2 text-white transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
									>
										{isLoading ? "Sending..." : "Send"}
									</button>
								</div>
							</form>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="mt-4 border-t border-[#1C1E23] pb-4 text-center">
					<p className="font-outfit text-xs text-zinc-500">
						© {new Date().getFullYear()} Rthmn
					</p>
				</div>
			</div>
		</div>
	);
};
