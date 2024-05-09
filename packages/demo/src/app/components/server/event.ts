import {   
    brokerRemote, 
} from '@/app/components/shared/custom-events'



export function sendAndWaitForReply() {

    const timeout = setTimeout( async () => {
        console.log( 'emitting and wait for replay')
        const reply = await brokerRemote.sendAndWaitForReply( { data: `how are you?`, reply: true } )
        console.log( 'reply', reply )
    } ,  5 * 1000 )

    return timeout
}
