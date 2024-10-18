import { BoxSlice, PairData } from '@/types';

class WebSocketClient {
  private socket: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8081';
    const wsUrl = baseUrl.replace(/^http/, 'ws');
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.resubscribe();
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'boxSlice') {
        const handler = this.messageHandlers.get(message.pair);
        if (handler) {
          handler(message.data);
        }
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      setTimeout(() => this.connect(), 5000);
    };
  }

  private resubscribe() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'subscribe',
          pairs: Array.from(this.subscriptions)
        })
      );
    }
  }

  public subscribe(pair: string, handler: (data: BoxSlice) => void) {
    this.subscriptions.add(pair);
    this.messageHandlers.set(pair, handler);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'subscribe', pairs: [pair] }));
    }
  }

  public unsubscribe(pair: string) {
    this.subscriptions.delete(pair);
    this.messageHandlers.delete(pair);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'unsubscribe', pairs: [pair] }));
    }
  }
}

export const wsClient = new WebSocketClient();
