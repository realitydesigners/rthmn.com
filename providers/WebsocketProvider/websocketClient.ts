import { BoxSlice } from '@/types/types';
import { decode } from '@msgpack/msgpack';

interface WebSocketMessage {
  type: 'boxSlice' | 'subscribeAll' | 'ack' | 'updateAll';
  pair?: string;
  data?: any;
  message?: string;
}

class WebSocketClient {
  private socket: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Map<string, (data: BoxSlice) => void> = new Map();
  private openHandlers: Set<() => void> = new Set();
  private closeHandlers: Set<() => void> = new Set();
  private globalMessageHandlers: Set<(event: MessageEvent) => void> = new Set();
  private accessToken: string | null = null;
  private isAuthenticated: boolean = false;
  private pendingOperations: (() => void)[] = [];

  public setAccessToken(token: string) {
    this.accessToken = token;
  }

  public connect() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!this.canConnect(wsUrl)) return;

    try {
      this.initializeConnection(wsUrl!);
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
    }
  }

  private canConnect(wsUrl: string | undefined): boolean {
    if (!wsUrl) {
      console.error('WebSocket URL is not defined in environment variables');
      return false;
    }
    if (!this.accessToken) {
      console.error('Access token not set. Cannot connect to WebSocket.');
      return false;
    }
    return true;
  }

  private initializeConnection(wsUrl: string) {
    this.socket = new WebSocket(wsUrl);
    this.socket.binaryType = 'arraybuffer';
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.onopen = () => this.handleOpen();
    this.socket.onmessage = (event) => this.handleMessage(event);
    this.socket.onerror = (error) => this.handleError(error);
    this.socket.onclose = (event) => this.handleClose(event);
  }

  private handleOpen() {
    console.log('🟢 WebSocket connection opened');
    this.authenticate();
  }

  private handleMessage(event: MessageEvent) {
    try {
      let message;
      if (event.data instanceof ArrayBuffer) {
        const uint8Array = new Uint8Array(event.data);
        message = decode(uint8Array);
      } else {
        message = JSON.parse(event.data);
      }

      if (message.type !== 'ack') {
        console.log('📥 WebSocket:', {
          type: message.type,
          ...(message.pair && { pair: message.pair }),
          timestamp: new Date().toISOString(),
          ...(message.type === 'subscribeAll' && {
            action: 'Initial subscription',
            pairs: Object.keys(message.data || {}).length,
            data: message.data
          }),
          ...(message.type === 'updateAll' && {
            action: 'Bulk update',
            pairs: Object.keys(message.data || {}).length,
            data: message.data
          }),
          ...(message.type === 'boxSlice' && {
            data: message.data
          })
        });
      }

      this.processMessage(message);
    } catch (error) {
      console.error('❌ Error processing WebSocket message:', error, {
        dataType: event.data?.constructor?.name,
        messageLength: event.data?.byteLength
      });
    }
  }

  private processMessage(message: WebSocketMessage) {
    const timestamp = new Date().toISOString();
    this.logMessage(message, timestamp);

    switch (message.type) {
      case 'boxSlice':
        this.handleBoxSliceMessage(message, timestamp);
        break;
      case 'subscribeAll':
        this.handleSubscribeAllMessage(message);
        break;
      case 'ack':
        this.handleAckMessage(message);
        break;
      case 'updateAll':
        this.handleUpdateAllMessage(message);
        break;
    }
  }

  private handleSubscribeAllMessage(message: WebSocketMessage) {
    if (!message.data) return;

    console.log('📊 Initial data received:', {
      pairs: Object.keys(message.data).join(', '),
      timestamp: new Date().toISOString()
    });

    Object.entries(message.data).forEach(([pair, data]) => {
      const handler = this.messageHandlers.get(pair);
      if (handler) {
        const boxSlice = this.formatBoxSliceData(
          data,
          new Date().toISOString()
        );
        handler(boxSlice);
      }
    });
  }

  private handleUpdateAllMessage(message: WebSocketMessage) {
    if (!message.data) return;

    console.log('🔄 Bulk update received:', {
      pairs: Object.keys(message.data).join(', '),
      timestamp: new Date().toISOString()
    });

    Object.entries(message.data).forEach(([pair, data]) => {
      const handler = this.messageHandlers.get(pair);
      if (handler) {
        const boxSlice = this.formatBoxSliceData(
          data,
          new Date().toISOString()
        );
        handler(boxSlice);
      }
    });
  }

  private handleAckMessage(message: any) {
    if (message.message === 'auth operation successful') {
      this.handleAuthSuccess();
    } else {
      // console.log('✅ Received ack:', message);
    }
  }

  private handleAuthSuccess() {
    console.log('🟢 Authentication successful');
    this.isAuthenticated = true;
    this.openHandlers.forEach((handler) => handler());
    this.subscribeAll();
    this.processPendingOperations();
  }

  private handleError(error: Event) {
    console.error('🔴 WebSocket error:', error);
  }

  private handleClose(event: CloseEvent) {
    this.cleanupConnection();
    this.scheduleReconnect(event);
  }

  private cleanupConnection() {
    this.isAuthenticated = false;
  }

  private scheduleReconnect(event: CloseEvent) {
    console.log('🔴 WebSocket connection closed:', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      timestamp: new Date().toISOString()
    });

    setTimeout(() => this.connect(), 5000);
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

  public onMessage(handler: (event: MessageEvent) => void) {
    this.globalMessageHandlers.add(handler);
  }

  public offMessage(handler: (event: MessageEvent) => void) {
    this.globalMessageHandlers.delete(handler);
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

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private authenticate() {
    if (this.socket?.readyState === WebSocket.OPEN && this.accessToken) {
      console.log(' Sending authentication message');
      this.socket.send(
        JSON.stringify({ type: 'auth', token: this.accessToken })
      );
    } else {
      console.warn('��️ Cannot authenticate - socket not ready or no token', {
        readyState: this.socket?.readyState,
        hasToken: !!this.accessToken,
        socketState: this.socket
          ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.socket.readyState]
          : 'NO_SOCKET'
      });
    }
  }

  private processPendingOperations() {
    while (this.pendingOperations.length > 0) {
      const operation = this.pendingOperations.shift();
      operation?.();
    }
  }

  private handleBoxSliceMessage(message: any, timestamp: string) {
    if (message.pair && message.data) {
      const handler = this.messageHandlers.get(message.pair);
      if (handler) {
        const boxSlice: BoxSlice = {
          boxes: message.data.boxes || [],
          timestamp: message.data.timestamp || timestamp,
          currentOHLC: message.data.currentOHLC
        };
        handler(boxSlice);
      }
    }
  }

  private logMessage(message: any, timestamp: string) {
    // console.log('📥 WebSocket message:', {
    //   type: message.type,
    //   pair: message.pair,
    //   timestamp,
    //   dataTimestamp: message.data?.timestamp
    // });
  }

  private async subscribeAll(retryCount = 3) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      if (retryCount > 0) {
        console.log(
          `Retrying subscribeAll in 1s (${retryCount} attempts left)`
        );
        setTimeout(() => this.subscribeAll(retryCount - 1), 1000);
        return;
      }
      console.error('Failed to subscribe to all pairs after retries');
      return;
    }

    try {
      this.socket.send(JSON.stringify({ type: 'subscribeAll' }));
    } catch (error) {
      console.error('Failed to send subscribeAll message:', error);
      if (retryCount > 0) {
        setTimeout(() => this.subscribeAll(retryCount - 1), 1000);
      }
    }
  }

  private formatBoxSliceData(data: any, timestamp: string): BoxSlice {
    return {
      boxes: data.boxes || [],
      timestamp: data.timestamp || timestamp,
      currentOHLC: data.currentOHLC || {
        open: 0,
        high: 0,
        low: 0,
        close: 0
      }
    };
  }
}

export const wsClient = new WebSocketClient();
