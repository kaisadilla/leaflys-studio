import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Position } from "geojson";
import Local from "Local";
import Logger from "Logger";
import { ContainerType, isContainer, isPseudoContainer, isShape, type MapperDocument, type MapperElement, type MapperPolygon, type MapperRectangle } from "models/MapDocument";
import { v4 as uuid } from 'uuid';

export interface MapperDocHeader {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
}

export interface MapperDocState {
  /**
   * The root group.
   */
  content: MapperDocument;
  /**
   * The id of the active document.
   */
  activeId: string;
  /**
   * The header of each document in the local storage.
   */
  headers: MapperDocHeader[];
}

function makeNewDocument (name: string) : MapperDocument {
  const doc: MapperDocument = {
    type: 'Group',
    id: 'root',
    name,
    properties: [],
    isHidden: false,
    elements: [],
  };

  return doc;
}

const [ doc, docId ] = await (async () => {
  let id = Local.getActiveDocumentId();

  if (id) {
    const doc = await Local.loadDocument(id);
    if (doc) return [doc, id] as const;
  }

  const doc = makeNewDocument("New document");
  id = await Local.saveDocument("New document", doc);

  return [doc, id] as const;
})();

const headers = Local.getDocumentHeaders();

const initialState: MapperDocState = {
  content: doc,
  activeId: docId,
  headers: headers,
}

const mapperDocSlice = createSlice({
  name: 'mapperDoc',
  initialState,
  reducers: {
    setDocument (state, action: PayloadAction<MapperDocument>) {
      const doc = action.payload;

      state.content = doc;
    },

    addElements (state, action: PayloadAction<{
      elements: MapperElement[],
      groupId?: string | null,
      index?: number | null,
    }>) {
      const { elements } = action.payload;
      let { groupId, index } = action.payload;
      
      groupId ??= null;
      index ??= null;

      for (const el of elements) {
        const existingEl = getElement(state.content, el.id, true);
        if (existingEl) {
          Logger.error(
            `An element with id '${el.id}' already exists, so it won't be ` +
            `added.`
          );
          return;
        }

        if (groupId === null || groupId === state.content.id) {
          insertElement(state.content, el, index);
        }
        else {
          const group = getElement(state.content, groupId, true);

          if (!group || ContainerType.has(group.type) === false) {
            Logger.error(
              `Element with id '${groupId}' either doesn't exist, or isn't a group.`
            )
          }
          else {
            insertElement(group, el, index);
          }
        }
      }
    },

    deleteElement (state, action: PayloadAction<string>) {
      const targetParent = getElementParent(state.content, action.payload);
      if (!targetParent) return;

      removeElement(targetParent, action.payload);
    },

    changeElement (state, action: PayloadAction<{
      elementId: string,
      update: Partial<Omit<MapperElement, 'id'>>
    }>) {
      const { elementId, update } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;

      Object.assign(el, update);
    },

    moveElement (state, action: PayloadAction<{
      elementId: string,
      containerId: string,
      index: number | null,
    }>) {
      const { elementId, containerId } = action.payload;
      let { index } = action.payload;

      const element = getElement(state.content, elementId, true);
      const elParent = getElementParent(state.content, elementId);

      const container = getElement(state.content, containerId, true);
      const containerParent = getElementParent(state.content, containerId);

      if (element === null || elParent === null) {
        Logger.error(`Can't find element with id '${elementId}'.`,
          element, elParent
        );
        return;
      }
      if (container === null) {
        Logger.error(`Can't find element with id '${containerId}'.`,
          container
        );
        return;
      }

      // When the element is being moved to the same parent it's already in.
      if (index !== null && elParent.id === container.id) {
        const currentIndex = getElementIndex(elParent, element.id);

        // If its current index is lower than its targeted index, we have to
        // account for its removal.
        if (currentIndex !== null && currentIndex < index) {
          index--;
        }
      }

      if (container.type === 'Group' || container.type === 'Collection') {
        _remove();
        insertElement(container, element, index);
      }
      else if (isShape(container)) {
        if (containerParent && isShape(containerParent)) {
          Logger.warn("Holes cannot receive children.");
        }
        else if (isShape(element) === false) {
          Logger.warn("Shapes can only receive other shapes as children.");
        }
        else if (element.holes.length > 0) {
          Logger.warn("Shapes cannot receive shapes with holes as children.");
        }
        else {
          _remove();
          insertElement(container, element, index);
        }
      }
      else {
        Logger.warn(`Element of type '${element.type}' cannot receive children.`);
      }

      function _remove () {
        const removed = removeElement(elParent!, element!.id);
        if (!removed) Logger.error("Error while removing element.");
      }
    },

    setElementName (state, action: PayloadAction<{
      elementId: string,
      name: string,
    }>) {
      const { elementId, name } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;

      el.name = name;
    },

    setHidden (state, action: PayloadAction<{
      elementId: string,
      value: boolean,
    }>) {
      const { elementId, value } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;

      el.isHidden = value;
    },

    setPropertyName (state, action: PayloadAction<{
      elementId: string,
      propertyId: string,
      name: string,
    }>) {
      const { elementId, propertyId, name } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;

      for (const prop of el.properties) {
        if (prop.id === propertyId) {
          prop.name = name;
          return;
        }
      }
    },

    setPropertyValue (state, action: PayloadAction<{
      elementId: string;
      propertyId: string;
      value: string;
    }>) {
      const { elementId, propertyId, value } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;

      for (const prop of el.properties) {
        if (prop.id === propertyId) {
          prop.value = value;
          return;
        }
      }
    },

    addProperty (state, action: PayloadAction<{
      elementId: string;
      propertyId?: string;
      name: string;
      value: string;
    }>) {
      const { elementId, propertyId, name, value } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;

      el.properties.push({
        id: propertyId ?? uuid(),
        name,
        value,
      });
    },

    updatePointPosition (state, action: PayloadAction<{
      elementId: string;
      position: Position;
    }>) {
      const { elementId, position } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;

      if (el.type !== 'Point') return;

      el.position = position;
    },

    updatePolygon (state, action: PayloadAction<{
      elementId: string,
      update: Partial<Omit<MapperPolygon, 'id'>>
    }>) {
      const { elementId, update } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;

      if (el.type !== 'Polygon') return;

      Object.assign(el, update);
    },
    
    updatePolygonVertices (state, action: PayloadAction<{
      elementId: string,
      vertices: Position[],
    }>) {
      const { elementId, vertices } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;

      if (el.type !== 'Polygon') return;

      el.vertices = vertices;
    },

    updateRectangleCorner (state, action: PayloadAction<{
      elementId: string;
      edge: 'north' | 'south' | 'west' | 'east';
      value: number;
    }>) {
      const { elementId, edge, value } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;

      if (el.type !== 'Rectangle') return;

      el[edge] = value;
    },

    updateRectangle (state, action: PayloadAction<{
      elementId: string;
      update: Partial<Omit<MapperRectangle, 'id'>>;
    }>) {
      const { elementId, update } = action.payload;

      const el = getElement(state.content, elementId, true);
      if (!el) return;
      if (el.type !== 'Rectangle') return;

      Object.assign(el, update);
    }
  },
});

