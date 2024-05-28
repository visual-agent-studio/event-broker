import {   
    Event,
    ReplyEvent,
} from '@/app/components/shared/custom-events'
import { AsyncEventBroker } from '@soulsoftware/event-broker'



export function sendAndWaitForReply( brokerRemote: AsyncEventBroker<Event, ReplyEvent> ) {

    const timeout = setTimeout( async () => {
        console.log( 'emitting and wait for replay')
        const reply = await brokerRemote.sendAndWaitForReply( { data: `how are you?`, reply: true } )
        console.log( 'reply', reply )
    } ,  5 * 1000 )

    return timeout
}
