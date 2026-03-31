// Bronze Emblem data loader
// Sources: createJS/dyo/Data.js (EmblemsData), public/xml/en_EN/emblems.xml (sizes)

export type EmblemSize = {
  variant: number;
  label: string;
  widthMm: number;
  heightMm: number;
};

export type EmblemEntry = {
  id: string;
  name: string;
  thumbnailUrl: string;
  imageUrl: string;
};

/** Fixed emblem sizes from xml/en_EN/emblems.xml (product id="200") — height only, width is proportional */
export const EMBLEM_SIZES: EmblemSize[] = [
  { variant: 1, label: '50 mm', widthMm: 50, heightMm: 50 },
  { variant: 2, label: '75 mm', widthMm: 75, heightMm: 75 },
  { variant: 3, label: '100 mm', widthMm: 100, heightMm: 100 },
  { variant: 4, label: '150 mm', widthMm: 150, heightMm: 150 },
  { variant: 5, label: '220 mm', widthMm: 220, heightMm: 220 },
  { variant: 6, label: '300 mm', widthMm: 300, heightMm: 300 },
  { variant: 7, label: '400 mm', widthMm: 400, heightMm: 400 },
];

/** Default size variant when adding a new emblem */
export const DEFAULT_EMBLEM_SIZE_VARIANT = 3; // 100×100mm

