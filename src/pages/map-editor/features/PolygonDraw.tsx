import { useKeyboardCtx } from 'context/useKeyboard';
import type { Position } from 'geojson';
import GLT from 'GLT';
import useKeyboard from 'hook/useKeyboard';
import type { LeafletMouseEvent } from "leaflet";
import MathExt from 'MathExt';
import { useEffect, useRef, useState } from 'react';
import { Marker, Polygon, Polyline, Tooltip, useMap } from 'react-leaflet';
import useMapperDoc from 'state/mapper/doc/useDoc';
import useMapperUi from 'state/mapper/ui/useUi';
import useMapperSettings from 'state/mapper/useSettings';
import MapEvents from '../MapEvents';
import styles from './PolygonDraw.module.scss';
import useMarkers from './useMarkers';
import useVertexFilter from './useVertexFilter';

export interface PolygonDrawProps {
  /**
   * A list of positions that make up the polygon.
   */
  vertices: Position[];
  color?: string;
  /**
   * Called every time one vertex is added to the polygon.
   * @param pos The position where the vertex is.
   * @param isStroke True when the position is added as part of a single
   * multi-position stroke (right-click behavior).
   */
  onAddVertex?: (pos: Position, isStroke: boolean) => void;
  /**
   * Called when the user completes a stroke. A stroke occurs when the user
   * presses the right button of the mouse, drags to form a path, and releases
   * the button.
   */
  onCompleteStroke?: () => void;
}

function PolygonDraw ({
  vertices,
  color,
  onAddVertex,
  onCompleteStroke,
}: PolygonDrawProps) {
  const ui = useMapperUi();
  const settings = useMapperSettings();

  color ??= settings.colors.active;

  const latlngs = vertices.map(c => GLT.gj.coord.leaflet(c));
  
  const { firstVertex } = useMarkers();

  return (<>
    {ui.toolSettings.showVertices && <_MarkerLayer
      latlngs={latlngs}
    />}
    {latlngs.length > 0 && <Polygon
      className={styles.polygon}
      positions={latlngs}
      weight={0}
      color={color}
    />}
    {latlngs.length > 0 && <Polyline
      positions={[latlngs]}
      weight={settings.lineWidth}
      color={color}
    />}
    {latlngs.length > 0 && <Marker
      position={latlngs[0]}
      icon={firstVertex}
    />}
    <_NextVertex
      vertices={vertices}
      color={color}
      onAddVertex={onAddVertex}
      onCompleteStroke={onCompleteStroke}
    />
  </>);
}

interface _MarkerLayerProps {
  latlngs: Position[];
}

function _MarkerLayer ({
  latlngs,
}: _MarkerLayerProps) {
  const ui = useMapperUi();

  const map = useMap();
  const markers = useRef<L.Marker[]>([]);

  const { visibleIndices } = useVertexFilter(latlngs);

  useEffect(() => {
    recalculateVertices();

    return () => {
      deleteMarkers();
    }
  }, []);

  useEffect(() => {
    recalculateVertices();
  }, [visibleIndices]);
  
  const { vertex, noIcon } = useMarkers();

  return null;

  function recalculateVertices () {
    for (let i = 0; i < visibleIndices.length; i++) {
      const latlng = latlngs[visibleIndices[i]];
      if (!latlng) continue; // latlng may be undefined.

      if (i < markers.current.length) {
        markers.current[i].setLatLng(latlng);
      }
      else {
        const m = L.marker(latlng, {
          icon: i === 0 ? noIcon : vertex,
        }).addTo(map);

        markers.current[i] = m;
      }
    }

    if (markers.current.length <= visibleIndices.length) return;

    for (let i = visibleIndices.length; i < markers.current.length; i++) {
      map.removeLayer(markers.current[i]);
    }

    markers.current = markers.current.slice(0, visibleIndices.length);
  }

  function deleteMarkers () {
    for (const m of markers.current) {
      map.removeLayer(m);
    }
    markers.current = [];
  }
}

interface _NextVertexProps {
  vertices: Position[];
  color: string;
  onAddVertex?: (pos: Position, isStroke: boolean) => void;
  onCompleteStroke?: () => void;
}

