import type { Position } from "geojson";
import Local from "Local";
import { type Corner, type Edge, type MapperElement, type MapperRectangle } from "models/MapDocument";
import { MapperActions, MapperHistory } from "pages/map-editor/MapperHistory";
import type { AppDispatch, RootState } from "state/store";
import { getElement, MapperDocActions } from "./slice";

type Thunk = (dispatch: AppDispatch, getState: () => RootState) => void;

type CornerAndPosition = [place: Corner, pos: Position];
type EdgeAndNumber = [place: Edge, pos: number];

/**
 * Contains functions that alter the current document and register said changes
 * in the history so that they can be undone and redone.
 */
const MapperDocThunks = {
  deleteDocument (id: string) : Thunk {
    return async (dispatch, getState) => {
      const state = getState();
      if (state.mapEditorDoc.headers.length < 2) {
        console.error("Can't delete the only document that exists.");
        return;
      }

      const deleted = await Local.deleteDocument(id);
      if (deleted === false) return;

      const headers = Local.getDocumentHeaders();
      dispatch(MapperDocActions.updateHeaders(headers));
      if (headers.length === 0) return; // This should never happen.

      const currentId = state.mapEditorDoc.activeId;
      if (currentId !== id) return;

      const mostRecent = headers.reduce(
        (latest, h) => h.modifiedAt > latest.modifiedAt ? h : latest
      );
      const doc = await Local.loadDocument(mostRecent.id);
      if (!doc) return;

      dispatch(MapperDocActions.setDocument(doc));
      dispatch(MapperDocActions.setActiveDocId(mostRecent.id));
    };
  },

  addElement (
    element: MapperElement,
    groupId?: string | null,
    index?: number | null,
  ) : Thunk {
    return (dispatch, getState) => {
      dispatch(MapperDocActions.addElements({
        elements: [element],
        groupId,
        index,
      }));
    };
  },

  addElements (
    elements: MapperElement[],
    groupId?: string | null,
    index?: number | null,
  ) : Thunk {
    return (dispatch, getState) => {
      dispatch(MapperDocActions.addElements({ elements, groupId, index }));
    };
  },

  updatePointPosition (
    id: string, position: Position
  ) : Thunk {
    return (dispatch, getState) => {
      const el = getElement(getState().mapEditorDoc.content, id, true);
      if (!el || el.type !== 'Point') return;

      const before = el.position;
      
      MapperHistory.push(
        MapperActions.movePoint(el.id, before, position),
      )

      dispatch(MapperDocActions.updatePointPosition({
        elementId: id,
        position,
      }));
    };
  },

  movePolygonVertex (
    id: string, index: number, position: Position
  ) : Thunk {
    return (dispatch, getState) => {
      const el = getElement(getState().mapEditorDoc.content, id, true);
      if (!el || el.type !== 'Polygon') return;

      const before = el.vertices[index];
      
      const verts = [...el.vertices];
      verts[index] = position;

      MapperHistory.push(
        MapperActions.moveVertex(el.id, index, before, position),
      );

      dispatch(MapperDocActions.updatePolygonVertices({
        elementId: el.id,
        vertices: verts,
      }));
    };
  },

  updateRectangle (id: string, update: Partial<MapperRectangle>) : Thunk {
    return (dispatch, getState) => {
      const el = getElement(getState().mapEditorDoc.content, id, true);
      if (!el || el.type !== 'Rectangle') return;

      dispatch(MapperDocActions.updateRectangle({
        elementId: el.id,
        update,
      }));
    }
  },

  updateRectanglePosition (
    id: string, ...args: CornerAndPosition | EdgeAndNumber
  ) : Thunk {
    return (dispatch, getState) => {
      const el = getElement(getState().mapEditorDoc.content, id, true);
      if (!el || el.type !== 'Rectangle') return;

      const [place, pos] = args;

      if (
        place === 'north'
        || place === 'south'
        || place === 'west'
        || place === 'east'
      ) {
        dispatch(MapperDocActions.updateRectangleCorner({
          elementId: el.id,
          edge: place,
          value: pos,
        }));
      }
      else {
        let north = el.north;
        let south = el.south;
        let west = el.west;
        let east = el.east;

        if (place === 'topLeft') {
          north = pos[1];
          west = pos[0];
        }
        else if (place === 'topRight') {
          north = pos[1];
          east = pos[0];
        }
        else if (place === 'bottomLeft') {
          south = pos[1];
          west = pos[0];
        }
        else if (place === 'bottomRight') {
          south = pos[1];
          east = pos[0];
        }

        if (south > north) {
          [north, south] = [south, north];
        }
        if (east > west) {
          [west, east] = [east, west];
        }

        dispatch(MapperDocActions.updateRectangle({
          elementId: el.id,
          update: {
            north,
            south,
            east,
            west,
          } satisfies Partial<Omit<MapperRectangle, 'id'>>
        }));
      }
    }
  },
}

export default MapperDocThunks;
