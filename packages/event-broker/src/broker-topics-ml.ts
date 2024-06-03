/**
 * @file broker-topics-ml.ts
 * @description This file contains the implementation of the AsyncEventBrokerTopicsML class, which is an event broker that supports multiple topics with multiple event handlers.
 * The AsyncEventBrokerTopicsML class allows for the registration of multiple event handlers for different topics that can handle events asynchronously and optionally reply to them.
 * It supports both persistent ('on') and one-time ('once') listeners for each topic.
 * 
 * @module AsyncEventBrokerTopicsML
 * @version 2.0.0-beta-20240603-1
 * @license MIT
 * 
 * @example
 * import { AsyncEventBrokerTopicsML } from './broker-topics-ml';
 * 
 * type ListenEvent = { data: string };
 * type ReplyEvent = { result: string };
 * 
 * const broker = new AsyncEventBrokerTopicsML<ListenEvent, ReplyEvent>();
 * 
 * const listenerId = await broker.on('topic1', async event => {
 *   console.log(event.data);
 * });
 * 
 * await broker.emit('topic1', { data: 'Test Event 1' });
 * await broker.emit('topic1', { data: 'Test Event 2' });
 * 
 * await broker.off('topic1', listenerId);
 */

import {  AsyncEventHandler, BaseEvent, ListenerID } from './broker'
import { AsyncEventBrokerML  } from './broker-ml'

/**
 * An asynchronous event broker that supports multiple topics with multiple event handlers.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export class AsyncEventBrokerTopicsML<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {

    private _topicMap = new Map<string, AsyncEventBrokerML<ListenEvent, ReplyEvent>>();

    /**
     * Gets the names of all topics.
     * @returns {string[]} An array of topic names.
     */
    get topicNames(): string[] {
        return [...this._topicMap.keys()];
    }

    /**
     * Gets the number of listeners for a specific topic or for all topics.
     * @param {string} [topic] - The topic to get the listener count for. If not provided, returns the total listener count for all topics.
     * @returns {number} The number of listeners.
     */
    listenerCount(topic?: string): number {
        if (topic) {
            return this._topicMap.get(topic)?.listenerCount() ?? 0;
        }
        let count = 0;
        for (const handlers of this._topicMap.values()) {
            count += handlers.listenerCount();
        }
        return count;
    }

    /**
     * Registers an event handler for a specific topic.
     * @param {string} topic - The topic to register the handler for.
     * @param {AsyncEventHandler<ListenEvent, ReplyEvent>} handler - The event handler to register.
     * @returns {Promise<ListenerID>} A promise that resolves with the listener ID.
     * @throws {Error} If the topic is not valid.
     */
    async on(topic: string, handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID> {
        if (!/\w+/.test(topic)) throw new Error("topic is not valid!");

        let broker = this._topicMap.get(topic);
        if (!broker) {
            broker = new AsyncEventBrokerML<ListenEvent, ReplyEvent>();
            this._topicMap.set(topic, broker);
        }

        return await broker.on(handler);
    }

    /**
     * Unregisters an event handler for a specific topic.
     * @param {string} topic - The topic to unregister the handler from.
     * @param {ListenerID} id - The ID of the listener to unregister.
     * @returns {Promise<boolean>} A promise that resolves to true if the listener was successfully unregistered, otherwise false.
     */
    async off(topic: string, id: ListenerID): Promise<boolean> {
        const broker = this._topicMap.get(topic);
        return (broker) ? await broker.off(id) : false;
    }

    /**
     * Sends an event to a specific topic.
     * @param {string} topic - The topic to send the event to.
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<boolean>} A promise that resolves to true if the event was successfully emitted, otherwise false.
     */
    async emit(topic: string, event: ListenEvent): Promise<boolean> {
        const broker = this._topicMap.get(topic);
        if (!broker) {
            return false;
        }
        return await broker.emit(event);
    }

    /**
     * Sends an event to a specific topic and waits for a reply.
     * @param {string} topic - The topic to send the event to.
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<ReplyEvent>} A promise that resolves with the reply event.
     * @throws {Error} If more than one reply event is returned by listeners.
     */
    async emitWithReply(topic: string, event: ListenEvent): Promise<ReplyEvent> {
        const fullfilled = await this.emitWithReplies(topic, event);

        if (fullfilled.length > 1) {
            throw new Error(`more than one reply event returned by listeners!`);
        }

        return fullfilled[0];
    }

    /**
     * Sends an event to a specific topic and waits for multiple replies.
     * @param {string} topic - The topic to send the event to.
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<ReplyEvent[]>} A promise that resolves with an array of reply events.
     * @throws {Error} If the topic doesn't exist.
     */
    async emitWithReplies(topic: string, event: ListenEvent): Promise<ReplyEvent[]> {
        const broker = this._topicMap.get(topic);
        if (!broker) {
            throw new Error(`topic doesn't exist!`);
        }

        return await broker.emitWithReplies(event);
    }
}
