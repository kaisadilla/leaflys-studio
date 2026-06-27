import { useActiveElement } from 'context/useActiveElement';
import type { Position } from 'geojson';
import type { Corner } from 'models/MapDocument';
import { useDispatch } from 'react-redux';
import MapperDocThunks from 'state/mapper/doc/thunks';
import useMapperDoc from 'state/mapper/doc/useDoc';
import useMapperSettings from 'state/mapper/useSettings';
import type { AppDispatch } from 'state/store';
import RectangleMoveCorners from '../features/RectangleMoveCorners';

export interface RectangleMoveVerticesToolProps {
  
}

function RectangleMoveVerticesTool (props: RectangleMoveVerticesToolProps) {
  const doc = useMapperDoc();
  const active = useActiveElement();
  const settings = useMapperSettings();
  const dispatch = useDispatch<AppDispatch>();

  const rect = active.getRectangle();
  if (!rect) return null;

  return (
    <RectangleMoveCorners
      image={rect.image}
      imgOpacity={rect.opacity}
      north={rect.north}
      south={rect.south}
      west={rect.west}
      east={rect.east}
      onMoveCorner={handleMoveCorner}
    />
  );

  function handleMoveCorner (corner: Corner, pos: Position) {
    if (!rect) return;

    dispatch(MapperDocThunks.updateRectanglePosition(rect.id, corner, pos));
  }
}

export default RectangleMoveVerticesTool;
