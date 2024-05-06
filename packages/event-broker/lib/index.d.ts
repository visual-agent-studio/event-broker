export type StartID = string;
export type BaseEvent = Record<string, any>;
export interface EventSubmitter<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent> {
    send(event: ListenEvent): IteratorResult<ReplyEvent | undefined, any>;
    sendAndWaitForReply(event: ListenEvent): ReplyEvent;
}
export declare class EventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> implements EventSubmitter<ListenEvent, ReplyEvent> {
    private _listener?;
    private _startId?;
    start(handler: (event: ListenEvent) => ReplyEvent | void): StartID | undefined;
    send(event: ListenEvent): IteratorResult<ReplyEvent | undefined, any>;
    sendAndWaitForReply(event: ListenEvent): any;
    stop(startId: StartID, value?: unknown): IteratorResult<ReplyEvent | undefined, any> | undefined;
}
export interface AsyncEventSubmitter<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent> {
    send(event: ListenEvent): Promise<IteratorResult<ReplyEvent | undefined, any>>;
    sendAndWaitForReply(event: ListenEvent): Promise<ReplyEvent>;
}
export declare class AsyncEventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> implements AsyncEventSubmitter<ListenEvent, ReplyEvent> {
    private _listener?;
    private _startId?;
    start(handler: (event: ListenEvent) => Promise<ReplyEvent | void>): Promise<string | undefined>;
    send(event: ListenEvent): Promise<IteratorResult<ReplyEvent | undefined, any>>;
    sendAndWaitForReply(event: ListenEvent): Promise<ReplyEvent>;
    stop(startId: StartID, value?: unknown): Promise<IteratorResult<ReplyEvent | undefined, any> | undefined>;
}
