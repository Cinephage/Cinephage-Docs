import { stringify } from 'yaml';
import { buildDotEnv } from './envTemplate';
import { buildNginxConf } from './proxyConfigs';
import { buildTraefikDynamicYaml } from './traefikConfigs';
import type { DirectHostPortMap, GeneratedStackOutput, GluetunTarget, ResolvedStack, StackConfiguratorState } from './types';
import { gluetunTargetToServiceName, normalizeApexDomain, resolveStack } from './types';
import { hasDirectPortConflicts } from './validateStackState';

const GLUETUN_IMAGE = 'qmcgaw/gluetun:latest';

/** caddy-docker-proxy - label-driven routes; mount Docker socket (see warnings). */
const CADDY_DOCKER_PROXY_IMAGE = 'lucaslorentz/caddy-docker-proxy:2.8-alpine';

/** LinuxServer qBittorrent: sync forwarded port from Gluetun (when qBittorrent uses network_mode: service:gluetun). */
export const QB_GLUETUN_PORT_MOD = 'ghcr.io/t-anc/gsp-qbittorent-gluetun-sync-port-mod:main';

export const LINUXSERVER_DEFAULT_PUID = '1000';
export const LINUXSERVER_DEFAULT_PGID = '1000';

/** LinuxServer GSP mod + qBittorrent behind Gluetun: same conditions as generated DOCKER_MODS / GSP_GTN_API_KEY. */
export function gspPortSyncActive(s: ResolvedStack): boolean {
	return (
		s.useGspPortSync &&
		s.gluetunEnabled &&
		s.gluetunTarget === 'qbittorrent' &&
		s.services.qbittorrent &&
		s.vpnPreset !== 'none'
	);
}

export function collectWarnings(s: ResolvedStack): string[] {
	const w: string[] = [];
	const { services: sv } = s;

	const mediaCount = [sv.jellyfin, sv.plex, sv.emby].filter(Boolean).length;
	if (mediaCount > 1) {
		w.push(
			'Multiple media servers are enabled (Jellyfin/Plex/Emby). That can duplicate libraries and increase RAM/CPU.'
		);
	}

	const apexNorm = normalizeApexDomain(s.apexDomain);
	if (s.proxyMode !== 'direct' && apexNorm.split('.').length > 2) {
		w.push(
			`Apex "${s.apexDomain.trim()}" normalized to "${apexNorm}". If that still has an extra subdomain (e.g. media.example.com), hosts become cinephage.${apexNorm}. Prefer a registrable apex like example.com when possible.`
		);
	}

	if (s.proxyMode === 'direct' && hasDirectPortConflicts(s)) {
		w.push(
			'Two or more enabled services use the same host port in the generated defaults - edit the compose file to change host port mappings.'
		);
	}

	if (s.gluetunEnabled) {
		if (!s.gluetunTarget && !sv.aria2 && !sv.bitmagnet) {
			w.push('Gluetun is enabled but nothing is selected to route (torrent client, aria2, or Bitmagnet).');
		} else if (s.gluetunTarget && !sv[gluetunTargetToServiceName(s.gluetunTarget)]) {
			w.push(
				`Gluetun targets "${s.gluetunTarget}" but that service is not enabled - fix choices or disable VPN.`
			);
		}
	}

	if (s.proxyMode === 'caddy') {
		w.push(
			'Caddy Docker Proxy mounts the Docker socket to discover labeled services - use only on trusted hosts.'
		);
	}

	if (sv.nzbdav && s.nzbdavHostPort === 3000) {
		w.push(
			'NZBDav is mapped to host port 3000, which usually conflicts with Cinephage. Use another host port (e.g. 3003).'
		);
	}

	if (sv.altmount) {
		w.push(
			'Altmount may require /dev/fuse, SYS_ADMIN, or Docker socket access - review https://altmount.kipsilabs.top before production use.'
		);
	}

	if (sv.bitmagnet) {
		w.push('Bitmagnet adds PostgreSQL and Redis. Set strong passwords and persist volumes before exposing to a network.');
	}

	if (gspPortSyncActive(s)) {
		w.push(
			'GSP port sync: `GSP_GTN_API_KEY` is pre-filled in the generated `.env` (rotate on the VPN step if needed). Enable qBittorrent Web UI “Bypass authentication for clients on localhost” - see https://github.com/t-anc/GSP-Qbittorent-Gluetun-sync-port-mod'
		);
	}

	if (sv.jellyfin && s.jellyfinHwAccel === 'vaapi') {
		w.push(
			'Jellyfin VAAPI: /dev/dri and group_add vary by host (Intel/AMD). Verify render/video GIDs on your system.'
		);
	}
	if (sv.jellyfin && s.jellyfinHwAccel === 'nvenc') {
		w.push(
			'Jellyfin NVENC: requires NVIDIA Container Toolkit and a compatible driver. `runtime: nvidia` may not work on all Docker setups - see LinuxServer docs.'
		);
	}

	if (s.vpnPreset === 'mullvad') {
		w.push('Mullvad + Gluetun: use a WireGuard key from your Mullvad account; see https://github.com/qdm12/gluetun-wiki');
	}

	if (s.gluetunEnabled) {
		w.push(
			'VPN secrets are not inlined in this compose file - set variables in the generated `.env` and run `docker compose` from this directory.'
		);
	}

	return w;
}

