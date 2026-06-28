import { useActiveElement } from "context/useActiveElement";
import type { Position } from "geojson";
import GLT from "GLT";
import { ElementFactory } from "models/MapDocument";
import { Marker } from "react-leaflet";
import { useDispatch } from "react-redux";
import { MapperDocActions } from "state/mapper/doc/slice";
import { MapperUiActions } from "state/mapper/ui/slice";
import useMapperUi from "state/mapper/ui/useUi";
import useMarkers from "../features/useMarkers";
import useNewFeature from "./useNewFeature";

export interface NewPolygonToolProps {
  
}

function NewPolygonTool (props: NewPolygonToolProps) {
  const ui = useMapperUi();
  const active = useActiveElement();
  const dispatch = useDispatch();

  const { hoveredPos } = useNewFeature(handleAdd);
  const { volatileVertex } = useMarkers();

  return (<>
    {hoveredPos && <Marker
      position={GLT.gj.coord.leaflet(hoveredPos)}
      icon={volatileVertex}
    />}
  </>);

  function handleAdd (position: Position) {
    const element = ElementFactory.polygon("New polygon");
    element.vertices.push(position);

    dispatch(MapperDocActions.addElements({
      elements: [element],
      groupId: ui.targetContainerId,
    }));

    active.setElement(element.id);
    dispatch(MapperUiActions.setTool('draw_vertices'));
  }
}

export default NewPolygonTool;
