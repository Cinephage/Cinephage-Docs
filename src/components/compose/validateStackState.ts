import type { StackConfiguratorState } from './types';
import { normalizeApexDomain, resolveStack } from './types';

const HTTP_URL = /^https?:\/\/.+/i;

function validateDirectPorts(s: StackConfiguratorState): string | null {
	const d = s.directPorts;
	for (const [k, v] of Object.entries(d) as [keyof typeof d, number][]) {
		if (!isValidTcpPort(v)) return `Invalid host port for ${String(k)}: use 1–65535.`;
	}
	if (!isValidTcpPort(s.nzbdavHostPort)) return 'NZBDav host port must be between 1 and 65535.';
	return null;
}

function isValidTcpPort(n: number): boolean {
	return Number.isInteger(n) && n >= 1 && n <= 65535;
}

/** True when two enabled direct-mode services share a host port. */
export function hasDirectPortConflicts(s: StackConfiguratorState): boolean {
	if (s.proxyMode !== 'direct') return false;
	const rs = resolveStack(s);
	const { directPorts: d, services: sv } = rs;
	const ports: { p: number; label: string }[] = [];

	const add = (p: number, label: string) => {
		if (isValidTcpPort(p)) ports.push({ p, label });
	};

	add(d.cinephage, 'cinephage');
	if (sv.jellyfin) add(d.jellyfin, 'jellyfin');
	if (sv.plex) add(d.plex, 'plex');
	if (sv.emby) add(sv.jellyfin ? d.emby : d.jellyfin, 'emby');
	if (sv.sabnzbd) add(d.sabnzbd, 'sabnzbd');
	if (sv.nzbget) add(d.nzbget, 'nzbget');
	if (sv.nzbdav) add(s.nzbdavHostPort, 'nzbdav');
	if (sv.altmount) add(d.altmount, 'altmount');
	if (sv.qbittorrent) add(d.qbittorrent, 'qbittorrent');
	if (sv.transmission) add(d.transmission, 'transmission');
	if (sv.deluge) add(d.deluge, 'deluge');
	if (sv.rutorrent) add(d.rutorrent, 'rutorrent');
	if (sv.aria2) {
		add(d.aria2Rpc, 'aria2-rpc');
		add(d.aria2Dht, 'aria2-dht');
	}
	if (sv.bitmagnet) add(d.bitmagnet, 'bitmagnet');

	const seen = new Map<number, string[]>();
	for (const { p, label } of ports) {
		const list = seen.get(p) ?? [];
		list.push(label);
		seen.set(p, list);
	}
	for (const [, labels] of seen) {
		if (labels.length > 1) return true;
	}
	return false;
}

/** Single-line error for a wizard step (empty = OK). */
export function validationErrorForStep(step: number, s: StackConfiguratorState): string | null {
	if (step === 0) return null;

	if (step === 1) {
		if (!s.pathConfig.trim() || !s.pathMedia.trim() || !s.pathDownloads.trim()) {
			return 'Enter config, media, and downloads paths.';
		}
		if (!s.tz.trim()) {
			return 'Select a timezone.';
		}
		return null;
	}

	if (step === 2) {
		if (s.proxyMode === 'direct') {
			const portErr = validateDirectPorts(s);
			if (portErr) return portErr;
			const o = s.directOrigin.trim();
			if (!o) return 'Enter a direct URL for Cinephage (ORIGIN).';
			if (!HTTP_URL.test(o)) return 'ORIGIN should start with http:// or https://';
			try {
				// eslint-disable-next-line no-new
				new URL(o);
			} catch {
				return 'ORIGIN is not a valid URL.';
			}
			return null;
		}
		const raw = s.apexDomain.trim();
		if (!raw) return 'Enter an apex domain (e.g. example.com).';
		const apex = normalizeApexDomain(raw);
		if (!/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(apex) && apex !== 'localhost') {
			return 'Apex domain should look like example.com (or paste a full URL to normalize).';
		}
		return null;
	}

	if (step === 3) {
		if (!isValidTcpPort(s.nzbdavHostPort)) {
			return 'NZBDav host port must be between 1 and 65535.';
		}
		return null;
	}

	// Step 4 (VPN): optional - secrets belong in .env; compose uses variable references only.
	if (step === 4) return null;

	return null;
}

/** Whether the Next button should be enabled from validation (paths + per-step rules). */
export function canProceedFromStep(step: number, s: StackConfiguratorState): boolean {
	if (step === 1) {
		if (!s.pathConfig.trim() || !s.pathMedia.trim() || !s.pathDownloads.trim()) return false;
		return validationErrorForStep(1, s) === null;
	}
	return validationErrorForStep(step, s) === null;
}