/** Docker Compose interpolation from a `.env` file next to this compose (same variable name). */
function envRef(varName: string): string {
	return `\${${varName}}`;
}

/** Optional variable; empty default if unset in `.env`. */
function envRefOpt(varName: string): string {
	return `\${${varName}:-}`;
}

function envList(pairs: Record<string, string>): string[] {
	return Object.entries(pairs).map(([k, v]) => `${k}=${v}`);
}

function lsEnv(s: ResolvedStack): Record<string, string> {
	return {
		PUID: LINUXSERVER_DEFAULT_PUID,
		PGID: LINUXSERVER_DEFAULT_PGID,
		TZ: s.tz
	};
}

function publish(
	s: ResolvedStack,
	hostPort: number | string,
	containerPort: number,
	proto: 'tcp' | 'udp' = 'tcp'
): string {
	const p = typeof hostPort === 'number' ? String(hostPort) : hostPort;
	const suffix = proto === 'udp' ? '/udp' : '';
	return `${p}:${containerPort}${suffix}`;
}

/** Compose `expose` (YAML), not the generator’s direct-mode boolean. */
function mergeComposeExpose(svc: Record<string, unknown>, containerPorts: number[]): void {
	const existing = (svc.expose as string[] | undefined) ?? [];
	const merged = new Set([...existing, ...containerPorts.map((p) => String(p))]);
	svc.expose = [...merged].sort((a, b) => Number(a) - Number(b));
}

function mergeCaddyLabels(s: ResolvedStack, svc: Record<string, unknown>, hostKey: string, reverseProxy: string): void {
	if (s.proxyMode !== 'caddy') return;
	const apex = normalizeApexDomain(s.apexDomain);
	svc.labels = {
		caddy: `${hostKey}.${apex}`,
		'caddy.reverse_proxy': reverseProxy
	};
}

function containerPortsFromPublishLines(lines: string[]): number[] {
	const out = new Set<number>();
	for (const line of lines) {
		const main = line.split('/')[0] ?? line;
		const seg = main.split(':');
		if (seg.length >= 2) {
			const right = seg[seg.length - 1];
			const n = parseInt(right, 10);
			if (!Number.isNaN(n)) out.add(n);
		}
	}
	return [...out].sort((a, b) => a - b);
}

