import type { CustomVpnFields, MullvadVpnFields } from './types';

/** Parsed from a standard WireGuard client `.conf` ([Interface] + first [Peer]). */
export interface ParsedWireGuard {
	wireguardPrivateKey: string;
	wireguardAddresses: string;
	wireguardPublicKey: string;
	wireguardPresharedKey: string;
	wireguardEndpointIp: string;
	wireguardEndpointPort: string;
}

export type ParseWireGuardResult =
	| { ok: true; data: ParsedWireGuard }
	| { ok: false; message: string };

/** Split `host:port` or `[ipv6]:port` into host and port (default `51820` if port missing). */
export function splitWireGuardEndpoint(endpoint: string): { host: string; port: string } {
	const t = endpoint.trim();
	if (!t) {
		return { host: '', port: '51820' };
	}
	if (t.startsWith('[')) {
		const close = t.indexOf(']');
		if (close === -1) {
			return { host: t, port: '51820' };
		}
		const host = t.slice(1, close);
		const rest = t.slice(close + 1).trim();
		if (rest.startsWith(':')) {
			const port = rest.slice(1).trim();
			return { host, port: port || '51820' };
		}
		return { host, port: '51820' };
	}
	const lastColon = t.lastIndexOf(':');
	// IPv4 host:port - single colon
	if (lastColon > 0 && !t.includes('::')) {
		const host = t.slice(0, lastColon);
		const port = t.slice(lastColon + 1);
		if (/^\d+$/.test(port)) {
			return { host, port };
		}
	}
	// Host without port
	return { host: t, port: '51820' };
}

type IniBag = Record<string, string>;

function parseWireGuardIni(text: string): { interface: IniBag; peer: IniBag } | null {
	const iface: IniBag = {};
	const peer: IniBag = {};
	let section: 'none' | 'interface' | 'peer' | 'ignore' = 'none';

	for (const rawLine of text.split(/\r?\n/)) {
		const line = (rawLine.split('#')[0] ?? '').trim();
		if (!line) continue;

		const sec = /^\[([^\]]+)\]$/i.exec(line);
		if (sec) {
			const name = sec[1]!.trim().toLowerCase();
			if (name === 'interface') {
				section = 'interface';
			} else if (name === 'peer') {
				// Only the first [Peer] block (stop merging further peers)
				if (Object.keys(peer).length > 0) {
					section = 'ignore';
				} else {
					section = 'peer';
				}
			} else {
				section = 'ignore';
			}
			continue;
		}

		const eq = line.indexOf('=');
		if (eq === -1) continue;
		const key = line.slice(0, eq).trim().toLowerCase().replace(/\s+/g, '');
		const val = line.slice(eq + 1).trim();
		if (section === 'interface') {
			iface[key] = val;
		} else if (section === 'peer') {
			peer[key] = val;
		}
	}

	if (Object.keys(iface).length === 0 && Object.keys(peer).length === 0) {
		return null;
	}
	return { interface: iface, peer };
}

function getKey(bag: IniBag, ...aliases: string[]): string {
	for (const a of aliases) {
		const k = a.toLowerCase().replace(/\s+/g, '');
		if (bag[k] !== undefined && bag[k] !== '') return bag[k]!;
	}
	return '';
}

/**
 * Parse a WireGuard client configuration file body.
 * Expects `[Interface]` with `PrivateKey` and `Address`, and `[Peer]` with `PublicKey` and `Endpoint`.
 */
export function parseWireGuardConf(text: string): ParseWireGuardResult {
	const trimmed = text.trim();
	if (!trimmed) {
		return { ok: false, message: 'File is empty.' };
	}

	const parsed = parseWireGuardIni(trimmed);
	if (!parsed) {
		return { ok: false, message: 'No [Interface] or [Peer] section found.' };
	}

	const { interface: iface, peer } = parsed;

	const privateKey = getKey(iface, 'PrivateKey');
	const address = getKey(iface, 'Address');
	const publicKey = getKey(peer, 'PublicKey');
	const presharedKey = getKey(peer, 'PresharedKey');
	const endpoint = getKey(peer, 'Endpoint');

	if (!privateKey) {
		return { ok: false, message: 'Missing PrivateKey in [Interface].' };
	}
	if (!address) {
		return { ok: false, message: 'Missing Address in [Interface].' };
	}
	if (!publicKey) {
		return { ok: false, message: 'Missing PublicKey in [Peer].' };
	}
	if (!endpoint) {
		return { ok: false, message: 'Missing Endpoint in [Peer].' };
	}

	const { host, port } = splitWireGuardEndpoint(endpoint);
	if (!host) {
		return { ok: false, message: 'Could not parse Endpoint host.' };
	}

	return {
		ok: true,
		data: {
			wireguardPrivateKey: privateKey,
			wireguardAddresses: address,
			wireguardPublicKey: publicKey,
			wireguardPresharedKey: presharedKey,
			wireguardEndpointIp: host,
			wireguardEndpointPort: port
		}
	};
}

export type ParseWireGuardPrivateKeyResult =
	| { ok: true; privateKey: string }
	| { ok: false; message: string };

/** Minimal parse for Gluetun + Proton: only `[Interface]` `PrivateKey` (e.g. from a Proton `.conf`). */
export function parseWireGuardPrivateKeyOnly(text: string): ParseWireGuardPrivateKeyResult {
	const trimmed = text.trim();
	if (!trimmed) {
		return { ok: false, message: 'File is empty.' };
	}
	const parsed = parseWireGuardIni(trimmed);
	if (!parsed) {
		return { ok: false, message: 'No [Interface] section found.' };
	}
	const privateKey = getKey(parsed.interface, 'PrivateKey');
	if (!privateKey) {
		return { ok: false, message: 'Missing PrivateKey in [Interface].' };
	}
	return { ok: true, privateKey };
}

export function parsedWireGuardToMullvadVpn(d: ParsedWireGuard): Pick<MullvadVpnFields, 'wireguardPrivateKey'> {
	return { wireguardPrivateKey: d.wireguardPrivateKey };
}

export function parsedWireGuardToCustomWireGuard(
	d: ParsedWireGuard
): Pick<CustomVpnFields, 'wireguardPrivateKey' | 'wireguardAddresses'> {
	return {
		wireguardPrivateKey: d.wireguardPrivateKey,
		wireguardAddresses: d.wireguardAddresses
	};
}