export const mapperDocReducer = mapperDocSlice.reducer;
export const MapperDocActions = mapperDocSlice.actions;

// #region Helper functions
/**
 * Retrieves the element with the id given from the container given, if it
 * exists there.
 * @param container The container to search in.
 * @param elementId The element to look for.
 * @param recursive If true, subgroups will also be searched.
 */
export function getElement (
  container: MapperElement, elementId: string, recursive: boolean
) : MapperElement | null {
  if (container.id === elementId) return container;

  const children = getChildrenArray(container);
  if (!children) return null;

  for (const el of children) {
    if (el.id === elementId) return el;

    if (recursive && isContainer(el)) {
      const found = getElement(el, elementId, true);
      if (found !== null) return found;
    }
  }

  return null;
}

/**
 * Locates the group the element with the id given belongs to.
 * @param container 
 * @param elementId 
 * @returns 
 */
export function getElementParent (
  container: MapperElement, elementId: string
) : MapperElement | null {
  const children = getChildrenArray(container);
  if (!children) return null;

  for (const el of children) {
    if (el.id === elementId) return container;

    if (isContainer(el)) {
      const found = getElementParent(el, elementId);
      if (found !== null) return found;
    }
  }

  return null;
}

/**
 * Locates the position of the element with the id given in its group.
 * @param container 
 * @param elementId 
 * @returns 
 */
export function getElementIndex (
  container: MapperElement, elementId: string
) : number | null {
  const parent = getElementParent(container, elementId);
  if (!parent) return null;

  const children = getChildrenArray(parent);
  if (!children) return null;

  for (let i = 0; i < children.length; i++) {
    if (children[i].id === elementId) return i;
  }

  return null;
}

