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
   *
   * @todo Document
   * @memberof Badge
   */
  get text() {
    return this._text;
  }

  /**
   *
   * @todo Document
   * @memberof Badge
   */
  get color() {
    return this._color;
  }

  /**
   *
   * @todo Document
   * @memberof Badge
   */
  set text(val) {
    this._text = val;
    scratchAddons.localState.badges[this._addonId].text = val;
  }
  /**
   *
   * @todo Document
   * @memberof Badge
   */
  set color(val) {
    this._color = val;
    scratchAddons.localState.badges[this._addonId].color = val;
  }
}
