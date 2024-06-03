import { expect, test } from "bun:test";
import { AsyncEventBrokerTopicsML } from '../src/broker-topics-ml'
import { BaseEvent } from "../src/broker";

test("topic validationd", () => {
    
    expect( /\w+/.test("") ).toBeFalse()
    expect( /\w+/.test("*") ).toBeFalse()
});

    
const replySymbol = Symbol("reply");

type MyListenEvent = BaseEvent & { [replySymbol]?: boolean }

test("test send messages one topic one listener", async () => {

    const broker = new AsyncEventBrokerTopicsML<MyListenEvent, BaseEvent>()

    expect( broker.topicNames.length ).toBe(0)
    expect( broker.listenerCount() ).toBe(0)

    const listenerId = await broker.on( 't1', async ( ev ) => {
        expect( ev.ev1 ).not.toBeNil()
    
        // console.log( ev )
        if( !!ev[replySymbol] ) {
            return { reply: `reply-${ev.ev1}` }
        }
    
        expect( ev.ev1 === 'd1' )
        
    })
    expect( broker.topicNames.length ).toBe(1)
    expect( broker.listenerCount() ).toBe(1)
    expect( broker.listenerCount( 't1') ).toBe(1)

    expect( await broker.emit( 't1', { ev1: 'd1' } ) ).toBe(true)
    expect( broker.emitWithReply( 't1', { ev1: 'd1' } ) )
        .rejects.toThrow( 'no valid reply event returned by listeners!')
    expect( broker.emitWithReplys( 't1', { ev1: 'd1' } ) )
        .rejects.toThrow( 'no valid reply event returned by listeners!')


    expect( await broker.emitWithReply( 't1', { ev1: 'd2', [replySymbol]: true } ) ).toEqual(  { reply: 'reply-d2' } )
    expect( await broker.emitWithReplys( 't1', { ev1: 'd2', [replySymbol]: true } ) ).toEqual(  [{ reply: 'reply-d2' }] )
   
    expect( await broker.off( 't2', listenerId ) ).toBe( false )
    expect( await broker.off( 't1', listenerId ) ).toBe( true )

    expect( broker.listenerCount() ).toBe(0)
    expect( broker.listenerCount( 't1') ).toBe(0)

    expect( await broker.emit( 't2', { ev1: 'd1' } ) ).toBe(false)
    expect( broker.emitWithReply( 't2', { ev1: 'd1' } ) )
        .rejects.toThrow( "topic doesn't exist!")
    expect( broker.emitWithReplys( 't2', { ev1: 'd1' } ) )
        .rejects.toThrow( "topic doesn't exist!" )

});
   
type MyListenEvent2 = { data: string, [replySymbol]?: boolean }

test("test send messages one topic more listeners", async () => {

    const broker = new AsyncEventBrokerTopicsML<MyListenEvent2, BaseEvent>()

    expect( broker.topicNames.length ).toBe(0)
    expect( broker.listenerCount() ).toBe(0)

    expect( await broker.emit( 't1', { data: 'd1' } ) ).toBe(false)
    expect( broker.emitWithReply( 't1', { data: 'd1' } ) )
        .rejects.toThrow( "topic doesn't exist!")
    expect( broker.emitWithReplys( 't1', { data: 'd1' } ) )
        .rejects.toThrow( "topic doesn't exist!" )
    expect( await broker.emit( 't2', { data: 'd1' } ) ).toBe(false)
    expect( broker.emitWithReply( 't2', { data: 'd1' } ) )
        .rejects.toThrow( "topic doesn't exist!")
    expect( broker.emitWithReplys( 't2', { data: 'd1' } ) )
        .rejects.toThrow( "topic doesn't exist!" )
    
    const listenerId1 = await broker.on( 't1', async ( ev ) => {

        expect( ev.data ).not.toBeNil()

        if( !!ev[replySymbol] ) {
            return { reply: `reply-${ev.data}` }
        }
        if( ev.data ) {
            expect( ev.data === 'd1' )
        }
    })
    const listenerId2 = await broker.on( 't2', async ( ev ) => {

        expect( ev.data ).not.toBeNil()

    })
    expect( broker.topicNames.length ).toBe(2)
    expect( broker.listenerCount() ).toBe(2)
    expect( broker.listenerCount( 't1') ).toBe(1)
    expect( broker.listenerCount( 't2') ).toBe(1)

    expect( await broker.emit( 't1', { data: 'd1' } ) ).toBe(true)
    expect( broker.emitWithReply( 't1', { data: 'd1' } ) )
        .rejects.toThrow( 'no valid reply event returned by listeners!')
    expect( broker.emitWithReplys( 't1', { data: 'd1' } ) )
        .rejects.toThrow( 'no valid reply event returned by listeners!')


    expect( await broker.emitWithReply( 't1', { data: 'd2', [replySymbol]: true } ) ).toEqual(  { reply: 'reply-d2' } )
    const listenerId3 = await broker.on( 't1', async ( ev ) => {

        expect( ev.data ).not.toBeNil()

        if( !!ev[replySymbol] ) {
            return { reply: `reply2-${ev.data}` }
        }
    })
    expect( await broker.emitWithReplys( 't1', { data: 'd2', [replySymbol]: true } ) )
        .toEqual(  [{ reply: 'reply-d2' }, { reply: 'reply2-d2' }] )
    expect( await broker.off( 't1', listenerId3 ) ).toBe( true )
    expect( await broker.emitWithReplys( 't1', { data: 'd2', [replySymbol]: true } ) )
        .toEqual(  [{ reply: 'reply-d2' } ])
        
    expect( await broker.off( 't1', listenerId1 ) ).toBe( true )
    expect( await broker.off( 't2', listenerId2 ) ).toBe( true )

    expect( broker.listenerCount() ).toBe(0)
    expect( broker.listenerCount( 't1') ).toBe(0)

    expect( await broker.emit( 't2', { data: 'd1' } ) ).toBe(false)
    expect( broker.emitWithReply( 't2', { data: 'd1' } ) )
        .rejects.toThrow( 'broker is not listening!')
    expect( broker.emitWithReplys( 't2', { data: 'd1' } ) )
        .rejects.toThrow( 'broker is not listening!')

});
