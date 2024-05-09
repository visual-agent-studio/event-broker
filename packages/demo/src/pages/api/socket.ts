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

import { sendAndWaitForReply } from '@/app/components/server/event'

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

        socket.on( SHARED_TOPIC, msg => {
            brokerLocal.send(msg)
        })

        const interval = pingClient()

        const timeout = sendAndWaitForReply()
        
        socket.on("disconnect", async (reason) => { // CLEANUP
            console.log( `socket ${socket.id} disconnected!`)
            brokerLocal.stop(localStartId!)
            await brokerRemote.stop(remoteLocalId!)
            clearInterval( interval )
            clearTimeout( timeout )
        });

    })

    res.end()
}

export function pingClient() {
    let tick = 0
    const interval = setInterval( () => 
        brokerRemote.send( { data: `ping${tick++}` } )
    , 1000 )

    return interval

}
