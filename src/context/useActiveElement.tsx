import type { Position } from "geojson";
import { ElementFactory, type MapperElement, type MapperPoint, type MapperPolygon, type MapperRectangle } from "models/MapDocument";
import Ops from "Ops";
import { MapperActions, MapperHistory, type MapperAction } from "pages/map-editor/MapperHistory";
import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { MapperDocActions } from "state/mapper/doc/slice";
import useMapperDoc from "state/mapper/doc/useDoc";
import Mapper from "state/mapper/events";
import { MapperUiActions } from "state/mapper/uiSlice";
import useMapperUi from "state/mapper/useUi";
import { getStateSetterValue, type StateSetter } from "types";

export type DeleteMode = 'individual' | 'section';
export type DeletePath = {
  start: number | null;
  end: number | null;
};

interface InternalState {
  id: string | null;
  stroke: Position[];
  deleteMode: DeleteMode;
  deletePath: DeletePath;
  reverseDeletePath: boolean;
}

interface ActiveElementValue extends InternalState {
  getElement: () => MapperElement | null;
  getPoint: () => MapperPoint | null;
  getPolygon: () => MapperPolygon | null;
  getRectangle: () => MapperRectangle | null;
  setElement: (elementId: string | null, resetTool?: boolean) => void;
  setVertices: (verts: StateSetter<Position[]>) => void;
  setStroke: (verts: StateSetter<Position[]>) => void;
  commitStroke: () => void;
  setDeleteMode: (mode: DeleteMode) => void;
  setDeletePath: (value: StateSetter<DeletePath>) => void;
  setDeletePathReverse: (value: boolean) => void;
  /**
   * Returns an array with all the indices currently included in the delete path.
   */
  getDeletePath: () => number[] | null;
  union: (targetId: string, deleteTarget: boolean) => void;
  difference: (targetId: string, deleteTarget: boolean) => void;
  intersection: (targetId: string, deleteTarget: boolean) => void;
  cut: (shape:  Position[]) => void;
}

const ActiveElementContext = createContext(undefined as ActiveElementValue | undefined);

