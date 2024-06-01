import { AsyncEventHandler, BaseEvent, ListenerID } from './broker';
/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export declare class AsyncEventBrokerML<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {
    private _listenerMap;
    private _broker;
    constructor();
    listenerCount(): number;
    on(handler: AsyncEventHandler<ListenEvent, ReplyEvent>): ListenerID;
    off(id: ListenerID): boolean;
    emit(event: ListenEvent): Promise<boolean>;
    emitWithReply(event: ListenEvent): Promise<ReplyEvent>;
    emitWithReplys(event: ListenEvent): Promise<ReplyEvent[]>;
}
