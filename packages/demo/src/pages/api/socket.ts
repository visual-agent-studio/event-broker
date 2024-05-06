import { Socket} from 'net';
import { Server  as HTTPServer} from 'http'
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io'


import {   
    WS_PATH, 
    brokerLocal, 
    brokerRemote, 
    ClientToServerEvents, 
    ServerToClientEvents, 
    SHARED_TOPIC,
    SHARED_REPLY_TOPIC
} from '@/app/components/shared/custom-events'


type NextApiRespnseIO = NextApiResponse & {
    socket: Socket & {
      server: HTTPServer & { io?: Server }
    }
  }
  
export default function handler(req: NextApiRequest, res: NextApiRespnseIO) {
    

    if (res.socket.server.io) {
        res.end()
        return
    }

    const io = new Server<ClientToServerEvents, ServerToClientEvents>(res.socket.server, {
        path: WS_PATH
    })

    res.socket.server.io = io
    
    let localStartId, remoteLocalId

    io.on('connection', async socket => { 
        
        console.log( `socket ${socket.id} connected!`)

        localStartId = brokerLocal.start( msg => {
            console.log( 'message from client', msg ) 
        })
         
        remoteLocalId = await brokerRemote.start( async msg => {
            console.debug( "send to client", msg )

            if( msg.reply ) {
                return new Promise( (resolve, _ ) => {
                    socket.emit( SHARED_REPLY_TOPIC, msg, ( e ) => {
                        resolve( e )
                    })    
                })
            }
            else {
                socket.emit( SHARED_TOPIC, msg )
            }
        })

        socket.on( SHARED_TOPIC, msg => brokerLocal.send(msg) )

        let tick = 0
        const interval = setInterval( () => 
            brokerRemote.send( { data: `ping${tick++}` } )
        , 1000 )

        const timeout = setTimeout( async () => {
            console.log( 'emitting and wait for replay')
            const reply = await brokerRemote.sendAndWaitForReply( { data: `how are you?`, reply: true } )
            console.log( 'reply', reply )
        } ,  5 * 1000 )
        
        socket.on("disconnect", (reason) => { // CLEANUP
            console.log( `socket ${socket.id} disconnected!`)
            clearInterval( interval )
            clearTimeout( timeout )
            brokerLocal.stop(localStartId!)
            brokerRemote.stop(remoteLocalId!)
        });

    })

    res.end()
}