export default class Account extends EventTarget {
  /**
   * @todo Write the documentation.
   */
  constructor() {
    super();
  }
  /**
   * @todo Write the documentation.
   */
  getMsgCount() {
    return scratchAddons.methods.getMsgCount();
  }
  /**
   * @todo Write the documentation.
   */
  getMessages(...args) {
    return scratchAddons.methods.getMessages(...args);
  }
  /**
   * @todo Write the documentation.
   */
  clearMessages() {
    return scratchAddons.methods.clearMessages();
  }
}

// TODO: should this be an event target?
