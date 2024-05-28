"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEventBroker = exports.useAsyncEventBroker = void 0;
const react_1 = require("react");
/**
 * Custom hook to manage AsyncEventBroker lifecycle
 *
 * The broker is automatically stopped on component unmount
 * If handler is provided the broker is automatically started on component mount
 *
 * @template ListenEvent - The type of event to listen for.
 * @template ReplyEvent - The type of event to reply with.
 * @param {AsyncEventBroker<ListenEvent, ReplyEvent>} broker - The AsyncEventBroker instance.
 * @param {(event: ListenEvent) => Promise<ReplyEvent | void>} [handler] - Optional handler function for incoming events.
 * @returns {AsyncEventBrokerProxy<ListenEvent, ReplyEvent>} - An AsyncEventBroker proxy that ensure a safe lifecycle management.
 */
function useAsyncEventBroker(broker, handler) {
    const brokerId = (0, react_1.useRef)();
    const proxyRef = (0, react_1.useRef)({
        start: async (handler) => {
            if (broker.isStarted)
                return;
            brokerId.current = await broker.start(handler);
        },
        stop: async () => {
            console.trace('request stop!', brokerId);
            const id = brokerId.current;
            brokerId.current = undefined;
            if (id) {
                try {
                    console.trace('stopping....!', id);
                    await broker.stop(id);
                    console.trace('stopped....!', id);
                }
                catch (e) {
                    console.warn(e.message);
                }
            }
        },
        send: async (event) => { await broker.send(event); },
        sendAndWaitForReply: async (event) => await broker.sendAndWaitForReply(event)
    });
    (0, react_1.useEffect)(() => {
        return () => {
            if (broker.isStarted) {
                proxyRef.current.stop();
            }
            else if (handler) {
                proxyRef.current.start(handler);
            }
        };
    }, []);
    return proxyRef.current;
}
exports.useAsyncEventBroker = useAsyncEventBroker;
/**
 * Custom hook to manage EventBroker lifecycle
 *
 * The broker is automatically stopped on component unmount
 * If handler is provided the broker is automatically started on component mount
 *
 * @template ListenEvent - The type of event to listen for.
 * @template ReplyEvent - The type of event to reply with.
 * @param {EventBroker<ListenEvent, ReplyEvent>} broker - The EventBroker instance.
 * @param {(event: ListenEvent) => ReplyEvent | void} [handler] - Optional handler function for incoming events.
 * @returns {EventBrokerProxy<ListenEvent, ReplyEvent>} - An EventBroker proxy that ensure safe lifecycle management.
 */
function useEventBroker(broker, handler) {
    const brokerId = (0, react_1.useRef)();
    const proxyRef = (0, react_1.useRef)({
        start: (handler) => {
            if (broker.isStarted)
                return;
            brokerId.current = broker.start(handler);
        },
        stop: () => {
            console.trace('request stop!', brokerId);
            const id = brokerId.current;
            brokerId.current = undefined;
            if (id) {
                try {
                    console.trace('stopping....!', id);
                    broker.stop(id);
                    console.trace('stopped....!', id);
                }
                catch (e) {
                    console.warn(e.message);
                }
            }
        },
        send: (event) => { broker.send(event); },
        sendAndWaitForReply: (event) => broker.sendAndWaitForReply(event)
    });
    (0, react_1.useEffect)(() => {
        return () => {
            if (broker.isStarted) {
                proxyRef.current.stop();
            }
            else if (handler) {
                proxyRef.current.start(handler);
            }
        };
    }, []);
    return proxyRef.current;
}
exports.useEventBroker = useEventBroker;
