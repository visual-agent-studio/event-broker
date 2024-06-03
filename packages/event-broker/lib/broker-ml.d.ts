import { AsyncEventHandler, BaseEvent, ListenerID } from './broker';
/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
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
    emitWithReplys(event: ListenEvent): Promise<ReplyEvent[]>;
}
