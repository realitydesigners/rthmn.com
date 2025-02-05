import { decode } from '@msgpack/msgpack';
import { BoxSlice, PriceData } from '@/types/types';

interface WebSocketMessage {
    type: 'boxSlice' | 'ack' | 'price';
    pair?: string;
    data?: any;
    message?: string;
}

class WebSocketClient {
    private socket: WebSocket | null = null;
    private subscriptions: Set<string> = new Set();
    private messageHandlers: Map<string, (data: BoxSlice | PriceData) => void> = new Map();
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
        // console.log('🟢 WebSocket connection opened');
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

            this.processMessage(message);
        } catch (error) {
            console.error('❌ Error processing WebSocket message:', error, {
                dataType: event.data?.constructor?.name,
                messageLength: event.data?.byteLength,
            });
        }
    }

    private processMessage(message: WebSocketMessage) {
        const timestamp = new Date().toISOString();

        switch (message.type) {
            case 'boxSlice':
                this.handleBoxSliceMessage(message, timestamp);
                break;
            case 'ack':
                this.handleAckMessage(message);
                break;
            case 'price':
                // Just pass the message to global handlers
                this.globalMessageHandlers.forEach((handler) => handler(new MessageEvent('message', { data: JSON.stringify(message) })));
                break;
        }
    }

    private handleAckMessage(message: any) {
        if (message.message === 'auth operation successful') {
            this.handleAuthSuccess();
        } else {
            // console.log('✅ Received ack:', message);
        }
    }

    private handleAuthSuccess() {
        // console.log('🟢 Authentication successful');
        this.isAuthenticated = true;
        // Delay the open handlers slightly to ensure price data is loaded
        setTimeout(() => {
            this.openHandlers.forEach((handler) => handler());
            this.processPendingOperations();
        }, 100);
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
            // console.log(' Sending authentication message');
            this.socket.send(JSON.stringify({ type: 'auth', token: this.accessToken }));
        } else {
            console.warn('��️ Cannot authenticate - socket not ready or no token', {
                readyState: this.socket?.readyState,
                hasToken: !!this.accessToken,
                socketState: this.socket ? ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][this.socket.readyState] : 'NO_SOCKET',
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
                    currentOHLC: message.data.currentOHLC,
                };
                handler(boxSlice);
            }
        }
    }
}

export const wsClient = new WebSocketClient();
