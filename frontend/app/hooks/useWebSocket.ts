'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://localhost:8000/ws';

export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const connect = () => {
            const ws = new WebSocket(WS_URL);
            socketRef.current = ws;

            ws.onopen = () => {
                console.log('✅ Connected to Cyber Cypher Backend');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Failed to parse WS message:', e);
                }
            };

            ws.onclose = () => {
                console.log('❌ Disconnected from Backend');
                setIsConnected(false);
                // Reconnect after delay
                setTimeout(connect, 3000);
            };

            ws.onerror = (error) => {
                console.error('WS Error:', error);
            };
        };

        connect();

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    const sendMessage = useCallback((msg: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(msg));
        }
    }, []);

    return { isConnected, lastMessage, sendMessage };
}
