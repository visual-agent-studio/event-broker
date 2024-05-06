'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

import { SHARED_TOPIC, WS_PATH, brokerLocal, brokerRemote, SHARED_REPLY_TOPIC } from '@/app/components/shared/custom-events'

let socket: Socket

export default function SocketViewer() {

  const [value, setValue] = useState('')
  const [valueToSend, setValueToSend] = useState('')

  const sendToServer = async (e:any) => {
    
    if (!socket) return
        
    await brokerRemote.send( { data: valueToSend } )
  }

  useEffect( () => { 
    const socketInitializer = async () => {
      // We call this just to make sure we turn on the websocket server
      await fetch('/api/socket')
  
      socket = io( { path: WS_PATH } )
  
      let localStartId, remoteLocalId

      socket.on('connect', async () => {
        console.log('Connected', socket.id) 
      
        localStartId = brokerLocal.start( msg => {
          if( msg.reply ) {
            const result = window.prompt( msg.data )
            return { data: result! }
          }
          else {
            setValue(msg.data)
          }
         })
  
        remoteLocalId = await brokerRemote.start( async msg => {
          console.debug( "send to server", msg )
          socket.emit( SHARED_TOPIC, msg )
        })
      
        socket.on( SHARED_TOPIC, msg => brokerLocal.send(msg) )
        socket.on( SHARED_REPLY_TOPIC, (msg, callback ) => {
            const reply = brokerLocal.sendAndWaitForReply( { ...msg, reply:true }) 
            callback( reply )
        })
      })
      socket.on('disconnect', async () => {
        console.log( 'socket disconnect')
        brokerLocal.stop(localStartId!)
        brokerRemote.stop(remoteLocalId!)
      })
    }
    return () => { socketInitializer() } 
  }, [] )

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