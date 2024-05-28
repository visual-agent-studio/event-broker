import { useEffect, useRef } from "react";
import { AsyncEventBroker, BaseEvent, EventBroker, StartID } from '@soulsoftware/event-broker';

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
    start(handler: (event: ListenEvent) => Promise<ReplyEvent | void>): Promise<void>;

    /**
     * Stops the broker.
     *
     * @returns {Promise<void>} A promise that resolves when the broker is stopped.
     */
    stop(): Promise<void>;

    /**
     * Sends an event to the broker.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<void>} A promise that resolves when the event is sent.
     */
    send(event: ListenEvent): Promise<void>;

    /**
     * Sends an event to the broker and waits for a reply.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<ReplyEvent | void>} A promise that resolves when reply event is received (void means that message has been delivered and no reply is expected).
     */
    sendAndWaitForReply(event: ListenEvent): Promise<ReplyEvent | void>;
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
export function useAsyncEventBroker<ListenEvent extends BaseEvent = any, ReplyEvent extends BaseEvent = ListenEvent>( broker: AsyncEventBroker<ListenEvent,ReplyEvent>, handler?: (event: ListenEvent) => Promise<ReplyEvent | void> ):AsyncEventBrokerProxy<ListenEvent,ReplyEvent> {

    const brokerId = useRef<StartID>();

    const proxyRef = useRef<AsyncEventBrokerProxy<ListenEvent,ReplyEvent>>( {
        start: async ( handler: (event: ListenEvent) => Promise<ReplyEvent | void> ) => {
            if( broker.isStarted ) return; 
            brokerId.current = await broker.start(handler)
        },
        stop: async () => {
            _TRACE( () => console.trace( 'request stop!',  brokerId ) )
            const id = brokerId.current
            brokerId.current = undefined
            if( id ) {
                try {
                    _TRACE( () => console.trace( 'stopping....!', id  ) )
                    await broker.stop(id);
                    _TRACE( () => console.trace( 'stopped....!', id  ) )
                }
                catch( e:any ) {
                    console.warn(e.message)
                }
            }
        }, 
        send: async (event: ListenEvent ) => { await broker.send( event ) },
        sendAndWaitForReply: async (event: ListenEvent ) => await broker.sendAndWaitForReply( event )
    })


    useEffect(() => {
        return () => {
            if ( broker.isStarted ) {
                proxyRef.current.stop()
            }
            else if( handler ) {
                proxyRef.current.start(handler);
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
    start(handler: (event: ListenEvent) => ReplyEvent | void): void;

    /**
     * Stops the broker.
     *
     * @returns {void} returns when broker is stopped.
     */
    stop(): void;

    /**
     * Sends an event to the broker.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {void} returns when the event is sent.
     */
    send(event: ListenEvent): void;

    /**
     * Sends an event to the broker and waits for a reply.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {ReplyEvent | void} returns when reply event is received (void means that message has been delivered and no reply is expected).
     */
    sendAndWaitForReply(event: ListenEvent): ReplyEvent | void;
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
export function useEventBroker<ListenEvent extends BaseEvent = any, ReplyEvent extends BaseEvent = ListenEvent>( broker: EventBroker<ListenEvent,ReplyEvent>, handler?: (event: ListenEvent) => ReplyEvent | void ):EventBrokerProxy<ListenEvent,ReplyEvent> {

    const brokerId = useRef<StartID>();

    const proxyRef = useRef<EventBrokerProxy<ListenEvent,ReplyEvent>>( {
        start: ( handler: (event: ListenEvent) => ReplyEvent | void ) => {
            if( broker.isStarted ) return; 
            brokerId.current = broker.start(handler)
        },
        stop: () => {
            _TRACE( () => console.trace( 'request stop!',  brokerId ) )
            const id = brokerId.current
            brokerId.current = undefined
            if( id ) {
                try {
                    _TRACE( () => console.trace( 'stopping....!', id  ) )
                    broker.stop(id);
                    _TRACE( () => console.trace( 'stopped....!', id  ) )
                }
                catch( e:any ) {
                    console.warn(e.message)
                }
            }
        }, 
        send: (event: ListenEvent ) => { broker.send( event ) },
        sendAndWaitForReply: (event: ListenEvent ) => broker.sendAndWaitForReply( event )
    })


    useEffect(() => {
        return () => {
            if ( broker.isStarted ) {
                proxyRef.current.stop()
            }
            else if( handler ) {
                proxyRef.current.start(handler);
            }
        }
    }, [])

    return proxyRef.current
}

