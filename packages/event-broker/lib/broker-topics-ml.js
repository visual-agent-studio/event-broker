"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncEventBrokerTopicsML = void 0;
const broker_ml_1 = require("./broker-ml");
/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
class AsyncEventBrokerTopicsML {
    _topicMap = new Map();
    get topicNames() {
        return [...this._topicMap.keys()];
    }
    listenerCount(topic) {
        if (topic) {
            return this._topicMap.get(topic)?.listenerCount() ?? 0;
        }
        let count = 0;
        for (const handlers of this._topicMap.values()) {
            count += handlers.listenerCount();
        }
        return count;
    }
    async on(topic, handler) {
        if (!/\w+/.test(topic))
            throw new Error("topic is not valid!");
        let broker = this._topicMap.get(topic);
        if (!broker) {
            broker = new broker_ml_1.AsyncEventBrokerML();
            this._topicMap.set(topic, broker);
        }
        return await broker.on(handler);
    }
    async off(topic, id) {
        const broker = this._topicMap.get(topic);
        return (broker) ?
            await broker.off(id) :
            false;
    }
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns A promise containing an iterator result containing the reply event or undefined.
     */
    async emit(topic, event) {
        const broker = this._topicMap.get(topic);
        if (!broker) {
            return false;
        }
        return await broker.emit(event);
    }
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    async emitWithReply(topic, event) {
        const fullfilled = await this.emitWithReplys(topic, event);
        if (fullfilled.length > 1) {
            throw new Error(`more that one reply event returned by listeners!`);
        }
        return fullfilled[0];
    }
    async emitWithReplys(topic, event) {
        const broker = this._topicMap.get(topic);
        if (!broker) {
            throw new Error(`topic doesn't exist!`);
        }
        return await broker.emitWithReplys(event);
    }
}
exports.AsyncEventBrokerTopicsML = AsyncEventBrokerTopicsML;
