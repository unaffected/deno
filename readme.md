# Deno v2 Websocket API



```bash
open http://0.0.0.0:8000
```

```js
const socket = new WebSocket('ws://0.0.0.0:8000')

socket.onmessage = console.log

event = JSON.stringify({
    type: 'message',
    data: 'Hello, world.'
})

socket.send(event)
```



