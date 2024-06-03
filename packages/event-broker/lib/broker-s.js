"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBroker = void 0;
const broker_1 = require("./broker");
class EventBroker {
    _listener;
    _listenerId;
    start(handler) {
        return this.on(handler);
    }
    stop(listenerId) {
        return this.off(listenerId);
    }
    get isStarted() {
        return this.isOn;
    }
    send(event) {
        return this.emit(event);
    }
    sendAndWaitForReply(event) {
        return this.emitWithReply(event);
    }
    *listen(listener) {
        console.debug("start listening...!", listener.type, this._listenerId);
        let res = undefined;
        const stop = () => {
            this._listenerId = undefined;
            this._listener = undefined;
        };
        while (true) {
            try {
                let event = yield res;
                if (!!event[broker_1.stopSymbol]) {
                    break;
                }
                try {
                    const ret = listener.handler(event);
                    res = ret ?? undefined;
                    if (listener.type === 'once') {
                        yield res;
                    }
                }
                catch (e) {
                    console.warn('error evaluating handler!', e);
                }
            }
            catch (e) {
                console.error(`error yield(ing) data!`, e);
                break;
            }
        }
        console.debug("stop listening...!", listener.type, this._listenerId);
        stop();
        if (listener.type === 'once') {
            yield res;
        }
    }
    on(handler) {
        if (this._listener)
            return;
        this._listenerId = (0, broker_1.generateListenerID)();
        this._listener = this.listen({ type: 'on', handler });
        this._listener.next();
        return this._listenerId;
    }
    once(handler) {
        if (this._listener)
            return;
        this._listenerId = (0, broker_1.generateListenerID)();
        this._listener = this.listen({ type: 'once', handler });
        this._listener.next();
        return this._listenerId;
    }
    off(listenerId) {
        if (!this._listener) {
            return false;
        }
        if (listenerId !== this._listenerId) {
            throw new Error('security error: you are not owner of broker!');
        }
        const l = this._listener;
        this._listener.next({ [broker_1.stopSymbol]: true });
        l.return();
        return true;
    }
    get isOn() {
        return !!this._listener;
    }
    emit(event) {
        if (!this._listener)
            return false;
        this._listener.next(event);
        return true;
    }
    emitWithReply(event) {
        if (!this._listener) {
            throw new Error('broker is not listening!');
        }
        ;
        const { value } = this._listener.next(event);
        if (!value) {
            throw new Error(`no reply event returned by listener!`);
        }
        return value;
    }
}
exports.EventBroker = EventBroker;