function _NextVertex ({
  vertices,
  color,
  onAddVertex,
  onCompleteStroke,
}: _NextVertexProps) {
  const [hoveredCoords, setHoveredCoords] = useState<Position | null>();
  const [drawingLine, setDrawingLine] = useState(false);
  const [straightLine, setStraightLine] = useState(false);
  const lastVertex = useRef<Position>(vertices[vertices.length - 1] ?? [-500, -500]);

  const doc = useMapperDoc();
  const ui = useMapperUi();
  const settings = useMapperSettings();
  const keyboard = useKeyboardCtx();
  const map = useMap();
  
  const { volatileVertex } = useMarkers();
  const { down, up } = useKeyboard();

  down['z'] = () => setStraightLine(true);
  up['z'] = () => setStraightLine(false);

  useEffect(() => {
    const removeMouseMove = MapEvents.mouseMove(handleMouseMove);
    const removeLClick = MapEvents.leftClick(handleLeftClick);
    const removeRClick = MapEvents.rightClickDown(handleRightClickDown);
    const removeRClickUp = MapEvents.rightClickUp(handleRightClickUp);

    return () => {
      removeMouseMove();
      removeLClick();
      removeRClick();
      removeRClickUp();
    };
  }, [doc]);

  return (
    <>
    {hoveredCoords && vertices.length > 0 && <Polyline
      positions={[
        GLT.gj.coord.leaflet(vertices[vertices.length - 1]),
        GLT.gj.coord.leaflet(hoveredCoords)
      ]}
      dashArray="7, 8, 1, 8"
      color={color}
      weight={2}
    />}
    {hoveredCoords && <Marker
      position={GLT.gj.coord.leaflet(hoveredCoords)}
      icon={volatileVertex}
    >
      {
        vertices.length > 2 && keyboard.ctrl === false && <Tooltip
          // @ts-ignore Tooltip's props interface is incorrect.
          permanent={true}
          direction='bottom'
          offset={[0, 10]}
          className={styles.editTooltip}
        >
          Click on the first point to finish.
        </Tooltip>
      }
    </Marker>}
    </>
  );

  function handleMouseMove (evt: LeafletMouseEvent) {
    let cursorPos = evt.latlng;

    if (vertices.length > 0 && keyboard.ctrl === false) {
      const pxStart = map.latLngToLayerPoint(GLT.gj.coord.leaflet(vertices[0]));
      const pxCursor = map.latLngToLayerPoint(cursorPos);

      if (MathExt.vec2distance(pxStart, pxCursor) < 20) {
        cursorPos = GLT.gj.coord.leafletObj(vertices[0]);
      }
    }

    const hoveredCoords = GLT.leaflet.coord.gj(cursorPos);

    if (vertices.length > 0 && straightLine) {
      const lastVert = vertices[vertices.length - 1];
      const distLng = hoveredCoords[0] - lastVert[0];
      const distLat = hoveredCoords[1] - lastVert[1];

      if (Math.abs(distLng) < Math.abs(distLat)) {
        hoveredCoords[0] = lastVert[0];
      }
      else {
        hoveredCoords[1] = lastVert[1];
      }
    }

    setHoveredCoords(hoveredCoords);

    if (drawingLine === false) return;
    if (!hoveredCoords) return;
    if (vertices.length < 1) return;

    const pxLast = map.latLngToLayerPoint(
      GLT.gj.coord.leaflet(lastVertex.current)
    );
    const pxCursor = map.latLngToLayerPoint(cursorPos);

    if (MathExt.vec2distance(pxLast, pxCursor) > ui.toolSettings.pencilStep) {
      onAddVertex?.(hoveredCoords, true);
      lastVertex.current = hoveredCoords;
    }
  }

  function handleLeftClick (evt: LeafletMouseEvent) {
    if (!hoveredCoords) return;

    onAddVertex?.(hoveredCoords, false);
  }

  function handleRightClickDown () {
    setDrawingLine(true);
  }

  function handleRightClickUp () {
    setDrawingLine(false);
    onCompleteStroke?.();
  }
}

export default PolygonDraw;
