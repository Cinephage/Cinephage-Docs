export type ProxyMode = 'direct' | 'caddy' | 'nginx' | 'traefik';

export type GluetunTarget = 'qbittorrent' | 'transmission' | 'deluge' | 'rtorrent';

export type NzbChoice = 'none' | 'sabnzbd' | 'nzbget';
export type DavChoice = 'none' | 'nzbdav' | 'altmount';
export type TorrentChoice = 'none' | 'qbittorrent' | 'transmission' | 'deluge' | 'rtorrent';
export type VpnPreset = 'none' | 'protonvpn' | 'mullvad' | 'custom';

/** Host environment - used for path hints only (not emitted to compose). */
export type HostOs = 'windows' | 'mac' | 'linux' | 'nas';

/** Jellyfin hardware acceleration (Linux-oriented; review on your host). */
export type JellyfinHwAccel = 'none' | 'vaapi' | 'nvenc';

export interface CustomVpnFields {
	provider: string;
	vpnType: 'openvpn' | 'wireguard';
	openvpnUser: string;
	openvpnPassword: string;
	wireguardPrivateKey: string;
	wireguardAddresses: string;
	serverCountry: string;
}

/**
 * ProtonVPN via Gluetun - `WIREGUARD_PRIVATE_KEY` from Proton’s WireGuard config page;
 * Gluetun picks servers using optional `SERVER_*` filters (see gluetun-wiki ProtonVPN).
 */
export interface ProtonVpnFields {
	wireguardPrivateKey: string;
	/** Gluetun SERVER_COUNTRIES (comma-separated, e.g. Netherlands) */
	serverCountries: string;
	serverRegions: string;
	serverCities: string;
}

/** Mullvad via Gluetun - use WireGuard key from Mullvad account; see Gluetun wiki. */
export interface MullvadVpnFields {
	wireguardPrivateKey: string;
	/** Optional Gluetun filter, e.g. CH or empty for any */
	serverCountries: string;
}

/** linuxserver rutorrent service name in compose vs Gluetun target id */
export function gluetunTargetToServiceName(
	gt: GluetunTarget
): 'qbittorrent' | 'transmission' | 'deluge' | 'rutorrent' {
	return gt === 'rtorrent' ? 'rutorrent' : gt;
}

export interface ServiceToggles {
	jellyfin: boolean;
	plex: boolean;
	emby: boolean;
	sabnzbd: boolean;
	nzbget: boolean;
	nzbdav: boolean;
	altmount: boolean;
	qbittorrent: boolean;
	transmission: boolean;
	deluge: boolean;
	rutorrent: boolean;
	aria2: boolean;
	bitmagnet: boolean;
}

/** Host ports published in direct mode (and used for proxy container publishes). */
export interface DirectHostPortMap {
	cinephage: number;
	jellyfin: number;
	plex: number;
	emby: number;
	sabnzbd: number;
	nzbget: number;
	qbittorrent: number;
	transmission: number;
	deluge: number;
	rutorrent: number;
	aria2Rpc: number;
	aria2Dht: number;
	bitmagnet: number;
	altmount: number;
	caddyHttp: number;
	caddyHttps: number;
	nginxHttp: number;
	traefikHttp: number;
	traefikHttps: number;
}

export function defaultDirectHostPorts(): DirectHostPortMap {
	return {
		cinephage: 3000,
		jellyfin: 8096,
		plex: 32400,
		emby: 8097,
		sabnzbd: 8081,
		nzbget: 6789,
		qbittorrent: 8082,
		transmission: 9091,
		deluge: 8112,
		rutorrent: 8084,
		aria2Rpc: 6800,
		aria2Dht: 6888,
		bitmagnet: 3333,
		altmount: 8095,
		caddyHttp: 80,
		caddyHttps: 443,
		nginxHttp: 80,
		traefikHttp: 80,
		traefikHttps: 443
	};
}

