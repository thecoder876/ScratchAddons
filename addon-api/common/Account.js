/**
 * @todo Should this be an event target?
 */
export default class Account extends EventTarget {
  constructor() {
    super();
  }

  /**
   *
   *
   * @return {*} 
   * @memberof Account
   */
  getMsgCount() {
    return scratchAddons.methods.getMsgCount();
  }
  /**
   *
   *
   * @param {*} args
   * @return {*} 
   * @memberof Account
   */
  getMessages(...args) {
    return scratchAddons.methods.getMessages(...args);
  }
  /**
   *
   *
   * @return {*} 
   * @memberof Account
   */
  clearMessages() {
    return scratchAddons.methods.clearMessages();
  }
}

