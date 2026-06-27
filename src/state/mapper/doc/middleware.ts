import type { Middleware } from "@reduxjs/toolkit";
import type { MapperElement } from "models/MapDocument";
import type { RootState } from "state/store";
import Mapper from "../events";
import { getElement, getElementIndex, getElementParent, MapperDocActions } from "./slice";

export const mapperDocMiddleware: Middleware<{}, RootState> = store => next => action => {
  const res = next(action);

  if (MapperDocActions.setDocument.match(action)) {
    Mapper.emit('documentChange', {});
  }
  else if (MapperDocActions.addElements.match(action)) {
    const data = action.payload;

    const state = store.getState();

    const elements: MapperElement[] = [];

    for (const el of data.elements) {
      const createdEl = getElement(state.mapEditorDoc.content, el.id, true);
      if (!createdEl) continue;

      const parent = getElementParent(state.mapEditorDoc.content, createdEl.id);
      if (!parent) return res;

      const index = getElementIndex(state.mapEditorDoc.content, createdEl.id);
      if (!index) return res;

      elements.push(createdEl);
    }

    Mapper.emit('addElements', {
      elements,
      groupId: data.groupId ?? state.mapEditorDoc.content.id,
      index: data.index ?? null,
    });

    return res;
  }
  else if (MapperDocActions.deleteElement.match(action)) {
    const elementId = action.payload;
    
    Mapper.emit('deleteElement', {
      elementId,
    });
  }
  else if (MapperDocActions.setHidden.match(action)) {
    const { elementId, value } = action.payload;

    Mapper.emit('hide', {
      elementId,
      hidden: value
    });
  }
  else if (
    MapperDocActions.updatePolygon.match(action)
    || MapperDocActions.updatePolygonVertices.match(action)
    || MapperDocActions.updateRectangle.match(action)
    || MapperDocActions.updateRectangleCorner.match(action)
  ) {
    const { elementId } = action.payload;

    const state = store.getState();
    const update = getElement(state.mapEditorDoc.content, elementId, true);

    if (update) {
      Mapper.emit('updateElement', {
        elementId,
        update,
      });
    }
  }

  return res;
}
