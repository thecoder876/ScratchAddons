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
   *
   * @memberof Badge
   */
  get text() {
    return this._text;
  }

  /**
   *
   *
   * @memberof Badge
   */
  get color() {
    return this._color;
  }

  /**
   *
   *
   * @memberof Badge
   */
  set text(val) {
    this._text = val;
    scratchAddons.localState.badges[this._addonId].text = val;
  }
  /**
   *
   *
   * @memberof Badge
   */
  set color(val) {
    this._color = val;
    scratchAddons.localState.badges[this._addonId].color = val;
  }
}
