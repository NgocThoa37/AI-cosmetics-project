import { io, Socket } from 'socket.io-client';

class ChatService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      auth: { token },
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(message: string) {
    this.socket?.emit('message', message);
  }

  onMessage(callback: (message: string) => void) {
    this.socket?.on('message', callback);
  }

  onTyping(callback: (isTyping: boolean) => void) {
    this.socket?.on('typing', callback);
  }
}

export const chatService = new ChatService();