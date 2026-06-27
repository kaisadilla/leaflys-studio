import { type MapperElement } from "models/MapDocument";
import { createContext, useContext, useState } from "react";
import useMapperDoc from "state/mapper/doc/useDoc";

interface InternalState {
  element: MapperElement | null;
  childrenIds: string[];
}

interface ElementDragValue {
  element: MapperElement | null;
  startDrag: (el: MapperElement) => void;
  endDrag: () => void;
  /**
   * Returns true if the element given is the element being dragged or a child
   * of it.
   * @param elementId The id of the element to test.
   */
  isNestedElement: (elementId: string) => boolean;
}

const ElementDragContext = createContext(undefined as ElementDragValue | undefined);

export const ElementDragProvider = ({ children }: any) => {
  const [state, setState] = useState<InternalState>(initState);

  const doc = useMapperDoc();

  function startDrag (el: MapperElement) {
    const children = doc.getAllElements(true, el);

    setState(prev => ({
      ...prev,
      element: el,
      childrenIds: children.map(c => c.id),
    }));
  }

  function endDrag () {
    setState(prev => ({ 
      ...prev,
      element: null,
      childrenIds: [],
    }));
  }

  function isNestedElement (elementId: string) : boolean {
    return elementId === state.element?.id
      || !!state.childrenIds.find(c => c === elementId);
  }

  return (
    <ElementDragContext.Provider value={{
      element: state.element,
      startDrag,
      endDrag,
      isNestedElement,
    }}>
      {children}
    </ElementDragContext.Provider>
  );
}

export function useElementDragCtx () : ElementDragValue {
  const ctx = useContext(ElementDragContext);

  if (!ctx) {
    throw new Error("<ElementDragProvider> not found.")
  }

  return ctx;
}

function initState () : InternalState {
  return {
    element: null,
    childrenIds: [],
  };
}
