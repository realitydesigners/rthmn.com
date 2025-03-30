'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type SupportThread = Database['public']['Tables']['support_threads']['Row'];
type Message = Database['public']['Tables']['support_messages']['Row'];

export default function SupportPage() {
    const [threads, setThreads] = useState<SupportThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [newThreadSubject, setNewThreadSubject] = useState('');
    const [isCreatingThread, setIsCreatingThread] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const fetchThreads = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase.from('support_threads').select('*').eq('user_id', user.id).order('last_message_time', { ascending: false });

            if (error) {
                console.error('Error fetching threads:', error);
                return;
            }

            setThreads(data);
        };

        fetchThreads();

        const subscription = supabase
            .channel('user_threads')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'support_threads',
                    filter: `user_id=eq.${supabase.auth.getUser()}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setThreads((prev) => [payload.new as SupportThread, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setThreads((prev) => prev.map((thread) => (thread.id === payload.new.id ? (payload.new as SupportThread) : thread)));
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
            const { data, error } = await supabase.from('support_messages').select('*').eq('thread_id', selectedThread.id).order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching messages:', error);
                return;
            }

            setMessages(data);
        };

        fetchMessages();

        const subscription = supabase
            .channel(`messages:${selectedThread.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
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

            const { data, error } = await supabase.from('support_threads').insert({
                product_id: 'default', // You might want to make this configurable
                user_id: user.id,
                user_name: user.user_metadata?.full_name || 'User',
                user_email: user.email,
                subject: newThreadSubject.trim(),
                status: 'open',
            });

            if (error) throw error;
            if (!data) throw new Error('No data returned from insert');
            setIsCreatingThread(false);
            setNewThreadSubject('');
            setSelectedThread(data[0]);
        } catch (error) {
            console.error('Error creating thread:', error);
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

            const { error } = await supabase.from('support_messages').insert({
                thread_id: selectedThread.id,
                sender_id: user.id,
                sender_name: user.user_metadata?.full_name || 'User',
                sender_type: 'user',
                content: newMessage.trim(),
            });

            if (error) throw error;
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className='container mx-auto p-4'>
            {!selectedThread && !isCreatingThread ? (
                <div>
                    <button onClick={() => setIsCreatingThread(true)} className='mb-4 rounded-md bg-blue-600 px-4 py-2 text-white'>
                        Create New Support Thread
                    </button>
                    <div className='space-y-4'>
                        {threads.map((thread) => (
                            <div key={thread.id} onClick={() => setSelectedThread(thread)} className='cursor-pointer rounded-lg border p-4 hover:bg-gray-50'>
                                <div className='flex items-center justify-between'>
                                    <h3 className='font-medium'>{thread.subject || 'No Subject'}</h3>
                                    <span className='text-sm text-gray-500'>{new Date(thread.last_message_time || '').toLocaleDateString()}</span>
                                </div>
                                <p className='mt-2 text-sm text-gray-600'>{thread.last_message}</p>
                                <div className='mt-2 flex items-center gap-2'>
                                    {thread.status === 'open' ? <span className='text-xs text-green-500'>Open</span> : <span className='text-xs text-gray-500'>Closed</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : isCreatingThread ? (
                <form onSubmit={handleCreateThread} className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Subject</label>
                        <input
                            type='text'
                            value={newThreadSubject}
                            onChange={(e) => setNewThreadSubject(e.target.value)}
                            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2'
                            placeholder='Enter subject'
                        />
                    </div>
                    <div className='flex gap-2'>
                        <button type='submit' className='rounded-md bg-blue-600 px-4 py-2 text-white'>
                            Create Thread
                        </button>
                        <button type='button' onClick={() => setIsCreatingThread(false)} className='rounded-md border border-gray-300 px-4 py-2'>
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className='flex h-[calc(100vh-200px)] flex-col'>
                    <div className='mb-4 flex items-center justify-between'>
                        <h2 className='text-lg font-semibold'>{selectedThread.subject}</h2>
                        <button onClick={() => setSelectedThread(null)} className='text-sm text-gray-500 hover:text-gray-700'>
                            Back to Threads
                        </button>
                    </div>
                    <div className='flex-1 space-y-4 overflow-y-auto'>
                        {messages.map((message) => (
                            <div key={message.id} className={`flex ${message.sender_type === 'support_team' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${message.sender_type === 'support_team' ? 'bg-gray-100 text-gray-900' : 'bg-blue-600 text-white'}`}>
                                    <div className='mb-1 text-sm font-medium'>{message.sender_name}</div>
                                    <div className='text-sm'>{message.content}</div>
                                    <div className='mt-1 text-xs opacity-70'>{new Date(message.created_at || '').toLocaleTimeString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSendMessage} className='mt-4'>
                        <div className='flex gap-2'>
                            <input
                                type='text'
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder='Type your message...'
                                className='flex-1 rounded-md border border-gray-300 px-4 py-2'
                            />
                            <button type='submit' className='rounded-md bg-blue-600 px-4 py-2 text-white'>
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
