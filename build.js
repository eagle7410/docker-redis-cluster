const json2yml = require('json2yaml');
const fsp  = require('fsp-eagle');


void async function build() {
	try {
		console.log(`- INFO| RUN`);

		const portBase   = '6379';
		const ipBase     = '100.0.16';
		const image      = 'redis:5-alpine3.8';
		const redis_net  = 'redis_net';

		let configJson = {
			version  : '3.5',
			services : {},
			networks: {
				[redis_net]: {
					driver: "bridge",
					ipam: {
						config: [{subnet: `${ipBase}.0/16`}]
					}
				}
			}
		};

		let ips = [];
		const baseCommand = `redis-server  --port ${portBase} --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes --cluster-require-full-coverage no`;

		for (let i = 0, len = 6, inx, ipv4_address, port, container_name; i<len; ++i) {
			inx             = i + 1;
			port            = '638' + inx;
			ipv4_address    = `${ipBase}.${inx}`;
			container_name  = i < 3
				? `redis-master-${inx}`
				: `redis-slave-${inx - 3}`;

			ips.push(ipv4_address);

			configJson.services[container_name] ={
				image,
				container_name,
				command:  baseCommand,
				ports :[`${port}:${portBase}`],
				networks: { [redis_net]: {ipv4_address}}
			};

			console.log(`--- INFO| ADD NODE ${container_name} IP ${ipv4_address} port ${port} `);
		}

		await fsp.writeFile(`${__dirname}/docker-compose.yaml`, json2yml.stringify(configJson), 'utf8');

		console.log(`- INFO| USE COMMAND FOR END`);
		console.log(`- INFO| docker run -i --rm --net dockerrediscluster_${redis_net} ${image} redis-cli --cluster create ${ips.map(ip => `${ip}:${portBase}`).join(' ')}  --cluster-replicas 1;`);
		console.log(`- INFO| DONE OK`);

	} catch (e) {
		console.error(`!!!ERR| ${typeof e === 'string' ? e  : e.stack}`);
	} finally {
		console.log('FINISH');
	}
}();
