import { useActiveElement } from "context/useActiveElement";
import type { Position } from "geojson";
import GLT from "GLT";
import { shapeToPolygon } from "models/MapDocument";
import { useState } from "react";
import { Polygon } from "react-leaflet";
import { useDispatch } from "react-redux";
import { MapperUiActions } from "state/mapper/ui/slice";
import useMapperSettings from "state/mapper/useSettings";
import PolygonDraw from "../features/PolygonDraw";

export interface PolygonCutToolProps {
  
}

function PolygonCutTool (props: PolygonCutToolProps) {
  const settings = useMapperSettings();
  const active = useActiveElement();
  const dispatch = useDispatch();

  const [hole, setHole] = useState<Position[]>([]);
  
  const polygon = active.getPolygon();
  if (!polygon) return null;

  const regular = shapeToPolygon(polygon);
  const verts = GLT.gj.coords.leaflet(regular.vertices);
  const holes = regular.holes.map(h => GLT.gj.coords.leaflet(h.vertices));

  return (<>
    <Polygon
      positions={[verts, ...holes]}
      color={settings.colors.active}
      weight={settings.lineWidth}
    />

    <PolygonDraw
      vertices={[...hole, ...active.stroke]}
      color="#ff0000"
      onAddVertex={handleAddVertex}
    />
  </>);

  function handleAddVertex (position: Position, isStroke: boolean) {
      addVertexToHole(position);
  }

  function addVertexToHole (position: Position) {
    if (hole.length > 0 && GLT.gj.coord.isEqual(position, hole[0])) {
      cut();
      return;
    }

    setHole(prev => [
      ...prev,
      position,
    ]);
  }

  function cut () {
    active.cut(hole);

    setHole([]);
    dispatch(MapperUiActions.setTool(null));
  }
}

export default PolygonCutTool;
