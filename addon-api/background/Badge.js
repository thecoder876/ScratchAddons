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
   * @todo Write the documentation.
   */
  get text() {
    return this._text;
  }
  /**
   * @todo Write the documentation.
   */
  get color() {
    return this._color;
  }
  /**
   * @todo Write the documentation.
   */
  set text(val) {
    this._text = val;
    scratchAddons.localState.badges[this._addonId].text = val;
  }
  /**
   * @todo Write the documentation.
   */
  set color(val) {
    this._color = val;
    scratchAddons.localState.badges[this._addonId].color = val;
  }
}
