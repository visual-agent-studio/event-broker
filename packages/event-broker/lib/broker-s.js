"use strict";
/**
 * event broker based on synchronous javascript generator
 *
 * @module event-broker
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBroker = void 0;
const broker_1 = require("./broker");
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
     * @deprecated use {@link on}
     */
    start(handler) {
        return this.on(handler);
    }
    /**
     * alias for {@link off} method
     * @deprecated use {@link off}
     */
    stop(listenerId) {
        return this.off(listenerId);
    }
    /**
     * alias for {@link isOn} property
     * @deprecated use {@link isOn}
     */
    get isStarted() {
        return this.isOn;
    }
    /**
     * alias for {@link emit} method
     * @deprecated use {@link emit}
     */
    send(event) {
        return this.emit(event);
    }
    /**
     *
     * alias for {@link emitWithReply} method
     * @deprecated use {@link emitWithReply}
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
        const stop = () => {
            this._listenerId = undefined;
            this._listener = undefined;
        };
        while (true) {
            try {
                let event = yield res;
                // console.debug( "RECEIVED", event, "EMITTED", res )
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
    /**
     * Starts listening for events.
     *
     * @param handler The function to handle the event.
     * @returns The start ID.
     */
    on(handler) {
        if (this._listener)
            return;
        this._listenerId = (0, broker_1.generateListenerID)();
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
        this._listenerId = (0, broker_1.generateListenerID)();
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
        this._listener.next({ [broker_1.stopSymbol]: true });
        // this._listener = undefined
        // this._listenerId = undefined
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
