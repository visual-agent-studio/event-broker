
import { AsyncEventBroker, AsyncEventHandler, BaseEvent, ListenerID, generateListenerID } from './broker'



/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export class AsyncEventBrokerML<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {

    private _listenerMap = new Map<ListenerID, AsyncEventHandler<ListenEvent, ReplyEvent>>()

    private _broker = new AsyncEventBroker<ListenEvent, PromiseSettledResult<void | ReplyEvent>[]>()
    private _listenerId?: ListenerID

    listenerCount(): number {
        return this._listenerMap.size
    }

    private _handler = async ( event: ListenEvent ): Promise<PromiseSettledResult<void | ReplyEvent>[]|void> => {

        const replys = [...this._listenerMap.values()].map(listener => listener(event))
        if( replys.length > 0 ) {
            return await Promise.allSettled(replys)
        }
    }

    async on( handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID> {

        if( !this._broker.isOn ) {
            this._listenerId = await this._broker.on(this._handler)
    
        }
        const listenerId = generateListenerID()
        this._listenerMap.set(listenerId, handler)

        return listenerId
    }

    async off( id: ListenerID): Promise<boolean> {
        const result =  this._listenerMap.delete(id)

        if( this._listenerMap.size === 0 && this._listenerId ) {
            this._broker.off(this._listenerId)
        }

        return result
    }


    async emit(event: ListenEvent): Promise<boolean> {
        if( this._listenerMap.size === 0 ) {
            return false
        }
        await this._broker.send( event )
        return true
    }

    async emitWithReply( event: ListenEvent): Promise<ReplyEvent> {

        const fullfilled = await this.emitWithReplys( event )

        if (fullfilled.length > 1) {
            throw new Error(`more that one reply event returned by listeners!`)
        }

        return fullfilled[0]

    }

    async emitWithReplys( event: ListenEvent): Promise<ReplyEvent[]> {

        const value = await this._broker.emitWithReply( event )

        const fullfilled = value.filter(v => v.status === 'fulfilled')
            .map(v => (<PromiseFulfilledResult<ReplyEvent>>v).value)
            .filter(v => !!v)

        if (fullfilled.length === 0) {
            throw new Error(`no valid reply event returned by listeners!`)
        }

        return fullfilled
    }
}