/**
 * Return whether the element with the id given is hidden, either by itself or
 * by being in a group that is hidden altogether.
 * @param container The group from which to start searching.
 * @param elementId The id of the element to check.
 * @param isParentHidden True if the group from which we are searching is hidden,
 * either by itself or by its parent.
 * @returns 
 */
export function isElementHidden (
  container: MapperElement, elementId: string, isParentHidden: boolean = false
) : boolean | null {
  const children = getChildrenArray(container);
  if (!children) return null;

  for (const el of children) {
    if (el.id === elementId) return isParentHidden || el.isHidden;

    if (isContainer(el)) {
      const found = isElementHidden(el, elementId, isParentHidden || el.isHidden);
      if (found !== null) return found;
    }
  }

  return null;
}

/**
 * Removes an element from the group given and returns it. Returns `null` if an
 * element is not found. This function is not recursive.
 * @param container The group where the element is.
 * @param elementId The id of the element to remove.
 */
export function removeElement (container: MapperElement, elementId: string) {
  const children = getChildrenArray(container);
  if (!children) return null;

  for (let i = 0; i < children.length; i++) {
    const el = children[i];

    if (el.id !== elementId) continue;

    children.splice(i, 1);
    return el;
  }

  return null;
}

/**
 * Adds an element to the group given, either as the first or the last element
 * of the group.
 * @param container The group to add the element to.
 * @param element The element to add.
 * @param index The index at which the element will be in the group.
 */
export function insertElement (
  container: MapperElement,
  element: MapperElement,
  index: number | null,
) {
  const children = getChildrenArray(container);
  if (!children) return;

  if (index === null) {
    children.push(element);
  }
  else {
    children.splice(index, 0, element);
  }
}

/**
 * Adds an element to the group given, before or after the element given. If the
 * reference element given is not found, the element to append will be added at
 * the end of the group.
 * @param container The group to add the element to.
 * @param element The element to add.
 * @param referenceId The id of the element to use as reference.
 * @param position Whether the element will be added before or after that one.
 */
export function insertElementBetween (
  container: MapperElement,
  element: MapperElement,
  referenceId: string,
  position: 'before' | 'after',
) {
  const children = getChildrenArray(container);
  if (!children) return;

  let index = children.findIndex(el => el.id === referenceId);

  if (index === -1) {
    children.push(element);
    return;
  }

  if (position === 'after') index++;
  
  children.splice(index, 0, element);
}

/**
 * Returns a flat array containing all elements in the given group, including
 * elements in all of its subgroups. This array also contains the subgroups
 * themselves as elements.
 * @param container The group from which to retrieve elements.
 * @param includePseudo Include elements that don't map to GeoJson elements
 * (that is, holes in shapes).
 */
export function getAllElements (
  container: MapperElement, includePseudo: boolean
) : MapperElement[] {  
  let children = getChildrenArray(container);
  if (!children) return [];

  const arr = [] as MapperElement[];

  for (const el of children) {
    arr.push(el);

    if (isContainer(el) && (includePseudo || isPseudoContainer(el) === false)) {
      arr.push(...getAllElements(el, includePseudo));
    }
  }
  
  return arr;
}

/**
 * Returns true if an element with the id given exists in the group given.
 * @param container The group in which the element may exist.
 * @param elementId The id of the element to look for.
 * @param recursive If true, subgroups will also be searched.
 * @returns 
 */
export function idExists (
  container: MapperElement, elementId: string, recursive: boolean
) : boolean {
  let children = getChildrenArray(container);
  if (!children) return false;

  for (const el of children) {
    if (el.id === elementId) return true;

    if (recursive && isContainer(el)) {
      if (idExists(el, elementId, true)) return true;
    }
  }

  return false;
}

/**
 * Given an element, returns the ORIGINAL ARRAY with its children. Modifying
 * this array will modify the children of the element.
 * If the element cannot have children (is not a container), this will return
 * `null`.
 * @param container The container element.
 * @returns 
 */
function getChildrenArray (container: MapperElement) : MapperElement[] | null {
  if (container.type === 'Group') return container.elements;
  if (container.type === 'Collection') return container.elements;
  if (container.type === 'Polygon') return container.holes;
  if (container.type === 'Rectangle') return container.holes;
  if (container.type === 'Circle') return container.holes;

  return null;
}

// #endregion Helper functions
