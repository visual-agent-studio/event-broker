/**
 * @file broker.ts
 * @description This file contains the implementation of the AsyncEventBroker class, which is an event broker based on asynchronous JavaScript generators.
 * The AsyncEventBroker class allows for the registration of a single event handler that can handle events asynchronously and optionally reply to them.
 * It supports both persistent ('on') and one-time ('once') listeners.
 * 
 * @module AsyncEventBroker
 * @version 2.0.0-beta-20240603
 * @license MIT
 * 
 * @example
 * import { AsyncEventBroker } from './broker';
 * 
 * type ListenEvent = { data: string };
 * type ReplyEvent = { result: string };
 * 
 * const broker = new AsyncEventBroker<ListenEvent, ReplyEvent>();
 * 
 * const listenerId = broker.on(async event => {
 *   console.log(event.data);
 *   return { result: 'Processed' };
 * });
 * 
 * broker.emit({ data: 'Test Event' });
 * 
 * const reply = await broker.emitWithReply({ data: 'Test Event' });
 * console.log(reply.result); // 'Processed'
 * 
 * broker.off(listenerId);
 */

export const stopSymbol = Symbol("stop listening");

export type ListenerID = string;

export const generateListenerID = ():ListenerID =>
    `el_${Math.floor(Math.random() * Date.now())}@${Date.now()}_`


/**
 * BaseEvent is a type alias for a Record with string keys and any values.
 */
export type BaseEvent = Record<string, any>;
    
//  type AsyncReturnType<T> = T extends Promise<any> ? T|Promise<void> : Promise<T|void>;
export type AsyncEventHandler<ListenEvent, ReplyEvent> = (event: ListenEvent) => Promise<ReplyEvent | void>

export interface AsyncBrokerListenerOn<ListenEvent, ReplyEvent> {
    type: 'on',
    handler: AsyncEventHandler<ListenEvent, ReplyEvent>
}

export interface  AsyncBrokerListenerOnce<ListenEvent, ReplyEvent> {
    type: 'once',
    handler: AsyncEventHandler<ListenEvent, ReplyEvent>
}

export type AsyncBrokerListener<ListenEvent, ReplyEvent> = AsyncBrokerListenerOn<ListenEvent, ReplyEvent> | AsyncBrokerListenerOnce<ListenEvent, ReplyEvent>

/**
 * An asynchronous event broker that support a single event handler.
 * 
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export class AsyncEventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {

    private _listener?: AsyncGenerator<ReplyEvent|undefined, ReplyEvent|void, ListenEvent | { [stopSymbol]?: boolean }> 

    private _listenerId?:ListenerID
    

    /**
     * alias for {@link on} method
     * @deprecated use {@link on}
     */
    async start( handler: AsyncEventHandler<ListenEvent, ReplyEvent> ):Promise<ListenerID|undefined> {
        return this.on( handler )
    }

    /**
     * alias for {@link off} method
     * @deprecated use  {@link off}
     */
    async stop( listenerId:ListenerID ):Promise<boolean> {
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
    async send(event: ListenEvent): Promise<boolean> {
        return this.emit( event )
    }
    
    /**
     * alias for {@link emitWithReply} method
     * @deprecated use {@link emitWithReply}
     */
    async sendAndWaitForReply( event: ListenEvent ):Promise<ReplyEvent> {
        return this.emitWithReply( event )
    }

    /**
    * An asynchronous generator function that listens for events.
    */
    private async *listen( listener: AsyncBrokerListener<ListenEvent , ReplyEvent>):AsyncGenerator<ReplyEvent|undefined, ReplyEvent|void, ListenEvent | { [stopSymbol]?: boolean }> {
        console.debug("async start listening...!", listener.type, this._listenerId);

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
                    const ret = await listener.handler( event )
                    res = ret ?? undefined    
                    if( listener.type === 'once' ) {
                        break;
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

        console.debug("async stop listening...!", listener.type, this._listenerId);

        stop()
        
        if( listener.type === 'once' ) {
            yield res
        }

    }

    /**
     * Starts listening for events.
     * 
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    async on( handler: AsyncEventHandler<ListenEvent, ReplyEvent> ):Promise<ListenerID|undefined> {

        if( this._listener ) return 
        
        this._listenerId = generateListenerID()
        this._listener = this.listen( { type: 'on', handler } )
        
        await this._listener.next()  // start listening
        return this._listenerId;
        
    }

    /**
     * Starts listening for sigle event and then {@link off}.
     * 
     * @param handler The event handler.
     * @returns A promise containing the listener ID or undefined.
     */
    async once( handler: AsyncEventHandler<ListenEvent, ReplyEvent> ):Promise<ListenerID|undefined> {

        if( this._listener ) return 
        
        this._listenerId = generateListenerID()
        this._listener = this.listen( { type: 'once', handler } )
        await this._listener.next()  // start listening
        return this._listenerId;
        
    }

    /**
     * Stops listening for events.
     * 
     * @param listenerId The listener ID.
     * @returns {Promise<boolean>} A promise that resolves to true if the listener was successfully stopped, otherwise false.
     * @throws An error if the listener ID does not match.
     */
    async off( listenerId:ListenerID ):Promise<boolean> {
        if( !this._listener ) {
            return false
        }
        if( listenerId !== this._listenerId ) {
            throw new Error( 'security error: you are not owner of broker!')
        } 
        const l = this._listener 
        await this._listener.next( { [stopSymbol]: true })
        // this._listener = undefined
        // this._listenerId = undefined
        await l.return() 

        return true
    }

    
    /**
     * Checks if the event broker is currently listening.
     * 
     * @returns {boolean} True if the event broker is started, otherwise false.
     */
    get isOn(): boolean {
        return !!this._listener;
    }
    
    /**
     * Sends an event to the listener.
     * 
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<boolean>} A promise that resolves to true if the event was sent successfully, otherwise false.
     */
    async emit(event: ListenEvent): Promise<boolean> {
        if (!this._listener) return false;
        await this._listener.next(event);
        return true;
    }
    
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    async emitWithReply( event: ListenEvent ):Promise<ReplyEvent> {
        
        if (!this._listener) {
            throw new Error( 'broker is not listening!')
        };
        const { value } = await this._listener.next(event);

        if( !value ) {
            throw new Error(`no reply event returned by listener!`)
        }

        return value
    }

}


////////////////////////////////////////////////////////////////////////////////////////////
//
// SYNC IMPLEMENTATION
//
////////////////////////////////////////////////////////////////////////////////////////////

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
 * EventBroker class that implements EventSubmitter interface.
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
     * @returns The start ID.
     */
    on( handler: EventHandler<ListenEvent,ReplyEvent> ):ListenerID|undefined {
        
        if( this._listener ) return     
        this._listenerId = generateListenerID()
        this._listener = this.listen( { type: 'on', handler } )
        this._listener.next()  // start listening
        return this._listenerId;
        
    }

    /**
     * Starts listening for sigle event and then off.
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
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
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
     * @returns An iterator result containing the reply event or undefined.
     */
    emit( event: ListenEvent ):boolean  {
        if (!this._listener) return false;
        this._listener.next(event);
        return true;
    }
    
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns The reply event.
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
