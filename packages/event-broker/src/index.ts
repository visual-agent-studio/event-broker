/**
 * event broker based on javascript generator etiher synchronous and asynchronous
 * 
 * @module event-broker
 */


export type StartID = string;

const generateStartID = (): StartID => 
    `_ID${Math.floor(Math.random()*Date.now())}@${Date.now()}_`

/**
 * BaseEvent is a type alias for a Record with string keys and any values.
 */
export type BaseEvent = Record<string, any>;
    
/**
 * Interface for an event submitter.
 * @template ListenEvent The type of the event to listen for.
 * @template ReplyEvent The type of the event to reply with.
 */
export interface EventSubmitter<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent> {
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns An iterator result containing the reply event or undefined.
     */
    send( event: ListenEvent ):IteratorResult<ReplyEvent | undefined, any>;
    
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns The reply event.
     */
    sendAndWaitForReply( event: ListenEvent ):ReplyEvent;

}

/**
 * EventBroker class that implements EventSubmitter interface.
 * @template ListenEvent The type of the event to listen for.
 * @template ReplyEvent The type of the event to reply with.
 */
export class EventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> implements EventSubmitter<ListenEvent, ReplyEvent> {

    private _listener?: Generator<ReplyEvent|undefined, any, ListenEvent> 

    private _startId?:StartID

    /**
     * Starts listening for events.
     * @param handler The function to handle the event.
     * @returns The start ID.
     */
    start( handler: ( event:ListenEvent ) => ReplyEvent|void ):StartID|undefined {
        if( this._listener ) return

        
        function* listener(id:string):Generator<ReplyEvent|undefined, any, ListenEvent> {
        
            console.debug("sync start listening...!", id);
    
            let res:ReplyEvent|undefined = undefined;

            while (true) {
                try {
                    let event = yield res
                    
                    try {
                        const ret = handler( event )
                        res = ret ?? undefined    
                    }
                    catch( e ) {
                        console.warn( 'error evaluating handler!', e)
                    }
                    
                }
                catch( e ) {
                    console.error( `error yield(ing) data!`, e)
                }
            }            
        }
        
        this._startId = generateStartID()
        this._listener = listener(this._startId)
        this._listener.next() // start listening
        return this._startId;
        
    }

    /**
     * Checks if the event broker is currently started.
     * @returns {boolean} True if the event broker is started, otherwise false.
     */
    get isStarted(): boolean {
        return !!this._listener;
    }
    
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns An iterator result containing the reply event or undefined.
     */
    send( event: ListenEvent ):IteratorResult<ReplyEvent | undefined, any>  {
        if( !this._listener ) return { value: undefined }
        return (this._listener.next(event))
    }
    
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns The reply event.
     */
    sendAndWaitForReply( event: ListenEvent ):any {
        return this.send( event ).value
    }

    /**
     * Stops listening for events.
     * @param startId The start ID.
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    stop( startId:StartID, value?: unknown  ):IteratorResult<ReplyEvent | undefined, any>|undefined {
        if( !this._listener ) return
        if( startId !== this._startId ) {
            throw new Error( 'security error: you are not owner of broker!')
        } 
        const l = this._listener 
        this._listener = undefined
        return l.return( value ) 
    }
}

/**
 * Interface for an async event submitter.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export interface AsyncEventSubmitter<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent> {
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns A promise containing an iterator result containing the reply event or undefined.
     */
    send( event: ListenEvent ):Promise<IteratorResult<ReplyEvent | undefined, any>>;
    
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    sendAndWaitForReply( event: ListenEvent ):Promise<ReplyEvent>;

}

/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export class AsyncEventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> implements AsyncEventSubmitter<ListenEvent,ReplyEvent>{

    private _listener?: AsyncGenerator<ReplyEvent|undefined, any, ListenEvent> 

    private _startId?:StartID
    
    /**
     * Starts listening for events.
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    async start( handler: ( event:ListenEvent ) => Promise<ReplyEvent|void> ):Promise<StartID|undefined> {

        if( this._listener ) return 
        
        /**
         * An asynchronous generator function that listens for events.
         */
        async function* listener(id:string):AsyncGenerator<ReplyEvent|undefined, any, ListenEvent> {
        
            console.debug("async start listening...!", id);
    
            let res:ReplyEvent|undefined = undefined;

            while (true) {
                try {
                    let event = yield res
                    
                    try { 
                        const ret = await handler( event )
                        res = ret ?? undefined    
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
        }
        
        this._startId = generateStartID()
        this._listener = listener(this._startId)
        await this._listener.next()  // start listening
        return this._startId;
        
    }

    /**
     * Checks if the event broker is currently started.
     * @returns {boolean} True if the event broker is started, otherwise false.
     */
    get isStarted(): boolean {
        return !!this._listener;
    }
     
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns A promise containing an iterator result containing the reply event or undefined.
     */
    async send( event: ListenEvent ):Promise<IteratorResult<ReplyEvent | undefined, any>> {
        if( !this._listener ) return { value: undefined }
        return (await this._listener.next(event))
    }
    
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    async sendAndWaitForReply( event: ListenEvent ):Promise<ReplyEvent> {
       return (await this.send( event)).value
    }

    /**
     * Stops listening for events.
     * @param startId The start ID.
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    async stop( startId:StartID, value?: unknown  ):Promise<IteratorResult<ReplyEvent | undefined, any>|undefined> {
        if( !this._listener ) return
        if( startId !== this._startId ) {
            throw new Error( 'security error: you are not owner of broker!')
        } 
        const l = this._listener 
        this._listener = undefined
        return await l.return( value ) 
    }
}

