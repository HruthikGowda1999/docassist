import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Fix __dirname and require for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Iconify imports
import {
  cleanupSVG,
  importDirectory,
  isEmptyColor,
  parseColors,
  runSVGO
} from '@iconify/tools';

import {
  getIcons,
  getIconsCSS,
  stringToIcon
} from '@iconify/utils';

// Icon sources
const sources = {
  json: [
    require.resolve('@iconify/json/json/ri.json'),

    {
      filename: require.resolve('@iconify/json/json/line-md.json'),
      icons: ['home-twotone-alt', 'github', 'document-list', 'document-code', 'image-twotone']
    }
  ],
  icons: [
    'bx-basket',
    'bi-airplane-engines',
    'tabler-anchor',
    'uit-adobe-alt',
    'twemoji-auto-rickshaw'
  ],
  svg: [
    // Uncomment and add your SVG directories if needed
    /*
    {
      dir: 'src/assets/iconify-icons/svg',
      monotone: false,
      prefix: 'custom'
    },
    {
      dir: 'src/assets/iconify-icons/emojis',
      monotone: false,
      prefix: 'emoji'
    }
    */
  ]
};

// File to save bundle to
const target = join(__dirname, 'generated-icons.css');

(async function () {
  // Create directory for output if missing
  try {
    await fs.mkdir(dirname(target), { recursive: true });
  } catch (err) {
    // Ignore if already exists
  }

  const allIcons = [];

  // Convert sources.icons to sources.json
  if (sources.icons) {
    const sourcesJSON = sources.json ? sources.json : (sources.json = []);
    const organizedList = organizeIconsList(sources.icons);

    for (const prefix in organizedList) {
      const filename = require.resolve(`@iconify/json/json/${prefix}.json`);

      sourcesJSON.push({
        filename,
        icons: organizedList[prefix]
      });
    }
  }

  // Bundle JSON files
  if (sources.json) {
    for (let i = 0; i < sources.json.length; i++) {
      const item = sources.json[i];
      const filename = typeof item === 'string' ? item : item.filename;
      const content = JSON.parse(await fs.readFile(filename, 'utf8'));

      if (typeof item !== 'string' && item.icons?.length) {
        const filtered = getIcons(content, item.icons);

        if (!filtered) throw new Error(`Cannot find required icons in ${filename}`);
        allIcons.push(filtered);
      } else {
        allIcons.push(content);
      }
    }
  }

  // Bundle custom SVGs
  if (sources.svg) {
    for (let i = 0; i < sources.svg.length; i++) {
      const source = sources.svg[i];
      const iconSet = await importDirectory(source.dir, { prefix: source.prefix });

      await iconSet.forEach(async (name, type) => {
        if (type !== 'icon') return;
        const svg = iconSet.toSVG(name);

        if (!svg) {
          iconSet.remove(name);
          
return;
        }

        try {
          await cleanupSVG(svg);

          if (source.monotone) {
            await parseColors(svg, {
              defaultColor: 'currentColor',
              callback: (attr, colorStr, color) => {
                return !color || isEmptyColor(color) ? colorStr : 'currentColor';
              }
            });
          }

          await runSVGO(svg);
        } catch (err) {
          console.error(`Error parsing ${name} from ${source.dir}:`, err);
          iconSet.remove(name);
          
return;
        }

        iconSet.fromSVG(name, svg);
      });

      allIcons.push(iconSet.export());
    }
  }

  // Generate CSS
  const cssContent = allIcons
    .map(iconSet => getIconsCSS(iconSet, Object.keys(iconSet.icons), { iconSelector: '.{prefix}-{name}' }))
    .join('\n');

  // Save CSS
  await fs.writeFile(target, cssContent, 'utf8');
  console.log(`✅ Saved CSS to ${target}`);
})().catch(err => {
  console.error('❌ Error:', err);
});

/**
 * Helper: Sort icon names by prefix
 */
function organizeIconsList(icons) {
  const sorted = Object.create(null);

  icons.forEach(icon => {
    const item = stringToIcon(icon);

    if (!item) return;

    const prefix = item.prefix;
    const name = item.name;
    const prefixList = sorted[prefix] || (sorted[prefix] = []);

    if (!prefixList.includes(name)) {
      prefixList.push(name);
    }
  });

  return sorted;
}
