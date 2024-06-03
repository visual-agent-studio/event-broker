/**
 * event broker based on asynchronous javascript generator
 *
 * @module event-broker
 */
export declare const stopSymbol: unique symbol;
export type ListenerID = string;
export declare const generateListenerID: () => ListenerID;
/**
 * BaseEvent is a type alias for a Record with string keys and any values.
 */
export type BaseEvent = Record<string, any>;
export type AsyncEventHandler<ListenEvent, ReplyEvent> = (event: ListenEvent) => Promise<ReplyEvent | void>;
export interface AsyncBrokerListenerOn<ListenEvent, ReplyEvent> {
    type: 'on';
    handler: AsyncEventHandler<ListenEvent, ReplyEvent>;
}
export interface AsyncBrokerListenerOnce<ListenEvent, ReplyEvent> {
    type: 'once';
    handler: AsyncEventHandler<ListenEvent, ReplyEvent>;
}
export type AsyncBrokerListener<ListenEvent, ReplyEvent> = AsyncBrokerListenerOn<ListenEvent, ReplyEvent> | AsyncBrokerListenerOnce<ListenEvent, ReplyEvent>;
/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export declare class AsyncEventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {
    private _listener?;
    private _listenerId?;
    /**
     * alias for {@link on} method
     * @deprecated use {@link on}
     */
    start(handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID | undefined>;
    /**
     * alias for {@link off} method
     * @deprecated use  {@link off}
     */
    stop(listenerId: ListenerID): Promise<boolean>;
    /**
     * alias for {@link isOn} property
     * @deprecated use {@link isOn}
     */
    get isStarted(): boolean;
    /**
     * alias for {@link emit} method
     * @deprecated use {@link emit}
     */
    send(event: ListenEvent): Promise<boolean>;
    /**
     * alias for {@link emitWithReply} method
     * @deprecated use {@link emitWithReply}
     */
    sendAndWaitForReply(event: ListenEvent): Promise<ReplyEvent>;
    /**
    * An asynchronous generator function that listens for events.
    */
    private listen;
    /**
     * Starts listening for events.
     *
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    on(handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID | undefined>;
    /**
     * Starts listening for sigle event and then off.
     *
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    once(handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID | undefined>;
    /**
     * Stops listening for events.
     *
     * @param listenerId The listener ID.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    off(listenerId: ListenerID): Promise<boolean>;
    /**
     * Checks if the event broker is currently listening.
     *
     * @returns {boolean} True if the event broker is started, otherwise false.
     */
    get isOn(): boolean;
    /**
     * Sends an event to the listener.
     *
     * @param {ListenEvent} event - The event to send.
     * @returns {Promise<boolean>} A promise that resolves to true if the event was sent successfully, otherwise false.
     */
    emit(event: ListenEvent): Promise<boolean>;
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    emitWithReply(event: ListenEvent): Promise<ReplyEvent>;
}
export type EventHandler<ListenEvent, ReplyEvent> = (event: ListenEvent) => ReplyEvent | void;
export interface BrokerListenerOn<ListenEvent, ReplyEvent> {
    type: 'on';
    handler: EventHandler<ListenEvent, ReplyEvent>;
}
export interface BrokerListenerOnce<ListenEvent, ReplyEvent> {
    type: 'once';
    handler: EventHandler<ListenEvent, ReplyEvent>;
}
export type BrokerListener<ListenEvent, ReplyEvent> = BrokerListenerOn<ListenEvent, ReplyEvent> | BrokerListenerOnce<ListenEvent, ReplyEvent>;
/**
 * EventBroker class that implements EventSubmitter interface.
 * @template ListenEvent The type of the event to listen for.
 * @template ReplyEvent The type of the event to reply with.
 */
export declare class EventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {
    private _listener?;
    private _listenerId?;
    /**
     * alias for {@link on} method
     * @deprecated use {@link on}
     */
    start(handler: EventHandler<ListenEvent, ReplyEvent>): ListenerID | undefined;
    /**
     * alias for {@link off} method
     * @deprecated use {@link off}
     */
    stop(listenerId: ListenerID): boolean;
    /**
     * alias for {@link isOn} property
     * @deprecated use {@link isOn}
     */
    get isStarted(): boolean;
    /**
     * alias for {@link emit} method
     * @deprecated use {@link emit}
     */
    send(event: ListenEvent): boolean;
    /**
     *
     * alias for {@link emitWithReply} method
     * @deprecated use {@link emitWithReply}
     */
    sendAndWaitForReply(event: ListenEvent): ReplyEvent;
    /**
    * An generator function that listens for events.
    */
    private listen;
    /**
     * Starts listening for events.
     *
     * @param handler The function to handle the event.
     * @returns The start ID.
     */
    on(handler: EventHandler<ListenEvent, ReplyEvent>): ListenerID | undefined;
    /**
     * Starts listening for sigle event and then off.
     *
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    once(handler: EventHandler<ListenEvent, ReplyEvent>): ListenerID | undefined;
    /**
     * Stops listening for events.
     *
     * @param listenerId The listener ID.
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    off(listenerId: ListenerID): boolean;
    /**
     * Checks if the event broker is currently started.
     * @returns {boolean} True if the event broker is started, otherwise false.
     */
    get isOn(): boolean;
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns An iterator result containing the reply event or undefined.
     */
    emit(event: ListenEvent): boolean;
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns The reply event.
     */
    emitWithReply(event: ListenEvent): ReplyEvent;
}
