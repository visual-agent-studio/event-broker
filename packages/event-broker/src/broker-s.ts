/**
 * @file broker-s.ts
 * @description This file contains the implementation of the EventBroker class, which is an event broker based on synchronous JavaScript generators.
 * The EventBroker class allows for the registration of a single event handler that can handle events synchronously and optionally reply to them.
 * It supports both persistent ('on') and one-time ('once') listeners.
 * 
 * @module EventBroker
 * @version 2.0.0-beta-20240603-1
 * @license MIT
 * 
 * @example
 * import { EventBroker } from './broker-s';
 * 
 * type ListenEvent = { data: string };
 * type ReplyEvent = { result: string };
 * 
 * const broker = new EventBroker<ListenEvent, ReplyEvent>();
 * 
 * const listenerId = broker.on(event => {
 *   console.log(event.data);
 *   return { result: 'Processed' };
 * });
 * 
 * broker.emit({ data: 'Test Event' });
 * 
 * const reply = broker.emitWithReply({ data: 'Test Event' });
 * console.log(reply.result); // 'Processed'
 * 
 * broker.off(listenerId);
 */

import { BaseEvent, ListenerID, generateListenerID, stopSymbol } from "./broker"


export type EventHandler<ListenEvent, ReplyEvent> = (event: ListenEvent) => ReplyEvent | void

export interface BrokerListenerOn<ListenEvent, ReplyEvent> {
    type: 'on',
    handler: EventHandler<ListenEvent, ReplyEvent>
}

export interface  BrokerListenerOnce<ListenEvent, ReplyEvent> {
    type: 'once',
    handler: EventHandler<ListenEvent, ReplyEvent>
}

export type BrokerListener<ListenEvent, ReplyEvent> = BrokerListenerOn<ListenEvent, ReplyEvent> | BrokerListenerOnce<ListenEvent, ReplyEvent>


/**
 * A Synchronous event broker that support a single event handlers
 * 
 * @template ListenEvent The type of the event to listen for.
 * @template ReplyEvent The type of the event to reply with.
 */
export class EventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {

    private _listener?: Generator<ReplyEvent|undefined,  ReplyEvent|void, ListenEvent | { [stopSymbol]?: boolean }> 

    private _listenerId?:ListenerID

    /**
     * alias for {@link on} method
     * @deprecated use {@link on}
     */
    start( handler: EventHandler<ListenEvent, ReplyEvent> ):ListenerID|undefined {
        return this.on( handler )
    }

    /**
     * alias for {@link off} method
     * @deprecated use {@link off}
     */
    stop( listenerId:ListenerID ):boolean {
        return this.off(listenerId)
    }

    /**
     * alias for {@link isOn} property
     * @deprecated use {@link isOn}
     */
    get isStarted(): boolean {
        return this.isOn
    }
    
    /**
     * alias for {@link emit} method
     * @deprecated use {@link emit}
     */
    send(event: ListenEvent): boolean {
        return this.emit( event )
    }
    
    /**
     * 
     * alias for {@link emitWithReply} method
     * @deprecated use {@link emitWithReply}
     */
    sendAndWaitForReply( event: ListenEvent ):ReplyEvent {
        return this.emitWithReply( event )
    }

    /**
    * An generator function that listens for events.
    */
    private *listen( listener: BrokerListener<ListenEvent, ReplyEvent>):Generator<ReplyEvent|undefined, ReplyEvent|void, ListenEvent | { [stopSymbol]?: boolean }> {
        console.debug("start listening...!", listener.type, this._listenerId);

        let res:ReplyEvent|undefined = undefined;

        const stop = () => {
            this._listenerId = undefined
            this._listener = undefined
        }

        while (true) {
            try {
                let event:any = yield res
                // console.debug( "RECEIVED", event, "EMITTED", res )
                if( !!event[stopSymbol]) {
                    break;
                }

                try { 
                    const ret = listener.handler( event )
                    res = ret ?? undefined    
                    if( listener.type === 'once' ) {
                        yield res
                    }
                }
                catch( e ) {
                    console.warn( 'error evaluating handler!', e)
                }
            }
            catch( e ) {
                console.error( `error yield(ing) data!`, e)
                break

            }
        }   

        console.debug("stop listening...!", listener.type, this._listenerId);

        stop()

        if( listener.type === 'once' ) {
            yield res
        }

    }
    
    /**
     * Starts listening for events.
     * 
     * @param handler The function to handle the event.
     * @returns The listener ID.
     */
    on( handler: EventHandler<ListenEvent,ReplyEvent> ):ListenerID|undefined {
        
        if( this._listener ) return     
        this._listenerId = generateListenerID()
        this._listener = this.listen( { type: 'on', handler } )
        this._listener.next()  // start listening
        return this._listenerId;
        
    }

    /**
     * Starts listening for sigle event and then {@link off}.
     * 
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    once( handler: EventHandler<ListenEvent, ReplyEvent> ):ListenerID|undefined {

        if( this._listener ) return    
        this._listenerId = generateListenerID()
        this._listener = this.listen( { type: 'once', handler } )
        this._listener.next()  // start listening
        return this._listenerId;
        
    }
    
    /**
     * Stops listening for events.
     * 
     * @param listenerId The listener ID.
     * @returns {boolean} True if the listener was successfully stopped, otherwise false.
     * @throws An error if the listener Id does not match.
     */
    off( listenerId:ListenerID ):boolean {
        if( !this._listener ) {
            return false
        }
        if( listenerId !== this._listenerId ) {
            throw new Error( 'security error: you are not owner of broker!')
        } 
        const l = this._listener 
        this._listener.next( { [stopSymbol]: true })
        // this._listener = undefined
        // this._listenerId = undefined
        l.return() 

        return true
    }

    /**
     * Checks if the event broker is currently started.
     * @returns {boolean} True if the event broker is started, otherwise false.
     */
    get isOn(): boolean {
        return !!this._listener;
    }
    
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns {boolean} True if the event was successfully emitted, otherwise false.
     */
    emit( event: ListenEvent ):boolean  {
        if (!this._listener) return false;
        this._listener.next(event);
        return true;
    }
    
    /**
     * Sends an event and waits for a reply from the listener.
     * 
     * @param {ListenEvent} event - The event to be sent.
     * @returns {ReplyEvent} The reply event received from the listener.
     * @throws {Error} If the broker is not listening or no reply event is returned.
     */
    emitWithReply( event: ListenEvent ):ReplyEvent  {
        if (!this._listener) {
            throw new Error( 'broker is not listening!')
        };
        const { value } = this._listener.next(event);

        if( !value ) {
            throw new Error(`no reply event returned by listener!`)
        }

        return value

    }

}
