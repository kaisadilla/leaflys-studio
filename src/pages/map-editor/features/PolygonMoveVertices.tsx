import type { Position } from 'geojson';
import GLT from 'GLT';
import { LatLng, Marker as LMarker, Polygon as LPolygon, type LeafletDragEndEvent } from 'leaflet';
import { useRef } from 'react';
import { Marker, Polygon, useMap } from 'react-leaflet';
import useMapperUi from 'state/mapper/ui/useUi';
import useMapperSettings from 'state/mapper/useSettings';
import { mercatorMidpoint } from 'turfExt';
import useMarkers from './useMarkers';

export interface PolygonMoveVerticesProps {
  vertices: Position[];
  onMoveVertex?: (index: number, pos: Position) => void;
  onAddVertex?: (index: number, pos: Position) => void;
}

function PolygonMoveVertices ({
  vertices,
  onMoveVertex,
  onAddVertex,
}: PolygonMoveVerticesProps) {
  const ui = useMapperUi();
  const settings = useMapperSettings();

  const polygonRef = useRef<LPolygon>(null);
  const midpointRefs = useRef<LMarker[]>([]);

  const latlngVerts = GLT.gj.coords.leaflet(vertices);
  const ring = [...latlngVerts, latlngVerts[0]];

  const { vertex, possibleVertex } = useMarkers();
  const map = useMap();

  return (<>
    <Polygon
      ref={polygonRef}
      positions={ring}
      weight={settings.lineWidth}
      color={settings.colors.active}
    />
    {latlngVerts.map((v, i) => <Marker
      key={i}
      position={v}
      icon={vertex}
      draggable
      eventHandlers={{
        drag: (evt: any) => handleDragVertex(evt, i),
        dragend: (evt: LeafletDragEndEvent) => handleVertexDragEnd(evt, i),
      }}
    />)}
    {vertices.map((v, i) => {
      const b = vertices[i === 0 ? vertices.length - 1 : i - 1];

      const c = mercatorMidpoint(v, b);

      return (
        <Marker
          key={i}
          ref={ref => midpointRefs.current[i] = ref}
          position={GLT.gj.coord.leaflet(c)}
          icon={possibleVertex}
          eventHandlers={{
            click: () => onAddVertex?.(i, c)
          }}
        />
      )
    })}
  </>);

  function handleDragVertex (evt: any, index: number) {
    if (!polygonRef.current) return;

    const vert = [evt.latlng.lng, evt.latlng.lat];

    const latlng = polygonRef.current.getLatLngs();
    // @ts-ignore
    latlng[0][index] = GLT.gj.coord.leafletObj(vert);

    polygonRef.current.setLatLngs(latlng);
  
    //const newVerts = [vertices[index - 1], vert, vertices[index + 1]]

    const v2 = [...vertices];
    v2[index] = vert;

    for (let i = 0; i < midpointRefs.current.length; i++) {
      const a = v2[i];
      const b = v2[i === 0 ? vertices.length - 1 : i - 1];

      const c = mercatorMidpoint(a, b);
      midpointRefs.current[i].setLatLng(GLT.gj.coord.leafletObj(c));
    }

    //midpointRefs.current[index].setLatLng(latlng[0][index]);
  }

  function handleVertexDragEnd (evt: LeafletDragEndEvent, index: number) {
    const latlng = evt.target.getLatLng() as LatLng;
    onMoveVertex?.(index, [latlng.lng, latlng.lat]);
  }
}

export default PolygonMoveVertices;
