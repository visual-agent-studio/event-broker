import { useEffect, useRef } from "react";
import { 
    AsyncEventBroker, 
    AsyncEventHandler, 
    BaseEvent, 
    EventBroker, 
    ListenerID, 
    EventHandler as SyncEventHandler } from '@soulsoftware/event-broker';

const _TRACE = ( action: () => void  ) => { 
    // action()
}

/**
 * Interface representing a proxy for AsyncEventBroker.
 *
 * @template ListenEvent - The type of event to listen for.
 * @template ReplyEvent - The type of event to reply with.
 */
export interface AsyncEventBrokerProxy<ListenEvent, ReplyEvent> {
    /**
     * Starts the broker with the provided handler.
     *
     * @param {(event: ListenEvent) => Promise<ReplyEvent | void>} handler - The handler function for incoming events.
     * @returns {Promise<void>} A promise that resolves when the broker is started.
     */
    on(handler: AsyncEventHandler<ListenEvent,ReplyEvent> ): Promise<void>;

    /**
     * Starts the broker with the provided handler and terminate after handle it.
     *
     * @param {(event: ListenEvent) => Promise<ReplyEvent | void>} handler - The handler function for incoming events.
     * @returns {Promise<void>} A promise that resolves when the broker is started.
     */
    once(handler: AsyncEventHandler<ListenEvent,ReplyEvent> ): Promise<void>;

    /**
     * Stops the broker.
     *
     * @returns {Promise<void>} A promise that resolves when the broker is stopped.
     */
    off(): Promise<void>;

    /**
     * Sends an event to the broker.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<void>} A promise that resolves when the event is sent.
     */
    emit(event: ListenEvent): Promise<void>;

    /**
     * Sends an event to the broker and waits for a reply.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<ReplyEvent | void>} A promise that resolves when reply event is received (void means that message has been delivered and no reply is expected).
     */
    emitWithReply(event: ListenEvent): Promise<ReplyEvent | void>;
}

/**
 * Custom hook to manage AsyncEventBroker lifecycle
 * 
 * The broker is automatically stopped on component unmount
 * If handler is provided the broker is automatically started on component mount
 *
 * @template ListenEvent - The type of event to listen for.
 * @template ReplyEvent - The type of event to reply with.
 * @param {AsyncEventBroker<ListenEvent, ReplyEvent>} broker - The AsyncEventBroker instance.
 * @param {(event: ListenEvent) => Promise<ReplyEvent | void>} [handler] - Optional handler function for incoming events.
 * @returns {AsyncEventBrokerProxy<ListenEvent, ReplyEvent>} - An AsyncEventBroker proxy that ensure a safe lifecycle management.
 */
export function useAsyncEventBroker<ListenEvent extends BaseEvent = any, ReplyEvent extends BaseEvent = ListenEvent>( broker: AsyncEventBroker<ListenEvent,ReplyEvent>, handler?: AsyncEventHandler<ListenEvent,ReplyEvent> ):AsyncEventBrokerProxy<ListenEvent,ReplyEvent> {

    const brokerId = useRef<ListenerID>();

    const proxyRef = useRef<AsyncEventBrokerProxy<ListenEvent,ReplyEvent>>( {
        on: async ( handler: (event: ListenEvent) => Promise<ReplyEvent | void> ) => {
            if( broker.isOn ) return; 
            brokerId.current = await broker.on(handler)
        },
        once: async ( handler: (event: ListenEvent) => Promise<ReplyEvent | void> ) => {
            if( broker.isOn ) return; 
            brokerId.current = await broker.once(handler)
        },
        off: async () => {
            _TRACE( () => console.trace( 'request stop!',  brokerId ) )
            const id = brokerId.current
            brokerId.current = undefined
            if( id ) {
                try {
                    _TRACE( () => console.trace( 'stopping....!', id  ) )
                    await broker.off(id);
                    _TRACE( () => console.trace( 'stopped....!', id  ) )
                }
                catch( e:any ) {
                    console.warn(e.message)
                }
            }
        }, 
        emit: async (event: ListenEvent ) => { await broker.emit( event ) },
        emitWithReply: async (event: ListenEvent ) => await broker.emitWithReply( event )
    })


    useEffect(() => {
        return () => {
            if ( broker.isStarted ) {
                proxyRef.current.off()
            }
            else if( handler ) {
                proxyRef.current.on(handler);
            }
        }
    }, [])

    return proxyRef.current
}


