import type { Position } from "geojson";
import type { Immutable } from "types";
import { v4 as uuid } from "uuid";

/**
 * An entry in a GeoJson property object. The name will act as the key. The id
 * is not preserved between sessions.
 */
export interface MapperProperty {
  id: string;
  name: string;
  value: string;
}

/**
 * The prefix used for Yerevan-defined GeoJson properties.
 */
export const YEREVAN_PROP_PREFIX = "_yerevan_";
export const YEREVAN_DIR_SEPARATOR = "\\";

export const YEREVAN_PROP_HIDDEN = YEREVAN_PROP_PREFIX + "hidden";
export const YEREVAN_PROP_GROUP = YEREVAN_PROP_PREFIX + "group";
export const YEREVAN_PROP_TYPE = YEREVAN_PROP_PREFIX + "type";
export const YEREVAN_PROP_NORTH = YEREVAN_PROP_PREFIX + "north";
export const YEREVAN_PROP_SOUTH = YEREVAN_PROP_PREFIX + "south";
export const YEREVAN_PROP_WEST = YEREVAN_PROP_PREFIX + "west";
export const YEREVAN_PROP_EAST = YEREVAN_PROP_PREFIX + "east";

export interface BaseMapperElement {
  /**
   * An id that uniquely identifies this element. This id will be saved in
   * GeoJson's property collection under the reserved key 'id'.
   */
  id: string;
  /**
   * The element's name. This name will be saved in GeoJson's property
   * collection under the reserved key 'name'.
   */
  name: string;
  /**
   * A list of user-defined properties for GeoJson's property collection.
   */
  properties: MapperProperty[];
  /**
   * True when the element (and all of its children) are hidden in the editor.
   */
  isHidden: boolean;
}

/**
 * Represents a folder in a Mapper document. Folders only exist in memory - the
 * document gets flattened when saved to disk and hierarchy is preserved in
 * GeoJson properties.
 */
export interface MapperGroup extends BaseMapperElement {
  type: 'Group';
  elements: MapperElement[];
}

export interface MapperPointData {
  type: 'Point';
  position: Position;
}

export interface MapperPoint extends BaseMapperElement, MapperPointData {
}

export interface MapperLineData {
  type: 'LineString';
  positions: Position[];
}

export interface MapperLine extends BaseMapperElement, MapperLineData {
}

export interface MapperPolygonData {
  type: 'Polygon';
  vertices: Position[];
  holes: MapperShape[];
}

export interface MapperPolygon extends BaseMapperElement, MapperPolygonData {
}

export interface MapperRegularPolygon extends MapperPolygon {
  holes: MapperPolygon[];
}

export interface MapperRectangleData {
  type: 'Rectangle';
  north: number;
  south: number;
  west: number;
  east: number;
  holes: MapperShape[];
  image: string | null;
  opacity: number;
  interactive: boolean;
  saveImage: boolean;
}

export interface MapperRectangle extends BaseMapperElement, MapperRectangleData {
}

export interface MapperCircleData {
  type: 'Circle';
  center: Position;
  radius: number;
  holes: MapperShape[];
}

export interface MapperCircle extends BaseMapperElement, MapperCircleData {
}

/**
 * Represents a GeoJson Collection. In GeoJson, a Collection is a group of
 * geometries, and may or may not be restricted to one single Geometry type.
 * In memory, there's only one type of Collection, which gets converted to the
 * most appropriate GeoJson Collection type when the document is saved to disk.
 */
export interface MapperCollection extends BaseMapperElement {
  type: 'Collection';
  elements: MapperElement[];
}

/**
 * A MapperFeature is any MapperElement that represents to a GeoJson feature.
 */
export type MapperFeature = MapperPoint
  | MapperLine
  | MapperShape
  | MapperCollection
  ;

export type MapperShape = MapperPolygon
  | MapperRectangle
  | MapperCircle
  ;

export type MapperShapeData = MapperPolygonData
  | MapperRectangleData
  | MapperCircleData
  ;

/**
 * A MapperElement is either a MapperFeature or a MapperGroup.
 */
export type MapperElement = MapperGroup | MapperFeature;

/**
 * A string identifying a type of MapperElement.
 */
