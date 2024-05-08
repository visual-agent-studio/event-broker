export type StartID = string;
/**
 * BaseEvent is a type alias for a Record with string keys and any values.
 */
export type BaseEvent = Record<string, any>;
/**
 * Interface for an event submitter.
 * @template ListenEvent The type of the event to listen for.
 * @template ReplyEvent The type of the event to reply with.
 */
export interface EventSubmitter<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent> {
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns An iterator result containing the reply event or undefined.
     */
    send(event: ListenEvent): IteratorResult<ReplyEvent | undefined, any>;
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns The reply event.
     */
    sendAndWaitForReply(event: ListenEvent): ReplyEvent;
}
/**
 * EventBroker class that implements EventSubmitter interface.
 * @template ListenEvent The type of the event to listen for.
 * @template ReplyEvent The type of the event to reply with.
 */
export declare class EventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> implements EventSubmitter<ListenEvent, ReplyEvent> {
    private _listener?;
    private _startId?;
    /**
     * Starts listening for events.
     * @param handler The function to handle the event.
     * @returns The start ID.
     */
    start(handler: (event: ListenEvent) => ReplyEvent | void): StartID | undefined;
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns An iterator result containing the reply event or undefined.
     */
    send(event: ListenEvent): IteratorResult<ReplyEvent | undefined, any>;
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns The reply event.
     */
    sendAndWaitForReply(event: ListenEvent): any;
    /**
     * Stops listening for events.
     * @param startId The start ID.
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    stop(startId: StartID, value?: unknown): IteratorResult<ReplyEvent | undefined, any> | undefined;
}
/**
 * Interface for an async event submitter.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export interface AsyncEventSubmitter<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent> {
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns A promise containing an iterator result containing the reply event or undefined.
     */
    send(event: ListenEvent): Promise<IteratorResult<ReplyEvent | undefined, any>>;
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    sendAndWaitForReply(event: ListenEvent): Promise<ReplyEvent>;
}
/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export declare class AsyncEventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> implements AsyncEventSubmitter<ListenEvent, ReplyEvent> {
    private _listener?;
    private _startId?;
    /**
     * Starts listening for events.
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    start(handler: (event: ListenEvent) => Promise<ReplyEvent | void>): Promise<StartID | undefined>;
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns A promise containing an iterator result containing the reply event or undefined.
     */
    send(event: ListenEvent): Promise<IteratorResult<ReplyEvent | undefined, any>>;
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    sendAndWaitForReply(event: ListenEvent): Promise<ReplyEvent>;
    /**
     * Stops listening for events.
     * @param startId The start ID.
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    stop(startId: StartID, value?: unknown): Promise<IteratorResult<ReplyEvent | undefined, any> | undefined>;
}