function buildGluetunPorts(
	s: ResolvedStack,
	d: DirectHostPortMap
): { ports: string[]; composeExpose: string[] } {
	const direct = s.proxyMode === 'direct';
	const ports: string[] = [];

	if (s.gluetunTarget) {
		const t = s.gluetunTarget;
		const map = gluetunPublishedPorts[t];
		let tcp = [...map.tcp];
		if (!direct && t === 'qbittorrent') {
			tcp = tcp.filter((line) => !line.startsWith('8080:8080'));
		}
		ports.push(...tcp);
		if (map.udp) ports.push(...map.udp);
	}

	if (s.services.aria2) {
		ports.push(publish(s, d.aria2Rpc, 6800));
		ports.push(publish(s, d.aria2Dht, 6888));
	}

	if (s.services.bitmagnet) {
		if (direct) {
			ports.push(publish(s, d.bitmagnet, 3333));
		}
	}

	let exposeNums = containerPortsFromPublishLines(ports);
	if (!direct && s.gluetunTarget === 'qbittorrent' && !exposeNums.includes(8080)) {
		exposeNums = [...exposeNums, 8080].sort((a, b) => a - b);
	}
	if (!direct && s.services.bitmagnet && !exposeNums.includes(3333)) {
		exposeNums = [...exposeNums, 3333].sort((a, b) => a - b);
	}

	return { ports, composeExpose: exposeNums.map(String) };
}

const gluetunPublishedPorts: Record<
	GluetunTarget,
	{ tcp: string[]; udp?: string[] }
> = {
	qbittorrent: {
		tcp: ['8080:8080', '6881:6881'],
		udp: ['6881:6881']
	},
	transmission: {
		tcp: ['9091:9091', '51413:51413'],
		udp: ['51413:51413']
	},
	deluge: {
		tcp: ['8112:8112', '6881:6881'],
		udp: ['6881:6881']
	},
	rtorrent: {
		tcp: ['80:80', '5000:5000', '51413:51413'],
		udp: ['51413:51413']
	}
};

function buildGluetunService(s: ResolvedStack, d: DirectHostPortMap): Record<string, unknown> {
	const { ports, composeExpose } = buildGluetunPorts(s, d);

	let environment: string[];
	if (s.vpnPreset === 'protonvpn') {
		environment = envList({
			VPN_SERVICE_PROVIDER: 'protonvpn',
			VPN_TYPE: 'wireguard',
			WIREGUARD_PRIVATE_KEY: envRef('WIREGUARD_PRIVATE_KEY'),
			SERVER_COUNTRIES: envRefOpt('SERVER_COUNTRIES'),
			SERVER_REGIONS: envRefOpt('SERVER_REGIONS'),
			SERVER_CITIES: envRefOpt('SERVER_CITIES'),
			UPDATER_PERIOD: '0'
		});
	} else if (s.vpnPreset === 'mullvad') {
		environment = envList({
			VPN_SERVICE_PROVIDER: 'mullvad',
			VPN_TYPE: 'wireguard',
			WIREGUARD_PRIVATE_KEY: envRef('WIREGUARD_PRIVATE_KEY'),
			SERVER_COUNTRIES: envRefOpt('SERVER_COUNTRIES'),
			UPDATER_PERIOD: '0'
		});
	} else if (s.vpnPreset === 'custom') {
		const c = s.customVpn;
		environment =
			c.vpnType === 'wireguard' ?
				envList({
					VPN_SERVICE_PROVIDER: c.provider || 'custom',
					VPN_TYPE: 'wireguard',
					WIREGUARD_PRIVATE_KEY: envRef('WIREGUARD_PRIVATE_KEY'),
					WIREGUARD_ADDRESSES: envRef('WIREGUARD_ADDRESSES'),
					UPDATER_PERIOD: '0'
				})
			:	envList({
					VPN_SERVICE_PROVIDER: c.provider || 'custom',
					VPN_TYPE: 'openvpn',
					OPENVPN_USER: envRef('OPENVPN_USER'),
					OPENVPN_PASSWORD: envRef('OPENVPN_PASSWORD'),
					UPDATER_PERIOD: '0'
				});
	} else {
		environment = [
			'VPN_SERVICE_PROVIDER=',
			'VPN_TYPE=openvpn',
			'OPENVPN_USER=',
			'OPENVPN_PASSWORD=',
			'UPDATER_PERIOD=0'
		];
	}

	if (gspPortSyncActive(s)) {
		environment = [
			...environment,
			// Same API key as GSP_GTN_API_KEY on qBittorrent - Gluetun control server (see gluetun-wiki control-server.md)
			'HTTP_CONTROL_SERVER_AUTH_DEFAULT_ROLE={"auth":"apikey","apikey":"${GSP_GTN_API_KEY}"}'
		];
		if (s.vpnPreset === 'protonvpn' || s.vpnPreset === 'mullvad') {
			environment.push('VPN_PORT_FORWARDING=on');
		}
	}

	return {
		image: GLUETUN_IMAGE,
		container_name: 'gluetun',
		restart: 'unless-stopped',
		cap_add: ['NET_ADMIN'],
		devices: ['/dev/net/tun'],
		environment,
		ports,
		expose: composeExpose,
		volumes: ['./gluetun:/gluetun']
	};
}

