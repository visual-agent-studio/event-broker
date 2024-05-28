"use strict";
/**
 * event broker based on javascript generator etiher synchronous and asynchronous
 *
 * @module event-broker
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncEventBroker = exports.EventBroker = void 0;
const generateStartID = () => `_ID${Math.floor(Math.random() * Date.now())}@${Date.now()}_`;
/**
 * EventBroker class that implements EventSubmitter interface.
 * @template ListenEvent The type of the event to listen for.
 * @template ReplyEvent The type of the event to reply with.
 */
class EventBroker {
    _listener;
    _startId;
    /**
     * Starts listening for events.
     * @param handler The function to handle the event.
     * @returns The start ID.
     */
    start(handler) {
        if (this._listener)
            return;
        function* listener(id) {
            console.debug("sync start listening...!", id);
            let res = undefined;
            while (true) {
                try {
                    let event = yield res;
                    try {
                        const ret = handler(event);
                        res = ret ?? undefined;
                    }
                    catch (e) {
                        console.warn('error evaluating handler!', e);
                    }
                }
                catch (e) {
                    console.error(`error yield(ing) data!`, e);
                }
            }
        }
        this._startId = generateStartID();
        this._listener = listener(this._startId);
        this._listener.next(); // start listening
        return this._startId;
    }
    /**
     * Checks if the event broker is currently started.
     * @returns {boolean} True if the event broker is started, otherwise false.
     */
    get isStarted() {
        return !!this._listener;
    }
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns An iterator result containing the reply event or undefined.
     */
    send(event) {
        if (!this._listener)
            return { value: undefined };
        return (this._listener.next(event));
    }
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns The reply event.
     */
    sendAndWaitForReply(event) {
        return this.send(event).value;
    }
    /**
     * Stops listening for events.
     * @param startId The start ID.
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    stop(startId, value) {
        if (!this._listener)
            return;
        if (startId !== this._startId) {
            throw new Error('security error: you are not owner of broker!');
        }
        const l = this._listener;
        this._listener = undefined;
        return l.return(value);
    }
}
exports.EventBroker = EventBroker;
/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
class AsyncEventBroker {
    _listener;
    _startId;
    /**
     * Starts listening for events.
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    async start(handler) {
        if (this._listener)
            return;
        /**
         * An asynchronous generator function that listens for events.
         */
        async function* listener(id) {
            console.debug("async start listening...!", id);
            let res = undefined;
            while (true) {
                try {
                    let event = yield res;
                    try {
                        const ret = await handler(event);
                        res = ret ?? undefined;
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
        }
        this._startId = generateStartID();
        this._listener = listener(this._startId);
        await this._listener.next(); // start listening
        return this._startId;
    }
    /**
     * Checks if the event broker is currently started.
     * @returns {boolean} True if the event broker is started, otherwise false.
     */
    get isStarted() {
        return !!this._listener;
    }
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns A promise containing an iterator result containing the reply event or undefined.
     */
    async send(event) {
        if (!this._listener)
            return { value: undefined };
        return (await this._listener.next(event));
    }
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    async sendAndWaitForReply(event) {
        return (await this.send(event)).value;
    }
    /**
     * Stops listening for events.
     * @param startId The start ID.
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    async stop(startId, value) {
        if (!this._listener)
            return;
        if (startId !== this._startId) {
            throw new Error('security error: you are not owner of broker!');
        }
        const l = this._listener;
        this._listener = undefined;
        return await l.return(value);
    }
}
exports.AsyncEventBroker = AsyncEventBroker;
