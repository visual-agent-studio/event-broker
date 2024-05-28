'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

import { SHARED_TOPIC, WS_PATH, newBrokerLocal, newBrokerRemote, SHARED_REPLY_TOPIC, Event } from '@/app/components/shared/custom-events'

import { useAsyncEventBroker, useEventBroker } from '@soulsoftware/event-broker-react';

export default function SocketViewer() {

  const [value, setValue] = useState('')
  const [valueToSend, setValueToSend] = useState('')

  const brokerRemoteProxy = useSocket( '/api/socket', msg => {
    if( msg.reply ) {
      const result = window.prompt( msg.data )
      return { data: result! }
    }
    else {
      setValue(msg.data)
    }
   } );

  const sendToServer = async (e:any) => await brokerRemoteProxy.send( { data: valueToSend } )
  
  
  return (
    <div className="bg-white shadow-md rounded-md p-4 w-full">
      <div className="justify-between items-center mb-4">
        <h3 className="text-black text-lg font-medium">Socket Viewer</h3>
      </div>
      <div className="mb-4">
        <p className="text-gray-700">{value}</p>      
        <input className="text-black border border-gray-400 rounded-md px-4 py-2 w-full" value={valueToSend} onChange={ (e) => setValueToSend(e.target.value) } />
        <div className="flex justify-end">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" onClick={sendToServer} disabled={!valueToSend}>Send Message</button>
        </div>
      </div>
    </div>
  )
}


function useSocket( api: string, fromServer: (event: Event) => void | Event ) {

  const brokerLocalProxy = useEventBroker( newBrokerLocal() )
  const brokerRemoteProxy = useAsyncEventBroker( newBrokerRemote() );

  useEffect( () => { 
    let socket:Socket|undefined 

    const socketInitializer = async () => {
      // We call this just to make sure we turn on the websocket server
      await fetch(api)
  
      socket = io( { path: WS_PATH } )

      socket.on('connect', async () => {

        console.debug('Connected', socket?.id) 

        brokerLocalProxy.start( fromServer )
  
        await brokerRemoteProxy.start( async msg => {
          console.debug( "send to server", msg )
          socket?.emit( SHARED_TOPIC, msg )
        })
      
        socket?.on( SHARED_TOPIC, msg => {
          console.debug( `from server ${socket?.id}`, msg )
          brokerLocalProxy.send(msg) 
        })
        socket?.on( SHARED_REPLY_TOPIC, (msg, callback ) => {
            const reply = brokerLocalProxy.sendAndWaitForReply( { ...msg, reply:true }) 
            callback( reply )
        })
      })

      socket.on('disconnect', async () => {
        console.log( 'socket disconnect')
        brokerLocalProxy.stop()
        await brokerRemoteProxy.stop()
      })
    }

    return () => { 
      if( socket ) {
        if( !socket.disconnected ) {
          socket.close()
          console.debug( 'socket closed!')  
        }
        socket = undefined
      }
      else {
        socketInitializer().then( () => console.debug( 'socket initialized'))
      }
     }
  }, [] )

  return brokerRemoteProxy

  
}