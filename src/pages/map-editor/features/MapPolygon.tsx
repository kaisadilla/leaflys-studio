import { useActiveElement } from "context/useActiveElement";
import GLT from "GLT";
import { type LeafletMouseEvent } from "leaflet";
import { shapeToPolygon, type MapperPolygon } from "models/MapDocument";
import Ops from "Ops";
import { Marker, Polygon } from "react-leaflet";
import { useDispatch } from "react-redux";
import useMapperUi from "state/mapper/ui/useUi";
import useMapperSettings from "state/mapper/useSettings";
import useMarkers from "./useMarkers";

export interface MapPolygonProps {
  polygon: MapperPolygon;
  isSibling?: boolean;
  isParent?: boolean;
}

function MapPolygon ({
  polygon,
  isSibling = false,
  isParent = false,
}: MapPolygonProps) {
  const active = useActiveElement();
  const ui = useMapperUi();
  const settings = useMapperSettings();
  const markers = useMarkers();
  const dispatch = useDispatch();

  let color = settings.colors.default;
  if (isSibling) color = settings.colors.activeSibling;
  else if (isParent) color = settings.colors.activeParent;

  if (polygon.vertices.length < 3) {
    return null;
  }

  const centroid = Ops.polygonCentroid(polygon);

  return (<>
    <Polygon
      positions={[
        GLT.gj.coords.leaflet(polygon.vertices),
        ...polygon.holes.map(
          h => GLT.gj.coords.leaflet(shapeToPolygon(h).vertices)
        )
      ]}
      weight={2}
      color={color}
      eventHandlers={{
        click: handleClick,
      }}
    />
    {settings.showLabels && !isSibling && !isParent && <Marker
      position={GLT.gj.coord.leaflet(centroid)}
      icon={markers.polygonLabel(polygon.name)}
      eventHandlers={{
        click: handleClick,
      }}
    />}
  </>);

  function handleClick (evt: LeafletMouseEvent) {
    if (evt.originalEvent.ctrlKey) {
      if (ui.tool === 'union') {
        active.union(polygon.id, ui.toolSettings.deleteFeaturesUsedByCombine);
      }
      else if (ui.tool === 'difference') {
        active.difference(
          polygon.id, ui.toolSettings.deleteFeaturesUsedByDifference
        );
      }
      else if (ui.tool === 'intersection') {
        active.intersection(
          polygon.id, ui.toolSettings.deleteFeaturesUsedByCombine
        )
      }
    }
    else {
      active.setElement(polygon.id);
    }
  }
}

export default MapPolygon;
