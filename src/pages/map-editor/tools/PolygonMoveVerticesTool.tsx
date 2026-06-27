import { useActiveElement } from "context/useActiveElement";
import type { Position } from "geojson";
import { useDispatch } from "react-redux";
import MapperDocThunks from "state/mapper/doc/thunks";
import useMapperDoc from "state/mapper/doc/useDoc";
import useMapperSettings from "state/mapper/useSettings";
import { type AppDispatch } from "state/store";
import PolygonMoveVertices from "../features/PolygonMoveVertices";
import { MapperActions, MapperHistory } from "../MapperHistory";

export interface PolygonMoveVerticesToolProps {
  
}

function PolygonMoveVerticesTool (props: PolygonMoveVerticesToolProps) {
  const doc = useMapperDoc();
  const active = useActiveElement();
  const settings = useMapperSettings();
  const dispatch = useDispatch<AppDispatch>();

  const polygon = active.getPolygon();
  if (!polygon) return null;
  if (polygon.vertices.length === 0) return null;

  return (
    <PolygonMoveVertices
      vertices={polygon.vertices}
      onMoveVertex={handleMoveVertex}
      onAddVertex={handleAddVertex}
    />
  );

  function handleMoveVertex (index: number, position: Position) {
    if (!polygon) return;

    dispatch(MapperDocThunks.movePolygonVertex(polygon.id, index, position));
  }

  function handleAddVertex (index: number, position: Position) {
    if (!polygon) return;

    const verts = [...polygon.vertices];
    verts.splice(index, 0, position);
    active.setVertices(verts);

    MapperHistory.push(
      MapperActions.addVertices(polygon.id, index, [position]),
    )
  }
}

export default PolygonMoveVerticesTool;
