import type { Position } from "geojson";
import Local from "Local";
import { ElementFactory, type Edge, type MapperDocument, type MapperElement, type MapperPolygon, type MapperRectangle, type Update } from "models/MapDocument";
import { useMemo } from "react";
import { useAppDispatch } from "../../store";
import { MapperDocActions } from "./slice";
import MapperDocThunks from "./thunks";

export default function useDispatchMapperDocument () {
  const dispatch = useAppDispatch();

  return useMemo(() => ({
    document: {
      // TODO: Probably needs to change to creating new from file.
      set (doc: MapperDocument) {
        dispatch(MapperDocActions.setDocument(doc));
      },

      async new (name: string) {
        const doc = ElementFactory.document(name);
        const docId = await Local.saveDocument(name, doc);
        const headers = Local.getDocumentHeaders();

        dispatch(MapperDocActions.setDocument(doc));
        dispatch(MapperDocActions.setActiveDocId(docId));
        dispatch(MapperDocActions.updateHeaders(headers));
      },

      async load (id: string) {
        const doc = await Local.loadDocument(id);
        if (doc === null) return;

        Local.setActiveDocumentId(id);

        dispatch(MapperDocActions.setDocument(doc));
        dispatch(MapperDocActions.setActiveDocId(id));
      },

      async delete (id: string) {
        dispatch(MapperDocThunks.deleteDocument(id));        
      },

      async rename (id: string, name: string) {
        const updated = await Local.renameDocument(id, name);
        if (updated === false) return;

        const headers = Local.getDocumentHeaders();
        dispatch(MapperDocActions.setDocumentName(name));
        dispatch(MapperDocActions.updateHeaders(headers));
      }
    },

    element: {
      add (
        element: MapperElement,
        groupId?: string | null,
        index?: number | null
      ) {
        dispatch(MapperDocActions.addElements({
          elements: [element],
          groupId,
          index,
        }));
      },

      addMany (
        elements: MapperElement[],
        groupId?: string | null,
        index?: number | null,
      ) {
        dispatch(MapperDocActions.addElements({ elements, groupId, index, }));
      },

      update (elementId: string, update: Update<MapperElement>) {
        dispatch(MapperDocActions.updateElement({ elementId, update, }));
      },

      delete (elementId: string) {
        dispatch(MapperDocActions.deleteElement(elementId));
      },

      move (elementId: string, containerId: string, index: number | null) {
        dispatch(MapperDocActions.moveElement({ elementId, containerId, index }));
      },

      setName (elementId: string, name: string) {
        dispatch(MapperDocActions.setElementName({ elementId, name, }));
      },

      setHidden (elementId: string, value: boolean) {
        dispatch(MapperDocActions.setHidden({ elementId, value, }));
      },
    },

    property: {
      add (
        elementId: string, propertyId: string, name: string, value: string
      ) {
        dispatch(MapperDocActions.addProperty(
          { elementId, propertyId, name, value, }
        ));
      },

      setName (elementId: string, propertyId: string, name: string) {
        dispatch(MapperDocActions.setPropertyName(
          { elementId, propertyId, name, }
        ));
      },

      setValue (elementId: string, propertyId: string, value: string) {
        dispatch(MapperDocActions.setPropertyValue(
          { elementId, propertyId, value, }
        ));
      },
    },

    point: {
      updatePosition (elementId: string, position: Position) {
        dispatch(MapperDocActions.updatePointPosition({ elementId, position, }));
      },
    },

    polygon: {
      update (elementId: string, update: Update<MapperPolygon>) {
        dispatch(MapperDocActions.updatePolygon({ elementId, update, }));
      },

      setVertices (elementId: string, vertices: Position[]) {
        dispatch(MapperDocActions.updatePolygonVertices({ elementId, vertices, }));
      },
    },

    rectangle: {
      update (elementId: string, update: Update<MapperRectangle>) {
        dispatch(MapperDocActions.updateRectangle( { elementId, update, }));
      },

      setCorner (elementId: string, edge: Edge, value: number) {
        dispatch(MapperDocActions.updateRectangleCorner(
          { elementId, edge, value, }
        ));
      },
    }
  }), [dispatch]);
}
