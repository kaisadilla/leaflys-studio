
import { useActiveElement } from 'context/useActiveElement';
import useMapperDoc from 'state/mapper/doc/useDoc';
import useMapperUi from 'state/mapper/ui/useUi';
import NewPointTool from '../tools/NewPointTool';
import NewPolygonTool from '../tools/NewPolygonTool';
import NewRectangleTool from '../tools/NewRectangleTool';
import NoTool from '../tools/NoTool';
import PointMoveShapeTool from '../tools/PointMoveShapeTool';
import PolygonCutTool from '../tools/PolygonCutTool';
import PolygonDeleteVerticesTool from '../tools/PolygonDeleteVerticesTool';
import PolygonDrawVerticesTool from '../tools/PolygonDrawVerticesTool';
import PolygonMoveShapeTool from '../tools/PolygonMoveShapeTool';
import PolygonMoveVerticesTool from '../tools/PolygonMoveVerticesTool';
import PolygonSetOriginTool from '../tools/PolygonSetOriginTool';
import RectangleMoveVerticesTool from '../tools/RectangleMoveVerticesTool';

export interface ActiveFeatureProps {
  
}

function ActiveFeature ({
  
}: ActiveFeatureProps) {
  const active = useActiveElement();
  const doc = useMapperDoc();
  const ui = useMapperUi();

  const feature = active.getElement();
  
  if (ui.tool === 'new_point') return (
    <NewPointTool />
  );
  if (ui.tool === 'new_line') return (
    null
  );
  if (ui.tool === 'new_polygon') return (
    <NewPolygonTool />
  );
  if (ui.tool === 'new_rectangle') return (
    <NewRectangleTool />
  );
  if (ui.tool === 'new_circle') return (
    null
  );

  if (!feature) return null;

  if (feature.type === 'Group') {
    return null;
  }

  if (feature.type === 'Point') {
    if (ui.tool === 'move_shape') return (
      <PointMoveShapeTool />
    );
  }

  if (feature.type === 'Polygon') {
    if (ui.tool === 'draw_vertices') return (
      <PolygonDrawVerticesTool />
    );
    if (ui.tool === 'move_vertices') return (
      <PolygonMoveVerticesTool />
    );
    if (ui.tool === 'cut') return (
      <PolygonCutTool />
    );
    if (ui.tool === 'delete_vertices') return (
      <PolygonDeleteVerticesTool />
    );
    if (ui.tool === 'set_origin') return (
      <PolygonSetOriginTool />
    );
    if (ui.tool === 'move_shape') return (
      <PolygonMoveShapeTool />
    );
  }
  
  if (feature.type === 'Rectangle') {
    if (ui.tool === 'move_vertices') return (
      <RectangleMoveVerticesTool />
    );
  }

  return (
    <NoTool feature={feature} />
  );
}
export default ActiveFeature;