type TorrentServiceName = 'qbittorrent' | 'transmission' | 'deluge' | 'rutorrent';

function torrentUsesGluetun(s: ResolvedStack, serviceName: TorrentServiceName): boolean {
	if (!s.gluetunEnabled || !s.gluetunTarget) return false;
	return gluetunTargetToServiceName(s.gluetunTarget) === serviceName && s.services[serviceName];
}

function buildCinephageService(s: ResolvedStack, publishHostPorts: boolean): Record<string, unknown> {
	const d = s.directPorts;
	const svc: Record<string, unknown> = {
		image: 'ghcr.io/cinephage/cinephage:${IMAGE_TAG:-latest}',
		container_name: 'cinephage',
		restart: 'unless-stopped',
		init: true,
		security_opt: ['no-new-privileges:true'],
		environment: envList({
			PUID: LINUXSERVER_DEFAULT_PUID,
			PGID: LINUXSERVER_DEFAULT_PGID,
			TZ: s.tz,
			ORIGIN: s.origin,
			BETTER_AUTH_URL: s.origin,
			BETTER_AUTH_SECRET: envRef('BETTER_AUTH_SECRET')
		}),
		volumes: [`${s.pathConfig}:/config`, `${s.pathMedia}:/media`, `${s.pathDownloads}:/downloads`]
	};
	if (publishHostPorts) {
		svc.ports = [publish(s, d.cinephage, 3000)];
	}
	mergeComposeExpose(svc, [3000]);
	mergeCaddyLabels(s, svc, 'cinephage', '{{upstreams 3000}}');
	return svc;
}

function jellyfinExtra(s: ResolvedStack): Record<string, unknown> {
	const extra: Record<string, unknown> = {};
	if (s.jellyfinHwAccel === 'vaapi') {
		extra.devices = ['/dev/dri:/dev/dri'];
		extra.group_add = ['993', '44'];
	}
	if (s.jellyfinHwAccel === 'nvenc') {
		extra.runtime = 'nvidia';
	}
	return extra;
}

