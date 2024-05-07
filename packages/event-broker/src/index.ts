
export type StartID = string;

const generateStartID = (): StartID => 
    `_ID${Math.floor(Math.random()*Date.now())}@${Date.now()}_`

export type BaseEvent = Record<string,any> 
    
export interface EventSubmitter<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent> {
    send( event: ListenEvent ):IteratorResult<ReplyEvent | undefined, any>;
    
    sendAndWaitForReply( event: ListenEvent ):ReplyEvent;

}

export class EventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> implements EventSubmitter<ListenEvent, ReplyEvent> {

    private _listener?: Generator<ReplyEvent|undefined, any, ListenEvent> 

    private _startId?:StartID

    start( handler: ( event:ListenEvent ) => ReplyEvent|void ):StartID|undefined {
        if( this._listener ) return

        function* listener():Generator<ReplyEvent|undefined, any, ListenEvent> {
        
            console.debug("sync start listening...!");
    
            let res:ReplyEvent|undefined = undefined;

            while (true) {
                try {
                    let event = yield res
                    // console.debug( 'got:', event, 'result', res )
                    const ret = handler( event )
                    res = ret ?? undefined
                    
                }
                catch( e ) {
                    console.error( `error listening data`, e)
                }
            }            
        }
        
        this._startId = generateStartID()
        this._listener = listener()
        this._listener.next() 
        return this._startId;
        
    }

    send( event: ListenEvent ):IteratorResult<ReplyEvent | undefined, any>  {
        if( !this._listener ) return { value: undefined }
        return (this._listener.next(event))
    }
    
    sendAndWaitForReply( event: ListenEvent ):any {
        return this.send( event ).value
    }

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

export interface AsyncEventSubmitter<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent> {
    send( event: ListenEvent ):Promise<IteratorResult<ReplyEvent | undefined, any>>;
    
    sendAndWaitForReply( event: ListenEvent ):Promise<ReplyEvent>;

}

export class AsyncEventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> implements AsyncEventSubmitter<ListenEvent,ReplyEvent>{

    private _listener?: AsyncGenerator<ReplyEvent|undefined, any, ListenEvent> 

    private _startId?:StartID
    
    async start( handler: ( event:ListenEvent ) => Promise<ReplyEvent|void> ):Promise<StartID|undefined> {

        if( this._listener ) return 
        
        async function* listener():AsyncGenerator<ReplyEvent|undefined, any, ListenEvent> {
        
            console.debug("async start listening...!");
    
            let res:ReplyEvent|undefined = undefined;

            while (true) {
                try {
                    let event = yield res
                    // console.debug( 'got:', event, 'result', res )
                    const ret = await handler( event )
                    res = ret ?? undefined
                }
                catch( e ) {
                    console.error( `error listening data`, e)
                }
            }            
        }
        
        this._startId = generateStartID()
        this._listener = listener()
        await this._listener.next()  // start listening
        return this._startId;
        
    }

    async send( event: ListenEvent ):Promise<IteratorResult<ReplyEvent | undefined, any>> {
        if( !this._listener ) return { value: undefined }
        return (await this._listener.next(event))
    }
    
    async sendAndWaitForReply( event: ListenEvent ):Promise<ReplyEvent> {
       return (await this.send( event)).value
    }

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


