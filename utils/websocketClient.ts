import { BoxSlice, PairData } from '@/types/types';

class WebSocketClient {
  private socket: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private openHandlers: Set<() => void> = new Set();
  private closeHandlers: Set<() => void> = new Set();
  private accessToken: string | null = null;
  private isAuthenticated: boolean = false;
  private pendingOperations: (() => void)[] = [];

  constructor() {
    // Remove the automatic connection from the constructor
  }

  public setAccessToken(token: string) {
    this.accessToken = token;
  }

  public connect() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

    if (!wsUrl) {
      console.error('WebSocket URL is not defined in environment variables');
      return;
    }

    if (!this.accessToken) {
      console.error('Access token not set. Cannot connect to WebSocket.');
      return;
    }

    console.log(`Attempting to connect to WebSocket at ${wsUrl}`);

    try {
      this.socket = new WebSocket(wsUrl);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return;
    }

    this.socket.onopen = () => {
      console.log('WebSocket connection opened');
      this.authenticate();
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received WebSocket message:', message);

        if (
          message.type === 'ack' &&
          message.message === 'auth operation successful'
        ) {
          this.isAuthenticated = true;
          this.openHandlers.forEach((handler) => handler());
          this.processPendingOperations();
        } else if (message.type === 'boxSlice') {
          const handler = this.messageHandlers.get(message.pair);
          if (handler) {
            handler(message.data);
          } else {
            console.warn(`No handler found for pair ${message.pair}`);
          }
        } else if (message.type === 'error') {
          console.error('Received error message from server:', message.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = (event) => {
      console.log(
        `WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`
      );
      this.isAuthenticated = false;
      this.closeHandlers.forEach((handler) => handler());
      console.log('Attempting to reconnect in 5 seconds...');
      setTimeout(() => this.connect(), 5000);
    };
  }

  private authenticate() {
    if (this.socket?.readyState === WebSocket.OPEN && this.accessToken) {
      this.socket.send(
        JSON.stringify({ type: 'auth', token: this.accessToken })
      );
      console.log('Authentication message sent');
    }
  }

  private processPendingOperations() {
    while (this.pendingOperations.length > 0) {
      const operation = this.pendingOperations.shift();
      if (operation) {
        operation();
      }
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private resubscribe() {
    if (this.isAuthenticated && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'subscribe',
          pairs: Array.from(this.subscriptions)
        })
      );
    } else {
      this.pendingOperations.push(() => this.resubscribe());
    }
  }

  public subscribe(pair: string, handler: (data: BoxSlice) => void) {
    this.subscriptions.add(pair);
    this.messageHandlers.set(pair, handler);
    if (this.isAuthenticated && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'subscribe', pairs: [pair] }));
    } else {
      this.pendingOperations.push(() => this.subscribe(pair, handler));
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