export const ActiveElementProvider = ({ children }: any) => {
  const [state, setState] = useState<InternalState>(initState);

  const doc = useMapperDoc();
  const ui = useMapperUi();
  const dispatch = useDispatch();

  // When the user abruptly changes tools mid-stroke, prevent the stroke from
  // hanging around.
  useEffect(() => {
    setState(prev => ({
      ...prev,
      stroke: [],
    }))
  }, [ui.tool]);

  function getElement () {
    if (state.id === null) return null;

    return doc.getElement(state.id);
  }

  function getPoint () : MapperPoint | null {
    const el = getElement();

    if (el?.type === 'Point') return el;
    return null;
  }

  function getPolygon () : MapperPolygon | null {
    const el = getElement();

    if (el?.type === 'Polygon') return el;
    return null;
  }

  function getRectangle () : MapperRectangle | null {
    const el = getElement();

    if (el?.type === 'Rectangle') return el;
    return null;
  }

  function setElement (elementId: string | null, resetTool: boolean = true) {
    if (resetTool) dispatch(MapperUiActions.setTool(null));

    Mapper.emit('activeElementChange', {
      oldElementId: state.id,
      newElementId: elementId,
    });

    setState(prev => ({
      ...prev,
      id: elementId,
      stroke: [],
    }));
  }

  function setVertices (verts: StateSetter<Position[]>) {
    if (state.id === null) return;

    const el = doc.getElement(state.id);
    if (!el) return;

    if (el.type !== 'Polygon') return;

    const vertices = getStateSetterValue(verts, el.vertices);

    dispatch(MapperDocActions.updatePolygonVertices({
      elementId: el.id,
      vertices,
    }));
  }

  function setStroke (verts: StateSetter<Position[]>) {
    setState(prev => ({
      ...prev,
      stroke: getStateSetterValue(verts, prev.stroke),
    }));
  }

  function commitStroke () {
    if (state.id === null) return;
    
    const el = doc.getElement(state.id);
    if (el === null) return;

    if (el.type === 'Polygon') {
      dispatch(MapperDocActions.updatePolygonVertices({
        elementId: el.id,
        vertices: [...el.vertices, ...state.stroke],
      }));
    }

    setState(prev => ({ ...prev, stroke: [] }));
  }

  function setDeleteMode (mode: DeleteMode) {
    setState(prev => ({
      ...prev,
      deleteMode: mode,
      deletePath: { start: null, end: null },
    }));
  }

  function setDeletePath (value: StateSetter<DeletePath>) {
    setState(prev => ({
      ...prev,
      deletePath: getStateSetterValue(value, prev.deletePath),
    }))
  }

  function setDeletePathReverse (value: boolean) {
    setState(prev => ({
      ...prev,
      reverseDeletePath: value,
    }));
  }

  function getDeletePath () : number[] | null {
    const polygon = getPolygon();
    if (!polygon) return null;

    if (state.deletePath.start === null) return null;
    if (state.deletePath.end === null) return [state.deletePath.start];

    if (polygon.vertices.length === 0) return [];
    
    const indices: number[] = [];

    let i = state.deletePath.start;

    if (state.reverseDeletePath === false) {
      while (true) {
        indices.push(i);
        if (i === state.deletePath.end) break;

        i++;
        if (i >= polygon.vertices.length) i = 0;
      }
    }
    else {
      while (true) {
        indices.push(i);
        if (i === state.deletePath.end) break;

        i--;
        if (i < 0) i = polygon.vertices.length - 1;
      }
    }

    return indices;
  }

  function union (targetId: string, deleteTarget: boolean) {
    polygonOp(targetId, deleteTarget, (a, b) => Ops.polygonUnion(a, b));
  }

  function difference (targetId: string, deleteTarget: boolean) {
    polygonOp(targetId, deleteTarget, (a, b) => Ops.polygonDifference(a, b));
  }

  function intersection (targetId: string, deleteTarget: boolean) {
    polygonOp(targetId, deleteTarget, (a, b) => Ops.polygonIntersection(a, b));
  }

  function cut (shape: Position[]) {
    const el = getPolygon();
    if (!el) return;

    const hole = ElementFactory.polygon();
    hole.vertices = shape;

    const oldElement = { ...el };

    const result = Ops.polygonDifference(el, hole);

    const update = {
      vertices: result.vertices,
      holes: result.holes,
    };

    dispatch(MapperDocActions.updatePolygon({
      elementId: el.id,
      update,
    }));

    MapperHistory.push(MapperActions.changeElement(
      oldElement.id, oldElement, { ...oldElement, ...update }
    ));
  }

  return (
    <ActiveElementContext.Provider value={{
      ...state,
      getElement,
      getPoint,
      getPolygon,
      getRectangle,
      setElement,
      setVertices,
      setStroke,
      commitStroke,
      setDeleteMode,
      setDeletePath,
      setDeletePathReverse,
      getDeletePath,
      union,
      difference,
      intersection,
      cut,
    }}>
      {children}
    </ActiveElementContext.Provider>
  );

  function polygonOp (
    targetId: string,
    deleteTarget: boolean,
    op: (receiver: MapperPolygon, target: MapperPolygon) => MapperPolygon,
  ) {
    const el = getPolygon();
    if (!el) return;

    const target = doc.getElement(targetId);
    if (target?.type !== 'Polygon') return;

    const actions: MapperAction[] = [];

    const oldElement = { ...el };

    const result = op(el, target);

    const update = {
      vertices: result.vertices,
      holes: result.holes,
    };

    dispatch(MapperDocActions.updatePolygon({
      elementId: el.id,
      update,
    }));

    actions.push(MapperActions.changeElement(
      oldElement.id, oldElement, { ...oldElement, ...update }
    ));
    
    if (deleteTarget) {
      dispatch(MapperDocActions.deleteElement(target.id));

      const targetParent = doc.getParent(target.id);
      const targetIndex = doc.getElementIndex(target.id);

      actions.push(MapperActions.deleteElement(
        target, targetParent?.id ?? null, targetIndex ?? 0
      ));
    }

    if (actions.length === 1) {
      MapperHistory.push(actions[0]);
    }
    else {
      MapperHistory.push(MapperActions.multiple(actions));
    }
  }
}

export function useActiveElement () : ActiveElementValue {
  const ctx = useContext(ActiveElementContext);

  if (!ctx) {
    throw new Error("<ActiveElementProvider> not found.")
  }

  return ctx;
}

function initState () : InternalState {
  return {
    id: null,
    stroke: [],
    deleteMode: 'individual',
    deletePath: {
      start: null,
      end: null,
    },
    reverseDeletePath: false,
  };
}
