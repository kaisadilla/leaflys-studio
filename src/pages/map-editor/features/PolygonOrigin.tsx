import type { Position } from 'geojson';
import GLT from 'GLT';
import { Marker, Polygon } from 'react-leaflet';
import useMapperUi from 'state/mapper/ui/useUi';
import useMapperSettings from 'state/mapper/useSettings';
import useMarkers from './useMarkers';

export interface PolygonOriginProps {
  vertices: Position[];
  onSetOrigin?: (index: number) => void;
}

function PolygonOrigin ({
  vertices,
  onSetOrigin,
}: PolygonOriginProps) {
  const ui = useMapperUi();
  const settings = useMapperSettings();

  if (vertices.length === 0) return null;

  const latlngVertices = vertices.map(c => GLT.gj.coord.leaflet(c));
  
  const { vertex, firstVertex } = useMarkers();

  return (<>
    {vertices.length > 2 && <Polygon
      positions={latlngVertices}
      weight={settings.lineWidth}
      color={settings.colors.active}
    />}
    {ui.toolSettings.showVertices && latlngVertices.slice(1).map((v, i) => (
      <Marker
        key={i}
        position={v}
        icon={vertex}
        eventHandlers={{
          click: () => onSetOrigin?.(i + 1),
        }}
      />
    ))}
    <Marker
      position={latlngVertices[0]}
      icon={firstVertex}
    />
  </>);
}

export default PolygonOrigin;
