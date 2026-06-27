import { useActiveElement } from "context/useActiveElement";
import GLT from "GLT";
import type { LeafletDragEndEvent, LeafletMouseEvent } from "leaflet";
import { Marker } from "react-leaflet";
import { useDispatch } from "react-redux";
import MapperDocThunks from "state/mapper/doc/thunks";
import useMapperDoc from "state/mapper/doc/useDoc";
import { type AppDispatch } from "state/store";
import useMarkers from "../features/useMarkers";

export interface PointMoveShapeToolProps {
  
}

function PointMoveShapeTool (props: PointMoveShapeToolProps) {
  const doc = useMapperDoc();
  const active = useActiveElement();
  const dispatch = useDispatch<AppDispatch>();

  const { activeMovablePoint } = useMarkers();

  const point = active.getPoint();
  if (!point) return null;

  return (
    <Marker
      position={GLT.gj.coord.leaflet(point.position)}
      icon={activeMovablePoint}
      draggable
      eventHandlers={{
        dragend: handleDragEnd,
        click: handleClick
      }}
    />
  );

  function handleClick (evt: LeafletMouseEvent) {
    evt.originalEvent.stopPropagation();
  }

  function handleDragEnd (evt: LeafletDragEndEvent) {
    if (!active.id) return;
    
    dispatch(MapperDocThunks.updatePointPosition(
      active.id,
      GLT.leaflet.coord.gj(evt.target.getLatLng()),
    ))
  }
}

export default PointMoveShapeTool;
