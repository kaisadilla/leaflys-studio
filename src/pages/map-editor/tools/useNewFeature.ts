import { useActiveElement } from 'context/useActiveElement';
import type { Position } from "geojson";
import GLT from 'GLT';
import type { LeafletMouseEvent } from 'leaflet';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import useMapperDoc from 'state/mapper/doc/useDoc';
import { MapperUiActions } from 'state/mapper/uiSlice';
import useMarkers from '../features/useMarkers';
import MapEvents from '../MapEvents';

export default function useNewFeature (
  onClick: (pos: Position, ctrl: boolean) => void
) {
  const [hoveredPos, setHoveredPos] = useState<Position | null>();

  const doc = useMapperDoc();
  const active = useActiveElement();
  const dispatch = useDispatch();

  const { volatileVertex } = useMarkers();

  useEffect(() => {
    const removeMouseMove = MapEvents.mouseMove(handleMouseMove);
    const removeLClick = MapEvents.leftClick(handleLeftClick);
    const removeRClick = MapEvents.rightClickDown(handleRightClick);

    return () => {
      removeMouseMove();
      removeLClick();
      removeRClick();
    }
  }, [hoveredPos]);

  return {
    hoveredPos,
  }

  function handleMouseMove (evt: LeafletMouseEvent) {
    let cursorPos = evt.latlng;

    const hoveredCoords = GLT.leaflet.coord.gj(cursorPos);
    setHoveredPos(hoveredCoords);
  }

  function handleLeftClick (evt: LeafletMouseEvent) {
    if (!hoveredPos) return;
    
    onClick(hoveredPos, evt.originalEvent.ctrlKey);
  }

  function handleRightClick () {
    dispatch(MapperUiActions.setTool(null));
  }
}
