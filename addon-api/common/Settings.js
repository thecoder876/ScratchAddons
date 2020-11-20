/**
 * # addon.settings.* APIs
 * ### Available in Userscripts and Persistant Scripts
 * @export
 * @class Settings
 * @extends {EventTarget}
 */
export default class Settings extends EventTarget {
  constructor(addonObject) {
    super();
    this._addonId = addonObject.self.id;
    scratchAddons.eventTargets.settings.push(this);
  }
  /**
   * Returns the user-specified value for that option, or the default specified in the addon manifest if the user didn't specify a value by themselves.
   * @throws if the specified option ID wasn't declared inside addon.json.
   * @returns the user-specified value for that option, or the default specified in the addon manifest if the user didn't specify a value by themselves.
   * @todo Document
   * @memberof Settings
   */
  get(optionName) {
    const settingsObj = scratchAddons.globalState.addonSettings[this._addonId] || {};
    const value = settingsObj[optionName];
    if (value === undefined) throw "ScratchAddons exception: invalid setting ID";
    else return value;
  }

  _removeEventListeners() {
    scratchAddons.eventTargets.settings.splice(
      scratchAddons.eventTargets.settings.findIndex((x) => x === this),
      1
    );
  }
}
