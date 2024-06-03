"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBroker = exports.AsyncEventBroker = exports.generateListenerID = exports.stopSymbol = void 0;
exports.stopSymbol = Symbol("stop listening");
const generateListenerID = () => `el_${Math.floor(Math.random() * Date.now())}@${Date.now()}_`;
exports.generateListenerID = generateListenerID;
class AsyncEventBroker {
    _listener;
    _listenerId;
    async start(handler) {
        return this.on(handler);
    }
    async stop(listenerId) {
        return this.off(listenerId);
    }
    get isStarted() {
        return this.isOn;
    }
    async send(event) {
        return this.emit(event);
    }
    async sendAndWaitForReply(event) {
        return this.emitWithReply(event);
    }
    async *listen(listener) {
        console.debug("async start listening...!", listener.type, this._listenerId);
        let res = undefined;
        const stop = () => {
            this._listenerId = undefined;
            this._listener = undefined;
        };
        while (true) {
            try {
                let event = yield res;
                if (!!event[exports.stopSymbol]) {
                    break;
                }
                try {
                    const ret = await listener.handler(event);
                    res = ret ?? undefined;
                    if (listener.type === 'once') {
                        break;
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
        console.debug("async stop listening...!", listener.type, this._listenerId);
        stop();
        if (listener.type === 'once') {
            yield res;
        }
    }
    async on(handler) {
        if (this._listener)
            return;
        this._listenerId = (0, exports.generateListenerID)();
        this._listener = this.listen({ type: 'on', handler });
        await this._listener.next();
        return this._listenerId;
    }
    async once(handler) {
        if (this._listener)
            return;
        this._listenerId = (0, exports.generateListenerID)();
        this._listener = this.listen({ type: 'once', handler });
        await this._listener.next();
        return this._listenerId;
    }
    async off(listenerId) {
        if (!this._listener) {
            return false;
        }
        if (listenerId !== this._listenerId) {
            throw new Error('security error: you are not owner of broker!');
        }
        const l = this._listener;
        await this._listener.next({ [exports.stopSymbol]: true });
        await l.return();
        return true;
    }
    get isOn() {
        return !!this._listener;
    }
    async emit(event) {
        if (!this._listener)
            return false;
        await this._listener.next(event);
        return true;
    }
    async emitWithReply(event) {
        if (!this._listener) {
            throw new Error('broker is not listening!');
        }
        ;
        const { value } = await this._listener.next(event);
        if (!value) {
            throw new Error(`no reply event returned by listener!`);
        }
        return value;
    }
}
exports.AsyncEventBroker = AsyncEventBroker;
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
                if (!!event[exports.stopSymbol]) {
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
        this._listenerId = (0, exports.generateListenerID)();
        this._listener = this.listen({ type: 'on', handler });
        this._listener.next();
        return this._listenerId;
    }
    once(handler) {
        if (this._listener)
            return;
        this._listenerId = (0, exports.generateListenerID)();
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
        this._listener.next({ [exports.stopSymbol]: true });
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
