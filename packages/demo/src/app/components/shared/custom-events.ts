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

// Nextjs Workaround 
// [Module imported in different files re-evaluated](https://github.com/vercel/next.js/issues/49309#issuecomment-1573406873)
const globalBrokers = global as typeof global & {
    local?: EventBroker<Event>;
    remote?: AsyncEventBroker<Event, ReplyEvent>
  };
  
if (!globalBrokers.local) {
    globalBrokers.local = new EventBroker<Event>()
}
if (!globalBrokers.remote) {
    globalBrokers.remote = new AsyncEventBroker<Event, ReplyEvent>()
}

export const brokerLocal = globalBrokers.local
export const brokerRemote = globalBrokers.remote
