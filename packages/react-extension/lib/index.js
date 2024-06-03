"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEventBroker = exports.useAsyncEventBroker = void 0;
const react_1 = require("react");
const _TRACE = (action) => {
};
function useAsyncEventBroker(broker, handler) {
    const brokerId = (0, react_1.useRef)();
    const proxyRef = (0, react_1.useRef)({
        on: async (handler) => {
            if (broker.isOn)
                return;
            brokerId.current = await broker.on(handler);
        },
        once: async (handler) => {
            if (broker.isOn)
                return;
            brokerId.current = await broker.once(handler);
        },
        off: async () => {
            _TRACE(() => console.trace('request stop!', brokerId));
            const id = brokerId.current;
            brokerId.current = undefined;
            if (id) {
                try {
                    _TRACE(() => console.trace('stopping....!', id));
                    await broker.off(id);
                    _TRACE(() => console.trace('stopped....!', id));
                }
                catch (e) {
                    console.warn(e.message);
                }
            }
        },
        emit: async (event) => { await broker.emit(event); },
        emitWithReply: async (event) => await broker.emitWithReply(event)
    });
    (0, react_1.useEffect)(() => {
        return () => {
            if (broker.isStarted) {
                proxyRef.current.off();
            }
            else if (handler) {
                proxyRef.current.on(handler);
            }
        };
    }, []);
    return proxyRef.current;
}
exports.useAsyncEventBroker = useAsyncEventBroker;
function useEventBroker(broker, handler) {
    const brokerId = (0, react_1.useRef)();
    const proxyRef = (0, react_1.useRef)({
        on: (handler) => {
            if (broker.isStarted)
                return;
            brokerId.current = broker.on(handler);
        },
        once: (handler) => {
            if (broker.isStarted)
                return;
            brokerId.current = broker.once(handler);
        },
        off: () => {
            _TRACE(() => console.trace('request stop!', brokerId));
            const id = brokerId.current;
            brokerId.current = undefined;
            if (id) {
                try {
                    _TRACE(() => console.trace('stopping....!', id));
                    broker.off(id);
                    _TRACE(() => console.trace('stopped....!', id));
                }
                catch (e) {
                    console.warn(e.message);
                }
            }
        },
        emit: (event) => { broker.emit(event); },
        emitWithReply: (event) => broker.emitWithReply(event)
    });
    (0, react_1.useEffect)(() => {
        return () => {
            if (broker.isStarted) {
                proxyRef.current.off();
            }
            else if (handler) {
                proxyRef.current.on(handler);
            }
        };
    }, []);
    return proxyRef.current;
}
exports.useEventBroker = useEventBroker;
