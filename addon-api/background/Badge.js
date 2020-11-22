/**
 * @namespace
 * @export
 * @class addon.badge
 */
export default class Badge {
  constructor(addonObject) {
    this._addonId = addonObject.self.id;
    this._text = null;
    this._color = null;
    scratchAddons.localState.badges[this._addonId] = {
      text: null,
      color: null,
    };
  }

  /**
   * ``` addon.badge.* ```
   * @todo Document
   * @memberof addon.badge
   */
  get text() {
    return this._text;
  }

  /**
   * @todo Document
   * @memberof addon.badge
   */
  get color() {
    return this._color;
  }

  /**
   * @todo Document
   * @memberof addon.badge
   */
  set text(val) {
    this._text = val;
    scratchAddons.localState.badges[this._addonId].text = val;
  }
  /**
   * @todo Document
   * @memberof addon.badge
   */
  set color(val) {
    this._color = val;
    scratchAddons.localState.badges[this._addonId].color = val;
  }
}
