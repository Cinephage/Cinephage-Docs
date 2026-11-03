import type { StackConfiguratorState } from './types';
import { computeOrigin, gspEnvRequested, normalizeApexDomain, resolveStack, toServiceToggles } from './types';

/** Build the `.env` file next to compose: known values from the wizard, empty keys for user secrets. */
export function buildDotEnv(state: StackConfiguratorState): string {
	const s = resolveStack(state);
	const lines: string[] = [
		'# =============================================================================',
		'# Generated .env for this stack - Docker Compose loads it for ${VAR} substitution.',
		'# Do not commit this file; rotate secrets if it leaks.',
		'# =============================================================================',
		'',
		`IMAGE_TAG=${state.imageTag || 'latest'}`,
		`TZ=${state.tz}`,
		''
	];

	if (state.proxyMode === 'direct') {
		lines.push(`# Cinephage ORIGIN (must match browser URL)`);
		lines.push(`ORIGIN=${computeOrigin(state)}`);
	} else {
		const apex = normalizeApexDomain(state.apexDomain);
		lines.push(`# Public URL uses cinephage.${apex}`);
		lines.push(`ORIGIN=${computeOrigin(state)}`);
	}

	lines.push('');
	if (state.betterAuthSecret.trim()) {
		lines.push('# Better Auth Secret (from stack builder)');
		lines.push(`BETTER_AUTH_SECRET=${state.betterAuthSecret}`);
	} else {
		lines.push('# Better Auth Secret - generate: openssl rand -base64 32');
		lines.push('BETTER_AUTH_SECRET=');
	}

	if (s.gluetunEnabled) {
		lines.push('', '# --- Gluetun VPN ---');
		if (state.vpnPreset === 'protonvpn') {
			lines.push('# ProtonVPN + Gluetun - PrivateKey from https://account.proton.me (WireGuard)');
			lines.push('WIREGUARD_PRIVATE_KEY=');
			lines.push('# Optional Gluetun filters (see gluetun-wiki ProtonVPN):');
			lines.push(`SERVER_COUNTRIES=${state.protonVpn.serverCountries}`);
			lines.push(`SERVER_REGIONS=${state.protonVpn.serverRegions}`);
			lines.push(`SERVER_CITIES=${state.protonVpn.serverCities}`);
		} else if (state.vpnPreset === 'mullvad') {
			lines.push('# Mullvad - WireGuard private key from https://mullvad.net/account');
			lines.push('WIREGUARD_PRIVATE_KEY=');
			lines.push('# Optional Gluetun filter:');
			lines.push('SERVER_COUNTRIES=');
		} else if (state.vpnPreset === 'custom') {
			lines.push('# Custom provider - see Gluetun wiki for required variables');
			if (state.customVpn.vpnType === 'wireguard') {
				lines.push('WIREGUARD_PRIVATE_KEY=');
				lines.push('WIREGUARD_ADDRESSES=');
			} else {
				lines.push('OPENVPN_USER=');
				lines.push('OPENVPN_PASSWORD=');
			}
		}

		if (gspEnvRequested(state)) {
			lines.push('', '# GSP port sync (qBittorrent mod) + Gluetun control server - one key for both (see generated compose)');
			if (state.gspGtnApiKey.trim()) {
				lines.push('# (Stack builder pre-filled; rotate with Regenerate on the VPN step or: docker run --rm qmcgaw/gluetun genkey)');
				lines.push(`GSP_GTN_API_KEY=${state.gspGtnApiKey}`);
			} else {
				lines.push('# Generate: stack builder VPN step, or docker run --rm qmcgaw/gluetun genkey');
				lines.push('GSP_GTN_API_KEY=');
			}
			if (state.vpnPreset === 'custom') {
				lines.push(
					'# Custom VPN: enable port forwarding in Gluetun per your provider if GSP cannot read a forwarded port'
				);
			}
		}
	}

	if (toServiceToggles(state).bitmagnet) {
		lines.push('', '# Bitmagnet PostgreSQL (same value in postgres + app services)');
		lines.push('BITMAGNET_POSTGRES_PASSWORD=');
	}

	if (toServiceToggles(state).altmount) {
		lines.push('', '# Altmount');
		lines.push('ALTMOUNT_JWT_SECRET=');
	}

	return lines.join('\n');
}
