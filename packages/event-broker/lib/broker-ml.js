"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncEventBrokerML = void 0;
const broker_1 = require("./broker");
/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
class AsyncEventBrokerML {
    _listenerMap = new Map();
    _broker = new broker_1.AsyncEventBroker();
    _listenerId;
    listenerCount() {
        return this._listenerMap.size;
    }
    _handler = async (event) => {
        const replys = [...this._listenerMap.values()].map(listener => listener(event));
        if (replys.length > 0) {
            return await Promise.allSettled(replys);
        }
    };
    async on(handler) {
        if (!this._broker.isOn) {
            this._listenerId = await this._broker.on(this._handler);
        }
        const listenerId = (0, broker_1.generateListenerID)();
        this._listenerMap.set(listenerId, handler);
        return listenerId;
    }
    async off(id) {
        const result = this._listenerMap.delete(id);
        if (this._listenerMap.size === 0 && this._listenerId) {
            this._broker.off(this._listenerId);
        }
        return result;
    }
    async emit(event) {
        if (this._listenerMap.size === 0) {
            return false;
        }
        await this._broker.send(event);
        return true;
    }
    async emitWithReply(event) {
        const fullfilled = await this.emitWithReplys(event);
        if (fullfilled.length > 1) {
            throw new Error(`more that one reply event returned by listeners!`);
        }
        return fullfilled[0];
    }
    async emitWithReplys(event) {
        const value = await this._broker.emitWithReply(event);
        const fullfilled = value.filter(v => v.status === 'fulfilled')
            .map(v => v.value)
            .filter(v => !!v);
        if (fullfilled.length === 0) {
            throw new Error(`no valid reply event returned by listeners!`);
        }
        return fullfilled;
    }
}
exports.AsyncEventBrokerML = AsyncEventBrokerML;
