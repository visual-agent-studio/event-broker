"use strict";
/**
 * event broker based on javascript generator etiher synchronous and asynchronous
 *
 * @module event-broker
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBroker = exports.AsyncEventBroker = exports.generateListenerID = void 0;
const generateListenerID = () => `el_${Math.floor(Math.random() * Date.now())}@${Date.now()}_`;
exports.generateListenerID = generateListenerID;
/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
class AsyncEventBroker {
    _listener;
    _listenerId;
    /**
     * alias for {@link on} method
     *
     */
    async start(handler) {
        return this.on(handler);
    }
    /**
     * alias for {@link off} method
     *
     */
    async stop(listenerId) {
        return this.off(listenerId);
    }
    /**
     * alias for {@link isOn} property
     *
     */
    get isStarted() {
        return this.isOn;
    }
    /**
     * alias for {@link emit} method
     *
     */
    async send(event) {
        return this.emit(event);
    }
    /**
     *
     *  alias for {@link emitWithReply} method
     */
    async sendAndWaitForReply(event) {
        return this.emitWithReply(event);
    }
    /**
    * An asynchronous generator function that listens for events.
    */
    async *listen(listener) {
        console.debug("async start listening...!", listener.type, this._listenerId);
        let res = undefined;
        while (true) {
            try {
                let event = yield res;
                // console.debug( "RECEIVED", event, "EMITTED", res )
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
        this._listenerId = undefined;
        this._listener = undefined;
    }
    /**
     * Starts listening for events.
     *
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    async on(handler) {
        if (this._listener)
            return;
        this._listenerId = (0, exports.generateListenerID)();
        this._listener = this.listen({ type: 'on', handler });
        await this._listener.next(); // start listening
        return this._listenerId;
    }
    /**
     * Starts listening for sigle event and then off.
     *
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    async once(handler) {
        if (this._listener)
            return;
        this._listenerId = (0, exports.generateListenerID)();
        this._listener = this.listen({ type: 'once', handler });
        await this._listener.next(); // start listening
        return this._listenerId;
    }
    /**
     * Stops listening for events.
     *
     * @param listenerId The listener ID.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    async off(listenerId) {
        if (!this._listener) {
            return false;
        }
        if (listenerId !== this._listenerId) {
            throw new Error('security error: you are not owner of broker!');
        }
        const l = this._listener;
        this._listener = undefined;
        this._listenerId = undefined;
        await l.return();
        return true;
    }
    /**
     * Checks if the event broker is currently listening.
     *
     * @returns {boolean} True if the event broker is started, otherwise false.
     */
    get isOn() {
        return !!this._listener;
    }
    /**
     * Sends an event to the listener.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<boolean>} A promise that resolves to true if the event was sent successfully, otherwise false.
     */
    async emit(event) {
        if (!this._listener)
            return false;
        await this._listener.next(event);
        return true;
    }
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
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
/**
 * EventBroker class that implements EventSubmitter interface.
 * @template ListenEvent The type of the event to listen for.
 * @template ReplyEvent The type of the event to reply with.
 */
class EventBroker {
    _listener;
    _listenerId;
    /**
     * alias for {@link on} method
     *
     */
    start(handler) {
        return this.on(handler);
    }
    /**
     * alias for {@link off} method
     *
     */
    stop(listenerId) {
        return this.off(listenerId);
    }
    /**
     * alias for {@link isOn} property
     *
     */
    get isStarted() {
        return this.isOn;
    }
    /**
     * alias for {@link emit} method
     *
     */
    send(event) {
        return this.emit(event);
    }
    /**
     *
     *  alias for {@link emitWithReply} method
     */
    sendAndWaitForReply(event) {
        return this.emitWithReply(event);
    }
    /**
    * An generator function that listens for events.
    */
    *listen(listener) {
        console.debug("start listening...!", listener.type, this._listenerId);
        let res = undefined;
        while (true) {
            try {
                let event = yield res;
                // console.debug( "RECEIVED", event, "EMITTED", res )
                try {
                    const ret = listener.handler(event);
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
        console.debug("stop listening...!", listener.type, this._listenerId);
        this._listenerId = undefined;
        this._listener = undefined;
    }
    /**
     * Starts listening for events.
     *
     * @param handler The function to handle the event.
     * @returns The start ID.
     */
    on(handler) {
        if (this._listener)
            return;
        this._listenerId = (0, exports.generateListenerID)();
        this._listener = this.listen({ type: 'on', handler });
        this._listener.next(); // start listening
        return this._listenerId;
    }
    /**
     * Starts listening for sigle event and then off.
     *
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    once(handler) {
        if (this._listener)
            return;
        this._listenerId = (0, exports.generateListenerID)();
        this._listener = this.listen({ type: 'once', handler });
        this._listener.next(); // start listening
        return this._listenerId;
    }
    /**
     * Stops listening for events.
     *
     * @param listenerId The listener ID.
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    off(listenerId) {
        if (!this._listener) {
            return false;
        }
        if (listenerId !== this._listenerId) {
            throw new Error('security error: you are not owner of broker!');
        }
        const l = this._listener;
        this._listener = undefined;
        this._listenerId = undefined;
        l.return();
        return true;
    }
    /**
     * Checks if the event broker is currently started.
     * @returns {boolean} True if the event broker is started, otherwise false.
     */
    get isOn() {
        return !!this._listener;
    }
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns An iterator result containing the reply event or undefined.
     */
    emit(event) {
        if (!this._listener)
            return false;
        this._listener.next(event);
        return true;
    }
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns The reply event.
     */
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
