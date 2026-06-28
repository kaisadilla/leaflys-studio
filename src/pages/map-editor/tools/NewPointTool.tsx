import { useActiveElement } from 'context/useActiveElement';
import type { Position } from 'geojson';
import GLT from 'GLT';
import { ElementFactory } from 'models/MapDocument';
import { Marker } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { MapperDocActions } from 'state/mapper/doc/slice';
import { MapperUiActions } from 'state/mapper/ui/slice';
import useMapperUi from 'state/mapper/ui/useUi';
import useMarkers from '../features/useMarkers';
import useNewFeature from './useNewFeature';

export interface NewPointToolProps {
  
}

function NewPointTool (props: NewPointToolProps) {
  const ui = useMapperUi();
  const active = useActiveElement();
  const dispatch = useDispatch();
  
  const { hoveredPos } = useNewFeature(handleAdd);

  const { volatileVertex } = useMarkers();

  return (<>
    {hoveredPos && <Marker
      position={GLT.gj.coord.leaflet(hoveredPos)}
      icon={volatileVertex}
      zIndexOffset={1000}
    />}
  </>);

  function handleAdd (position: Position, ctrl: boolean) {
    const element = ElementFactory.point(position, "New point");

    dispatch(MapperDocActions.addElements({
      elements: [element],
      groupId: ui.targetContainerId,
    }));
    
    if (ui.toolSettings.newPointMode === 'single') {
      active.setElement(element.id);
      dispatch(MapperUiActions.setTool('move_shape'));
    }
    else if (ui.toolSettings.newPointMode === 'multi') {
      // Nothing.
    }
    else if (ui.toolSettings.newPointMode === 'named') {
      // TODO: Rename.
    }
  }
}

export default NewPointTool;
