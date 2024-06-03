"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncEventBrokerTopicsML = void 0;
const broker_ml_1 = require("./broker-ml");
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
        return (broker) ? await broker.off(id) : false;
    }
    async emit(topic, event) {
        const broker = this._topicMap.get(topic);
        if (!broker) {
            return false;
        }
        return await broker.emit(event);
    }
    async emitWithReply(topic, event) {
        const fullfilled = await this.emitWithReplies(topic, event);
        if (fullfilled.length > 1) {
            throw new Error(`more than one reply event returned by listeners!`);
        }
        return fullfilled[0];
    }
    async emitWithReplies(topic, event) {
        const broker = this._topicMap.get(topic);
        if (!broker) {
            throw new Error(`topic doesn't exist!`);
        }
        return await broker.emitWithReplies(event);
    }
}
exports.AsyncEventBrokerTopicsML = AsyncEventBrokerTopicsML;
