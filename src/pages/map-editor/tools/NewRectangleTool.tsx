import { useActiveElement } from "context/useActiveElement";
import type { Position } from "geojson";
import GLT from "GLT";
import { ElementFactory } from "models/MapDocument";
import { useState } from "react";
import { Marker, Polygon } from "react-leaflet";
import { useDispatch } from "react-redux";
import { MapperDocActions } from "state/mapper/doc/slice";
import useMapperUi from "state/mapper/ui/useUi";
import useMapperSettings from "state/mapper/useSettings";
import useMarkers from "../features/useMarkers";
import useNewFeature from "./useNewFeature";

export interface NewRectangleToolProps {
  
}

function NewRectangleTool (props: NewRectangleToolProps) {
  const ui = useMapperUi();
  const active = useActiveElement();
  const settings = useMapperSettings();
  const dispatch = useDispatch();

  const [ start, setStart ] = useState<Position | null>(null);

  const { hoveredPos } = useNewFeature(handleAdd);
  const { volatileVertex } = useMarkers();

  
  let color = settings.colors.active;

  return (<>
    {start && hoveredPos && <Polygon
      positions={[
        GLT.gj.coord.leaflet(start),
        GLT.gj.coord.leaflet([hoveredPos[0], start[1]]),
        GLT.gj.coord.leaflet(hoveredPos),
        GLT.gj.coord.leaflet([start[0], hoveredPos[1]]),
        GLT.gj.coord.leaflet(start),
      ]}
      weight={2}
      color={color}
    />}
    {start && <Marker
      position={GLT.gj.coord.leaflet(start)}
      icon={volatileVertex}
    />}
    {hoveredPos && <Marker
      position={GLT.gj.coord.leaflet(hoveredPos)}
      icon={volatileVertex}
    />}
  </>);

  function handleAdd (position: Position) {
    if (!hoveredPos) return;

    if (start === null) {
      setStart(hoveredPos);
    }
    else {
      const end = hoveredPos;

      const north = Math.min(start[1], end[1]);
      const south = Math.max(start[1], end[1]);
      const west = Math.min(start[0], end[0]);
      const east = Math.max(start[0], end[0]);

      const el = ElementFactory.rectangle(
        north, south, west, east, "New rectangle"
      );

      dispatch(MapperDocActions.addElements({
        elements: [el],
        groupId: ui.targetContainerId,
      }));

      setStart(null);

      //active.setElement(el.id);
      //dispatch(MapperUiActions.setTool('draw_vertices'));
    }

    //const element = ElementFactory.polygon("New polygon");
    //element.vertices.push(position);
//
    //dispatch(MapperDocActions.addElements({
    //  elements: [element],
    //  groupId: ui.targetContainerId,
    //}));
//
    //active.setElement(element.id);
    //dispatch(MapperUiActions.setTool('draw_vertices'));
  }
}

export default NewRectangleTool;
