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
    return name
      .trim()
      .toLowerCase()
      .replace(/\W+/g, '-');
      // .replace(/[^A-Za-z0-9]/, '');
  }
}
