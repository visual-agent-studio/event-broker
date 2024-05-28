# Event Broker

In process event broker based on javascript generator


## Async Usage

Define Events' type

```typescript

type BaseEvent = { data: string }

export interface ListenEvent extends BaseEvent { 
    reply?: boolean
}

export type ReplyEvent = BaseEvent

```

Create an instance
```typescript

const broker = new AsyncEventBroker<ListenEvent, ReplyEvent>()

```

Start broker
```typescript

const startId = await broker.start( async ( event:ListenEvent ) => {

    // handle event
    const result = await doSomething()

    if( event.reply ) {
        return result; // this will be replyed to sender
    }
})

```

<u>Note</u>:
> StartId must be stored because it is need for eventually stop listening event. This is because only who start broker will be able to stop it

Send event to broker
```typescript

await broker.send( { data: "message1" } )

```

Send event to broker and wait reply

```typescript

const reply = await broker.sendAndWaitForReply( { data: "message_with_reply", reply: true  } )

```

Stop broker
```typescript

try {
    await broker.stop( startId )
}
catch( e ) {
    // startId is not valid !!!
}

```