import { AsyncEventHandler, BaseEvent, ListenerID } from './broker';
export declare class AsyncEventBrokerTopicsML<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {
    private _topicMap;
    get topicNames(): string[];
    listenerCount(topic?: string): number;
    on(topic: string, handler: AsyncEventHandler<ListenEvent, ReplyEvent>): Promise<ListenerID>;
    off(topic: string, id: ListenerID): Promise<boolean>;
    emit(topic: string, event: ListenEvent): Promise<boolean>;
    emitWithReply(topic: string, event: ListenEvent): Promise<ReplyEvent>;
    emitWithReplies(topic: string, event: ListenEvent): Promise<ReplyEvent[]>;
}
