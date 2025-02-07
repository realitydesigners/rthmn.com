import { decode } from '@msgpack/msgpack';
import { BoxSlice, PriceData } from '@/types/types';

type MessageType = 'auth' | 'subscribe' | 'unsubscribe' | 'price' | 'boxSlice' | 'error' | 'ack';

interface WebSocketMessage {
    type: MessageType;
    pair?: string;
    data?: any;
    message?: string;
}

class WebSocketClient {
    private socket: WebSocket | null = null;
    private accessToken: string | null = null;
    private isAuthenticated: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 1000; // Base delay of 1 second

    private handlers = {
        message: new Set<(event: MessageEvent) => void>(),
        open: new Set<() => void>(),
        close: new Set<() => void>(),
        error: new Set<(error: any) => void>(),
        subscriptions: new Map<string, (data: BoxSlice) => void>(),
    };

    public setAccessToken(token: string) {
        this.accessToken = token;
    }

    public connect() {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
        if (!wsUrl || !this.accessToken) {
            console.error('Cannot connect: missing URL or access token');
            return;
        }

        try {
            this.socket = new WebSocket(wsUrl);
            this.socket.binaryType = 'arraybuffer';
            this.setupEventHandlers();
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.handleReconnect();
        }
    }

    private setupEventHandlers() {
        if (!this.socket) return;

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.authenticate();
            this.reconnectAttempts = 0;
        };

        this.socket.onmessage = this.handleMessage.bind(this);
        this.socket.onerror = this.handleError.bind(this);
        this.socket.onclose = this.handleClose.bind(this);
    }

    private handleMessage(event: MessageEvent) {
        try {
            let message: WebSocketMessage;

            // Handle binary messages (msgpackr encoded from Bun)
            if (event.data instanceof ArrayBuffer) {
                const uint8Array = new Uint8Array(event.data);
                message = decode(uint8Array) as WebSocketMessage;
            }
            // Handle text messages (JSON)
            else if (typeof event.data === 'string') {
                message = JSON.parse(event.data);
            } else {
                throw new Error(`Unsupported message format: ${typeof event.data}`);
            }

            this.processMessage(message);
        } catch (error) {
            console.error('Error processing message:', error);
            this.handlers.error.forEach((handler) => handler(error));
        }
    }

    private processMessage(message: WebSocketMessage) {
        switch (message.type) {
            case 'ack':
                if (message.message === 'auth operation successful') {
                    this.isAuthenticated = true;
                    this.handlers.open.forEach((handler) => handler());
                    this.resubscribeAll();
                }
                break;

            case 'boxSlice':
                if (message.pair && message.data) {
                    const handler = this.handlers.subscriptions.get(message.pair);
                    if (handler) {
                        const boxSlice: BoxSlice = {
                            boxes: message.data.boxes || [],
                            timestamp: message.data.timestamp || new Date().toISOString(),
                            currentOHLC: message.data.currentOHLC,
                        };
                        handler(boxSlice);
                    }
                }
                break;

            case 'price':
                this.handlers.message.forEach((handler) => handler(new MessageEvent('message', { data: JSON.stringify(message) })));
                break;

            case 'error':
                console.error('Server error:', message.message);
                this.handlers.error.forEach((handler) => handler(message));
                break;
        }
    }

    private handleError(error: Event) {
        console.error('WebSocket error:', error);
        this.handlers.error.forEach((handler) => handler(error));
    }

    private handleClose(event: CloseEvent) {
        this.isAuthenticated = false;
        this.handlers.close.forEach((handler) => handler());
        this.handleReconnect();
    }

    private handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;

        console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);
        setTimeout(() => this.connect(), delay);
    }

    private authenticate() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.accessToken) {
            return;
        }

        this.socket.send(
            JSON.stringify({
                type: 'auth',
                token: this.accessToken,
            })
        );
    }

    private resubscribeAll() {
        if (!this.isAuthenticated || !this.socket) return;

        const pairs = Array.from(this.handlers.subscriptions.keys());
        if (pairs.length > 0) {
            this.socket.send(
                JSON.stringify({
                    type: 'subscribe',
                    pairs,
                })
            );
        }
    }

    // Public API
    public onOpen(handler: () => void) {
        this.handlers.open.add(handler);
    }

    public offOpen(handler: () => void) {
        this.handlers.open.delete(handler);
    }

    public onClose(handler: () => void) {
        this.handlers.close.add(handler);
    }

    public offClose(handler: () => void) {
        this.handlers.close.delete(handler);
    }

    public onError(handler: (error: any) => void) {
        this.handlers.error.add(handler);
    }

    public offError(handler: (error: any) => void) {
        this.handlers.error.delete(handler);
    }

    public onMessage(handler: (event: MessageEvent) => void) {
        this.handlers.message.add(handler);
    }

    public offMessage(handler: (event: MessageEvent) => void) {
        this.handlers.message.delete(handler);
    }

    public subscribe(pair: string, handler: (data: BoxSlice) => void) {
        this.handlers.subscriptions.set(pair, handler);

        if (this.isAuthenticated && this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(
                JSON.stringify({
                    type: 'subscribe',
                    pairs: [pair],
                })
            );
        }
    }

    public unsubscribe(pair: string) {
        this.handlers.subscriptions.delete(pair);

        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(
                JSON.stringify({
                    type: 'unsubscribe',
                    pairs: [pair],
                })
            );
        }
    }

    public disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        // Clear all handlers
        this.handlers.message.clear();
        this.handlers.open.clear();
        this.handlers.close.clear();
        this.handlers.error.clear();
        this.handlers.subscriptions.clear();

        // Reset state
        this.isAuthenticated = false;
        this.reconnectAttempts = 0;
    }
}

export const wsClient = new WebSocketClient();
