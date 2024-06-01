import { BaseEvent, ListenerID } from './broker';
type AsyncEventHandler<ListenEvent, ReplyEvent> = (event: ListenEvent) => Promise<ReplyEvent | void>;
/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
export declare class AsyncEventBrokerTopicsML<ListenEvent extends BaseEvent, ReplyEvent extends BaseEvent = ListenEvent> {
    private _topicMap;
    get topicNames(): string[];
    listenerCount(topic?: string): number;
    on(topic: string, handler: AsyncEventHandler<ListenEvent, ReplyEvent>): ListenerID;
    off(topic: string, id: ListenerID): boolean;
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns A promise containing an iterator result containing the reply event or undefined.
     */
    emit(topic: string, event: ListenEvent): Promise<boolean>;
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    emitWithReply(topic: string, event: ListenEvent): Promise<ReplyEvent>;
    emitWithReplys(topic: string, event: ListenEvent): Promise<ReplyEvent[]>;
}
export {};