export interface StackConfiguratorState {
	tz: string;
	/** Shown in UI only - LinuxServer PUID/PGID in compose are fixed to 1000. */
	hostOs: HostOs;
	/**
	 * When qBittorrent + Gluetun + VPN: add LinuxServer DOCKER_MODS GSP (recommended).
	 */
	useGspPortSync: boolean;
	imageTag: string;
	pathConfig: string;
	pathMedia: string;
	pathDownloads: string;
	proxyMode: ProxyMode;
	/** When using Caddy/Nginx/Traefik: `http` or `https` for derived ORIGIN. */
	publicScheme: 'http' | 'https';
	/** Apex domain only, e.g. `example.com` (one label + TLD pattern). Used for `cinephage.${apexDomain}` and proxy hosts. */
	apexDomain: string;
	/** When `proxyMode === 'direct'`: ORIGIN for Cinephage (e.g. http://localhost:3000). */
	directOrigin: string;
	nzbdavHostPort: number;
	nzbChoice: NzbChoice;
	davChoice: DavChoice;
	torrentChoice: TorrentChoice;
	vpnPreset: VpnPreset;
	/** Used when vpnPreset === 'protonvpn' - maps to Gluetun Proton WireGuard env vars. */
	protonVpn: ProtonVpnFields;
	/** Used when vpnPreset === 'mullvad'. */
	mullvadVpn: MullvadVpnFields;
	customVpn: CustomVpnFields;
	media: {
		jellyfin: boolean;
		plex: boolean;
		emby: boolean;
	};
	extrasAria2: boolean;
	extrasBitmagnet: boolean;
	/**
	 * Better Auth Secret (Base64 of 32 random bytes). Empty until the stack builder sets it on the client.
	 */
	betterAuthSecret: string;
	/** GSP + Gluetun control server API key (hex). Empty until the stack builder fills it when GSP is active. */
	gspGtnApiKey: string;
	/** Host port map for direct mode and proxy edge ports. */
	directPorts: DirectHostPortMap;
	/** When Jellyfin is enabled, optional hardware acceleration (Linux hosts). */
	jellyfinHwAccel: JellyfinHwAccel;
}

/** Fully resolved values for YAML / proxy generation. */
export interface ResolvedStack extends StackConfiguratorState {
	services: ServiceToggles;
	/** Cinephage ORIGIN env */
	origin: string;
	gluetunEnabled: boolean;
	gluetunTarget: GluetunTarget | null;
	/** Set when Jellyfin is enabled; used for `JELLYFIN_PublishedServerUrl`. */
	jellyfinPublishedServerUrl: string | null;
}

/**
 * Users often paste a full URL into "apex domain". Accept only the registrable apex for hosts:
 * - Strip `http://` / `https://`, path, port
 * - If the host is `cinephage.<apex>`, strip the `cinephage.` prefix so we do not emit `cinephage.cinephage...`
 */
