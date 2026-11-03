import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
	title: 'Cinephage',
	tagline: 'One app to replace them all - self-hosted media management',
	favicon: 'img/logo.png',

	future: {
		v4: true
	},

	url: 'https://docs.cinephage.net',
	baseUrl: '/',

	organizationName: 'Cinephage',
	projectName: 'Cinephage-Docs',

	onBrokenLinks: 'throw',

	markdown: {
		hooks: {
			onBrokenMarkdownLinks: 'warn'
		}
	},

	i18n: {
		defaultLocale: 'en',
		locales: ['en']
	},

	presets: [
		[
			'classic',
			{
				docs: {
					sidebarPath: './sidebars.ts',
					routeBasePath: '/',
					editUrl: 'https://github.com/Cinephage/Cinephage-Docs/edit/main/',
					exclude: ['**/superpowers/**']
				},
				blog: false,
				theme: {
					customCss: './src/css/custom.css'
				}
			} satisfies Preset.Options
		]
	],

	plugins: [
		[
			'@easyops-cn/docusaurus-search-local',
			{
				hashed: true,
				language: ['en'],
				highlightSearchTermsOnTargetPage: true,
				explicitSearchResultPath: true,
				docsRouteBasePath: '/'
			}
		]
	],

	themeConfig: {
		image: 'img/logo.png',
		colorMode: {
			defaultMode: 'dark',
			respectPrefersColorScheme: true
		},
		navbar: {
			title: 'Cinephage',
			logo: {
				alt: 'Cinephage Logo',
				src: 'img/logo.png'
			},
			items: [
				{
					type: 'docSidebar',
					sidebarId: 'docsSidebar',
					position: 'left',
					label: 'Documentation'
				},
				{
					type: 'html',
					position: 'left',
					value:
						'<a href="/deploy" class="navbar__link">Deploy <span class="badge badge--secondary">Beta</span></a>'
				},
				{
					href: 'https://discord.gg/scGCBTSWEt',
					position: 'left',
					label: 'Discord'
				},
				{
					type: 'dropdown',
					label: 'Source Code',
					position: 'right',
					items: [
						{
							href: 'https://github.com/cinephage/cinephage',
							label: 'Cinephage (main)'
						},
						{
							href: 'https://github.com/cinephage/cinephage/tree/dev',
							label: 'Cinephage (dev)'
						},
						{
							href: 'https://github.com/cinephage/cinephage-Docs',
							label: 'Documentation Repo'
						}
					]
				}
			]
		},
		footer: {
			style: 'dark',
			links: [
				{
					title: 'Documentation',
					items: [
						{
							label: 'Getting Started',
							to: '/getting-started'
						},
						{
							label: 'Guides',
							to: '/guides'
						},
						{
							label: 'Reference',
							to: '/reference'
						}
					]
				},
				{
					title: 'Support',
					items: [
						{
							label: 'FAQ',
							to: '/support/faq'
						},
						{
							label: 'Troubleshooting',
							to: '/guides/deploy/troubleshooting'
						},
						{
							label: 'Roadmap',
							to: '/support/roadmap'
						},
						{
							label: 'Releases',
							to: '/support/releases'
						}
					]
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Discord',
							href: 'https://discord.gg/scGCBTSWEt'
						},
						{
							label: 'GitHub Discussions',
							href: 'https://github.com/cinephage/cinephage/discussions'
						},
						{
							label: 'Issues',
							href: 'https://github.com/cinephage/cinephage/issues'
						}
					]
				},
				{
					title: 'More',
					items: [
						{
							label: 'GitHub',
							href: 'https://github.com/cinephage/cinephage'
						},
						{
							label: 'Changelog',
							href: 'https://github.com/cinephage/cinephage/releases'
						}
					]
				}
			],
			copyright: `Copyright \u00A9 ${new Date().getFullYear()} Cinephage. Licensed under GPL-3.0. Built with Docusaurus.`
		},
		tableOfContents: {
			minHeadingLevel: 2,
			maxHeadingLevel: 3
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
			additionalLanguages: [
				'bash',
				'docker',
				'json',
				'yaml',
				'toml',
				'nginx',
				'properties',
				'ini'
			]
		}
	} satisfies Preset.ThemeConfig
};

export default config;
