import GLT from 'GLT';
import { isPseudoContainer, shapeToPolygon, type MapperFeature, type MapperPoint, type MapperPolygon, type MapperRectangle } from 'models/MapDocument';
import { ImageOverlay, Marker, Polygon } from 'react-leaflet';
import useMapperDoc from 'state/mapper/doc/useDoc';
import useMapperSettings from 'state/mapper/useSettings';
import useMarkers from '../features/useMarkers';
import styles from './NoTool.module.scss';

export interface NoToolProps {
  feature: MapperFeature;
}

function NoTool ({
  feature,
}: NoToolProps) {
  if (feature.type === 'Point') return (
    <_Point point={feature} />
  );
  if (feature.type === 'Polygon') return (
    <_Polygon polygon={feature} />
  );
  if (feature.type === 'Rectangle') return (
    <_Rectangle rectangle={feature} />
  );
}

interface _PointProps {
  point: MapperPoint;
}

function _Point ({
  point,
}: _PointProps) {
  const { activePoint } = useMarkers();

  return (<>
    <Marker
      position={GLT.gj.coord.leaflet(point.position)}
      icon={activePoint}
    />
  </>);
}


interface _PolygonProps {
  polygon: MapperPolygon;
}

function _Polygon ({
  polygon,
}: _PolygonProps) {
  const doc = useMapperDoc();
  const settings = useMapperSettings();

  const parent = doc.getParent(polygon.id);
  const isPseudo = !!parent && isPseudoContainer(parent);

  return (
    <Polygon
      key={polygon.id}
      className={styles.polygon}
      positions={[
        GLT.gj.coords.leaflet(polygon.vertices)
      ]}
      weight={2}
      color={isPseudo ? settings.colors.activePseudo : settings.colors.active}
    />
  );
}

interface _RectangleProps {
  rectangle: MapperRectangle;
}

function _Rectangle ({
  rectangle,
}: _RectangleProps) {
  const settings = useMapperSettings();

  if (rectangle.image) return (<>
    <ImageOverlay
      url={rectangle.image}
      bounds={[
        [rectangle.north, rectangle.east],
        [rectangle.south, rectangle.west],
      ]}
      opacity={rectangle.opacity}
    />
    <Polygon
      positions={[GLT.gj.coords.leaflet(shapeToPolygon(rectangle).vertices)]}
      weight={2}
      color={settings.colors.active}
      fillColor={"transparent"}
    />
  </>);
  else return (
    <_Polygon polygon={shapeToPolygon(rectangle)} />
  );
}



export default NoTool;
