import { AsyncEventHandler, BaseEvent, ListenerID } from './broker';
export declare class AsyncEventBrokerML<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {
    private _listenerMap;
    private _broker;
    private _listenerId?;
    listenerCount(): number;
    private _handler;
    on(handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID>;
    off(id: ListenerID): Promise<boolean>;
    emit(event: ListenEvent): Promise<boolean>;
    emitWithReply(event: ListenEvent): Promise<ReplyEvent>;
    emitWithReplies(event: ListenEvent): Promise<ReplyEvent[]>;
}
