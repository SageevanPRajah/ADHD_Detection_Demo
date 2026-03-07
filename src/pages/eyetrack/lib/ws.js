const WS_BASE = import.meta.env.VITE_WS_BASE_URL;
/**
 * Minimal WS wrapper.
 * - Uses addEventListener so callers can attach their own handlers without overwriting internals.
 * - Always injects sessionId into outgoing messages.
 */
export function connectWs(sessionId, onMsg) {
    const ws = new WebSocket(`${WS_BASE.replace(/\/$/, '')}/ws`);
    ws.addEventListener('message', (e) => {
        try {
            onMsg(JSON.parse(e.data));
        }
        catch { /* ignore */ }
    });
    // Best-effort bind (backend also accepts sessionId embedded in each message)
    ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ type: 'bind', sessionId }));
    });
    return {
        ws,
        send: (m) => {
            if (ws.readyState !== WebSocket.OPEN)
                return;
            ws.send(JSON.stringify({ ...m, sessionId }));
        },
        close: () => ws.close()
    };
}
