/**
 * Fetch
 * addon.fetch API
 * @export
 * @param {*} url
 * @param {*} [opts={}]
 * @return {*} 
 */
export default function fetch(url, opts = {}) {
  if (!opts.headers) opts.headers = {};
  opts.headers["X-ScratchAddons-Uses-Fetch"] = "true";
  return window.fetch(url, opts);
}
