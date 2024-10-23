'use client';
import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { BoxSlice } from '@/types';

export default function WebSocketTestPage() {
  const {
    isConnected,
    connect,
    disconnect,
    subscribeToBoxSlices,
    unsubscribeFromBoxSlices
  } = useWebSocket();
  const [messages, setMessages] = useState<BoxSlice[]>([]);
  const [pair, setPair] = useState('BTC-USD');

  useEffect(() => {
    const handleBoxSlice = (data: BoxSlice) => {
      setMessages((prevMessages) => [...prevMessages, data].slice(-5));
    };

    return () => {
      unsubscribeFromBoxSlices(pair);
    };
  }, [pair, unsubscribeFromBoxSlices]);

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSubscribe = () => {
    subscribeToBoxSlices(pair, (data: BoxSlice) => {
      setMessages((prevMessages) => [...prevMessages, data].slice(-5));
    });
  };

  const handleUnsubscribe = () => {
    unsubscribeFromBoxSlices(pair);
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">WebSocket Test Page</h1>
      <div className="mb-4">
        <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      </div>
      <div className="mb-4 space-x-2">
        <button
          onClick={handleConnect}
          className="rounded bg-green-500 px-4 py-2 text-white"
        >
          Connect
        </button>
        <button
          onClick={handleDisconnect}
          className="rounded bg-red-500 px-4 py-2 text-white"
        >
          Disconnect
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={pair}
          onChange={(e) => setPair(e.target.value)}
          className="rounded border px-2 py-1"
          placeholder="Enter pair (e.g., BTC-USD)"
        />
      </div>
      <div className="mb-4 space-x-2">
        <button
          onClick={handleSubscribe}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Subscribe
        </button>
        <button
          onClick={handleUnsubscribe}
          className="rounded bg-yellow-500 px-4 py-2 text-white"
        >
          Unsubscribe
        </button>
      </div>
      <div>
        <h2 className="mb-2 text-xl font-semibold">Received Messages:</h2>
        <ul className="space-y-2">
          {messages.map((msg, index) => (
            <li key={index} className="rounded border p-2">
              {JSON.stringify(msg)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
