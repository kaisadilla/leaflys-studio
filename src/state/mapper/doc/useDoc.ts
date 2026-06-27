import type { MapperElement } from "models/MapDocument";
import { useSelector } from "react-redux";
import { store, type RootState } from "../../store";
import { getAllElements, getElement, getElementIndex, getElementParent, idExists, isElementHidden, type MapperDocState } from "./slice";

export default function useMapperDoc () {
  const doc = useSelector((state: RootState) => state.mapEditorDoc);
  
  return getMapperDocInterface(doc);
}

function getMapperDocInterface (doc: MapperDocState) {

  return {
    ...doc,

    /**
     * Returns the latest version of this store. 
     * @returns 
     */
    latest () {
      const state = store.getState();

      return getMapperDocInterface(state.mapEditorDoc);
    },

    getAllElements: (includePseudo: boolean, container?: MapperElement) =>
      getAllElements(container ?? doc.content, includePseudo),

    getElement: (elementId: string) =>
      getElement(doc.content, elementId, true),

    idExists: (elementId: string, recursive: boolean) =>
      idExists(doc.content, elementId, recursive),

    isElementHidden: (elementId: string) =>
      isElementHidden(doc.content, elementId),

    getParent: (elementId: string) =>
      getElementParent(doc.content, elementId),

    getElementIndex: (elementId: string) => 
      getElementIndex(doc.content, elementId),
  };
}
