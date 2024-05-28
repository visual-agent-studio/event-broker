import { AsyncEventBroker, BaseEvent, EventBroker } from '@soulsoftware/event-broker';
/**
 * Interface representing a proxy for AsyncEventBroker.
 *
 * @template ListenEvent - The type of event to listen for.
 * @template ReplyEvent - The type of event to reply with.
 */
export interface AsyncEventBrokerProxy<ListenEvent, ReplyEvent> {
    /**
     * Starts the broker with the provided handler.
     *
     * @param {(event: ListenEvent) => Promise<ReplyEvent | void>} handler - The handler function for incoming events.
     * @returns {Promise<void>} A promise that resolves when the broker is started.
     */
    start(handler: (event: ListenEvent) => Promise<ReplyEvent | void>): Promise<void>;
    /**
     * Stops the broker.
     *
     * @returns {Promise<void>} A promise that resolves when the broker is stopped.
     */
    stop(): Promise<void>;
    /**
     * Sends an event to the broker.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<void>} A promise that resolves when the event is sent.
     */
    send(event: ListenEvent): Promise<void>;
    /**
     * Sends an event to the broker and waits for a reply.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<ReplyEvent | void>} A promise that resolves when reply event is received (void means that message has been delivered and no reply is expected).
     */
    sendAndWaitForReply(event: ListenEvent): Promise<ReplyEvent | void>;
}
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
export declare function useAsyncEventBroker<ListenEvent extends BaseEvent = any, ReplyEvent extends BaseEvent = ListenEvent>(broker: AsyncEventBroker<ListenEvent, ReplyEvent>, handler?: (event: ListenEvent) => Promise<ReplyEvent | void>): AsyncEventBrokerProxy<ListenEvent, ReplyEvent>;
/**
 * Interface representing a proxy for EventBroker.
 *
 * @template ListenEvent - The type of event to listen for.
 * @template ReplyEvent - The type of event to reply with.
 */
export interface EventBrokerProxy<ListenEvent, ReplyEvent> {
    /**
     * Starts the broker with the provided handler.
     *
     * @param {(event: ListenEvent) => ReplyEvent | void} handler - The handler function for incoming events.
     * @returns {void} - returns when broker is started.
     */
    start(handler: (event: ListenEvent) => ReplyEvent | void): void;
    /**
     * Stops the broker.
     *
     * @returns {void} returns when broker is stopped.
     */
    stop(): void;
    /**
     * Sends an event to the broker.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {void} returns when the event is sent.
     */
    send(event: ListenEvent): void;
    /**
     * Sends an event to the broker and waits for a reply.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {ReplyEvent | void} returns when reply event is received (void means that message has been delivered and no reply is expected).
     */
    sendAndWaitForReply(event: ListenEvent): ReplyEvent | void;
}
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
export declare function useEventBroker<ListenEvent extends BaseEvent = any, ReplyEvent extends BaseEvent = ListenEvent>(broker: EventBroker<ListenEvent, ReplyEvent>, handler?: (event: ListenEvent) => ReplyEvent | void): EventBrokerProxy<ListenEvent, ReplyEvent>;