export function generateStackOutput(state: StackConfiguratorState): GeneratedStackOutput {
	const s = resolveStack(state);
	const warnings = collectWarnings(s);
	const direct = s.proxyMode === 'direct';
	const publishHostPorts = direct;
	const d = s.directPorts;

	const services: Record<string, Record<string, unknown>> = {};

	services.cinephage = buildCinephageService(s, publishHostPorts);

	if (s.services.jellyfin) {
		const baseEnv = envList({
			...lsEnv(s),
			JELLYFIN_PublishedServerUrl: s.jellyfinPublishedServerUrl!
		});
		const jfEnv =
			s.jellyfinHwAccel === 'nvenc' ? [...baseEnv, 'NVIDIA_VISIBLE_DEVICES=all'] : baseEnv;
		services.jellyfin = {
			image: 'lscr.io/linuxserver/jellyfin:latest',
			container_name: 'jellyfin',
			restart: 'unless-stopped',
			environment: jfEnv,
			volumes: ['./jellyfin:/config', `${s.pathMedia}:/data`],
			...(publishHostPorts ? { ports: [publish(s, d.jellyfin, 8096)] } : {}),
			...jellyfinExtra(s)
		};
		mergeComposeExpose(services.jellyfin, [8096]);
		mergeCaddyLabels(s, services.jellyfin, 'jellyfin', '{{upstreams 8096}}');
	}

	if (s.services.plex) {
		services.plex = {
			image: 'lscr.io/linuxserver/plex:latest',
			container_name: 'plex',
			restart: 'unless-stopped',
			environment: [...envList({ ...lsEnv(s), VERSION: 'docker', PLEX_CLAIM: '' })],
			volumes: ['./plex:/config', `${s.pathMedia}:/data`],
			...(publishHostPorts ? { ports: [publish(s, d.plex, 32400)] } : {})
		};
		mergeComposeExpose(services.plex, [32400]);
		mergeCaddyLabels(s, services.plex, 'plex', '{{upstreams 32400}}');
	}

	if (s.services.emby) {
		const hostEmby = s.services.jellyfin ? d.emby : d.jellyfin;
		services.emby = {
			image: 'lscr.io/linuxserver/emby:latest',
			container_name: 'emby',
			restart: 'unless-stopped',
			environment: envList(lsEnv(s)),
			volumes: ['./emby:/config', `${s.pathMedia}:/data`],
			...(publishHostPorts ? { ports: [publish(s, hostEmby, 8096)] } : {})
		};
		mergeComposeExpose(services.emby, [8096]);
		mergeCaddyLabels(s, services.emby, 'emby', '{{upstreams 8096}}');
	}

	if (s.services.sabnzbd) {
		services.sabnzbd = {
			image: 'lscr.io/linuxserver/sabnzbd:latest',
			container_name: 'sabnzbd',
			restart: 'unless-stopped',
			environment: envList(lsEnv(s)),
			volumes: ['./sabnzbd:/config', `${s.pathDownloads}:/downloads`],
			...(publishHostPorts ? { ports: [publish(s, d.sabnzbd, 8080)] } : {})
		};
		mergeComposeExpose(services.sabnzbd, [8080]);
		mergeCaddyLabels(s, services.sabnzbd, 'sabnzbd', '{{upstreams 8080}}');
	}

	if (s.services.nzbget) {
		services.nzbget = {
			image: 'lscr.io/linuxserver/nzbget:latest',
			container_name: 'nzbget',
			restart: 'unless-stopped',
			environment: envList(lsEnv(s)),
			volumes: ['./nzbget:/config', `${s.pathDownloads}:/downloads`],
			...(publishHostPorts ? { ports: [publish(s, d.nzbget, 6789)] } : {})
		};
		mergeComposeExpose(services.nzbget, [6789]);
		mergeCaddyLabels(s, services.nzbget, 'nzbget', '{{upstreams 6789}}');
	}

	if (s.services.nzbdav) {
		services.nzbdav = {
			image: 'nzbdav/nzbdav:latest',
			container_name: 'nzbdav',
			restart: 'unless-stopped',
			environment: envList(lsEnv(s)),
			volumes: ['./nzbdav:/config'],
			...(publishHostPorts ? { ports: [publish(s, s.nzbdavHostPort, 3000)] } : {})
		};
		mergeComposeExpose(services.nzbdav, [3000]);
		mergeCaddyLabels(s, services.nzbdav, 'nzbdav', '{{upstreams 3000}}');
	}

	if (s.services.altmount) {
		services.altmount = {
			image: 'ghcr.io/javi11/altmount:latest',
			container_name: 'altmount',
			restart: 'unless-stopped',
			environment: [
				...envList({
					...lsEnv(s),
					PORT: '8080',
					JWT_SECRET: envRef('ALTMOUNT_JWT_SECRET')
				})
			],
			volumes: ['./altmount/config:/config', './altmount/metadata:/metadata'],
			...(publishHostPorts ? { ports: [publish(s, d.altmount, 8080)] } : {})
		};
		mergeComposeExpose(services.altmount, [8080]);
		mergeCaddyLabels(s, services.altmount, 'altmount', '{{upstreams 8080}}');
	}

	const addTorrent = (
		key: TorrentServiceName,
		image: string,
		extra: Record<string, unknown>
	) => {
		const gt = torrentUsesGluetun(s, key);
		const qbitGluetunPortMod =
			gt &&
			key === 'qbittorrent' &&
			s.gluetunEnabled &&
			s.useGspPortSync &&
			`DOCKER_MODS=${QB_GLUETUN_PORT_MOD}`;
		const gspEnv =
			qbitGluetunPortMod ? ['GSP_GTN_API_KEY=${GSP_GTN_API_KEY}'] : [];
		const base: Record<string, unknown> = {
			image,
			container_name: key,
			restart: 'unless-stopped',
			environment: [
				...envList(lsEnv(s)),
				...(qbitGluetunPortMod ? [qbitGluetunPortMod, ...gspEnv] : [])
			],
			volumes: [`./${key}:/config`, `${s.pathDownloads}:/downloads`],
			...extra
		};
		if (gt) {
			base.network_mode = 'service:gluetun';
			base.depends_on = ['gluetun'];
			delete base.ports;
		} else if (publishHostPorts) {
			const hp =
				key === 'qbittorrent'
					? d.qbittorrent
					: key === 'transmission'
						? d.transmission
						: key === 'deluge'
							? d.deluge
							: d.rutorrent;
			const cp =
				key === 'rutorrent' ? 80 : key === 'qbittorrent' ? 8080 : key === 'transmission' ? 9091 : 8112;
			base.ports = [publish(s, hp, cp)];
		}
		const uiPort =
			key === 'rutorrent' ? 80 : key === 'qbittorrent' ? 8080 : key === 'transmission' ? 9091 : 8112;
		if (gt) {
			mergeCaddyLabels(s, base, key, `gluetun:${uiPort}`);
		} else {
			mergeComposeExpose(base, [uiPort]);
			mergeCaddyLabels(s, base, key, `${key}:${uiPort}`);
		}
		services[key] = base;
	};

	if (s.services.qbittorrent) {
		addTorrent('qbittorrent', 'lscr.io/linuxserver/qbittorrent:latest', {});
	}
	if (s.services.transmission) {
		addTorrent('transmission', 'lscr.io/linuxserver/transmission:latest', {});
	}
	if (s.services.deluge) {
		addTorrent('deluge', 'lscr.io/linuxserver/deluge:latest', {});
	}
	if (s.services.rutorrent) {
		addTorrent('rutorrent', 'lscr.io/linuxserver/rutorrent:latest', {});
	}

	if (s.services.aria2) {
		const behindGluetun = s.gluetunEnabled;
		if (behindGluetun) {
			services.aria2 = {
				image: 'p3terx/aria2-pro:latest',
				container_name: 'aria2',
				restart: 'unless-stopped',
				environment: envList(lsEnv(s)),
				volumes: ['./aria2:/config', `${s.pathDownloads}:/downloads`],
				network_mode: 'service:gluetun',
				depends_on: ['gluetun']
			};
			mergeCaddyLabels(s, services.aria2, 'aria2', 'gluetun:6800');
		} else {
			services.aria2 = {
				image: 'p3terx/aria2-pro:latest',
				container_name: 'aria2',
				restart: 'unless-stopped',
				environment: envList(lsEnv(s)),
				volumes: ['./aria2:/config', `${s.pathDownloads}:/downloads`],
				...(publishHostPorts
					? {
							ports: [publish(s, d.aria2Rpc, 6800), publish(s, d.aria2Dht, 6888)]
						}
					: {})
			};
			mergeComposeExpose(services.aria2, [6800, 6888]);
			mergeCaddyLabels(s, services.aria2, 'aria2', 'aria2:6800');
		}
	}

	if (s.services.bitmagnet) {
		if (s.gluetunEnabled) {
			services['bitmagnet-postgres'] = {
				image: 'postgres:16-alpine',
				container_name: 'bitmagnet-postgres',
				restart: 'unless-stopped',
				depends_on: ['gluetun'],
				network_mode: 'service:gluetun',
				environment: [
					'POSTGRES_USER=bitmagnet',
					`POSTGRES_PASSWORD=${envRef('BITMAGNET_POSTGRES_PASSWORD')}`,
					'POSTGRES_DB=bitmagnet'
				],
				volumes: ['bitmagnet-postgres-data:/var/lib/postgresql/data']
			};
			mergeComposeExpose(services['bitmagnet-postgres'], [5432]);
			services['bitmagnet-redis'] = {
				image: 'redis:7-alpine',
				container_name: 'bitmagnet-redis',
				restart: 'unless-stopped',
				depends_on: ['gluetun'],
				network_mode: 'service:gluetun',
				volumes: ['bitmagnet-redis-data:/data']
			};
			mergeComposeExpose(services['bitmagnet-redis'], [6379]);
			services.bitmagnet = {
				image: 'ghcr.io/bitmagnet-io/bitmagnet:latest',
				container_name: 'bitmagnet',
				restart: 'unless-stopped',
				depends_on: ['gluetun', 'bitmagnet-postgres', 'bitmagnet-redis'],
				network_mode: 'service:gluetun',
				environment: [
					'POSTGRES_HOST=127.0.0.1',
					`POSTGRES_PASSWORD=${envRef('BITMAGNET_POSTGRES_PASSWORD')}`,
					'REDIS_HOST=127.0.0.1'
				]
			};
			mergeComposeExpose(services.bitmagnet, [3333]);
			mergeCaddyLabels(s, services.bitmagnet, 'bitmagnet', 'gluetun:3333');
		} else {
			services['bitmagnet-postgres'] = {
				image: 'postgres:16-alpine',
				container_name: 'bitmagnet-postgres',
				restart: 'unless-stopped',
				environment: [
					'POSTGRES_USER=bitmagnet',
					`POSTGRES_PASSWORD=${envRef('BITMAGNET_POSTGRES_PASSWORD')}`,
					'POSTGRES_DB=bitmagnet'
				],
				volumes: ['bitmagnet-postgres-data:/var/lib/postgresql/data']
			};
			mergeComposeExpose(services['bitmagnet-postgres'], [5432]);
			services['bitmagnet-redis'] = {
				image: 'redis:7-alpine',
				container_name: 'bitmagnet-redis',
				restart: 'unless-stopped',
				volumes: ['bitmagnet-redis-data:/data']
			};
			mergeComposeExpose(services['bitmagnet-redis'], [6379]);
			services.bitmagnet = {
				image: 'ghcr.io/bitmagnet-io/bitmagnet:latest',
				container_name: 'bitmagnet',
				restart: 'unless-stopped',
				depends_on: ['bitmagnet-postgres', 'bitmagnet-redis'],
				environment: [
					'POSTGRES_HOST=bitmagnet-postgres',
					`POSTGRES_PASSWORD=${envRef('BITMAGNET_POSTGRES_PASSWORD')}`,
					'REDIS_HOST=bitmagnet-redis'
				],
				...(publishHostPorts ? { ports: [publish(s, d.bitmagnet, 3333)] } : {})
			};
			mergeComposeExpose(services.bitmagnet, [3333]);
			mergeCaddyLabels(s, services.bitmagnet, 'bitmagnet', 'bitmagnet:3333');
		}
	}

	const shouldInsertGluetun =
		s.gluetunEnabled &&
		(
			(s.gluetunTarget && s.services[gluetunTargetToServiceName(s.gluetunTarget)]) ||
			s.services.aria2 ||
			s.services.bitmagnet
		);

	if (shouldInsertGluetun) {
		const g = buildGluetunService(s, d);
		const rest = { ...services };
		delete rest.gluetun;
		Object.assign(services, { gluetun: g, ...rest });
	}

	if (s.proxyMode === 'caddy') {
		services.caddy = {
			image: CADDY_DOCKER_PROXY_IMAGE,
			container_name: 'caddy',
			restart: 'unless-stopped',
			ports: [publish(s, d.caddyHttp, 80), publish(s, d.caddyHttps, 443)],
			volumes: ['/var/run/docker.sock:/var/run/docker.sock', 'caddy_data:/data'],
			depends_on: ['cinephage']
		};
	}

	if (s.proxyMode === 'nginx') {
		services.nginx = {
			image: 'nginx:alpine',
			container_name: 'nginx',
			restart: 'unless-stopped',
			ports: [publish(s, d.nginxHttp, 80)],
			volumes: ['./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro'],
			depends_on: ['cinephage']
		};
	}

	if (s.proxyMode === 'traefik') {
		services.traefik = {
			image: 'traefik:v3.2',
			container_name: 'traefik',
			restart: 'unless-stopped',
			command: [
				'--api.dashboard=false',
				'--providers.file.filename=/etc/traefik/dynamic.yml',
				'--providers.file.watch=true',
				'--entrypoints.web.address=:80',
				'--entrypoints.websecure.address=:443'
			],
			ports: [publish(s, d.traefikHttp, 80), publish(s, d.traefikHttps, 443)],
			volumes: ['./traefik/dynamic.yml:/etc/traefik/dynamic.yml:ro'],
			depends_on: ['cinephage']
		};
	}

	const volumes: Record<string, Record<string, unknown> | null> = {};
	if (s.proxyMode === 'caddy') {
		volumes.caddy_data = {};
	}
	if (s.services.bitmagnet) {
		volumes['bitmagnet-postgres-data'] = {};
		volumes['bitmagnet-redis-data'] = {};
	}

	const composeDoc: Record<string, unknown> = {
		name: 'cinephage-stack',
		services,
		...(Object.keys(volumes).length ? { volumes } : {})
	};

	const gluetunNote =
		s.gluetunEnabled && s.vpnPreset === 'protonvpn' ?
			`# Gluetun (ProtonVPN): WIREGUARD_PRIVATE_KEY from Proton - https://github.com/qdm12/gluetun-wiki/blob/main/setup/providers/protonvpn.md
`
		: s.gluetunEnabled && s.vpnPreset === 'mullvad' ?
			`# Gluetun (Mullvad): WireGuard key from Mullvad account - see https://github.com/qdm12/gluetun-wiki
`
		: s.gluetunEnabled && s.vpnPreset === 'custom' ?
			`# Gluetun (custom): verify VPN_* / WireGuard fields and use .env or secrets for passwords.
`
		: '';

	const header = `# =============================================================================
# Cinephage stack (generated example - review before use)
# Secrets are referenced as \${VAR} - use the generated .env next to this file (do not commit .env).
# Point Cinephage download clients at your containers on the Docker network.
# IMAGE_TAG: export or set in a .env file next to this compose file.
${gluetunNote}# =============================================================================

`;

	const yamlBody = stringify(composeDoc, {
		lineWidth: 120,
		defaultStringType: 'PLAIN'
	});

	const altmountNote =
		s.services.altmount ?
			`
# --- Altmount: you may need devices/capabilities per https://altmount.kipsilabs.top ---
# devices:
#   - /dev/fuse
# cap_add:
#   - SYS_ADMIN
# privileged: true   # only if required by your deployment

`
		:	'';

	const gspNote =
		gspPortSyncActive(s) ?
			`
# --- GSP qBittorrent–Gluetun port sync (LinuxServer DOCKER_MODS) ---
# https://github.com/t-anc/GSP-Qbittorent-Gluetun-sync-port-mod
# GSP_GTN_API_KEY in the generated .env matches Gluetun control server (HTTP_CONTROL_SERVER_AUTH_DEFAULT_ROLE).
# In qBittorrent: enable "Bypass authentication for clients on localhost".
# Custom VPN: enable port forwarding in Gluetun per your provider if you use GSP (Proton/Mullvad presets set VPN_PORT_FORWARDING=on here).

`
		:	'';

	const caddyProxyNote =
		s.proxyMode === 'caddy' ?
			`# Reverse proxy: Caddy Docker Proxy - routes from Docker labels on each service (no Caddyfile).
`
		:	'';

	const composeYaml = header + caddyProxyNote + gspNote + altmountNote + yamlBody;

	const caddyfile: string | null = null;
	let nginxConf: string | null = null;
	let traefikDynamicYaml: string | null = null;
	if (s.proxyMode === 'nginx') {
		nginxConf = buildNginxConf(s);
	}
	if (s.proxyMode === 'traefik') {
		traefikDynamicYaml = buildTraefikDynamicYaml(s);
	}

	const dotEnv = buildDotEnv(state);

	return { composeYaml, caddyfile, nginxConf, traefikDynamicYaml, dotEnv, warnings };
}

/** Alias matching the module name. */
export const generateDockerCompose = generateStackOutput;