/**
 * Interface representing a proxy for EventBroker.
 *
 * @template ListenEvent - The type of event to listen for.
 * @template ReplyEvent - The type of event to reply with.
 */
export interface EventBrokerProxy<ListenEvent, ReplyEvent> {
    /**
     * Starts the broker with the provided handler.
     *
     * @param {(event: ListenEvent) => ReplyEvent | void} handler - The handler function for incoming events.
     * @returns {void} - returns when broker is started.
     */
    on(handler: SyncEventHandler<ListenEvent,ReplyEvent> ): void;
    /**
     * Starts the broker with the provided handler and terminate after handle it.
     *
     * @param {(event: ListenEvent) => ReplyEvent | void} handler - The handler function for incoming events.
     * @returns {void} - returns when broker is started.
     */
    once(handler: SyncEventHandler<ListenEvent,ReplyEvent> ): void;
    /**
     * Stops the broker.
     *
     * @returns {void} returns when broker is stopped.
     */
    off(): void;
    /**
     * Sends an event to the broker.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {void} returns when the event is sent.
     */
    emit(event: ListenEvent): void;
    /**
     * Sends an event to the broker and waits for a reply.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {ReplyEvent | void} returns when reply event is received (void means that message has been delivered and no reply is expected).
     */
    emitWithReply(event: ListenEvent): ReplyEvent | void;
}

/**
 * Custom hook to manage EventBroker lifecycle
 * 
 * The broker is automatically stopped on component unmount
 * If handler is provided the broker is automatically started on component mount
 *
 * @template ListenEvent - The type of event to listen for.
 * @template ReplyEvent - The type of event to reply with.
 * @param {EventBroker<ListenEvent, ReplyEvent>} broker - The EventBroker instance.
 * @param {(event: ListenEvent) => ReplyEvent | void} [handler] - Optional handler function for incoming events.
 * @returns {EventBrokerProxy<ListenEvent, ReplyEvent>} - An EventBroker proxy that ensure safe lifecycle management.
 */
export function useEventBroker<ListenEvent extends BaseEvent = any, ReplyEvent extends BaseEvent = ListenEvent>( broker: EventBroker<ListenEvent,ReplyEvent>, handler?: SyncEventHandler<ListenEvent,ReplyEvent> ):EventBrokerProxy<ListenEvent,ReplyEvent> {

    const brokerId = useRef<ListenerID>();

    const proxyRef = useRef<EventBrokerProxy<ListenEvent,ReplyEvent>>( {
        on: ( handler: (event: ListenEvent) => ReplyEvent | void ) => {
            if( broker.isStarted ) return; 
            brokerId.current = broker.on(handler)
        },
        once: ( handler: (event: ListenEvent) => ReplyEvent | void ) => {
            if( broker.isStarted ) return; 
            brokerId.current = broker.once(handler)
        },
        off: () => {
            _TRACE( () => console.trace( 'request stop!',  brokerId ) )
            const id = brokerId.current
            brokerId.current = undefined
            if( id ) {
                try {
                    _TRACE( () => console.trace( 'stopping....!', id  ) )
                    broker.off(id);
                    _TRACE( () => console.trace( 'stopped....!', id  ) )
                }
                catch( e:any ) {
                    console.warn(e.message)
                }
            }
        }, 
        emit: (event: ListenEvent ) => { broker.emit( event ) },
        emitWithReply: (event: ListenEvent ) => broker.emitWithReply( event )
    })


    useEffect(() => {
        return () => {
            if ( broker.isStarted ) {
                proxyRef.current.off()
            }
            else if( handler ) {
                proxyRef.current.on(handler);
            }
        }
    }, [])

    return proxyRef.current
}

