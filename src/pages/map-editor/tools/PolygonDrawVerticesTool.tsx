import { useActiveElement } from 'context/useActiveElement';
import type { Position } from 'geojson';
import GLT from 'GLT';
import { isPseudoContainer } from 'models/MapDocument';
import { useDispatch } from 'react-redux';
import useMapperDoc from 'state/mapper/doc/useDoc';
import { MapperUiActions } from 'state/mapper/uiSlice';
import useMapperSettings from 'state/mapper/useSettings';
import PolygonDraw from '../features/PolygonDraw';
import { MapperHistory } from '../MapperHistory';

export interface PolygonDrawVerticesToolProps {
  
}

function PolygonDrawVerticesTool (props: PolygonDrawVerticesToolProps) {
  const doc = useMapperDoc();
  const active = useActiveElement();
  const settings = useMapperSettings();
  const dispatch = useDispatch();

  const polygon = active.getPolygon();
  if (!polygon) return null;

  const parent = doc.getParent(polygon.id);
  const isPseudo = !!parent && isPseudoContainer(parent);

  return (
    <PolygonDraw
      vertices={[...polygon.vertices, ...active.stroke]}
      color={isPseudo ? settings.colors.activePseudo : settings.colors.active}
      onAddVertex={handleAddVertex}
      onCompleteStroke={handleCompleteStroke}
    />
  );

  function handleAddVertex (position: Position, isStroke: boolean) {
    if (isStroke === false) {
      addVertexToPolygon(position);
    }
    else {
      addVertexToStroke(position);
    }
  }

  function addVertexToPolygon (position: Position) {
    if (!polygon) return;

    if (GLT.gj.coord.isEqual(position, polygon.vertices[0])) {
      //active.commitChanges();
      //addStrokeToHistory();
      dispatch(MapperUiActions.setTool(null));
      return;
    }

    MapperHistory.push({
      type: 'add_vertices',
      elementId: polygon.id,
      index: polygon.vertices.length,
      vertices: [position],
    });

    active.setVertices(prev => [
      ...prev,
      position,
    ]);
  }

  function addVertexToStroke (position: Position) {
    active.setStroke(prev => [
      ...prev,
      position,
    ]);
  }

  function handleCompleteStroke () {
    if (!polygon) return;

    const vertices = [...active.stroke];

    MapperHistory.push({
      type: 'add_vertices',
      elementId: polygon.id,
      index: polygon.vertices.length,
      vertices,
    })

    active.commitStroke();
  }
}

export default PolygonDrawVerticesTool;
