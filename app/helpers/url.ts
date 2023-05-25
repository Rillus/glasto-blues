import assert from "assert";

export default {
  safeName: function(name: string) {
    assert(name, "Name is required");
    return name
      .trim()
      .toLowerCase()
      .replace(/\W+/g, '-');
  }
}
