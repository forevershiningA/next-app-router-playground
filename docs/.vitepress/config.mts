import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'DYO Documentation',
  description: 'Technical documentation for the DYO 3D Headstone Designer',
  base: './',
  outDir: './.vitepress/dist',
  srcExclude: ['backup/**', 'license.md'],
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/ico/favicon.png' }],
  ],

  themeConfig: {
    logo: '/ico/favicon.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'forevershining.org', link: 'https://forevershining.org/' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Configuration', link: '/configuration' },
        ],
      },
      {
        text: 'Application',
        items: [
          { text: 'Routes & API', link: '/routes' },
          { text: 'Components', link: '/components' },
          { text: 'State Management', link: '/state-management' },
        ],
      },
      {
        text: '3D Rendering',
        items: [
          { text: '3D Scene System', link: '/three-scene' },
        ],
      },
      {
        text: 'Data & Infrastructure',
        items: [
          { text: 'Database Schema', link: '/database-schema' },
          { text: 'Scripts & Tooling', link: '/scripts' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Store API', link: '/api-store' },
          { text: 'Utility Functions', link: '/api-utilities' },
          { text: 'Three.js Components', link: '/api-three' },
          { text: 'Auth, DB & API Routes', link: '/api-auth-db' },
          { text: 'Hooks & Constants', link: '/api-hooks-constants' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/' },
    ],

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
    },

    footer: {
      message: 'DYO — Design Your Own Headstone',
      copyright: '© Forever Shining. All rights reserved.',
    },
  },
})
