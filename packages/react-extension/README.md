# Event Broker Nextjs Hook

NextJS hook for using event broker

## `useEventBroker`

> Custom hook to manage EventBroker lifecycle

### Automatically close the broker on component unmount
```typescript 

  const brokerProxy = useEventBroker( new EventBroker<ListenEvent,ReplyEvent>() );

  ...
  
  brokerProxy.start( ( event: ListenEvent ) => { 
    ...
  })

```

### Automatically start on component mount and close on  unmount
```typescript 

  const brokerProxy = useEventBroker( new EventBroker<ListenEvent,ReplyEvent>(), ( event: ListenEvent ) => { 
    ...
  } );
```


## `useAsyncEventBroker`

> Custom hook to manage AsyncEventBroker lifecycle

### Automatically close the broker on component unmount
```typescript 

  const brokerProxy = useAsyncEventBroker( new AsyncEventBroker<ListenEvent,ReplyEvent>() );

  ...
  
  brokerProxy.start( async ( event: ListenEvent ) => { 
    ...
  })

```

### Automatically start on component mount and close on  unmount
```typescript 

  const brokerProxy = useAsyncEventBroker( new AsyncEventBroker<ListenEvent,ReplyEvent>(), async ( event: ListenEvent ) => { 
    ...
  } );
```
