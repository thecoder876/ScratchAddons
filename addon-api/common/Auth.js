export default class Auth extends EventTarget {
  constructor(addonObject) {
    super();
    scratchAddons.eventTargets.auth.push(this);
  }
  /**
   * @todo Write the documentation.
   */
  get isLoggedIn() {
    return scratchAddons.globalState.auth.isLoggedIn;
  }
  /**
   * @todo Write the documentation.
   */
  get username() {
    return scratchAddons.globalState.auth.username;
  }  
  /**
   * @todo Write the documentation.
   */
  get userId() {
    return scratchAddons.globalState.auth.userId;
  }  
  /**
   * @todo Write the documentation.
   */
  get xToken() {
    return scratchAddons.globalState.auth.xToken;
  }  
  /**
   * @todo Write the documentation.
   */
  get csrfToken() {
    return scratchAddons.globalState.auth.csrfToken;
  }  
  /**
   * @todo Write the documentation.
   */
  get scratchLang() {
    return scratchAddons.globalState.auth.scratchLang;
  }
  /**
   * @todo Write the documentation.
   */
  _removeEventListeners() {
    scratchAddons.eventTargets.auth.splice(
      scratchAddons.eventTargets.auth.findIndex((x) => x === this),
      1
    );
  }
}
