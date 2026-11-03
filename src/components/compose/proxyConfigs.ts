import type { GluetunTarget, ResolvedStack } from './types';
import { gluetunTargetToServiceName, normalizeApexDomain } from './types';

export type ProxyServiceKey =
	| 'cinephage'
	| 'jellyfin'
	| 'plex'
	| 'emby'
	| 'sabnzbd'
	| 'nzbget'
	| 'nzbdav'
	| 'altmount'
	| 'qbittorrent'
	| 'transmission'
	| 'deluge'
	| 'rutorrent'
	| 'aria2'
	| 'bitmagnet';

interface Upstream {
	key: ProxyServiceKey;
	container: string;
	port: number;
	enabled: boolean;
}

/** One-level subdomain: `{label}.{apexDomain}` */
function hostForApex(apexDomain: string, label: string): string {
	const apex = normalizeApexDomain(apexDomain);
	return `${label}.${apex}`;
}

const torrentUiPort: Record<GluetunTarget, number> = {
	qbittorrent: 8080,
	transmission: 9091,
	deluge: 8112,
	rtorrent: 80
};

function torrentProxyRef(
	s: ResolvedStack,
	key: ProxyServiceKey
): { container: string; port: number } {
	const t = s.gluetunTarget;
	const torrentKeys = ['qbittorrent', 'transmission', 'deluge', 'rutorrent'] as const;
	const isTorrent = (torrentKeys as readonly string[]).includes(key);
	const serviceName =
		key === 'qbittorrent' || key === 'transmission' || key === 'deluge' || key === 'rutorrent'
			? key
			: null;
	const viaGluetun =
		isTorrent &&
		serviceName &&
		s.gluetunEnabled &&
		t &&
		gluetunTargetToServiceName(t) === serviceName &&
		s.services[serviceName];
	if (viaGluetun && t) {
		return { container: 'gluetun', port: torrentUiPort[t] };
	}
	if (key === 'aria2' && s.gluetunEnabled && s.services.aria2) {
		return { container: 'gluetun', port: 6800 };
	}
	if (key === 'bitmagnet' && s.gluetunEnabled && s.services.bitmagnet) {
		return { container: 'gluetun', port: 3333 };
	}
	const defaults: Partial<Record<ProxyServiceKey, { container: string; port: number }>> = {
		qbittorrent: { container: 'qbittorrent', port: 8080 },
		transmission: { container: 'transmission', port: 9091 },
		deluge: { container: 'deluge', port: 8112 },
		rutorrent: { container: 'rutorrent', port: 80 }
	};
	return defaults[key] ?? { container: String(key), port: 80 };
}

export function collectUpstreams(s: ResolvedStack): Upstream[] {
	const { services: sv } = s;
	const list: Upstream[] = [
		{ key: 'cinephage', container: 'cinephage', port: 3000, enabled: true },
		{ key: 'jellyfin', container: 'jellyfin', port: 8096, enabled: sv.jellyfin },
		{ key: 'plex', container: 'plex', port: 32400, enabled: sv.plex },
		{ key: 'emby', container: 'emby', port: 8096, enabled: sv.emby },
		{ key: 'sabnzbd', container: 'sabnzbd', port: 8080, enabled: sv.sabnzbd },
		{ key: 'nzbget', container: 'nzbget', port: 6789, enabled: sv.nzbget },
		{ key: 'nzbdav', container: 'nzbdav', port: 3000, enabled: sv.nzbdav },
		{ key: 'altmount', container: 'altmount', port: 8080, enabled: sv.altmount },
		{
			key: 'qbittorrent',
			...torrentProxyRef(s, 'qbittorrent'),
			enabled: sv.qbittorrent
		},
		{
			key: 'transmission',
			...torrentProxyRef(s, 'transmission'),
			enabled: sv.transmission
		},
		{ key: 'deluge', ...torrentProxyRef(s, 'deluge'), enabled: sv.deluge },
		{ key: 'rutorrent', ...torrentProxyRef(s, 'rutorrent'), enabled: sv.rutorrent },
		{ key: 'aria2', container: 'aria2', port: 6800, enabled: sv.aria2 },
		{ key: 'bitmagnet', container: 'bitmagnet', port: 3333, enabled: sv.bitmagnet }
	];
	return list.filter((u) => u.enabled);
}

export function buildNginxConf(s: ResolvedStack): string {
	const upstreams = collectUpstreams(s);
	const apex = normalizeApexDomain(s.apexDomain);
	const blocks: string[] = [
		'# Nginx - generated example. Verify proxy headers and TLS (ssl_certificate) for production.',
		'# Hosts use one label + apex, e.g. cinephage.' + apex,
		''
	];

	for (const u of upstreams) {
		const h = hostForApex(apex, u.key);
		blocks.push(`upstream ${u.key}_svc {`);
		blocks.push(`    server ${u.container}:${u.port};`);
		blocks.push(`}`, ``);
		blocks.push(`server {`);
		blocks.push(`    listen 80;`);
		blocks.push(`    server_name ${h};`);
		blocks.push(`    location / {`);
		blocks.push(`        proxy_pass http://${u.key}_svc;`);
		blocks.push(`        proxy_http_version 1.1;`);
		blocks.push(`        proxy_set_header Host $host;`);
		blocks.push(`        proxy_set_header X-Real-IP $remote_addr;`);
		blocks.push(`        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`);
		blocks.push(`        proxy_set_header X-Forwarded-Proto $scheme;`);
		if (u.key === 'plex') {
			blocks.push(`        proxy_set_header X-Plex-Client-Identifier $request_id;`);
		}
		blocks.push(`    }`);
		blocks.push(`}`, ``);
	}

	return blocks.join('\n');
}
