export default class Auth extends EventTarget {
  constructor(addonObject) {
    super();
    scratchAddons.eventTargets.auth.push(this);
  }
  /**
   * @return {boolean} Whether the user is logged in or not
   */
  get isLoggedIn() {
    return scratchAddons.globalState.auth.isLoggedIn;
  }
  /**
   * @return {string} The username of the currently logged in user
   */
  get username() {
    return scratchAddons.globalState.auth.username;
  }
  /**
   * @return {string} The user ID of the currently logged in user.
   */
  get userId() {
    return scratchAddons.globalState.auth.userId;
  }
  /**
   * @return {string} The value of the X-Token header used in the Scratch REST API.
   */
  get xToken() {
    return scratchAddons.globalState.auth.xToken;
  }
  /**
   * @return {string} The value of the scratchcsrftoken cookie.
   */
  get csrfToken() {
    return scratchAddons.globalState.auth.csrfToken;
  }
  /**
   * @return {string} The language code for the language choice the user has made in Scratch, for example. "en".
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
