const role = (name) => ({ by: 'role', role: 'button', name, first: true });
const quickNav = (slug) => ({ by: 'quickNav', slug });

export const peterHiggsMemorialScenario = Object.freeze({
  id: 'peter-higgs-memorial',
  title: 'Designing a memorial for Peter Higgs',
  route: '/laser-etched-black-granite-headstone/select-images?capture=social',
  outputBaseName: 'social-peter-higgs-memorial',
  defaultFormats: ['vertical'],
  maxDurationSeconds: 40,
  posterTimeSeconds: 1.4,
  steps: [
    { action: 'pause', ms: 900 },
    {
      action: 'caption',
      eyebrow: 'Remembering remarkable lives',
      title: 'A memorial for Peter Higgs',
      body: 'A concept created in the Forever Shining 3D memorial designer.',
      afterMs: 1900,
    },
    {
      action: 'caption',
      eyebrow: 'Step 1',
      title: 'Choose a lasting portrait',
      body: 'Laser etching transforms a photograph into a permanent granite image.',
      afterMs: 400,
    },
    { action: 'click', target: role('Granite Image'), afterMs: 500 },
    {
      action: 'upload',
      target: { by: 'css', selector: '#image-upload' },
      file: 'assets/video-sources/peter-higgs.jpg',
    },
    {
      action: 'waitForVisible',
      target: role('Add Cropped Image to Headstone'),
      timeout: 20_000,
    },
    {
      action: 'caption',
      eyebrow: 'Step 2',
      title: 'Frame the portrait',
      body: 'The crop and finish are previewed before the image is placed.',
      afterMs: 500,
    },
    { action: 'click', target: role(/^Square$/i), afterMs: 500 },
    {
      action: 'dragRange',
      target: { by: 'css', selector: 'input[type="range"]', first: true },
      fraction: 0.72,
      afterMs: 500,
    },
    {
      action: 'click',
      target: role('Add Cropped Image to Headstone'),
      afterMs: 1400,
    },
    {
      action: 'fill',
      target: {
        by: 'css',
        selector: 'input[inputmode="decimal"]',
        first: true,
      },
      value: '240',
      afterMs: 900,
    },
    {
      action: 'dragCanvas',
      from: { x: 0.57, y: 0.72 },
      delta: { x: 0, y: -125 },
      afterMs: 800,
    },
    {
      action: 'caption',
      eyebrow: 'Step 3',
      title: 'Tell the story in a few words',
      body: 'A name, a lifetime and a line that reflects what they gave the world.',
      afterMs: 500,
    },
    { action: 'click', target: quickNav('inscriptions') },
    { action: 'waitForUrl', url: /\/inscriptions(?:\?|$)/ },
    {
      action: 'waitForVisible',
      target: { by: 'css', selector: '#inscriptionTextInput' },
    },
    {
      action: 'fill',
      target: { by: 'css', selector: '#inscriptionTextInput' },
      value:
        'Peter Higgs\n1929 – 2024\nA life devoted to\nunderstanding the universe',
      afterMs: 700,
    },
    { action: 'click', target: role('Add Inscription'), afterMs: 900 },
    {
      action: 'dragRange',
      target: { by: 'css', selector: 'input[type="range"]', first: true },
      fraction: 0.07,
      afterMs: 700,
    },
    {
      action: 'caption',
      eyebrow: 'Created in 3D',
      title: 'Every life deserves a personal tribute',
      body: 'Design, refine and view the memorial from every angle.',
      afterMs: 600,
    },
    { action: 'click', target: role('Rotate right'), fast: true, afterMs: 900 },
    { action: 'click', target: role('Rotate left'), fast: true, afterMs: 800 },
    { action: 'hideCaption', afterMs: 400 },
    { action: 'clickCanvas', at: { x: 0.92, y: 0.18 }, afterMs: 2600 },
  ],
});
