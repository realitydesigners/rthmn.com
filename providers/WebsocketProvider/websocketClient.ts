import { BoxSlice } from '@/types/types';

class WebSocketClient {
  private socket: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Map<string, (data: BoxSlice) => void> = new Map();
  private openHandlers: Set<() => void> = new Set();
  private closeHandlers: Set<() => void> = new Set();
  private globalMessageHandlers: Set<(event: MessageEvent) => void> = new Set();
  private accessToken: string | null = null;
  private isAuthenticated: boolean = false;
  private lastUpdateTimes: Map<string, number> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private pendingOperations: (() => void)[] = [];

  private static readonly UPDATE_CHECK_INTERVAL = 2000; // 2 seconds
  private static readonly UPDATE_THRESHOLD = 8000; // 8 seconds

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
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      this.processMessage(message);
    } catch (error) {
      console.error('❌ Error processing WebSocket message:', error);
    }
  }

  private processMessage(message: any) {
    const timestamp = new Date().toISOString();
    this.logMessage(message, timestamp);

    switch (message.type) {
      case 'boxSlice':
        this.handleBoxSliceMessage(message, timestamp);
        break;
      case 'ack':
        this.handleAckMessage(message);
        break;
    }
  }

  private handleAckMessage(message: any) {
    if (message.message === 'auth operation successful') {
      this.handleAuthSuccess();
    } else {
      console.log('✅ Received ack:', message);
    }
  }

  private handleAuthSuccess() {
    console.log('🟢 Authentication successful, resubscribing to pairs');
    this.isAuthenticated = true;
    this.openHandlers.forEach((handler) => handler());
    this.processPendingOperations();
    this.resubscribe();
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
    this.stopHeartbeat();
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
    this.lastUpdateTimes.delete(pair);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'unsubscribe', pairs: [pair] }));
    }
  }

  public disconnect() {
    this.stopHeartbeat();
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
      console.warn('⚠️ Cannot authenticate - socket not ready or no token', {
        readyState: this.socket?.readyState,
        hasToken: !!this.accessToken,
        socketState: this.socket
          ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.socket.readyState]
          : 'NO_SOCKET'
      });
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    Array.from(this.subscriptions).forEach((pair) => {
      if (!this.lastUpdateTimes.has(pair)) {
        this.lastUpdateTimes.set(pair, Date.now());
      }
    });

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.checkForUpdates();
      }
    }, WebSocketClient.UPDATE_CHECK_INTERVAL);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private checkForUpdates() {
    const now = Date.now();
    Array.from(this.subscriptions).forEach((pair) => {
      const lastUpdate = this.lastUpdateTimes.get(pair) || now;
      const timeSinceUpdate = now - lastUpdate;

      if (timeSinceUpdate > WebSocketClient.UPDATE_THRESHOLD) {
        this.requestUpdate(pair, timeSinceUpdate);
      }
    });
  }

  private requestUpdate(pair: string, timeSinceUpdate: number) {
    console.log(
      `🔄 Requesting update for ${pair} (${Math.round(timeSinceUpdate / 1000)}s since last update)`
    );
    this.socket!.send(JSON.stringify({ type: 'subscribe', pairs: [pair] }));
  }

  private resubscribe() {
    const pairs = Array.from(this.subscriptions);
    if (pairs.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      pairs.forEach((pair) => this.requestUpdate(pair, 0));
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
          currentOHLC: message.data.currentOHLC || {
            open: 0,
            high: 0,
            low: 0,
            close: 0
          }
        };
        this.lastUpdateTimes.set(message.pair, Date.now());
        handler(boxSlice);
      }
    }
  }

  private logMessage(message: any, timestamp: string) {
    console.log('📥 WebSocket message:', {
      type: message.type,
      pair: message.pair,
      timestamp,
      dataTimestamp: message.data?.timestamp
    });
  }
}

export const wsClient = new WebSocketClient();
