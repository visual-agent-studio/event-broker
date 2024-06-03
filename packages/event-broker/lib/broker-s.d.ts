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
