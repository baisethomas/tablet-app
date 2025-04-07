declare module 'react-native-websocket' {
  interface WebSocketOptions {
    headers?: Record<string, string>;
  }

  class WebSocket {
    constructor(url: string, options?: WebSocketOptions);
    onopen: () => void;
    onmessage: (event: { data: string }) => void;
    onerror: (error: Error) => void;
    onclose: () => void;
    send: (data: string) => void;
    close: () => void;
  }

  export default WebSocket;
} 