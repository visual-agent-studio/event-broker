import { send } from 'process'
import { AsyncEventBroker, EventBroker } from '@soulsoftware/event-broker'

export const SHARED_TOPIC = '__shared_topic__'
export const SHARED_REPLY_TOPIC = '__shared_reply_topic__'

export const WS_PATH = '/api/my_awesome_socket'

type BaseEvent = { data: string }

export interface Event extends BaseEvent { 
    reply?: boolean
}

export type ReplyEvent = BaseEvent


export interface ServerToClientEvents {
    noArg: () => void;
    [SHARED_TOPIC]: (arg:Event) => void;
    [SHARED_REPLY_TOPIC]: (arg: Event, callback: (e: ReplyEvent) => void) => void;
    // Add other custom events as needed
}

export interface ClientToServerEvents {
    [SHARED_TOPIC]: (arg:Event) => void;
}

export const brokerLocal = new EventBroker<Event>()
export const brokerRemote = new AsyncEventBroker<Event, ReplyEvent>()
