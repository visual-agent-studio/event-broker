/**
 * @file broker-ml.ts
 * @description This file contains the implementation of the AsyncEventBrokerML class, which is an event broker that supports multiple event handlers.
 * The AsyncEventBrokerML class allows for the registration of multiple event handlers that can handle events asynchronously and optionally reply to them.
 * It supports both persistent ('on') and one-time ('once') listeners.
 * 
 * @module AsyncEventBrokerML
 * @version 2.0.0-beta-20240603-1
 * @license MIT
 * 
 * @example
 * import { AsyncEventBrokerML } from './broker-ml';
 * 
 * type ListenEvent = { data: string };
 * type ReplyEvent = { result: string };
 * 
 * const broker = new AsyncEventBrokerML<ListenEvent, ReplyEvent>();
 * 
 * const listenerId = await broker.on(async event => {
 *   console.log(event.data);
 * });
 * 
 * await broker.emit({ data: 'Test Event 1' });
 * await broker.emit({ data: 'Test Event 2' });
 * 
 * await broker.off(listenerId);
 */


import { AsyncEventBroker, AsyncEventHandler, BaseEvent, ListenerID, generateListenerID } from './broker'

/**
 * An asynchronous event broker that supports multiple event handlers.
 * 
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export class AsyncEventBrokerML<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {

    private _listenerMap = new Map<ListenerID, AsyncEventHandler<ListenEvent, ReplyEvent>>()

    private _broker = new AsyncEventBroker<ListenEvent, PromiseSettledResult<void | ReplyEvent>[]>()
    private _listenerId?: ListenerID

    /**
     * Returns the number of listeners currently registered.
     * 
     * @returns {number} The number of listeners.
     */
    listenerCount(): number {
        return this._listenerMap.size
    }

    /**
     * Internal handler for processing events.
     * 
     * @param {ListenEvent} event - The event to handle.
     * @returns {Promise<PromiseSettledResult<void | ReplyEvent>[]|void>} A promise that resolves with the results of the event handlers.
     */
    private _handler = async ( event: ListenEvent ): Promise<PromiseSettledResult<void | ReplyEvent>[]|void> => {

        const replys = [...this._listenerMap.values()].map(listener => listener(event))
        if( replys.length > 0 ) {
            return await Promise.allSettled(replys)
        }
    }

    /**
     * Registers an event handler.
     * 
     * @param {AsyncEventHandler<ListenEvent, ReplyEvent>} handler - The event handler to register.
     * @returns {Promise<ListenerID>} A promise that resolves with the listener ID.
     */
    async on( handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID> {

        if( !this._broker.isOn ) {
            this._listenerId = await this._broker.on(this._handler)
    
        }
        const listenerId = generateListenerID()
        this._listenerMap.set(listenerId, handler)

        return listenerId
    }

    /**
     * Unregisters an event handler.
     * 
     * @param {ListenerID} id - The ID of the listener to unregister.
     * @returns {Promise<boolean>} A promise that resolves to true if the listener was successfully unregistered, otherwise false.
     */
    async off( id: ListenerID): Promise<boolean> {
        const result =  this._listenerMap.delete(id)

        if( this._listenerMap.size === 0 && this._listenerId ) {
            this._broker.off(this._listenerId)
        }

        return result
    }

    /**
     * Emits an event to all registered handlers.
     * 
     * @param {ListenEvent} event - The event to emit.
     * @returns {Promise<boolean>} A promise that resolves to true if the event was successfully emitted, otherwise false.
     */
    async emit(event: ListenEvent): Promise<boolean> {
        if( this._listenerMap.size === 0 ) {
            return false
        }
        await this._broker.send( event )
        return true
    }

    /**
     * Emits an event and waits for a single reply.
     * 
     * @param {ListenEvent} event - The event to emit.
     * @returns {Promise<ReplyEvent>} A promise that resolves with the reply event.
     * @throws {Error} If more than one reply event is returned by listeners.
     */
    async emitWithReply( event: ListenEvent): Promise<ReplyEvent> {

        const fullfilled = await this.emitWithReplies( event )

        if (fullfilled.length > 1) {
            throw new Error(`more that one reply event returned by listeners!`)
        }

        return fullfilled[0]

    }

    /**
     * Emits an event and waits for multiple replies.
     * 
     * @param {ListenEvent} event - The event to emit.
     * @returns {Promise<ReplyEvent[]>} A promise that resolves with an array of reply events.
     * @throws {Error} If no valid reply event is returned by listeners.
     */
    async emitWithReplies( event: ListenEvent): Promise<ReplyEvent[]> {

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
