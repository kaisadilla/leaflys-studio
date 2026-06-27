import { useActiveElement } from "context/useActiveElement";
import GLT from "GLT";
import type { LeafletMouseEvent } from "leaflet";
import Logger from "Logger";
import { getChildren, shapeToPolygon, type MapperElement, type MapperPolygon } from "models/MapDocument";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import useMapperDoc from "state/mapper/doc/useDoc";
import useMapperSettings from "state/mapper/useSettings";
import type { Collection } from "types";

export default function usePolygonLayer (
  group: MapperElement,
  onClick?: (evt: LeafletMouseEvent, elementId: string) => void,
) {
  const doc = useMapperDoc();
  const map = useMap();
  const settings = useMapperSettings();
  const active = useActiveElement();

  const lPolygons = useRef<Collection<L.Polygon>>({});

  const children = getChildren(group) ?? [];
  const innerGroups = children.filter(el => el.type === 'Group'
    || el.type === 'Collection'
  );
  const polygons = children.filter(el => el.type === 'Polygon');

  // On mount, build the leaflet polygons. On dismount, delete them from the map.
  useEffect(() => {
    buildPolygons();

    return () => {
      clearPolygons();
    }
  }, [group.id]);

  useEffect(() => {
    for (const [k, v] of Object.entries(lPolygons.current)) {
      v.off('click');
      v.on('click', (evt: LeafletMouseEvent) => onClick?.(evt, k));
    }
  }, [onClick]);

  return {
    /**
     * The children contained by this element.
     */
    children,
    /**
     * The groups that are inside this one. This includes pseudo-groups.
     */
    innerGroups,
    /**
     * Builds all polygons currently in the document, adding to the map those that
     * should be currently visible.
     */
    buildPolygons,
    hidePolygon,
    showPolygon,
    /**
     * Adds a polygon to the layer, showing it in the map if it's not hidden.
     */
    addPolygon,
    /**
     * Removes the polygon with the id given, if it exists.
     */
    deletePolygon,
    updatePolygon,
    /**
     * Removes all polygons from the map, but keeps them in cache.
     */
    hideAll,
    /**
     * Shows all existing leaflet polygons that are not hidden themselves.
     */
    showAll,
    /**
     * Colors the polygon with the given id as active, and the rest as inactive.
     */
    setActive,
  }

  function buildPolygons () {
    Logger.info("Polygon layer rebuilt.");

    clearPolygons();

    for (const p of polygons) {
      const lPol = _createPolygon(p);

      lPolygons.current[p.id] = lPol;

      if (p.isHidden === false && p.id !== active.id) {
        lPol.addTo(map);
      }
    }
  }
 
  /**
   * Removes all polygons in the map and discards them.
   */
  function clearPolygons () {
    for (const p of Object.values(lPolygons.current)) {
      map.removeLayer(p);
    }

    lPolygons.current = {};
  }

  function addPolygon (el: MapperPolygon) {
    if (lPolygons.current[el.id]) return;

    const lPol = _createPolygon(el);
    lPolygons.current[el.id] = lPol;

    if (el.isHidden === false && el.id !== active.id) {
      lPol.addTo(map);
    }
  }

  function deletePolygon (id: string) {
    if (lPolygons.current[id]) {
      map.removeLayer(lPolygons.current[id]);
    }

    delete lPolygons.current[id];
  }

  function updatePolygon (el: MapperPolygon) {
    const p = lPolygons.current[el.id];
    if (!p) return;

    const regularP = shapeToPolygon(el);

    const verts = GLT.gj.coords.leaflet(regularP.vertices);
    const holes = regularP.holes.map(h => GLT.gj.coords.leaflet(h.vertices));

    p.setLatLngs([verts, ...holes] as any); // ts - wrong typing
  }

  function hidePolygon (id: string) {
    if (lPolygons.current[id]) {
      map.removeLayer(lPolygons.current[id]);
    }
  }

  function showPolygon (id: string) {
    if (lPolygons.current[id]) {
      map.addLayer(lPolygons.current[id]);
    }
  }

  function hideAll () {
    for (const p of Object.values(lPolygons.current)) {
      map.removeLayer(p);
    }
  }

  function showAll () {
    for (const p of polygons) {
      if (p.isHidden === false && lPolygons.current[p.id]) {
        map.addLayer(lPolygons.current[p.id]);
      }
    }
  }

  function setActive (id: string | null) {
    for (const [k, v] of Object.entries(lPolygons.current)) {
      v.setStyle({
        color: k === id ? settings.colors.activeParent : settings.colors.default,
      });
    }
  }

  /**
   * Creates a leaflet polygon and returns it. This polygon is not added to the
   * collection nor the map.
   * @param el The shape for the polygon.
   */
  function _createPolygon (el: MapperPolygon) : L.Polygon {
    const regular = shapeToPolygon(el);

    const verts = GLT.gj.coords.leaflet(regular.vertices);
    const holes = regular.holes.map(h => GLT.gj.coords.leaflet(h.vertices));

    const lPol = L.polygon([verts, ...holes] as any, {
      color: settings.colors.default,
      weight: settings.lineWidth,
    }); // ts - wrong typing

    lPol.on('click', (evt: LeafletMouseEvent) => onClick?.(evt, el.id));

    return lPol;
  }
}
