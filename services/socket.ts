import { io, type Socket } from "socket.io-client"
import { env } from "@/config/env"

class SocketService {
  private static instance: SocketService
  private socket: Socket | null = null

  private constructor() {
    this.socket = io(env.SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false,
    })

    this.socket.on("connect", () => {
      console.log("Connected to Socket.IO server")
    })

    this.socket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server")
    })
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public connect(userId: string) {
    if (this.socket) {
      this.socket.auth = { userId }
      this.socket.connect()
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }

  public onNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on("notification", callback)
    }
  }

  public offNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off("notification", callback)
    }
  }
}

export const socketService = SocketService.getInstance()

