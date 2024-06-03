import { expect, test } from "bun:test";

import { AsyncEventBroker } from "../src/broker"

const replySymbol = Symbol("reply");

type ListenEvent = { data: string, [replySymbol]?: boolean  }
type ReplyEvent = { result: string }

test( "async broker test", async () => {

    const broker = new AsyncEventBroker<ListenEvent,ReplyEvent>()

    const eventsHistory = new Array<string>()

    const listenid = await broker.on(  async ( ev ) => {
        
        if( !!ev[replySymbol] ) {
            return { result: 'this is the reply' };
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
    
    const emits = messages.map( data =>  broker.emit( { data } ) )
    
    const results = await Promise.allSettled( emits )
    
    results.forEach( r => { 

        expect( r.status ).toBe( 'fulfilled' )
        expect( (<any>r).value ).toBeTrue()
    })
    
    expect( eventsHistory ).toBeArrayOfSize(5)
    expect( eventsHistory ).toEqual( messages )

    const reply = await broker.emitWithReply( { data: 'async wait for reply ', [replySymbol]: true })

    expect( reply ).not.toBeNil()
    expect( reply.result ).toBe( 'this is the reply' )

    const res = await broker.off(listenid!)

    expect( res ).toBeTrue()
    expect( broker.isOn ).toBeFalse()
        
})

test( "async broker test once", async () => {

    const broker = new AsyncEventBroker<ListenEvent,ReplyEvent>()

    const handler = async ( ev:ListenEvent ) => {
        
        if( !!ev[replySymbol] ) {
            return { result: 'this is the reply'};
        }
        return
    }


    // reply 
    let id = await broker.once( handler )
        
    // await expect( broker.emitWithReply( { data: "Event Data" } ) ).resolves.not.toThrow()
    try {
        let reply = await broker.emitWithReply( { data: "Event Data", [replySymbol]: true  } )
        expect( reply ).not.toBeNil()
        expect( reply ).toEqual( { result: 'this is the reply' } )
        expect( broker.isOn ).toBeFalse()
        const res = await broker.off(id!)
        expect( res ).toBeFalse()
    
    }
    catch( e ) {
        throw e.message
    } 

    id = await broker.once( handler )

    expect( id ).not.toBeNil()

    let res = await broker.emit( { data: "Event Data" } )
    expect( res ).toBeTrue()
    expect( broker.isOn ).toBeFalse()
    res = await broker.off(id!)
    expect( res ).toBeFalse()

    res = await broker.emit( { data: "Event Data 2" } )
    expect( res ).toBeFalse()

    


})