export type MapperElementType = MapperElement['type'];

/**
 * The root of a Mapper document. It map's to GeoJson's root FeatureCollection.
 */
export type MapperDocument = MapperGroup;

export const PseudoContainerType = new Set<MapperElementType>([
  'Polygon',
  'Rectangle',
  'Circle',
] as MapperElementType[]);

export type Edge = 'north' | 'south' | 'west' | 'east';
export type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export type Update<T> = Partial<Omit<T, 'id'>>;

/**
 * The types of `MapperElement` that can contain children.
 */
export const ContainerType = new Set<MapperElementType>([
  'Group',
  'Collection',
  ...PseudoContainerType,
] as MapperElementType[]);

export function isContainer (element: MapperElement) : boolean {
  return ContainerType.has(element.type);
}

export function isPseudoContainer (element: MapperElement) 
  : element is MapperPolygon | MapperRectangle | MapperCircle
{
  return PseudoContainerType.has(element.type);
}

/**
 * Converts a polygon and all of its holes into polygons.
 * @param poly The polygon to convert.
 */
export function polygonToPolygon (poly: MapperPolygon) : MapperRegularPolygon {
  return {
    ...poly,
    holes: poly.holes.map(h => shapeToPolygon(h)),
  };
}

export function rectangleToPolygon (rect: MapperRectangle) : MapperRegularPolygon {
  return {
    type: 'Polygon',
    id: rect.id,
    name: rect.name,
    properties: rect.properties,
    isHidden: rect.isHidden,
    vertices: [
      [rect.west, rect.north],
      [rect.east, rect.north],
      [rect.east, rect.south],
      [rect.west, rect.south],
      [rect.west, rect.north],
    ],
    holes: rect.holes.map(h => shapeToPolygon(h)),
  };
}

export function circleToPolygon (circle: MapperCircle) : MapperRegularPolygon {
  throw "Not yet implemented";
}

/**
 * Converts a shape and all of its holes into polygons.
 * @param shape The shape to convert.
 */
export function shapeToPolygon (shape: MapperShape) : MapperRegularPolygon {
  if (shape.type === 'Polygon') return polygonToPolygon(shape);
  if (shape.type === 'Rectangle') return rectangleToPolygon(shape);
  if (shape.type === 'Circle') return circleToPolygon(shape);

  throw `Unknown shape type.`;
}

export function isShape (element: Immutable<MapperElement>) : element is MapperShape {
  return element.type === 'Polygon'
    || element.type === 'Rectangle'
    || element.type === 'Circle'
    ;
}

/**
 * Returns all children elements of the given element, or `null` if the element
 * cannot have children.
 * @param element 
 * @returns 
 */
export function getChildren (element: MapperElement) : MapperElement[] | null {
  if (element.type === 'Group') return element.elements;
  if (element.type === 'Collection') return element.elements;
  if (
    element.type === 'Polygon'
    || element.type === 'Rectangle'
    || element.type === 'Circle'
  ) return element.holes;

  return null;
}

export const ElementFactory = {
  document (name: string) : MapperDocument {
    return {
      type: 'Group',
      id: uuid(),
      name,
      properties: [],
      isHidden: false,
      elements: [],
    };
  },

  group (name: string = "") : MapperGroup {
    return {
      type: 'Group',
      id: uuid(),
      name,
      properties: [],
      isHidden: false,
      elements: [],
    };
  },

  point (position: Position, name: string = "") : MapperPoint {
    return {
      type: 'Point',
      id: uuid(),
      name,
      properties: [],
      isHidden: false,
      position,
    };
  },

  rectangle (
    north: number,
    south: number,
    west: number,
    east: number,
    name: string = ""
  ) : MapperRectangle {
    return {
      type: 'Rectangle',
      id: uuid(),
      name,
      properties: [],
      isHidden: false,
      north,
      south,
      west,
      east,
      holes: [],
      image: null,
      interactive: false,
      opacity: 1,
      saveImage: true,
    };
  },

  polygon (name: string = "") : MapperPolygon {
    return {
      type: 'Polygon',
      id: uuid(),
      name,
      properties: [],
      isHidden: false,
      vertices: [],
      holes: [],
    };
  },
}
