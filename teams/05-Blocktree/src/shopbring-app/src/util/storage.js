class Storage {
  constructor(storage) {
    this.storage = storage;
  }

  Set(key, value) {
    this.storage.setItem(key, JSON.stringify(value || {}));
  }

  Get(key) {
    const json = this.storage.getItem(key);
    try {
      return JSON.parse(json);
    } catch (err) {
      return;
    }
  }

  Remove(key) {
    this.storage.removeItem(key);
  }
}

const storage = {
  AuthStorage: new Storage(window.sessionStorage),
};

export default Storage;
