/**
 * Decodes Adobe Animate shape data to SVG path string
 * Based on Adobe Animate's proprietary shape encoding format
 */

interface PathCommand {
  c: 'moveTo' | 'lineTo' | 'quadraticCurveTo' | 'bezierCurveTo' | 'closePath';
  x?: number;
  y?: number;
  cpx?: number;
  cpy?: number;
  cp1x?: number;
  cp1y?: number;
  cp2x?: number;
  cp2y?: number;
}

interface BoundingBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface DecodedShape {
  commands: PathCommand[];
  bounds: BoundingBox;
  svgPath: string;
}

export class AdobeAnimateDecoder {
  private stack: PathCommand[] = [];
  private posX: number[] = [];
  private posY: number[] = [];
  private last = { x: 0, y: 0 };

  private moveTo(x: number, y: number) {
    this.last.x = x;
    this.last.y = y;
    this.posX.push(x);
    this.posY.push(y);
    this.stack.push({ c: 'moveTo', x, y });
  }

  private lineTo(x: number, y: number) {
    this.last.x = x;
    this.last.y = y;
    this.posX.push(x);
    this.posY.push(y);
    this.stack.push({ c: 'lineTo', x, y });
  }

  private quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    this.last.x = x;
    this.last.y = y;
    this.posX.push(x);
    this.posY.push(y);
    this.stack.push({ c: 'quadraticCurveTo', x, y, cpx, cpy });
  }

  private bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
    this.last.x = x;
    this.last.y = y;
    this.posX.push(x);
    this.posY.push(y);
    this.stack.push({ c: 'bezierCurveTo', x, y, cp1x, cp1y, cp2x, cp2y });
  }

  private closePath() {
    this.stack.push({ c: 'closePath' });
  }

  /**
   * Decode Adobe Animate base64-encoded path data
   */
  decodePath(path: string): DecodedShape {
    if (!path) {
      throw new Error('Path data is required');
    }

    this.stack = [];
    this.posX = [];
    this.posY = [];

    const instructions = [
      this.moveTo.bind(this),
      this.lineTo.bind(this),
      this.quadraticCurveTo.bind(this),
      this.bezierCurveTo.bind(this),
      this.closePath.bind(this),
    ];
    const paramCount = [2, 2, 4, 6, 0];
    
    const base64: Record<string, number> = {
      "A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,"J":9,"K":10,"L":11,"M":12,"N":13,"O":14,"P":15,
      "Q":16,"R":17,"S":18,"T":19,"U":20,"V":21,"W":22,"X":23,"Y":24,"Z":25,"a":26,"b":27,"c":28,"d":29,"e":30,
      "f":31,"g":32,"h":33,"i":34,"j":35,"k":36,"l":37,"m":38,"n":39,"o":40,"p":41,"q":42,"r":43,"s":44,"t":45,
      "u":46,"v":47,"w":48,"x":49,"y":50,"z":51,"0":52,"1":53,"2":54,"3":55,"4":56,"5":57,"6":58,"7":59,"8":60,
      "9":61,"+":62,"/":63
    };

    let i = 0;
    const l = path.length;
    let x = 0, y = 0;

    while (i < l) {
      const c = path.charAt(i);
      const n = base64[c];
      const fi = n >> 3; // highest order bits 1-3 code for operation
      const f = instructions[fi];

      // check that we have a valid instruction & that the unused bits are empty
      if (!f || (n & 3)) {
        throw new Error(`Bad path data (@${i}): ${c}`);
      }

      const pl = paramCount[fi];
      if (!fi) { x = y = 0; } // move operations reset the position

      const params: number[] = [];
      i++;
      const charCount = (n >> 2 & 1) + 2; // 4th header bit indicates number size for this operation

      for (let p = 0; p < pl; p++) {
        let num = base64[path.charAt(i)];
        const sign = (num >> 5) ? -1 : 1;
        num = ((num & 31) << 6) | (base64[path.charAt(i + 1)]);
        if (charCount === 3) {
          num = (num << 6) | (base64[path.charAt(i + 2)]);
        }
        num = sign * num / 10;
        if (p % 2) {
          x = (num += x);
        } else {
          y = (num += y);
        }
        params[p] = Math.round(num);
        i += charCount;
      }

      f.apply(this, params as any);
    }

    const bounds: BoundingBox = {
      left: Math.min(...this.posX),
      top: Math.min(...this.posY),
      right: Math.max(...this.posX),
      bottom: Math.max(...this.posY),
      width: 0,
      height: 0,
    };
    bounds.width = bounds.right - bounds.left;
    bounds.height = bounds.bottom - bounds.top;

    const svgPath = this.commandsToSVGPath(this.stack);

    return {
      commands: this.stack,
      bounds,
      svgPath,
    };
  }

  /**
   * Convert path commands to SVG path string
   */
  private commandsToSVGPath(commands: PathCommand[]): string {
    const parts: string[] = [];

    for (const cmd of commands) {
      switch (cmd.c) {
        case 'moveTo':
          parts.push(`M ${cmd.x} ${cmd.y}`);
          break;
        case 'lineTo':
          parts.push(`L ${cmd.x} ${cmd.y}`);
          break;
        case 'quadraticCurveTo':
          parts.push(`Q ${cmd.cpx} ${cmd.cpy} ${cmd.x} ${cmd.y}`);
          break;
        case 'bezierCurveTo':
          parts.push(`C ${cmd.cp1x} ${cmd.cp1y} ${cmd.cp2x} ${cmd.cp2y} ${cmd.x} ${cmd.y}`);
          break;
        case 'closePath':
          parts.push('Z');
          break;
      }
    }

    return parts.join(' ');
  }
}

/**
 * Helper function to decode Adobe Animate shape data and return SVG path
 */
export function decodeAdobeAnimatePath(encodedData: string): DecodedShape {
  const decoder = new AdobeAnimateDecoder();
  return decoder.decodePath(encodedData);
}

/**
 * Create an SVG element from Adobe Animate shape data
 */
export function createSVGFromAdobeAnimate(
  name: string,
  encodedData: string,
  options?: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    viewBoxPadding?: number;
  }
): string {
  const decoded = decodeAdobeAnimatePath(encodedData);
  const { bounds, svgPath } = decoded;
  
  const padding = options?.viewBoxPadding || 0;
  const viewBox = `${bounds.left - padding} ${bounds.top - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`;
  
  const fill = options?.fillColor || 'currentColor';
  const stroke = options?.strokeColor || 'none';
  const strokeWidth = options?.strokeWidth || 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <title>${name}</title>
  <path d="${svgPath}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
</svg>`;
}
