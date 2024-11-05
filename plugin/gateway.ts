import type { Plugin } from '../app.ts'

declare module '../app.ts' {
  interface Application {
    http: Deno.HttpServer
    sockets: Map<string, Socket>
  }
}

export type Socket = WebSocket & { id: string }

const plugin: Plugin = (app) => {
  app.sockets = new Map<string, Socket>();

  app.http = Deno.serve((request) => {
    if (request.headers.get("upgrade") !== "websocket") {
      return new Response('ok');
    }
  
    const upgrade = Deno.upgradeWebSocket(request);
    
    const socket: Socket = upgrade.socket as Socket;
  
    (socket as Socket).id = globalThis.crypto.randomUUID();

    socket.addEventListener("open", () => { app.sockets.set(socket.id, socket) });
    socket.addEventListener("close", () => { app.sockets.delete(socket.id) });
  
    socket.addEventListener("message", (message) => {
      const event = JSON.parse(message.data);
  
      if (event.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong' }));

        return
      }
  
      app.channel.emit(event.type, event.data);
    });
  
    return upgrade.response;
  })
}

export default plugin
