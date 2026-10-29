import type { MemoryId, RoomObjectId } from './room';
import type { Sprite } from './sprites';

/** Un píxel de sprite mide 2 unidades del SVG en todos los objetos: el pixel art queda parejo. */
export const PIXEL_UNITS = 2;

/**
 * Dibujos originales de los objetos de la habitación (RF-29, RNF-2). Cada uno mide lo mismo
 * que su lugar en `room.ts`, dividido por PIXEL_UNITS. La tele no está: ya la dibuja la escena.
 */
export const ROOM_SPRITES: Readonly<Record<Exclude<RoomObjectId, 'tv'>, Sprite>> = {
  // Ventana a Boedo: la ciudad de noche, con la luna
  window: {
    palette: {
      x: '#2e1f14',
      u: '#5a3d25',
      l: '#7a5434',
      s: '#101a44',
      z: '#1b2c6a',
      m: '#f4f6ff',
      q: '#b9c2dc',
      b: '#0a0e22',
      y: '#ffd23f'
    },
    rows: [
      '.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.',
      '.xllllllllllllllllllllllllllllllllllllx.',
      '.xlxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxux.',
      '.xlxsssssssssssssssuusssssssssssssssxux.',
      '.xlxsssssssssssssmsuusssssssssssssssxux.',
      '.xlxsssmsssssssssssuusssssssmmmsssssxux.',
      '.xlxsssssssssssssssuussmsssmmmmmssssxux.',
      '.xlxsssssssssssssssuusssssmmqmmmmsssxux.',
      '.xlxssssssssmssssssuusssssmmmmmmmsssxux.',
      '.xlxsssssssssssssssuusssssmmmqqmmsssxux.',
      '.xlxsssssssssssssssuussssssmmmmmssssxux.',
      '.xlxsssssmsssssssssuussssmssmmmsssssxux.',
      '.xlxzzzzzzzzzzzzzzzuuzzzzzzzzzzzzzzzxux.',
      '.xlxzzzzzzzzzzzzbzzuuzzzzzzzzzzzzzmzxux.',
      '.xlxzzmzzzzzzzzzbzzuuzzzzzzzzzzzzzzzxux.',
      '.xlxuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuxux.',
      '.xlxuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuxux.',
      '.xlxzzzzzzzzzzbbbbbuuzzzzzzzzzzzzzzzxux.',
      '.xlxzzzzzzzzzzbybybuuzzzbbbbbbbzzzzzxux.',
      '.xlxbbbbbbzzzzbbbbbuuzzzbbbbbbbzzzzzxux.',
      '.xlxbbbbbbzzzzbbbbbuuzzzbybybbbzzzzzxux.',
      '.xlxbybybbzzzzbybbbuubbbbbbbbbbzzzzzxux.',
      '.xlxbbbbbbbbbbbbbbbuubbbbbbbbybzzzzzxux.',
      '.xlxbbbbbbbbbbbbbbyuubybbbbbbbbbbbbbxux.',
      '.xlxbybbbbbybbbbbbbuubbbbbbbbbbbbbbbxux.',
      '.xlxbbbbbbbbbbbbbbbuubbbbybbbbbbybbbxux.',
      '.xlxbbbbybbbbbbbybbuubbbbbbbbbbbbbbbxux.',
      '.xlxbbbbbbbbybbbbbbuubbbbbbbybbbbbybxux.',
      '.xlxbbbbbbbbbbbbbbbuubbbbbbbbbbbbbbbxux.',
      '.xlxbbbbbbbbbbbbbbbuubbbbbbbbbbbbbbbxux.',
      '.xlxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxux.',
      '.xluuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuux.',
      '.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.',
      'llllllllllllllllllllllllllllllllllllllll',
      'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu'
    ]
  },
  // Bandera argentina, sujeta con dos chinches
  flag: {
    palette: { c: '#74acdf', w: '#f4f6ff', y: '#f6b40e', o: '#85340a', p: '#9aa3bf' },
    rows: [
      'cpccccccccccccccccccccccccccpc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'wwwwwwwwwwwwwoyyowwwwwwwwwwwww',
      'wwwwwwwwwwwwoyyyyowwwwwwwwwwww',
      'wwwwwwwwwwwwyyyyyywwwwwwwwwwww',
      'wwwwwwwwwwwwyyyyyywwwwwwwwwwww',
      'wwwwwwwwwwwwoyyyyowwwwwwwwwwww',
      'wwwwwwwwwwwwwoyyowwwwwwwwwwwww',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc',
      'cccccccccccccccccccccccccccccc'
    ]
  },
  // Retrato de Favaloro: dibujo propio, no una foto (RNF-2)
  favaloro: {
    palette: {
      n: '#5a3d25',
      g: '#c9962e',
      b: '#2a3566',
      s: '#e2b48a',
      h: '#b98458',
      w: '#d9dde8',
      r: '#5a5a6a',
      k: '#111114',
      l: '#cfe0f5',
      m: '#8a3b2e',
      u: '#1d2340',
      e: '#f4f6ff',
      t: '#3a5ad8'
    },
    rows: [
      'nnnnnnnnnnnnnnnnnnnn',
      'nggggggggggggggggggn',
      'ngbbbbbbbbbbbbbbbbgn',
      'ngbbbbbbbbbbbbbbbbgn',
      'ngbbbbbssssssbbbbbgn',
      'ngbbbbssssssssbbbbgn',
      'ngbbbwsssssssswbbbgn',
      'ngbbwwsssssssswwbbgn',
      'ngbbwrrrrrrrrrrwbbgn',
      'ngbbwrlkrssrklrwbbgn',
      'ngbbwrrrrssrrrrwbbgn',
      'ngbbbwssshhssswbbbgn',
      'ngbbbbssssssssbbbbgn',
      'ngbbbbsssmmsssbbbbgn',
      'ngbbbbbhsssshbbbbbgn',
      'ngbbbbbbssssbbbbbbgn',
      'ngbbuuuuetteuuuubbgn',
      'ngbuuuuuetteuuuuubgn',
      'nguuuuuuetteuuuuuugn',
      'nguuuuuuuttuuuuuuugn',
      'nguuuuuuuttuuuuuuugn',
      'nguuuuuuuttuuuuuuugn',
      'nguuuuuuuuuuuuuuuugn',
      'nguuuuuuuuuuuuuuuugn',
      'nggggggggggggggggggn',
      'nnnnnnnnnnnnnnnnnnnn'
    ]
  },
  // Póster de San Lorenzo: franjas azulgrana y "CASLA", sin el escudo (RNF-2)
  poster: {
    palette: { w: '#e8e4d8', b: '#1c2d7a', r: '#b3122e', t: '#9aa3bf' },
    rows: [
      'wtttwwwwwwwwwwwwwwwwwtttw',
      'wtttrrrrbbbrrrbbbrrrrtttw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wwwwwwwwwwwwwwwwwwwwwwwww',
      'wwwbbbwwrwwbbbwrwwwwbwwww',
      'wwwbwwwrwrwbwwwrwwwbwbwww',
      'wwwbwwwrrrwbbbwrwwwbbbwww',
      'wwwbwwwrwrwwwbwrwwwbwbwww',
      'wwwbbbwrwrwbbbwrrrwbwbwww',
      'wwwwwwwwwwwwwwwwwwwwwwwww',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wbbbrrrrbbbrrrbbbrrrrbbbw',
      'wwwwwwwwwwwwwwwwwwwwwwwww'
    ]
  },
  // Estante de trofeos: dos copas de los JJBB, la medalla de la BA Gaming y Camille
  trophies: {
    palette: {
      x: '#2e1f14',
      u: '#5a3d25',
      l: '#7a5434',
      y: '#ffd23f',
      h: '#fff3b0',
      o: '#c08a10',
      n: '#3a2414',
      b: '#1d3fd1',
      r: '#c42b2b',
      s: '#c9cfe0',
      q: '#8f97b0',
      j: '#3b3550',
      f: '#e7c9b0',
      v: '#2b3a7a',
      a: '#8fb6ff',
      e: '#c0c8e0',
      k: '#111114'
    },
    rows: [
      '.............................................',
      '.............................................',
      '......................................jj.....',
      '.....................................jjjj....',
      '.....................................jffj....',
      '.....................................ffff....',
      '...yyyyyyyy...yyyyyyyy................ff.....',
      '..yyhyyyyoyy.yyhyyyyoyy.............vvvvvv...',
      '..y.hyyyyo.y.y.hyyyyo.y............vvavvavv..',
      '..y.hyyyyo.y.y.hyyyyo.y..bb...rr...v.vvvv.v..',
      '...yhyyyyoy...yhyyyyoy....bb.rr....f.vvvv.f..',
      '....hyyyyo.....hyyyyo......bbr.......vvvv....',
      '.....yyyo.......yyyo........r........v..v....',
      '......yy.........yy........sss......ee..ee...',
      '......yo.........yo.......shssq.....e....e...',
      '.....yyyy.......yyyy.....shssssq...e......e..',
      '....nnnnnn.....nnnnnn....shssssq..e........e.',
      '....nyyyyn.....nyyyyn.....sssqq..kkkkkkkkkkk.',
      '....nnnnnn.....nnnnnn......sqq....kkkkkkkkk..',
      'lllllllllllllllllllllllllllllllllllllllllllll',
      'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    ]
  },
  // Estante de consolas: cada consola con la caja de su juego, sin logos ni carátulas (RNF-2)
  consoles: {
    palette: {
      l: '#7a5434',
      u: '#5a3d25',
      k: '#111114',
      e: '#e4e4ec',
      r: '#c42b2b',
      y: '#ffd23f',
      g: '#3a3a44',
      h: '#4a4a58',
      s: '#c0c8e0',
      b: '#3a7bff',
      c: '#74acdf',
      o: '#e8743b',
      n: '#6b3e1e',
      p: '#f08a5d',
      v: '#3fb950',
      z: '#2a8a3a',
      a: '#2a2a33',
      t: '#0f4c5c',
      q: '#2a7f8f',
      w: '#f4f6ff',
      d: '#8a5a14',
      m: '#5e3c0e',
      f: '#c8c0a8'
    },
    rows: [
      '.................................................................',
      '.................................................................',
      '..kkkkkkkk.....kkkkkkkk.....kkkkkkkk.....kkkkkkkk.....kkkkkkkk...',
      '..kcccccck.....kooooook.....kpvvvvpk.....ktyyyytk.....kvvvvvvk...',
      '..kccrrcck.....kooyyook.....kvvpvpvk.....kttwwttk.....kvzvvzvk...',
      '..kcrrrrck.....koyyyyok.....kppnpppk.....kttwwttk.....kdvddvdk...',
      '..kcrrrrck.....koonnook.....kppnpppk.....kttrrttk.....kddddddk...',
      '..kccrrcck.....konnnnok.....kpppnppk.....kttwwttk.....kdmddmdk...',
      '..kcccwcck.....knnnnnnk.....kpppnppk.....ktwwwwtk.....kdddmddk...',
      '..kcccwcck.....kooooook.....kaaaaaak.....kqqqqqqk.....kdmddddk...',
      '..kbbbbbbk.....krrrrrrk.....kaayyaak.....ktqtqtqk.....kddddmdk...',
      '..kkkkkkkk.....kkkkkkkk.....kkkkkkkk.....kkkkkkkk.....kkkkkkkk...',
      '....yyyyy.................................kkkkkkk................',
      '.eeeyyyyyeee...kkkkkkkkk...kkkkkkkkkkk...kkhkkkkkk...fffffffffff.',
      '.eeeeeeeeeee..kkkgggggkkk..kgggggggggk..kkhkkkkkkkk..fkkkkffffff.',
      '.rrrrrrrrrrr..kkgkkkkkgkk..kkkkkkkkkkk..kkkkkkkkkkk..fffffffffvf.',
      '.rwrrrrrrrwr..krkgggggkkk..kgggggggggk..sssssssssss..fffffffffff.',
      '.kkkkkkkkkkk..kkkkkkkkkkk..kkkkkkkkkbk..kkkkkkkkkkk..kkkkkkkkkkk.',
      'lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll',
      'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu'
    ]
  },
  // PC: monitor con código de colores, gabinete con luces y teclado
  pc: {
    palette: {
      k: '#2b2b30',
      h: '#4a4a58',
      n: '#06081a',
      b: '#3a7bff',
      w: '#f4f6ff',
      y: '#ffd23f',
      v: '#3fb950',
      g: '#18181c',
      e: '#9aa3bf',
      q: '#6a7290'
    },
    rows: [
      'kkkkkkkkkkkkkkkkkkkkkk..........',
      'khhhhhhhhhhhhhhhhhhhhk..........',
      'kknnnnnnnnnnnnnnnnnnkk..........',
      'kknbbbbnwwwwwwnnnnnnkk..........',
      'kknnnnnnnnnnnnnnnnnnkk..........',
      'kknnnyyyyynwwwwnnnnnkk..........',
      'kknnnnnnnnnnnnnnnnnnkk..........',
      'kknnnvvvnwwwwwwwnnnnkk..........',
      'kknnnnnnnnnnnnnnnnnnkk..hhhhhhhh',
      'kknnnnnyyyyynbbbnnnnkk..kkkkkkkk',
      'kknnnnnnnnnnnnnnnnnnkk..kkggggkk',
      'kknnnwwwwwwnnnnnnnnnkk..kkkkkkkk',
      'kknbbnnnnnnnnnnnnnnnkk..kkggggkk',
      'kknnnnnnnnnnnnnnnnnnkk..kkkkkkkk',
      'kkkkkkkkkkkkkkkkkkkkkk..kkkkkkkk',
      'kkkkkkkkkkkkkkkkkkvkkk..kggggggk',
      'kkkkkkkkkkkkkkkkkkkkkk..kggggggk',
      '.........kkkk...........kggbbbgk',
      '.........kkkk...........kgbbbbbk',
      '.........kkkk...........kgbbgbbk',
      '......kkkkkkkkkk........kgbbbbbk',
      '........................kggbbbgk',
      '........................kggggggk',
      '........................kkkkkkkk',
      '........................kkkkkkkk',
      '.eeeeeeeeeeeeeeeeeeee...kkkkkkkk',
      '.eqeqeqeqeqeqeqeqeqee...kkkkkkkk',
      '.eeqeqeqeqeqeqeqeqeqe.eekkkkkkvk',
      '.qqqqqqqqqqqqqqqqqqqq.eekkkkkkkk',
      '........................kkkkkkkk'
    ]
  },
  // Mate con bombilla y taza de café humeante
  mate: {
    palette: {
      s: '#c0c8e0',
      r: '#c9962e',
      m: '#7a4a28',
      v: '#5f8a2a',
      h: '#a86b3c',
      d: '#4a2a14',
      q: '#9aa3bf',
      w: '#e8e8f0',
      c: '#4a2a14',
      u: '#1d3fd1'
    },
    rows: [
      '.....s......q.....',
      '.....s.......q.q..',
      '.....s......q.q...',
      '.....s.......q.q..',
      '.rrrrsr...........',
      'mvvvvsvm..........',
      'mmmmmmmm..wccccw..',
      'mmhmmmmm..wwwwwww.',
      'mmhmmmmm..wwwwww.w',
      'mmmmmmmm..uuuuuu.w',
      '.mmmmmm...wwwwwww.',
      '..mmmm....wwwwww..',
      '...dd......wwww...'
    ]
  },
  // Tocadiscos sobre un mueble con discos, sin portadas reales (RNF-2)
  recordPlayer: {
    palette: {
      x: '#2e1f14',
      u: '#5a3d25',
      l: '#7a5434',
      k: '#111114',
      g: '#2a2a33',
      r: '#c42b2b',
      s: '#c0c8e0',
      y: '#ffd23f',
      b: '#1d3fd1',
      w: '#f4f6ff',
      v: '#3fb950'
    },
    rows: [
      '..............................',
      '........................s.....',
      '........................s.....',
      'llllllkkkkkkkkkkkkkllllsggllll',
      'llllkkggggkrrrkkkkkkksslggllll',
      'llllkkkkkkkrrrkggggkklllllllll',
      'llllllkkkkkkkkkkkkklllllllllll',
      'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
      'uuuuuuuuuuuuuuuuuuuuuuuuuyuyuu',
      'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuu',
      '.xxxxxxxxxxxxxxxxxxxxxxxxxxxx.',
      '.uuuuuuuuuuuuuuuuuuuuuuuuuuuu.',
      '.uuxxxxxxxxxxxxxxxxxxxxxxxxuu.',
      '.uuxbbxyyxrrxwwxvvxbbxrrxyyuu.',
      '.uuxbbxyyxrrxwwxvvxbbxrrxyyuu.',
      '.uuxbbxyyxrrxwwxvvxbbxrrxyyuu.',
      '.uuxbbxyyxrrxwwxvvxbbxrrxyyuu.',
      '.uuxbbxyyxrrxwwxvvxbbxrrxyyuu.',
      '.uuxbbxyyxrrxwwxvvxbbxrrxyyuu.',
      '.uuuuuuuuuuuuuuuuuuuuuuuuuuuu.',
      '..xx......................xx..',
      '..xx......................xx..'
    ]
  },
  // Globo terráqueo con su aro y su pie
  globe: {
    palette: { o: '#1d3fd1', v: '#3fb950', h: '#5b7cf0', g: '#c9962e', n: '#5a3d25' },
    rows: [
      '..........ggggg.....',
      '........ooooo.ggg...',
      '......vvooooooo.gg..',
      '.....vhvoooooovv.g..',
      '....vhvooooooovvv.g.',
      '...oovvoooooooovoo.g',
      '...ohovooooooooooo.g',
      '..ooooooooooooooooog',
      '..ooooooooovvoooooog',
      '..oooooooovvvvooooog',
      '..oooooooovvvvvoooog',
      '..ooooooooovvvvoooog',
      '...oooooooovvvoooo.g',
      '...ooooooooovvoooo.g',
      '....oooooooovoooo.g.',
      '.....ooooooooooo.g..',
      '......ooooooooo.gg..',
      '........ooooo.ggg...',
      '...........gggg.....',
      '.........nn.........',
      '.........nn.........',
      '.........nn.........',
      '.........nn.........',
      '.........nn.........',
      '.........nn.........',
      '.........nn.........',
      '.........nn.........',
      '.....nnnnnnnnnn.....',
      '.....nnnnnnnnnn.....',
      '...nnnnnnnnnnnnnn...',
      '...nnnnnnnnnnnnnn...',
      '...nn..........nn...',
      '...nn..........nn...'
    ]
  },
  // Oso de peluche sentado, con moño
  bear: {
    palette: { b: '#8a5a14', l: '#c08a50', k: '#111114', r: '#c42b2b' },
    rows: [
      '..bbb.......bbb...',
      '..blbbbbbbbbbblb..',
      '..bbbbbbbbbbbbbb..',
      '...bbkbbbbbbkbb...',
      '...bbbbllllbbbb...',
      '...bbbllkkllbbb...',
      '....bbllllllbb....',
      '.....bbbbbbbb.....',
      '...bbbbrrrrbbbb...',
      '..bbbbbbrrbbbbbb..',
      '.bbbbbllllllbbbbb.',
      '.bbb.bllllllb.bbb.',
      '.bbb.bllllllb.bbb.',
      '..b..bllllllb..b..',
      '.....bbllllbb.....',
      '....bbbbbbbbbb....',
      '...bbbbb..bbbbb...',
      '..bblllb..blllbb..',
      '..bblllb..blllbb..',
      '..bbbbbb..bbbbbb..',
      '..................'
    ]
  },
  // Pocho: perro chico y negro
  pocho: {
    palette: { k: '#1a1a22', h: '#4a4a5c', w: '#f4f6ff', r: '#c42b2b', p: '#ff7fb6' },
    rows: [
      '........h.h',
      'h.......hkh',
      '.h.....hkwk',
      '..hhhhrkkkp',
      '..kkkkkrkk.',
      '..kkkkkkk..',
      '..kkkkkkk..',
      '..k.k..k.k.',
      '..k.k..k.k.'
    ]
  },
  // Negra: perra negra y grande, de orejas caídas
  negra: {
    palette: {
      k: '#1a1a22',
      h: '#4a4a5c',
      w: '#f4f6ff',
      r: '#c42b2b',
      p: '#ff7fb6',
      e: '#2a2a34',
      n: '#000000'
    },
    rows: [
      '.....................',
      '...............khhhh.',
      '...............eekwk.',
      'h..............eekkkn',
      '.h............keekkkk',
      '.h............keekkkk',
      '..hhhhhhhhhhhhkee..p.',
      '...kkkkkkkkkkkrrr....',
      '...kkkkkkkkkkkkkk....',
      '...kkkkkkkkkkkkkk....',
      '...kkkkkkkkkkkkkk....',
      '...kkkkkkkkkkkkkk....',
      '....kkkkkkkkkkkkk....',
      '....kk.kk..kk.kk.....',
      '....kk.kk..kk.kk.....',
      '....kk.kk..kk.kk.....',
      '....kk.kk..kk.kk.....',
      '...kkkkkk.kkk.kkk....'
    ]
  },
  // Pelota de fútbol
  ball: {
    palette: { w: '#f4f6ff', k: '#111114', g: '#9aa3bf' },
    rows: [
      '...www...',
      '.wwkkkww.',
      '.wwkkkwg.',
      'wkwwwwwkg',
      'kkwwwwwkk',
      'wkwwwwwkg',
      '.wwkkkwg.',
      '.wwwkwgg.',
      '...wgg...'
    ]
  },
  // Raqueta de tenis con su pelota
  racket: {
    palette: { r: '#c42b2b', w: '#e8e8f0', k: '#111114', y: '#d4e83a', z: '#f4f6ff' },
    rows: [
      '...............',
      '..rrrrr........',
      '.rw.w.wr.......',
      'rwwwwwwwr......',
      'r.w.w.w.r......',
      'rwwwwwwwrrrkkkk',
      'r.w.w.w.rrrkkkk',
      'rwwwwwwwr......',
      'r.w.w.w.r......',
      '.rwwwwwr.......',
      '..rrrrr....yy..',
      '..........yyyy.',
      '..........yzyy.',
      '...........yy..'
    ]
  },
  // Flaco: galgo gris, largo y finito
  flaco: {
    palette: { g: '#8a8fa3', d: '#5a5e70', k: '#111114', r: '#c42b2b' },
    rows: [
      '.......................',
      '.................dd....',
      '.................gggg..',
      '.................ggkg..',
      '...............gggggggg',
      '...............ggg..ggk',
      '...ggggggggggggrrg.....',
      '..gggggggggggggrrg.....',
      '.g.gggggggggggggg......',
      '.g.gggg.....ggggg......',
      '.g..g.d.....ggggg......',
      '..g.g.d.......g.d......',
      '....g.d.......g.d......',
      '....g.d.......g.d......',
      '....g.d.......g.d......',
      '....g.d.......g.d......',
      '....g.d.......g.d......',
      '...dd.dd.....dd.dd.....'
    ]
  },
  // Nymeria: gata gorda y peluda, media atigrada en marrón, negro y beige
  nymeria: {
    palette: { b: '#8a5a30', k: '#2a1a10', e: '#d9b98a', y: '#c8d84a', p: '#ff7fb6', w: '#f4f6ff' },
    rows: [
      '..b.........b...',
      '..bb.......bb...',
      '..bkbbbbbbbkb...',
      '..bbybbbbbybb...',
      'wwbbbbbpbbbbbww.',
      '..beeeeeeeeeb...',
      '.bbbeeeeeeebbb..',
      'bkbbeeeeeeebbkb.',
      'bbkbeeeeeeebkbb.',
      'bkbbeeeeeeebbkb.',
      'bbkbeeeeeeebkbbk',
      'bkbbeeeeeeebbkbk',
      '.bbbbeeeeebbbbbk',
      '.bebbbbbbbbbbebk',
      '..ee........eekk'
    ]
  }
};

/**
 * Ventana del Modo Ciclón (RF-71): Boedo con la cancha llena, las torres de luz prendidas y la
 * hinchada de azul y de grana. Sin escudo ni nombres (RNF-2). Mide lo mismo que la ventana.
 */
export const CYCLONE_WINDOW: Sprite = {
  palette: {
    x: '#2e1f14',
    u: '#5a3d25',
    l: '#7a5434',
    s: '#101a44',
    g: '#26398a',
    m: '#f4f6ff',
    t: '#6b7088',
    b: '#0a0e22',
    y: '#ffd23f',
    k: '#18181c',
    a: '#2f4fd0',
    r: '#c8203f',
    e: '#e2b48a',
    v: '#3fb950'
  },
  rows: [
    '.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.',
    '.xllllllllllllllllllllllllllllllllllllx.',
    '.xlxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxux.',
    '.xlxsssssssssssssssuusssssssssssssssxux.',
    '.xlxmmmmmmsssssssssuusssssssssmmmmmmxux.',
    '.xlxmmmmmmsssssssssuusssssssssmmmmmmxux.',
    '.xlxttttttsssssssssuusssssssssttttttxux.',
    '.xlxssttsssssssssssuusssssssssssttssxux.',
    '.xlxssttsssssssssssuusssssssssssttssxux.',
    '.xlxsgttsgsssgsssgsuugsssgsssgssttssxux.',
    '.xlxggttgggsgggsggguuggsgggsgggsttgsxux.',
    '.xlxbbttggggggggggguugggggggggggttggxux.',
    '.xlxbbttggggggggggguugggggggggggttbbxux.',
    '.xlxybttggggggggggguugggggggggggttbbxux.',
    '.xlxbbttggggggggggguugggggggggggttbyxux.',
    '.xlxuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuxux.',
    '.xlxuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuxux.',
    '.xlxbyttggtrrggtaaguuggtrrggtaagttbbxux.',
    '.xlxbbttsstsssstsssuusstsssstsssttybxux.',
    '.xlxbbkkkkkkkkkkkkkuukkkkkkkkkkkkkbbxux.',
    '.xlxbbaaaerrreaaaeruueaaaerrreaaaebbxux.',
    '.xlxybaeaarerraeaaruuraeaarerraeaabbxux.',
    '.xlxbbrrreaaaerrreauuerrreaaaerrrebyxux.',
    '.xlxbbrerraeaarerrauuarerraeaarerrbbxux.',
    '.xlxbbaaaerrreaaaeruueaaaerrreaaaebbxux.',
    '.xlxbykkkkkkkkkkkkkuukkkkkkkkkkkkkbbxux.',
    '.xlxbbmmmmmmmmmmmmmuummmmmmmmmmmmmbbxux.',
    '.xlxbbvvvvvvvvvvvvvuuvvvvvvvvvvvvvybxux.',
    '.xlxbbvvvvvvvmvvvvvuuvvvvvvvvvvvvvbbxux.',
    '.xlxbbvvvvvvvvvvvvvuuvvvvvvvvvvvvvbbxux.',
    '.xlxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxux.',
    '.xluuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuux.',
    '.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.',
    'llllllllllllllllllllllllllllllllllllllll',
    'uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu'
  ]
};

/** Todos los recuerdos miden lo mismo, así la caja de diálogo no cambia de tamaño. */
export const MEMORY_SIZE = { width: 32, height: 24 };

/**
 * Recuerdos de los diálogos (RF-37): ilustraciones originales con marco de foto instantánea.
 * Reemplazan a las fotos del portfolio anterior, que eran de terceros (RNF-2).
 */
export const MEMORY_SPRITES: Readonly<Record<MemoryId, Sprite>> = {
  // El equipo campeón levantando la copa
  team: {
    palette: {
      f: '#f4f6ff',
      b: '#1d3fd1',
      y: '#ffd23f',
      s: '#e2b48a',
      n: '#3a2414',
      r: '#c42b2b',
      k: '#18181c',
      g: '#2b2119'
    },
    rows: [
      'ffffffffffffffffffffffffffffffff',
      'fbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbf',
      'fbbbbbbbbybbfbbbbbbbybbbbbbbbbbf',
      'fbbbybbbbbbbbbbbbbbbbbbbybbbbbbf',
      'fbbbbbbbbbbbbbyyyyfbbbbbbbbbbbbf',
      'fbbbbbbbbbbbbbyyyybbbbbbbbbbybbf',
      'fbbbbbybbbbbbbbyybbbbbbfbbbbbbbf',
      'fbbbbbbbbbbbbbbyybbbbbbbbbbbbbbf',
      'fbbbbbbbbbbbbsyyyysbbbbbbbybbbbf',
      'fbbbbbbfbbbbbsbbbbsbbbbbbbbbbbbf',
      'fbbynnbbbnnbbbbnnbbbbnnbbbnnbbbf',
      'fbbbssbbbssbbbbssbbbbssbbbssbybf',
      'fbbbssbbbssbbbbssbbbbssbbbssbbbf',
      'fbbrrrrbrrrrbbrrrrbbrrrrbrrrrbbf',
      'fbbrrrrbrrrrbbrrrrbbrrrrbrrrrbbf',
      'fbbrrrrbrrrrbbrrrrbbrrrrbrrrrbbf',
      'fbbbkkbbbkkbbbbkkbbbbkkbbbkkbbbf',
      'fbbbkkbbbkkbbbbkkbbbbkkbbbkkbbbf',
      'fgggkgkggkgkgggkgkgggkgkggkgkggf',
      'fgggkgkggkgkgggkgkgggkgkggkgkggf',
      'fggggggggggggggggggggggggggggggf',
      'fggggggggggggggggggggggggggggggf',
      'fggggggggggggggggggggggggggggggf',
      'ffffffffffffffffffffffffffffffff'
    ]
  },
  // Un oso pardo sacando la lengua
  bear: {
    palette: {
      f: '#f4f6ff',
      v: '#2f8a3e',
      z: '#1f5f2a',
      b: '#8a5a14',
      d: '#5e3c0e',
      l: '#c08a50',
      k: '#111114',
      p: '#ff7fb6'
    },
    rows: [
      'ffffffffffffffffffffffffffffffff',
      'fvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvf',
      'fvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvf',
      'fvvzvvvvddvvvvvvvvvvvvddvvvvvvvf',
      'fvvvvvvdbbdvvvvvvvvvvdbbdvvzvvvf',
      'fvvvvvvdbbbbbbbbbbbbbbbbdvvvvvvf',
      'fvvvvvdbbbbbbbbbbbbbbbbbbdvvvvvf',
      'fvvvvzdbbbbbbbbbbbbbbbbbbdvvvvvf',
      'fvvvvvdbbbkbbbbbbbbbbkbbbdvvvvvf',
      'fvvvvvdbbbbbbbbbbbbbbbbbbdvvvzvf',
      'fvvvvvdbbbbbbllllllbbbbbbdvvvvvf',
      'fvvvvvdbbbbbllllllllbbbbbdvvvvvf',
      'fvvvvvdbbbbblllkklllbbbbbdvvvvvf',
      'fvvvvvdbbbbblllkklllbbbbbdvvvvvf',
      'fvzvvvvdbbbbllllllllbbbbdvvvvvvf',
      'fvvvvvvdbbbblllpplllbbbbdvvvzvvf',
      'fvvvvvvvdbbbbllppllbbbbdvvvvvvvf',
      'fvvvvvvvvdbbbbbppbbbbbdvvvvvvvvf',
      'fvvvvvvvvvdbbbbppbbbbdvvvvvvvvvf',
      'fvvvvvvvvvvddbbbbbbddvvvvvvvvvvf',
      'fvvvvvdddddbbbbbbbbbbdddddvvvvvf',
      'fvvvvvbbbbbbbbbbbbbbbbbbbbvvvvvf',
      'fvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvf',
      'ffffffffffffffffffffffffffffffff'
    ]
  },
  // La tribuna azulgrana con "CASLA", sin el escudo
  stands: {
    palette: { f: '#f4f6ff', b: '#1c2d7a', r: '#b3122e', s: '#e2b48a', v: '#3fb950', k: '#18181c' },
    rows: [
      'ffffffffffffffffffffffffffffffff',
      'fbbbrrrbbbrrrbbbrrrbbbrrrbbbrrrf',
      'fbbbrrrbbbffffffffffffrrrbbbrrrf',
      'fbbbrrffffffffffffffffffffbbrrrf',
      'fbbbfffbbbffbffbbbfbffffbfffrrrf',
      'fbbffffbfffbfbfbfffbfffbfbfffrrf',
      'fbbffffbfffbbbfbbbfbfffbbbfffrrf',
      'fbbffffbfffbfbfffbfbfffbfbfffrrf',
      'fbbbfffbbbfbfbfbbbfbbbfbfbffrrrf',
      'fbbbrrffffffffffffffffffffbbrrrf',
      'fbbbrrrbbbffffffffffffrrrbbbrrrf',
      'fbbbrrrbbbrrrbbbrrrbbbrrrbbbrrrf',
      'frkskbkrkskbkrkskbkrkskbkrkskbkf',
      'fkskbkrkskbkrkskbkrkskbkrkskbkrf',
      'fskbkrkskbkrkskbkrkskbkrkskbkrkf',
      'fkbkrkskbkrkskbkrkskbkrkskbkrksf',
      'fbkrkskbkrkskbkrkskbkrkskbkrkskf',
      'fkrkskbkrkskbkrkskbkrkskbkrkskbf',
      'frkskbkrkskbkrkskbkrkskbkrkskbkf',
      'fvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvf',
      'fvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvf',
      'fvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvf',
      'fvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvf',
      'ffffffffffffffffffffffffffffffff'
    ]
  },
  // Tres globos de diálogo: "Hola", "Hello" y "Olá"
  languages: {
    palette: { f: '#f4f6ff', n: '#2a3566', y: '#ffd23f', k: '#111114', r: '#c42b2b', c: '#74acdf' },
    rows: [
      'ffffffffffffffffffffffffffffffff',
      'fnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnf',
      'fnyyyyyyyyyyyyyyyyynnnnnnnnnnnnf',
      'fnykykykkkykyyyykyynnnnnnnnnnnnf',
      'fnykykykykykyyykykynnnnnnnnnnnnf',
      'fnykkkykykykyyykkkynnnnnnnnnnnnf',
      'fnykykykykykyyykykynnnnnnnnnnnnf',
      'fnykykykkkykkkykykynnnnnnnnnnnnf',
      'fnyyyyyyyyyyyyyyyyynnnnnnnnnnnnf',
      'fnnnyynnnnrrrrrrrrrrrrrrrrrrrrrf',
      'fnnnynnnnnrfrfrfffrfrrrfrrrfffrf',
      'fnnnnnnnnnrfrfrfrrrfrrrfrrrfrfrf',
      'fnnnnnnnnnrfffrffrrfrrrfrrrfrfrf',
      'fnnnnnnnnnrfrfrfrrrfrrrfrrrfrfrf',
      'fnnnnnnnnnrfrfrfffrfffrfffrfffrf',
      'fnnnnnnnnnrrrrrrrrrrrrrrrrrrrrrf',
      'fnncccccccccckccnnnnnnnnnnnrrnnf',
      'fnnckkkckcccckccnnnnnnnnnnnnrnnf',
      'fnnckckckccckckcnnnnnnnnnnnnnnnf',
      'fnnckckckccckkkcnnnnnnnnnnnnnnnf',
      'fnnckckckccckckcnnnnnnnnnnnnnnnf',
      'fnnckkkckkkckckcnnnnnnnnnnnnnnnf',
      'fnncccccccccccccnnnnnnnnnnnnnnnf',
      'ffffffffffffffffffffffffffffffff'
    ]
  }
};
