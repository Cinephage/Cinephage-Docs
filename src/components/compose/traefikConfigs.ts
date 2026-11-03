import { stringify } from 'yaml';
import type { ResolvedStack } from './types';
import { collectUpstreams } from './proxyConfigs';
import { normalizeApexDomain } from './types';

/**
 * Traefik v3 file-provider dynamic configuration (HTTP routers/services).
 * Mount at ./traefik/dynamic.yml in the generated compose service.
 */
export function buildTraefikDynamicYaml(s: ResolvedStack): string {
	const apex = normalizeApexDomain(s.apexDomain);
	const upstreams = collectUpstreams(s);

	const routers: Record<string, { rule: string; service: string }> = {};
	const services: Record<string, { loadBalancer: { servers: { url: string }[] } }> = {};

	for (const u of upstreams) {
		const host = `${u.key}.${apex}`;
		const routerName = `rt_${u.key.replace(/[^a-zA-Z0-9_]/g, '_')}`;
		const svcName = `svc_${u.key.replace(/[^a-zA-Z0-9_]/g, '_')}`;
		routers[routerName] = {
			rule: `Host(\`${host}\`)`,
			service: svcName
		};
		services[svcName] = {
			loadBalancer: {
				servers: [{ url: `http://${u.container}:${u.port}` }]
			}
		};
	}

	const doc = {
		http: { routers, services }
	};

	const header = `# Traefik dynamic config - generated example.
# Mount as ./traefik/dynamic.yml and point Traefik --providers.file.filename at it.
# Add TLS / ACME on entrypoints for production (see https://doc.traefik.io/traefik/).
# Hosts use one label + apex, e.g. cinephage.${apex}

`;

	return header + stringify(doc, { lineWidth: 120, defaultStringType: 'PLAIN' });
}
