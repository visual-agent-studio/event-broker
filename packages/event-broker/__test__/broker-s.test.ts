import { expect, test } from "bun:test";

import {  EventBroker } from "../src/broker-s"

const replySymbol = Symbol("reply");

type ListenEvent = { data: string, [replySymbol]?: boolean  }
type ReplyEvent = { result: string }


test( "broker test", () => {

    const broker = new EventBroker<ListenEvent,ReplyEvent>()

    const eventsHistory = new Array<string>()

    const listenid = broker.on(  ev  => {
        
        if( !!ev[replySymbol] ) {
            return { result: 'this is the reply' } ;
        }

        eventsHistory.push( ev.data )

        return
    })

    expect( broker.isOn ).toBeTrue()
    
    const messages = [ 
        'async 10', 
        'async hello world 1!', 
        'async hello world 2!', 
        'async hello world 3!', 
        'async 11'
    ]
    
    
    messages.forEach( data => { 
        const res = broker.emit( { data } )
        expect( res ).toBeTrue()
    })
    
    expect( eventsHistory ).toBeArrayOfSize(5)
    expect( eventsHistory ).toEqual( messages )

    const reply = broker.emitWithReply( { data: 'async wait for reply ', [replySymbol]: true })

    expect( reply ).not.toBeNil()
    expect( reply.result ).toBe( 'this is the reply' )

    const res = broker.off(listenid!)

    expect( res ).toBeTrue()
    expect( broker.isOn ).toBeFalse()
        
})

test.skip( "generator test", () => {

    let stopped = true

    function* listener() {
        stopped = false
        console.debug("sync start generator!");
    
        let res:string|undefined = undefined;
        let ret
        while (!stopped) {
            try {
                ret = yield res
                // console.debug( 'got:', event, 'result', res )
                
                console.debug( 'yield', ret)
                
            }
            catch( e ) {
                console.error( `error listening data:`, e.message )
            }
            finally {
                console.error( `finally`, ret )
            }
        }     
        
        console.debug("sync finish generator");
    
    }
    
    const gen = listener()

    gen.next()
    const values = [ 'a', 'b' ]
    values.forEach( v => console.log( `next('${v}')`, gen.next(v) ) )
    //gen.throw( new Error( 'stop ') )
    stopped = true
    console.log( 'next', gen.next() )
    console.log( `return()`, gen.return() )
    
})

