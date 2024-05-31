import { AsyncEventBroker, EventBroker } from "../src/index"

function  syncTest() {
    type ListenEvent = { data: string, reply?:boolean  }
    type ReplyEvent = { result: string }

    const broker = new EventBroker<ListenEvent,ReplyEvent>()

    const startid = broker.start( ( e ) => {
        
        console.debug( 'heard:', e)
        if( e.reply ) {
            console.debug( 'reply')
            return { result: 'sync this is the reply' };
        }
        return
      })
    console.log( startid )

    broker.send( { data: 'sync 10' } )
    broker.send( { data: 'sync hello world 1! ' } )
    broker.send( { data: 'sync hello world 2!' } )
    broker.send( { data: 'sync hello world 3!' } )
    broker.send( { data: 'sync 11'} )
    const reply = broker.sendAndWaitForReply( { data: 'sync wait for reply', reply: true })
    console.debug( 'sync reply:', reply )
    const res = broker.stop(startid!, 'end')
    
    console.debug( 'sync result:', res )
}

async function asyncTest() {

    type ListenEvent = { data: string, reply?:boolean  }
    type ReplyEvent = { result: string }
    const broker = new AsyncEventBroker<ListenEvent,ReplyEvent>()

    const startid = await broker.start(  async ( e ) => {
        
        console.debug( 'heard:', e)
        if( e.reply ) {
            console.debug( 'reply')
            return Promise.resolve( { result: 'this is the reply' } );
        }
        return
      })
    console.log( startid )
    await broker.send( { data: 'async 10' } )
    await broker.send( { data: 'async hello world 1! ' } )
    await broker.send( { data: 'async hello world 2!' } )
    await broker.send( { data: 'async hello world 3!' } )
    await broker.send( { data: 'async 11'} )
    const reply = await broker.sendAndWaitForReply( { data: 'async wait for reply ', reply: true })
    console.debug( 'async reply:', reply )
    const res = await broker.stop(startid!, 'end')
    console.debug( 'async result:', res )
}


function generatorTest() {

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
    
}

syncTest()
asyncTest()
generatorTest()
