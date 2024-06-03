# Event Broker

In process event brokers based on javascript generator

The available brokers are:

* `AsyncEventBroker` 
  > An asynchronous event broker that support a single event handler.
* `EventBroker`
  > Synchronous event broker that support a single event handlers
* `AsyncEventBrokerML`
  > An asynchronous event broker that supports multiple event handlers.
* `AsyncEventBrokerTopicsML`
  > An asynchronous event broker that supports multiple topics with multiple event handlers.

## AsyncEventBroker Usage

### Define Events' type

```typescript
const replySymbol = Symbol("reply"); 

type ListenEvent = { data: string, [replySymbol]?: boolean  }
type ReplyEvent = { result: string }
```
### Create an instance
```typescript
const broker = new AsyncEventBroker<ListenEvent, ReplyEvent>()
```

### Start broker
```typescript

const listenerId = await broker.on( async ( ev:ListenEvent ) => {

    // handle event
    const result = await doSomething( ev.data )

    if( !!ev[replySymbol] ) { // if reply is required
        return { result } ; // this will be replyed to sender
    }
})

```

<u>Note</u>:
> listenerId must be stored because it is need for eventually stop listening event. This is because: **Only who start broker will be able to stop it**

### Send event to broker
```typescript

await broker.emit( { data: "message1" } )

```

### Send event to broker and wait reply

```typescript

const reply = await broker.emitWithReply( { data: "message_with_reply", reply: true  } )
// reply = { result: "....." }
```

Stop broker
```typescript

try {
    await broker.off( startId )
}
catch( e ) {
    // startId is not valid !!!
}

```

## Other Examples

Other usage examples could be found in [test](./__test__) folder 