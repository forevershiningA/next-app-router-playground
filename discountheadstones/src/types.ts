export interface Shape {
  id: string;
  name: string;
  svgFile: string;
  /** Zero-based index in the catalog XML, used for ?shape-id param */
  shapeIndex: number;
}

export interface GraniteMaterial {
  id: string;
  name: string;
  textureFile: string;
}