/** All 236 emblem identifiers from createJS/dyo/Data.js EmblemsData */
const EMBLEM_IDS: string[] = [
  'br111l-horse-head', 'br111r-horse-head', 'br112-scotch-thistle', 'br113-scotch-thistle',
  'br114-tulips', 'br115l-gum-leaves', 'br115r-gum-leaves', 'br116l-dove-of-peace',
  'br116r-dove-of-peace', 'br118-bible', 'br119-jesus-brown', 'br119-jesus',
  'br120l-angel-kneeling', 'br120r-angel-kneeling', 'br121-fossicker', 'br122-football-soccer',
  'br123-spray-of-roses', 'br124-jockey-cap', 'br125l-gum-tree', 'br125r-gum-tree',
  'br126-angel', 'br127-aeroplane', 'br128l-motorbike', 'br128r-motorbike', 'br129-ivy',
  'br138-golfer-male', 'br139l-gum-leaves', 'br139r-gum-leaves', 'br140-bullock-team',
  'br141-beetle', 'br142-magpie', 'br145-heart', 'br146-mormon', 'br148l-footballer-rugby',
  'br148r-footballer-rugby', 'br150-waratah', 'br151-horse-head-and-shoe', 'br152l-shearer',
  'br152r-shearer', 'br153-cricketer-batsman', 'br154l-tennis-player', 'br154r-tennis-player',
  'br155-daffodils', 'br157l-ram', 'br157r-ram', 'br158-elephant', 'br160l-fisherman',
  'br161-crucifix', 'br162-wattle', 'br163-lilies', 'br164_butterfly_profile', 'br165-butterfly',
  'br166-gladioli', 'br167-child-in-hand', 'br168-mary-magdalene', 'br169-mary-and-child-standing',
  'br171-pansies', 'br172l-trotter', 'br172r-trotter', 'br173-cherubs', 'br174-ploughman',
  'br177-violets', 'br178-rose-long-stem', 'br179l-madonna-and-child', 'br179r-madonna-and-child',
  'br180-orchid', 'br181-waratah', 'br182-gum-leaves-and-blossoms', 'br183-truck', 'br184-lilies',
  'br185-daisy', 'br186-flannel-flowers', 'br187-wheat-sheaf', 'br189-cat-persian', 'br190-labrador',
  'br191-bull-horned', 'br192-dolphin', 'br197-fire-engine', 'br198-cat-general', 'br200-last-supper',
  'br2915-infant-of-prague', 'br300-daffodils-short', 'br301-bull-polled', 'br304-clown-and-drum',
  'br305-rosebud-stem-and-leaves', 'br310-kangaroo', 'br310l-kangaroo', 'br310r-kangaroo',
  'br311l-lion-rampant', 'br311r-lion-rampant', 'br312-key', 'br313-cat-sleeping', 'br314-bat',
  'br315l-firemans-axe', 'br315r-firemans-axe', 'br317-cricketer-bowler', 'br318-violin',
  'br319-dog-head', 'br321-dancing-couple', 'br324-bishops-mitre', 'br325-angel-face-and-wings',
  'br326-mary-and-infant-jesus', 'br328-st-patrick-medal', 'br332-see-i-have-carved-you',
  'br333-flannel-flowers', 'br334-curved-vase', 'br336-gum-leaf-and-nuts', 'br336gum-leaf-and-nuts',
  'br338-australia-remembers', 'br339-the-australian-army', 'br340-gwydir-regiment',
  'br341-royal-sussex-regiment', 'br342-polish-eagle', 'br343-st-vincent-de-paul',
  'br349l-footballer-afl', 'br349r-footballer-afl', 'br350-mary-the-ascension',
  'br358-cosmos-flower', 'br362-man-on-horse-trotting', 'br362l-man-on-horse-trotting',
  'br362l-man-on-horse', 'br363-dogs-two', 'br364-jesus-(without-cross)', 'br365-jesus-on-cross',
  'br369-ram-head', 'br371-chinese-dragon', 'br374-christmas-bells', 'br375-cricketer-batsman-front',
  'br378-guitar', 'br384-hands-with-rosary-and-cross', 'br389-puppy', 'br389-puppy_brown',
  'br390-seagull', 'br391-kitten-with-wool', 'br391-kitten_green', 'br392-bird-in-hands',
  'br392-hands-and-dove_brown', 'br393-mother-and-child', 'br394-sacred-heart-of-mary',
  'br396-violets', 'br398r-man-on-horse', 'br400-station-viii---gethsemane',
  'br400-station-viii-gethsemane', 'br4195-wattle', 'br4196-sacred-heart', 'br4198-climbing-rose',
  'br4199-lilyofvalley', 'br4200-dogwood-render', 'br4202-oak-1', 'br4204-maple--render',
  'br4206-maple-2', 'br4222--caring-hands', 'br4223-canadian-wheat2', 'br4224-chapel-romanesque',
  'br4225-church-on-the-hill', 'br4226-crucifixion', 'br4227-fairies-butterfly', 'br4228-fairy',
  'br4229-fairy-on-plant', 'br4230-flannel-flowers-(corner)', 'br4231-forever-springtime',
  'br4233--gabriel', 'br4234-graceful-memories', 'br4237-last-supper', 'br4238-lawn-bowler',
  'br4240--peacefulness', 'br4241-pieta', 'br4247-trees-left---canadian', 'br4248-trees-right---canadian',
  'br4249-mountain-scene---canadian-', 'br4279-schooner', 'br4281-welcoming-arms', 'br4283-footprints',
  'br4289-blank-book', 'br4292-stations-of-cross-1-jesus-is-condemned-to-death',
  'br4293-station-of-cross-2-jesus-is-given-his-cross', 'br4294-stations-of-cross-3-jesus-falls-1st-time',
  'br4295-stations-of-cross-4-jesus-meets-his-mother', 'br4297-sations-of-cross-5-simon-of-cyrene-carries-cross',
  'br4298-station-of-cross-6-veronica-wipes-the-face-of-jesus', 'br4299-stations-of-cross-7-jesus-falls-2nd-time',
  'br4300-stations-of-cross-8', 'br4301-stations-9', 'br4302-stations-10', 'br4302-stations-11',
  'br4304-station-of-cross-12', 'br4305-stations-of-cross-13', 'br4306-station-of-cross-14',
  'br4307-padre-pio', 'br4606-mary-and-child-standing-2', 'br4607-sacred-heart-jesus-2',
  'br4622-lady-of-mount-carmel', 'br4629-cowboy-hat---braided',
];

function humanize(id: string): string {
  return id
    .replace(/^br\d+[lr]?[-_]?/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\(|\)/g, '')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || id;
}

/** Load all emblem entries with thumbnail/image URLs */
export function loadEmblems(): EmblemEntry[] {
  return EMBLEM_IDS.map((id) => ({
    id,
    name: humanize(id),
    thumbnailUrl: `/png/emblems/xs/${id}.png`,
    imageUrl: `/png/emblems/m/${id}.png`,
  }));
}

/** Map of emblem ID → EmblemEntry for quick lookup */
export function createEmblemsMap(): Map<string, EmblemEntry> {
  return new Map(loadEmblems().map((e) => [e.id, e]));
}
