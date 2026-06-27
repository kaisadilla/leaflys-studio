import * as turf from "@turf/turf";
import { useActiveElement } from "context/useActiveElement";
import GLT from "GLT";
import 'leaflet-truesize';
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useDispatch } from "react-redux";
import useMapperDoc from "state/mapper/doc/useDoc";
import useMapperSettings from "state/mapper/useSettings";

export interface PolygonMoveShapeToolProps {
  
}

function PolygonMoveShapeTool (props: PolygonMoveShapeToolProps) {
  const doc = useMapperDoc();
  const active = useActiveElement();
  const settings = useMapperSettings();
  const dispatch = useDispatch();
  const map = useMap();

  const polygon = active.getPolygon();
  if (!polygon) return;

  const gj = GLT.mapper.polygon.turf(polygon);
  const res = turf.transformTranslate(gj, 2500, 0);

  //const latlngVertices = polygon.vertices.map(c => GLT.gj.coord.leaflet(c));
  const latlngVertices = res.geometry.coordinates[0].map(c => GLT.gj.coord.leaflet(c));

  //for (const p of latlngVertices) {
  //  p[0] = p[0] + 20;
  //}

  useEffect(() => {
    // @ts-ignore
    const layer = L.trueSize(gj, {
      color: "red",
      weight: 1,
      opacity: 1,
      dashArray: "7 10",
    }).addTo(map);

    return () => {
      map.removeLayer(layer);
    }
  });

  return null;

  //return (
  //  <Polygon
  //    positions={latlngVertices}
  //  />
  //);
}

export default PolygonMoveShapeTool;
