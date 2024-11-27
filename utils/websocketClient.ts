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
  private globalMessageHandlers: Set<(event: MessageEvent) => void> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastUpdateTimes: Map<string, number> = new Map(); // Track last update for each pair

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

    console.log(`🔌 Attempting to connect to WebSocket at ${wsUrl}`);

    try {
      this.socket = new WebSocket(wsUrl);

      // Add connection state logging
      console.log('📡 WebSocket State:', {
        readyState: this.socket.readyState,
        isAuthenticated: this.isAuthenticated,
        hasSubscriptions: this.subscriptions.size > 0
      });

      this.socket.onopen = () => {
        console.log('🟢 WebSocket connection opened');
        this.authenticate();
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const timestamp = new Date().toISOString();

          // Enhanced logging for all message types
          console.log('📥 WebSocket message received:', {
            type: message.type,
            pair: message.pair,
            timestamp,
            dataTimestamp: message.data?.timestamp,
            hasData: !!message.data,
            dataType: message.data ? typeof message.data : 'none',
            subscriptionStatus: {
              isAuthenticated: this.isAuthenticated,
              activeSubscriptions: Array.from(this.subscriptions),
              hasHandler: message.pair
                ? this.messageHandlers.has(message.pair)
                : false
            }
          });

          if (message.type === 'boxSlice') {
            this.handleBoxSliceMessage(message, timestamp);
          } else if (
            message.type === 'ack' &&
            message.message === 'auth operation successful'
          ) {
            console.log('🟢 Authentication successful, resubscribing to pairs');
            this.isAuthenticated = true;
            this.openHandlers.forEach((handler) => handler());
            this.processPendingOperations();
            this.resubscribe();
          } else if (message.type === 'ack') {
            console.log('✅ Received ack:', message);
          }
        } catch (error) {
          console.error('❌ Error processing WebSocket message:', error);
          console.log('Raw message:', event.data);
        }
      };

      this.socket.onerror = (error) => {
        console.error('🔴 WebSocket error:', error);
      };

      this.socket.onclose = (event) => {
        this.isAuthenticated = false;
        this.stopHeartbeat();
        console.log('🔴 WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          timestamp: new Date().toISOString()
        });

        // Attempt to reconnect
        console.log('🔄 Attempting to reconnect in 5 seconds...');
        setTimeout(() => {
          console.log('🔄 Reconnecting...');
          this.connect();
        }, 5000);
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
    }
  }

  private authenticate() {
    if (this.socket?.readyState === WebSocket.OPEN && this.accessToken) {
      console.log('🔑 Sending authentication message');
      this.socket.send(
        JSON.stringify({ type: 'auth', token: this.accessToken })
      );
    } else {
      console.warn('⚠️ Cannot authenticate - socket not ready or no token', {
        readyState: this.socket?.readyState,
        hasToken: !!this.accessToken
      });
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
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private resubscribe() {
    if (this.isAuthenticated && this.socket?.readyState === WebSocket.OPEN) {
      const pairs = Array.from(this.subscriptions);
      if (pairs.length > 0) {
        console.log('🔄 Refreshing subscriptions for pairs:', pairs);

        // Send individual subscription for each pair
        pairs.forEach((pair) => {
          const subscribeMessage = {
            type: 'subscribe',
            pairs: [pair]
          };
          console.log(`📤 Sending subscription for ${pair}:`, subscribeMessage);
          this.socket!.send(JSON.stringify(subscribeMessage));
        });
      }
    }
  }

  public subscribe(pair: string, handler: (data: BoxSlice) => void) {
    console.log(`📌 Subscribing to ${pair}`);

    // Initialize last update time when subscribing
    this.lastUpdateTimes.set(pair, Date.now());
    this.subscriptions.add(pair);
    this.messageHandlers.set(pair, handler);

    if (this.isAuthenticated && this.socket?.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'subscribe',
        pairs: [pair]
      };
      this.socket.send(JSON.stringify(subscribeMessage));
    } else {
      this.pendingOperations.push(() => this.subscribe(pair, handler));
    }
  }

  public unsubscribe(pair: string) {
    this.subscriptions.delete(pair);
    this.messageHandlers.delete(pair);
    this.lastUpdateTimes.delete(pair); // Clean up the update time
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

  public onMessage(handler: (event: MessageEvent) => void) {
    this.globalMessageHandlers.add(handler);
  }

  public offMessage(handler: (event: MessageEvent) => void) {
    this.globalMessageHandlers.delete(handler);
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Initialize lastUpdateTimes for all subscribed pairs
    Array.from(this.subscriptions).forEach((pair) => {
      if (!this.lastUpdateTimes.has(pair)) {
        this.lastUpdateTimes.set(pair, Date.now());
      }
    });

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        const now = Date.now();
        const pairs = Array.from(this.subscriptions);

        // Check which pairs need updates
        pairs.forEach((pair) => {
          const lastUpdate = this.lastUpdateTimes.get(pair) || now; // Default to now if no update time
          const timeSinceUpdate = now - lastUpdate;

          // If it's been more than 8 seconds since last update, request new data
          if (timeSinceUpdate > 8000) {
            console.log(
              `🔄 Requesting update for ${pair} (${Math.round(timeSinceUpdate / 1000)}s since last update)`
            );
            const subscribeMessage = {
              type: 'subscribe',
              pairs: [pair]
            };
            this.socket!.send(JSON.stringify(subscribeMessage));
          }
        });
      }
    }, 2000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
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

        // Update last update time for this pair
        this.lastUpdateTimes.set(message.pair, Date.now());

        console.log(`📦 Processing boxSlice for ${message.pair}:`, {
          timestamp: boxSlice.timestamp,
          boxCount: boxSlice.boxes.length,
          currentPrice: boxSlice.currentOHLC.close,
          secondsSinceLastUpdate: Math.round(
            (Date.now() -
              (this.lastUpdateTimes.get(message.pair) || Date.now())) /
              1000
          )
        });

        handler(boxSlice);
      }
    }
  }
}

export const wsClient = new WebSocketClient();
