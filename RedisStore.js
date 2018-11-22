

req
// TODO: clear
console.log(`redis conf p is ${port} type is ${typeof port} ` + ' h is ' + host);
const RedisClustr      = require('redis-clustr');
const Client           = new RedisClustr({

	slotInterval: 1000, // default: none. Interval to repeatedly re-fetch cluster slot configuration
	maxQueueLength: 100, // default: no limit. Maximum length of the getSlots queue (basically number of commands that can be queued whilst connecting to the cluster)
	queueShift: false, // default: true. Whether to shift the getSlots callback queue when it's at max length (error oldest callback), or to error on the new callback
	wait: 5000, // default: no timeout. Max time to wait to connect to cluster before sending an error to all getSlots callbacks
});
// const Client           = require('redis').createClient({port, host});
const ClientSet        = promisify(Client.set).bind(Client);
const ClientGet        = promisify(Client.get).bind(Client);
const ClientExists     = promisify(Client.exists).bind(Client);
const ClientDel        = promisify(Client.del).bind(Client);

const DEFAULT_PREFIX = '';

let timeStoreSecond = 3000;

let prefix = DEFAULT_PREFIX;

class RedisStore {
	static getTimeStoreSecond () {
		return timeStoreSecond;
	}
	/**
	 * Set new prefix for store.
	 *
	 * @param {string} newPrefix
	 */
	static setPrefix(newPrefix) {
		prefix = newPrefix || DEFAULT_PREFIX;
	}

	/**
	 * Set time retention time.
	 *
	 * @param {number} newTimeStoreSecond
	 */
	static setTimeStoreSecond (newTimeStoreSecond) {
		timeStoreSecond = newTimeStoreSecond;
	}

	/**
	 * Set key to store.
	 *
	 * @param {string} key
	 * @param {*} value
	 *
	 * @returns {Promise<any>}
	 */
	static set(key, value) {
		return ClientSet(`${prefix + key}`, value, 'EX', this.getTimeStoreSecond());
	}

	static get (key) {
		// return ClientGet(`${prefix}_${key}`);
		return new Promise(function(ok,bad) {


			Client.get(`${prefix + key}`, function(err, dt) {
				if (err) return bad(err);
				ok(dt);
			})
		});

	}

	/**
	 * Check exists key in store.
	 *
	 * @param {string} key
	 *
	 * @returns {Promise<boolean>}
	 */
	static async exists(key) {
		return !! await ClientExists(`${prefix}_${key}`);
	}

	/**
	 * Check exists key in store.
	 *
	 * @param {string} key
	 *
	 * @returns {Promise<any>}
	 */
	static delete(key) {
		return ClientDel(`${prefix}_${key}`);
	}

	/**
	 * Check exist token in store.
	 * if not be  throw unauthorized.
	 *
	 * @param {string} token
	 *
	 * @return {Promise<boolean>}
	 */
	static async httpAuthorized(token) {
		if (!await this.exists(token))
			throw ErrorHttp.unauthorized();

		return false;
	}
}

module.exports = RedisStore;
