import { AsyncEventBroker, AsyncEventHandler, BaseEvent, EventBroker, EventHandler as SyncEventHandler } from '@soulsoftware/event-broker';
export interface AsyncEventBrokerProxy<ListenEvent, ReplyEvent> {
    on(handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<void>;
    once(handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<void>;
    off(): Promise<void>;
    emit(event: ListenEvent): Promise<void>;
    emitWithReply(event: ListenEvent): Promise<ReplyEvent | void>;
}
export declare function useAsyncEventBroker<ListenEvent extends BaseEvent = any, ReplyEvent extends BaseEvent = ListenEvent>(broker: AsyncEventBroker<ListenEvent, ReplyEvent>, handler?: AsyncEventHandler<ListenEvent, ReplyEvent>): AsyncEventBrokerProxy<ListenEvent, ReplyEvent>;
export interface EventBrokerProxy<ListenEvent, ReplyEvent> {
    on(handler: SyncEventHandler<ListenEvent, ReplyEvent>): void;
    once(handler: SyncEventHandler<ListenEvent, ReplyEvent>): void;
    off(): void;
    emit(event: ListenEvent): void;
    emitWithReply(event: ListenEvent): ReplyEvent | void;
}
export declare function useEventBroker<ListenEvent extends BaseEvent = any, ReplyEvent extends BaseEvent = ListenEvent>(broker: EventBroker<ListenEvent, ReplyEvent>, handler?: SyncEventHandler<ListenEvent, ReplyEvent>): EventBrokerProxy<ListenEvent, ReplyEvent>;
