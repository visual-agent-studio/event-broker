var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var generateStartID = function () {
    return "_ID".concat(Math.floor(Math.random() * Date.now()), "@").concat(Date.now(), "_");
};
/**
 * EventBroker class that implements EventSubmitter interface.
 * @template ListenEvent The type of the event to listen for.
 * @template ReplyEvent The type of the event to reply with.
 */
var EventBroker = /** @class */ (function () {
    function EventBroker() {
    }
    /**
     * Starts listening for events.
     * @param handler The function to handle the event.
     * @returns The start ID.
     */
    EventBroker.prototype.start = function (handler) {
        if (this._listener)
            return;
        function listener() {
            var res, event_1, ret, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.debug("sync start listening...!");
                        res = undefined;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, res
                            // console.debug( 'got:', event, 'result', res )
                        ];
                    case 3:
                        event_1 = _a.sent();
                        ret = handler(event_1);
                        res = ret !== null && ret !== void 0 ? ret : undefined;
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.error("error listening data", e_1);
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        }
        this._startId = generateStartID();
        this._listener = listener();
        this._listener.next();
        return this._startId;
    };
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns An iterator result containing the reply event or undefined.
     */
    EventBroker.prototype.send = function (event) {
        if (!this._listener)
            return { value: undefined };
        return (this._listener.next(event));
    };
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns The reply event.
     */
    EventBroker.prototype.sendAndWaitForReply = function (event) {
        return this.send(event).value;
    };
    /**
     * Stops listening for events.
     * @param startId The start ID.
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    EventBroker.prototype.stop = function (startId, value) {
        if (!this._listener)
            return;
        if (startId !== this._startId) {
            throw new Error('security error: you are not owner of broker!');
        }
        var l = this._listener;
        this._listener = undefined;
        return l.return(value);
    };
    return EventBroker;
}());
export { EventBroker };
/**
 * An asynchronous event broker.
 * @template ListenEvent The type of event to listen for.
 * @template ReplyEvent The type of event to reply with.
 */
var AsyncEventBroker = /** @class */ (function () {
    function AsyncEventBroker() {
        this._instanceId = ++AsyncEventBroker._instances;
        console.debug("async new broker!", this._instanceId);
    }
    /**
     * Starts listening for events.
     * @param handler The event handler.
     * @returns A promise containing the start ID or undefined.
     */
    AsyncEventBroker.prototype.start = function (handler) {
        return __awaiter(this, void 0, void 0, function () {
            /**
             * An asynchronous generator function that listens for events.
             */
            function listener() {
                return __asyncGenerator(this, arguments, function listener_1() {
                    var res, event_2, ret, e_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.debug("async start listening...!", id, startId);
                                res = undefined;
                                _a.label = 1;
                            case 1:
                                if (!true) return [3 /*break*/, 8];
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 6, , 7]);
                                return [4 /*yield*/, __await(res
                                    // console.debug( 'got:', event, 'result', res )
                                    )];
                            case 3: return [4 /*yield*/, _a.sent()];
                            case 4:
                                event_2 = _a.sent();
                                return [4 /*yield*/, __await(handler(event_2))];
                            case 5:
                                ret = _a.sent();
                                res = ret !== null && ret !== void 0 ? ret : undefined;
                                return [3 /*break*/, 7];
                            case 6:
                                e_2 = _a.sent();
                                console.error("error listening data", e_2);
                                return [3 /*break*/, 7];
                            case 7: return [3 /*break*/, 1];
                            case 8: return [2 /*return*/];
                        }
                    });
                });
            }
            var id, startId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._listener)
                            return [2 /*return*/];
                        id = this._instanceId;
                        startId = generateStartID();
                        this._startId = startId;
                        this._listener = listener();
                        return [4 /*yield*/, this._listener.next()]; // start listening
                    case 1:
                        _a.sent(); // start listening
                        return [2 /*return*/, this._startId];
                }
            });
        });
    };
    /**
     * Sends an event and returns an iterator result.
     * @param event The event to send.
     * @returns A promise containing an iterator result containing the reply event or undefined.
     */
    AsyncEventBroker.prototype.send = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.debug('async send', this._instanceId, this._startId);
                        if (!this._listener)
                            return [2 /*return*/, { value: undefined }];
                        return [4 /*yield*/, this._listener.next(event)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    /**
     * Sends an event and waits for a reply.
     * @param event The event to send.
     * @returns A promise containing the reply event.
     */
    AsyncEventBroker.prototype.sendAndWaitForReply = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send(event)];
                    case 1: return [2 /*return*/, (_a.sent()).value];
                }
            });
        });
    };
    /**
     * Stops listening for events.
     * @param startId The start ID.
     * @param value The value to return.
     * @returns An iterator result containing the reply event or undefined.
     * @throws An error if the start ID does not match.
     */
    AsyncEventBroker.prototype.stop = function (startId, value) {
        return __awaiter(this, void 0, void 0, function () {
            var l;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._listener)
                            return [2 /*return*/];
                        if (startId !== this._startId) {
                            throw new Error('security error: you are not owner of broker!');
                        }
                        l = this._listener;
                        this._listener = undefined;
                        return [4 /*yield*/, l.return(value)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AsyncEventBroker._instances = 0;
    return AsyncEventBroker;
}());
export { AsyncEventBroker };
