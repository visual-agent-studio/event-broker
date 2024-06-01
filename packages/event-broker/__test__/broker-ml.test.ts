import { expect, test } from "bun:test";
import { AsyncEventBrokerML } from '../src/broker-ml'
import { BaseEvent } from "../src/broker";
    
const replySymbol = Symbol("reply");

type MyListenEvent = BaseEvent & { [replySymbol]?: boolean }

test("test send messages single listener", async () => {

    const broker = new AsyncEventBrokerML<MyListenEvent, BaseEvent>()

    expect( broker.listenerCount() ).toBe(0)

    const listenerId = broker.on(  async ( ev ) => {
        expect( ev.ev1 ).not.toBeNil()
    
        // console.log( ev )
        if( !!ev[replySymbol] ) {
            return { reply: `reply-${ev.ev1}` }
        }
    
        expect( ev.ev1 === 'd1' )
        
    })
    
    expect( broker.listenerCount() ).toBe(1)

    expect( await broker.emit( { ev1: 'd1' } ) ).toBe(true)
    expect( broker.emitWithReply( { ev1: 'd1' } ) )
        .rejects.toThrow( 'no valid reply event returned by listeners!')
    expect( broker.emitWithReplys( { ev1: 'd1' } ) )
        .rejects.toThrow( 'no valid reply event returned by listeners!')


    expect( await broker.emitWithReply( { ev1: 'd2', [replySymbol]: true } ) ).toEqual(  { reply: 'reply-d2' } )
    expect( await broker.emitWithReplys( { ev1: 'd2', [replySymbol]: true } ) ).toEqual(  [{ reply: 'reply-d2' }] )
   
    expect( broker.off( listenerId ) ).toBe( true )

    expect( broker.listenerCount() ).toBe(0)

    expect( await broker.emit( { ev1: 'd1' } ) ).toBe(false)
    expect( broker.emitWithReply( { ev1: 'd1' } ) )
        .rejects.toThrow( "no reply event returned by listener!")
    expect( broker.emitWithReplys( { ev1: 'd1' } ) )
        .rejects.toThrow( "no reply event returned by listener!" )

});
   
type MyListenEvent2 = { data: string, [replySymbol]?: boolean }

test("test send messages more listeners", async () => {

    const broker = new AsyncEventBrokerML<MyListenEvent2, BaseEvent>()

    expect( broker.listenerCount() ).toBe(0)

    expect( await broker.emit( { data: 'd1' } ) ).toBe(false)
    expect( broker.emitWithReply( { data: 'd1' } ) )
        .rejects.toThrow( "no reply event returned by listener!")
    expect( broker.emitWithReplys( { data: 'd1' } ) )
        .rejects.toThrow( "no reply event returned by listener!" )
    
    const listenerId1 = broker.on( async ( ev ) => {

        expect( ev.data ).not.toBeNil()

        if( !!ev[replySymbol] ) {
            return { reply: `reply-${ev.data}` }
        }
        if( ev.data ) {
            expect( ev.data === 'd1' )
        }
    })
    const listenerId2 = broker.on( async ( ev ) => {

        expect( ev.data ).not.toBeNil()

    })
    expect( broker.listenerCount() ).toBe(2)

    expect( await broker.emit( { data: 'd1' } ) ).toBe(true)
    expect( broker.emitWithReply( { data: 'd1' } ) )
        .rejects.toThrow( 'no valid reply event returned by listeners!')
    expect( broker.emitWithReplys( { data: 'd1' } ) )
        .rejects.toThrow( 'no valid reply event returned by listeners!')


    expect( await broker.emitWithReply( { data: 'd2', [replySymbol]: true } ) ).toEqual(  { reply: 'reply-d2' } )
    const listenerId3 = broker.on(  async ( ev ) => {

        expect( ev.data ).not.toBeNil()

        if( !!ev[replySymbol] ) {
            return { reply: `reply2-${ev.data}` }
        }
    })
    expect( await broker.emitWithReplys( { data: 'd2', [replySymbol]: true } ) )
        .toEqual(  [{ reply: 'reply-d2' }, { reply: 'reply2-d2' }] )
    expect( broker.off( listenerId3 ) ).toBe( true )
    expect( await broker.emitWithReplys( { data: 'd2', [replySymbol]: true } ) )
        .toEqual(  [{ reply: 'reply-d2' } ])
        
    expect( broker.off( listenerId1 ) ).toBe( true )
    expect( broker.off( listenerId2 ) ).toBe( true )

    expect( broker.listenerCount() ).toBe(0)

    expect( await broker.emit( { data: 'd1' } ) ).toBe(false)
    expect( broker.emitWithReply( { data: 'd1' } ) )
        .rejects.toThrow( 'no reply event returned by listener!')
    expect( broker.emitWithReplys( { data: 'd1' } ) )
        .rejects.toThrow( 'no reply event returned by listener!')

});
