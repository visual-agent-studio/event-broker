export declare const stopSymbol: unique symbol;
export type ListenerID = string;
export declare const generateListenerID: () => ListenerID;
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
export declare class AsyncEventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {
    private _listener?;
    private _listenerId?;
    start(handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID | undefined>;
    stop(listenerId: ListenerID): Promise<boolean>;
    get isStarted(): boolean;
    send(event: ListenEvent): Promise<boolean>;
    sendAndWaitForReply(event: ListenEvent): Promise<ReplyEvent>;
    private listen;
    on(handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID | undefined>;
    once(handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID | undefined>;
    off(listenerId: ListenerID): Promise<boolean>;
    get isOn(): boolean;
    emit(event: ListenEvent): Promise<boolean>;
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
export declare class EventBroker<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {
    private _listener?;
    private _listenerId?;
    start(handler: EventHandler<ListenEvent, ReplyEvent>): ListenerID | undefined;
    stop(listenerId: ListenerID): boolean;
    get isStarted(): boolean;
    send(event: ListenEvent): boolean;
    sendAndWaitForReply(event: ListenEvent): ReplyEvent;
    private listen;
    on(handler: EventHandler<ListenEvent, ReplyEvent>): ListenerID | undefined;
    once(handler: EventHandler<ListenEvent, ReplyEvent>): ListenerID | undefined;
    off(listenerId: ListenerID): boolean;
    get isOn(): boolean;
    emit(event: ListenEvent): boolean;
    emitWithReply(event: ListenEvent): ReplyEvent;
}
