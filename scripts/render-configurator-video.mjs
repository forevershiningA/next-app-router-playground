import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderVideoScenario } from './video/capture-engine.mjs';
import { parseFormats, VIDEO_FORMATS } from './video/formats.mjs';
import { addInscriptionScenario } from './video/scenarios/add-inscription.mjs';
import { configuratorHeroScenario } from './video/scenarios/configurator-hero.mjs';
import { peterHiggsMemorialScenario } from './video/scenarios/peter-higgs-memorial.mjs';

const scenarios = new Map(
  [
    configuratorHeroScenario,
    addInscriptionScenario,
    peterHiggsMemorialScenario,
  ].map((scenario) => [scenario.id, scenario]),
);
const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

function readArgument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  if (process.argv.includes('--list')) {
    for (const scenario of scenarios.values())
      console.log(`${scenario.id}\t${scenario.title}`);
    console.log(`formats\t${Object.keys(VIDEO_FORMATS).join(', ')}`);
    return;
  }
  const scenarioId = readArgument('scenario') ?? 'configurator-hero';
  const scenario = scenarios.get(scenarioId);
  if (!scenario)
    throw new Error(
      `Unknown scenario: ${scenarioId}. Available scenarios: ${[...scenarios.keys()].join(', ')}`,
    );
  const formats = parseFormats(
    readArgument('formats'),
    scenario.defaultFormats,
  );
  const baseUrl =
    readArgument('base-url') ??
    process.env.VIDEO_BASE_URL ??
    process.env.HERO_VIDEO_BASE_URL ??
    'http://127.0.0.1:3100';
  const outputDir = path.resolve(
    rootDir,
    readArgument('output-dir') ?? path.join('public', 'videos'),
  );
  console.log(`Rendering ${scenario.id}: ${formats.join(', ')}`);
  const outputs = await renderVideoScenario({
    rootDir,
    outputDir,
    baseUrl,
    scenario,
    formats,
  });
  for (const output of outputs) console.log(`Created ${output.mp4Output}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
