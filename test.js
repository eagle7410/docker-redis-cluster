// Configs
const configSimple = require('./redis/config');
const host = 'localhost';

const configCluster = {
	servers: [
		{host, port: "6381"},
		{host, port: "6382"},
		{host, port: "6383"},
		{host, port: "6384"},
		{host, port: "6385"},
		{host, port: "6386"},
	]
};

const RedisFactory = require('./modules/Redis/RedisFactory');
const isCuster = false;
const RedisStore = new RedisFactory(isCuster ? configCluster : configSimple , isCuster);

let command;
const commandsAllowed = ['set', 'get'];

let inxCommand = process.argv.indexOf('-c');

if (!~inxCommand) {
	console.error(`Not set command -c`);
	return process.exit();
}

command = process.argv[inxCommand + 1].trim();

if (!commandsAllowed.includes(command)) {
	console.error(`Command must be one of ${JSON.stringify(commandsAllowed)}`);
	return process.exit();
}

void async function doit() {
	try {
		const keyIs = 'TEST_KEY';
		const keyValue = 'IGOR_1';

		switch (command) {
			case commandsAllowed[0]:

				await RedisStore.keySet(keyIs, keyValue);
				console.log(`SET KEY ${keyIs} = ${keyValue}`);

				break;

			case commandsAllowed[1]:

				console.log(`GET KEY ${keyIs} = ${await RedisStore.keyGet(keyIs)} | BE SET VALUE ${keyValue}`);

				break;
		}

	} catch (e) {
		console.error('Error doit ', e);
	} finally {
		process.exit();
	}

}();
