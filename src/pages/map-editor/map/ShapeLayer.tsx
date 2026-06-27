import { useActiveElement } from "context/useActiveElement";
import GLT from "GLT";
import { type LeafletMouseEvent } from "leaflet";
import { isShape, shapeToPolygon, type MapperElement, type MapperRectangle } from "models/MapDocument";
import { useEffect, useState } from "react";
import { ImageOverlay, Polygon } from "react-leaflet";
import useMapperDoc from "state/mapper/doc/useDoc";
import Mapper, { type MapperActiveElementChangeEvent, type MapperAddElementsEvent, type MapperDeleteElementEvent, type MapperHideEvent, type MapperUpdateElementEvent } from "state/mapper/events";
import useMapperSettings from "state/mapper/useSettings";
import useMapperUi from "state/mapper/useUi";
import usePolygonLayer from "./usePolygonLayer";

export interface ShapeLayerProps {
  group: MapperElement;
}

function ShapeLayer ({
  group,
}: ShapeLayerProps) {
  const [isHidden, setHidden] = useState(group.isHidden);

  const doc = useMapperDoc();
  const ui = useMapperUi();
  const active = useActiveElement();

  const layer = usePolygonLayer(
    group,
    handleShapeClick,
  );

  // Listeners for Mapper events.
  useEffect(() => {
    Mapper.on('activeElementChange', handleActiveElementChange);
    Mapper.on('addElements', handleAddElements);
    Mapper.on('deleteElement', handleDeleteElement);
    Mapper.on('updateElement', handleUpdateElement);
    Mapper.on('hide', handleHideElement);

    return () => {
      Mapper.off('activeElementChange', handleActiveElementChange);
      Mapper.off('addElements', handleAddElements);
      Mapper.off('deleteElement', handleDeleteElement);
      Mapper.off('updateElement', handleUpdateElement);
      Mapper.off('hide', handleHideElement);
    }
  }, [
    doc,
    handleActiveElementChange,
    handleAddElements,
    handleUpdateElement,
    handleUpdateElement,
    handleHideElement,
  ]);

  // When this group is shown or hidden, add or remove leaflet polygons to the
  // map.
  useEffect(() => {
    if (isHidden) {
      layer.hideAll();
    }
    else {
      layer.showAll();
    }
  }, [isHidden]);

  useEffect(() => {
    let activeParent: string | null = null;

    if (active.id !== null) {
      const parent = doc.getParent(active.id);
      if (parent && isShape(parent)) {
        activeParent = parent.id;
      }
    }

    layer.setActive(activeParent);
  }, [active.id]);

  const rects = layer.children.filter(p => p.type === 'Rectangle');

  return (<>
    {isHidden
      ? null
      : layer.innerGroups.map(g => <ShapeLayer key={g.id} group={g} />)}
    <_RectangleLayer
      rectangles={rects}
      onClick={handleShapeClick}
    />
  </>)
  
  function handleShapeClick (evt: LeafletMouseEvent, id: string) {
    if (evt.originalEvent.ctrlKey) {
      if (ui.tool === 'union') {
        active.union(id, ui.toolSettings.deleteFeaturesUsedByCombine);
      }
      else if (ui.tool === 'difference') {
        active.difference(
          id, ui.toolSettings.deleteFeaturesUsedByDifference
        );
      }
      else if (ui.tool === 'intersection') {
        active.intersection(
          id, ui.toolSettings.deleteFeaturesUsedByCombine
        )
      }
    }
    else {
      active.setElement(id);
    }
  }

  function handleActiveElementChange (evt: MapperActiveElementChangeEvent) {
    if (evt.oldElementId) layer.showPolygon(evt.oldElementId);
    if (evt.newElementId) layer.hidePolygon(evt.newElementId);
  }

  function handleAddElements (evt: MapperAddElementsEvent) {
    for (const el of evt.elements) {
      if (el.type !== 'Polygon') continue;
      if (evt.groupId !== group.id) continue;

      layer.addPolygon(el);
    }
  }

  function handleDeleteElement (evt: MapperDeleteElementEvent) {
    layer.deletePolygon(evt.elementId);
  }

  function handleUpdateElement (evt: MapperUpdateElementEvent) {
    if (evt.update.type !== 'Polygon') return;

    const parent = doc.latest().getParent(evt.elementId);

    if (parent && parent.type === 'Polygon') {
      layer.updatePolygon(parent);
    }
    else {
      layer.updatePolygon(evt.update);
    }
  }

  function handleHideElement (evt: MapperHideEvent) {
    if (evt.elementId === group.id) {
      setHidden(evt.hidden);
    }
    else {
      if (evt.hidden) {
        layer.hidePolygon(evt.elementId);
      }
      else {
        layer.showPolygon(evt.elementId);
      }
    }
  }
}

interface _RectangleLayerProps {
  rectangles: MapperRectangle[];
  onClick: (evt: LeafletMouseEvent, elementId: string) => void;
}

function _RectangleLayer ({
  rectangles,
  onClick,
}: _RectangleLayerProps) {
  const active = useActiveElement();
  const settings = useMapperSettings();

  return (<>
    {rectangles.map(rect => {
      if (rect.id === active.id) return null;
      if (rect.isHidden) return null;

      if (rect.image) return (
        <ImageOverlay
          key={rect.id}
          url={rect.image!}
          bounds={[
            [rect.north, rect.east],
            [rect.south, rect.west],
          ]}
          opacity={rect.opacity}
          // @ts-ignore this property exists.
          interactive={rect.interactive}
          eventHandlers={{
            click: (evt: LeafletMouseEvent) => onClick?.(evt, rect.id)
          }}
          zIndex={-1000}
        />
      )
      else {
        const p = shapeToPolygon(rect);

        return (
          <Polygon
            key={rect.id}
            positions={[
              GLT.gj.coords.leaflet(p.vertices),
              ...p.holes.map(h => GLT.gj.coords.leaflet(h.vertices))
            ]}
            weight={2}
            color={settings.colors.default}
            eventHandlers={{
              click: (evt: LeafletMouseEvent) => onClick?.(evt, rect.id)
            }}
          />
        )
      }
    })}
  </>);
}


export default ShapeLayer;
