import { Socket} from 'net';
import { Server  as HTTPServer} from 'http'
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io'


import {   
    WS_PATH, 
    newBrokerLocal, 
    newBrokerRemote, 
    ClientToServerEvents, 
    ServerToClientEvents, 
    SHARED_TOPIC,
    SHARED_REPLY_TOPIC,
    Event,
    ReplyEvent
} from '@/app/components/shared/custom-events'

import { sendAndWaitForReply } from '@/app/components/server/event'
import { AsyncEventBroker, EventBroker, ListenerID } from '@soulsoftware/event-broker';

type NextApiRespnseIO = NextApiResponse & {
    socket: Socket & {
      server: HTTPServer & { io?: Server }
    }
  }
  
interface  SocketSession {

    localStartId?: ListenerID
    brokerLocal: EventBroker<Event>
    remoteStartId?:ListenerID
    brokerRemote: AsyncEventBroker<Event, ReplyEvent>


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
    
    const socketSessionMap = new Map<string,SocketSession>()


    io.on('connection', async socket => { 
        
        console.log( `socket ${socket.id} connected!`)

        const session:SocketSession = {

            brokerLocal: newBrokerLocal(),
            brokerRemote: newBrokerRemote()
        }

        socketSessionMap.set( socket.id, session )

        session.localStartId = session.brokerLocal.start( msg => {
            console.log( 'message from client', msg ) 
        })
         
        session.remoteStartId = await session.brokerRemote.start( async msg => {
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
            session.brokerLocal.send(msg)
        })

        const interval = pingClient( session )
        const timeout = sendAndWaitForReply( session.brokerRemote )
        
        socket.on("disconnect", async (reason) => { // CLEANUP
            console.log( `socket ${socket.id} disconnected!`)

            const session = socketSessionMap.get(socket.id)

            if( session?.localStartId ) {
                session.brokerLocal.stop(session.localStartId)
            }
            
            if( session?.remoteStartId ) {
                await session.brokerRemote.stop(session.remoteStartId!)
            }
            
            clearInterval( interval )
            clearTimeout( timeout )
        });

    })

    res.end()
}

export function pingClient( session: SocketSession ) {
    let tick = 0
    const interval = setInterval( () => 
        session.brokerRemote.send( { data: `ping${tick++}` } )
    , 1000 )

    return interval

}
