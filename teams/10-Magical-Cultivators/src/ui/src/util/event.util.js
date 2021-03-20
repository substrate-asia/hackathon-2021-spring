export default {
	listeners: {},
	addListener(obj, type, listener) {
		let listeners = this.listeners[type] = this.listeners[type] || [];
		listeners.push(listener);
		listener.obj = obj;
	},
	removeListener(obj, type) {
		let listeners = this.listeners[type];
		if (listeners) {
			for (let i = 0, listener; listener = listeners[i]; i++) {
				if (listener.obj === obj) {
					listeners.splice(i, 1);
					break;
				}
			}
			if (listeners.length === 0) {
				this.listeners[type] = null;
				delete this.listeners[type];
			}
		}
	},
	emit(type, data) {
		let listeners = this.listeners[type];
		if (listeners) {
			listeners.forEach(function(listener) {
				listener.call(listener.obj, data);
			});
		}
	},
	removeListeners(obj) {
		for (let type in this.listeners) {
			this.removeListener(obj, type);
		}
	}
};
