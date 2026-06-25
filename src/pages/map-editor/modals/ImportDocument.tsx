import { Button, Checkbox } from "@mantine/core";
import { modals, type ContextModalProps } from "@mantine/modals";
import PreviewMap from "components/PreviewMap";
import GLT from "GLT";
import i18n from "i18n";
import { Boxes, MapPin, Pentagon, Waypoints } from "lucide-react";
import { isShape, shapeToPolygon, type MapperElement } from "models/MapDocument";
import { useState } from "react";
import { Marker, Polygon, Polyline } from "react-leaflet";
import { useDispatch } from "react-redux";
import MapperDocThunks from "state/mapper/docThunks";
import useMapperSettings from "state/mapper/useSettings";
import { type AppDispatch } from "state/store";
import styles from './ImportDocument.module.scss';

export interface ImportDocumentModalProps {
  elements: MapperElement[],
}

function ImportDocumentModal ({
  innerProps,
  context,
  id: modalId,
}: ContextModalProps<ImportDocumentModalProps>) {
  const { elements } = innerProps;
  const dispatch = useDispatch<AppDispatch>();

  const [active, setActive] = useState<string[]>([]);

  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <div className={styles.listContainer}>
          <div className={styles.listOptions}>
            <Button
              size='compact-sm'
              onClick={() => setActive(elements.map(el => el.id))}
            >
              Select all
            </Button>
            <Button
              size='compact-sm'
              variant='outline'
              onClick={() => setActive([])}
            >
              Clear selection
            </Button>
          </div>
          <div className={styles.list}>
            {elements.map(el => <_ListItem
              key={el.id}
              element={el}
              active={active.includes(el.id)}
              onSelect={() => handleSelect(el.id)}
            />)}
          </div>
        </div>
        <div className={styles.mapContainer}>
          <PreviewMap
            className={styles.map}
          >
            {elements.map(el => <_LeafletElement
              key={el.id}
              element={el}
              active={active.includes(el.id)}
              onClick={() => handleSelect(el.id)}
            />)}
          </PreviewMap>
        </div>
      </div>
      <div className={styles.ribbon}>
        <Button
          size='compact-sm'
          variant='outline'
          onClick={() => context.closeModal(modalId)}
        >
          Cancel
        </Button>
        <Button
          size='compact-sm'
          onClick={handleImport}
        >
          Import
        </Button>
      </div>
    </div>
  );

  function handleSelect (id: string) {
    if (active.includes(id)) {
      setActive(prev => prev.filter(i => i !== id));
    }
    else {
      setActive(prev => [...prev, id]);
    }
  }

  function handleImport () {
    dispatch(MapperDocThunks.addElements(
      elements.filter(el => active.includes(el.id))
    ));
    context.closeModal(modalId);
  }
}

interface _ListItemProps {
  element: MapperElement;
  active: boolean;
  onSelect: () => void;
}

function _ListItem ({
  element,
  active,
  onSelect,
}: _ListItemProps) {

  return (
    <div key={element.id} className={styles.listItem}>
      <div className={styles.checkbox}>
        <Checkbox
          checked={active}
          onChange={onSelect}
          size='xs'
        />
      </div>
      <div className={styles.type}>
        {element.type === 'Point' && <MapPin />}
        {element.type === 'LineString' && <Waypoints />}
        {element.type === 'Polygon' && <Pentagon />}
        {element.type === 'Collection' && <Boxes />}
      </div>
      <div className={styles.name}>
        {element.name}
      </div>
    </div>
  );
}


interface _LeafletElementProps {
  element: MapperElement;
  active?: boolean;
  onClick?: () => void;
}

function _LeafletElement ({
  element,
  active,
  onClick,
}: _LeafletElementProps) {
  const settings = useMapperSettings();

  if (element.type === 'Group') return null;

  if (element.type === 'Point') {
    const point = L.divIcon({
      className: styles.point,
      iconSize: [10, 10],
    });

    const activePoint = L.divIcon({
      className: styles.activePoint,
      iconSize: [14, 14],
    });

    return (
      <Marker
        position={GLT.gj.coord.leaflet(element.position)}
        icon={active ? activePoint : point}
        eventHandlers={{ click: onClick }}
      />
    )
  }
  if (element.type === 'LineString') {
    return (
      <Polyline
        positions={GLT.gj.coords.leaflet(element.positions)}
        eventHandlers={{ click: onClick }}
        pathOptions={{
          color: active ? "#0b5f00" : "#999",
          weight: active ? 2 : 1,
        }}
      />
    )
  }
  if (isShape(element)) {
    const regular = shapeToPolygon(element);

    return (
      <Polygon
        positions={
          [
            GLT.gj.coords.leaflet(regular.vertices),
            ...regular.holes.map(h => GLT.gj.coords.leaflet(h.vertices))
          ]
        }
        eventHandlers={{ click: onClick }}
        pathOptions={{
          color: active ? "#0b5f00" : "#999",
          weight: active ? 2 : 1,
        }}
      />
    )
  }
  if (element.type === 'Collection') {
    return (<>
      {element.elements.map(e => <_LeafletElement
        key={e.id}
        element={e}
        active={active}
        onClick={onClick}
      />)}
    </>)
  }

  return null;
}

export function openImportDocument (props: ImportDocumentModalProps) {
  modals.openContextModal({
    modal: 'importDocument',
    title: i18n.t("modal.import_document.title"),
    innerProps: props,
    size: '80vw',
    closeOnClickOutside: false,
  });
}

export default ImportDocumentModal;
