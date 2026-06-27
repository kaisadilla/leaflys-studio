import type { BaseEventPayload, DropTargetLocalizedData, ElementDragType } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import Logger from "Logger";
import { isShape, type MapperElement } from "models/MapDocument";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { MapperDocActions } from "state/mapper/doc/slice";
import useMapperDoc from "state/mapper/doc/useDoc";
import { useElementDragCtx } from "./useElementDragContext";

type DropTarget = 'before' | 'inside' | 'after';

export default function useElementDrag (
  element: MapperElement,
  parent: MapperElement | null,
  expanded: boolean,
  disabled: boolean,
) {
  const ref = useRef<HTMLDivElement>(null);

  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const doc = useMapperDoc();
  const ctx = useElementDragCtx();
  const dispatch = useDispatch();

  const isPseudo = !!parent && isShape(parent);

  useEffect(() => {
    if (disabled) return;
    
    const el = ref.current;
    if (!el) return;

    const removeDrag = draggable({
      element: el,
      onDragStart: handleDragStart,
      onDrop: handleDrop,
      getInitialData: () => ({
        id: element.id,
        name: element.name,
        type: element.type,
      }),
    })

    const removeDrop = dropTargetForElements({
      element: el,
      getData: () => ({
        id: element.id,
        name: element.name,
        type: element.type,
      }),
      onDragEnter: handleForeignDrag,
      onDrag: handleForeignDrag,
      onDragLeave: handleForeignDragLeave,
      onDrop: handleForeignDrop,
    });

    return () => {
      removeDrag();
      removeDrop();
    }

  }, [
    element,
    dispatch,
    handleDragStart,
    handleDrop,
    handleForeignDrag,
    handleForeignDragLeave,
    handleForeignDrop
  ]);

  return {
    ref,
    dropTarget: dropTarget,
  }

  function handleDragStart () {
    ctx.startDrag(element);
  }

  function handleDrop () {
    ctx.endDrag();
  }

  function handleForeignDrag ({
    source,
    location,
  }: BaseEventPayload<ElementDragType> & DropTargetLocalizedData) {
    if (source.data.id === element.id) return;
    if (ctx.isNestedElement(element.id)) return;
    if (ref.current === null) return;

    const rect = ref.current.getBoundingClientRect();
    const y = location.current.input.clientY;
    const ratio = (y - rect.top) / rect.height;

    if (canReceiveElementAsChild(source.data.id as string)) {
      if (ratio < 0.33) setDropTarget('before');
      else if (ratio < 0.67) setDropTarget('inside');
      else if (expanded) setDropTarget('inside');
      else setDropTarget('after');
    }
    else {
      if (ratio < 0.5) setDropTarget('before');
      else setDropTarget('after');
    }
  }

  function handleForeignDrop ({
    source,
  }: BaseEventPayload<ElementDragType> & DropTargetLocalizedData) {
    const target = dropTarget;
    setDropTarget(null);

    if (source.data.id === element.id) return;
    if (ctx.isNestedElement(element.id)) return;
    if (ref.current === null) return;


    if (target === 'inside') {
      dispatch(MapperDocActions.moveElement({
        elementId: source.data.id as string,
        containerId: element.id,
        index: null,
      }));
    }
    else {
      const index = doc.getElementIndex(element.id) ?? 0;
      const parent = doc.getParent(element.id);

      if (!parent) {
        Logger.error(`Couldn't find parent for element '${element.id}'.`);
        return;
      }

      dispatch(MapperDocActions.moveElement({
        elementId: source.data.id as string,
        containerId: parent.id,
        index: target === 'before' ? index : index + 1,
      }));
    }
  }

  function handleForeignDragLeave () {
    setDropTarget(null);
  }

  /**
   * Returns true if this element can receive the element with the id given as
   * a child.
   * @param foreignId The id of the element to receive.
   */
  function canReceiveElementAsChild (foreignId: string) {
    if (isPseudo) return false;

    if (element.type === 'Group' || element.type === 'Collection') {
      return true;
    }

    if (isShape(element)) {
      const foreign = doc.getElement(foreignId);
      return foreign && isShape(foreign) && foreign.holes.length === 0;
    }

    return false;
  }
}