export function normalizeApexDomain(raw: string): string {
	let h = raw.trim();
	if (!h) return 'example.com';
	// If multiple `://` fragments were pasted, use the last host-like segment
	const schemeParts = h.split('://');
	if (schemeParts.length > 1) {
		h = schemeParts[schemeParts.length - 1] ?? h;
	} else {
		h = h.replace(/^https?:\/\//i, '');
	}
	h = h.split('/')[0].split('?')[0];
	h = h.split(':')[0];
	while (/^cinephage\./i.test(h)) {
		h = h.slice('cinephage.'.length);
	}
	return h || 'example.com';
}

/** Default Jellyfin host port in direct mode (overridden by `directPorts.jellyfin`). */
export const JELLYFIN_DIRECT_PUBLISHED_PORT = 8096;

/** Public URL Jellyfin should advertise (`JELLYFIN_PublishedServerUrl`). */
export function computeJellyfinPublishedServerUrl(s: StackConfiguratorState): string {
	if (s.proxyMode === 'direct') {
		const port = s.directPorts?.jellyfin ?? JELLYFIN_DIRECT_PUBLISHED_PORT;
		return `http://127.0.0.1:${port}`;
	}
	const apex = normalizeApexDomain(s.apexDomain);
	return `${s.publicScheme}://jellyfin.${apex}`;
}

export function toServiceToggles(s: StackConfiguratorState): ServiceToggles {
	const tc = s.torrentChoice;
	return {
		jellyfin: s.media.jellyfin,
		plex: s.media.plex,
		emby: s.media.emby,
		sabnzbd: s.nzbChoice === 'sabnzbd',
		nzbget: s.nzbChoice === 'nzbget',
		nzbdav: s.davChoice === 'nzbdav',
		altmount: s.davChoice === 'altmount',
		qbittorrent: tc === 'qbittorrent',
		transmission: tc === 'transmission',
		deluge: tc === 'deluge',
		rutorrent: tc === 'rtorrent',
		aria2: s.extrasAria2,
		bitmagnet: s.extrasBitmagnet
	};
}

export function computeOrigin(s: StackConfiguratorState): string {
	if (s.proxyMode === 'direct') {
		return s.directOrigin.trim() || 'http://localhost:3000';
	}
	const apex = normalizeApexDomain(s.apexDomain);
	return `${s.publicScheme}://cinephage.${apex}`;
}

/** True when generated `.env` should include GSP + Gluetun key lines (matches `buildDotEnv` / GSP compose). */
export function gspEnvRequested(s: StackConfiguratorState): boolean {
	return s.useGspPortSync && s.torrentChoice === 'qbittorrent' && s.vpnPreset !== 'none';
}

export function resolveStack(s: StackConfiguratorState): ResolvedStack {
	const services = toServiceToggles(s);
	const origin = computeOrigin(s);
	const vpnOn = s.vpnPreset !== 'none';
	const gluetunEnabled =
		vpnOn && (s.torrentChoice !== 'none' || s.extrasAria2 || s.extrasBitmagnet);
	const gluetunTarget: GluetunTarget | null =
		s.torrentChoice !== 'none' ? (s.torrentChoice as GluetunTarget) : null;
	const jellyfinPublishedServerUrl =
		s.media.jellyfin ? computeJellyfinPublishedServerUrl(s) : null;
	return {
		...s,
		services,
		origin,
		gluetunEnabled,
		gluetunTarget,
		jellyfinPublishedServerUrl
	};
}

export const defaultCustomVpn: CustomVpnFields = {
	provider: '',
	vpnType: 'wireguard',
	openvpnUser: '',
	openvpnPassword: '',
	wireguardPrivateKey: '',
	wireguardAddresses: '',
	serverCountry: ''
};

export const defaultProtonVpn: ProtonVpnFields = {
	wireguardPrivateKey: '',
	serverCountries: '',
	serverRegions: '',
	serverCities: ''
};

export const defaultMullvadVpn: MullvadVpnFields = {
	wireguardPrivateKey: '',
	serverCountries: ''
};

export interface GeneratedStackOutput {
	composeYaml: string;
	caddyfile: string | null;
	nginxConf: string | null;
	traefikDynamicYaml: string | null;
	/** Generated `.env` contents (placeholders + values known from the wizard). Do not commit. */
	dotEnv: string;
	warnings: string[];
}

export const defaultStackState: StackConfiguratorState = {
	tz: '',
	hostOs: 'linux',
	useGspPortSync: true,
	imageTag: 'latest',
	pathConfig: './config',
	pathMedia: './media',
	pathDownloads: './downloads',
	proxyMode: 'direct',
	publicScheme: 'https',
	apexDomain: 'example.com',
	directOrigin: 'http://localhost:3000',
	nzbdavHostPort: 3003,
	nzbChoice: 'none',
	davChoice: 'none',
	torrentChoice: 'none',
	vpnPreset: 'none',
	protonVpn: { ...defaultProtonVpn },
	mullvadVpn: { ...defaultMullvadVpn },
	customVpn: { ...defaultCustomVpn },
	media: {
		jellyfin: true,
		plex: false,
		emby: false
	},
	extrasAria2: false,
	extrasBitmagnet: false,
	betterAuthSecret: '',
	gspGtnApiKey: '',
	directPorts: defaultDirectHostPorts(),
	jellyfinHwAccel: 'none'
};
