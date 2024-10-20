import { BoxSlice, PairData } from '@/types';

class WebSocketClient {
  private socket: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private openHandlers: Set<() => void> = new Set();
  private closeHandlers: Set<() => void> = new Set();

  constructor() {
    this.connect();
  }

  private connect() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const wsUrl = isDevelopment
      ? process.env.NEXT_PUBLIC_WS_URL_DEV
      : process.env.NEXT_PUBLIC_WS_URL_PROD;

    if (!wsUrl) {
      console.error('WebSocket URL is not defined in environment variables');
      return;
    }

    console.log('Attempting to connect WebSocket to:', wsUrl);
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected successfully');
      this.resubscribe();
      this.openHandlers.forEach((handler) => handler());
    };

    this.socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const message = JSON.parse(event.data);
        console.log('Parsed WebSocket message:', message);
        if (message.type === 'boxSlice') {
          console.log(
            `WebSocket boxSlice update for ${message.pair}:`,
            message.data
          );
          const handler = this.messageHandlers.get(message.pair);
          if (handler) {
            handler(message.data);
          } else {
            console.warn(`No handler found for pair ${message.pair}`);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      this.closeHandlers.forEach((handler) => handler());
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
    console.log(`Subscribing to WebSocket updates for ${pair}`);
    this.subscriptions.add(pair);
    this.messageHandlers.set(pair, handler);
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log(`Sending WebSocket subscription message for ${pair}`);
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

  public onOpen(handler: () => void) {
    this.openHandlers.add(handler);
  }

  public offOpen(handler: () => void) {
    this.openHandlers.delete(handler);
  }

  public onClose(handler: () => void) {
    this.closeHandlers.add(handler);
  }

  public offClose(handler: () => void) {
    this.closeHandlers.delete(handler);
  }
}

export const wsClient = new WebSocketClient();
