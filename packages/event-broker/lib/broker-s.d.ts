/**
 * event broker based on synchronous javascript generator
 *
 * @module event-broker
 */
import { BaseEvent, ListenerID } from "./broker";
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
