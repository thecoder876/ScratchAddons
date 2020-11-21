/**
 * addon.tab.traps.* APIs
 *
 * @export
 * @class Trap
 * @extends {EventTarget}
 */
export default class Trap extends EventTarget {
  constructor() {
    super();
  }
  /**
   * mapping for the Once objects trapped.
   * @type {object.<string, *>}
   * @readonly
   * @memberof Trap
   */
  get onceValues() {
    return __scratchAddonsTraps._onceMap;
  }

  /**
   * Symbol for accessing props of trapped objects.
   * @type {symbol}
   * @readonly
   * @memberof Trap
   */
  get numOnce() {
    return __scratchAddonsTraps._trapNumOnce;
  }
  /**
   * Symbol for accessing props of trapped objects.
   * @type {symbol}
   * @readonly
   * @memberof Trap
   */
  get numMany() {
    return __scratchAddonsTraps._trapNumMany;
  }

  /**
   * Adds listener for Once objects trapped.
   * @param {string} trapName Trap name to listen to. Can be '*' for any.
   * @param {function} fn callback passed to addEventListener.
   * @memberof Trap
   */
  addOnceListener(trapName, fn) {
    const eventName = trapName === "*" ? "trapready" : `ready.${trapName}`;
    if (!__scratchAddonsTraps._targetOnce) throw new Error("Event target not initialized");
    __scratchAddonsTraps._targetOnce.addEventListener(eventName, fn);
  }

  /**
   * Removes listener for Once objects trapped.
   * @param {string} trapName Trap name to listen to. Can be '*' for any.
   * @param {function} fn callback passed to removeEventListener.
   * @memberof Trap
   */
  removeOnceListener(trapName, fn) {
    const eventName = trapName === "*" ? "trapready" : `ready.${trapName}`;
    if (!__scratchAddonsTraps._targetOnce) throw new Error("Event target not initialized");
    __scratchAddonsTraps._targetOnce.removeEventListener(eventName, fn);
  }

  /**
   * Adds listener for Many objects trapped.
   * @param {string} trapName Trap name to listen to. Can be '*' for any.
   * @param {function} fn callback passed to addEventListener.
   * @memberof Trap
   */
  addManyListener(trapName, fn) {
    const eventName = trapName === "*" ? "trapready" : `ready.${trapName}`;
    if (!__scratchAddonsTraps._targetMany) throw new Error("Event target not initialized");
    __scratchAddonsTraps._targetMany.addEventListener(eventName, fn);
  }

  /**
   * Removes listener for Many objects trapped.
   * @param {string} trapName Trap name to listen to. Can be '*' for any.
   * @param {function} fn callback passed to removeEventListener.
   * @memberof Trap
   */
  removeManyListener(trapName, fn) {
    const eventName = trapName === "*" ? "trapready" : `ready.${trapName}`;
    if (!__scratchAddonsTraps._targetMany) throw new Error("Event target not initialized");
    __scratchAddonsTraps._targetMany.removeEventListener(eventName, fn);
  }

  /**
   * Adds listener for prototype functions trapped.
   * @param {string} trapName Trap name to listen to. Can be '*' for any.
   * @param {function} fn callback passed to addEventListener.
   * @memberof Trap
   */
  addPrototypeListener(trapName, fn) {
    const eventName = trapName === "*" ? "prototypecalled" : `prototype.${trapName}`;
    __scratchAddonsTraps.addEventListener(eventName, fn);
  }

  /**
   * Removes listener for prototype functions trapped.
   * @param {string} trapName Trap name to listen to. Can be '*' for any.
   * @param {function} fn callback passed to removeEventListener.
   * @memberof Trap
   */
  removePrototypeListener(trapName, fn) {
    const eventName = trapName === "*" ? "prototypecalled" : `prototype.${trapName}`;
    __scratchAddonsTraps.removeEventListener(eventName, fn);
  }
}
