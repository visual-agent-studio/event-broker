
import {  BaseEvent, ListenerID } from './broker'
import { AsyncEventBrokerML  } from './broker-ml'

type AsyncEventHandler<ListenEvent, ReplyEvent> = (event: ListenEvent) => Promise<ReplyEvent | void>

/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export class AsyncEventBrokerTopicsML<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {

    private _topicMap = new Map<string, AsyncEventBrokerML<ListenEvent, ReplyEvent>>()

    get topicNames(): string[] {
        return [...this._topicMap.keys()]
    }

    listenerCount( topic?: string ): number {

        if( topic ) {
            return this._topicMap.get( topic )?.listenerCount() ?? 0
        }
        let count = 0;
        for( const handlers of this._topicMap.values() ) {
            count += handlers.listenerCount()
        }
        return count
    }

    on(topic: string, handler: AsyncEventHandler<ListenEvent, ReplyEvent>): ListenerID {
        if (!/\w+/.test(topic)) throw new Error("topic is not valid!")

        let broker = this._topicMap.get(topic)
        if (!broker) {

            broker = new AsyncEventBrokerML<ListenEvent, ReplyEvent>();

            this._topicMap.set(topic, broker)
        }

        return broker.on( handler )
    }

    off(topic: string, id: ListenerID): boolean {

        const broker = this._topicMap.get(topic)
        return (broker) ?
            broker.off(id) :
            false
    }

    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns A promise containing an iterator result containing the reply event or undefined.
     */
    async emit(topic: string, event: ListenEvent): Promise<boolean> {

        const broker = this._topicMap.get(topic)
        if( !broker ) { 
            return false
        }
        return await broker.emit( event )
    }

    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    async emitWithReply(topic: string, event: ListenEvent): Promise<ReplyEvent> {

        const fullfilled = await this.emitWithReplys( topic, event )

        if (fullfilled.length > 1) {
            throw new Error(`more that one reply event returned by listeners!`)
        }

        return fullfilled[0]

    }

    async emitWithReplys(topic: string, event: ListenEvent): Promise<ReplyEvent[]> {

        const broker = this._topicMap.get(topic)
        if( !broker ) { 
            throw new Error(`topic doesn't exist!`)
        }

        return await broker.emitWithReplys( event )
    }
}
