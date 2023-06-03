import assert from "assert";

export default {
  isUrlSafe: function(name: string) {
    if(/[^A-Za-z0-9]/.test(name)) {
      return true;
    }

    return false;
  },
  safeName: function(name: string) {
    assert(name, "Name is required");
    // Note: doesn't work for:
    // "Late Night Sessions: Run in the Jungle Ft D*minds & T&gt;i, I Am Jakes, T Lex B2B Kendrick, Ts2w"
    return encodeURIComponent(name
      .trim()
      .toLowerCase()
      // .replace(/[^A-Za-z0-9]/, '');
      .replace(/[\:\/\,\(\)\[\]\{\}\&\;\!\?]/g, '')
      .replace(/\s/g, '-')
      .replace(/^-+|-+(?=-|$)/g, ''));

  }
}
