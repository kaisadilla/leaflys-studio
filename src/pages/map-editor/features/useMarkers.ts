import deleteImg from 'assets/img/marker_delete.png';
import deleteSelectedImg from 'assets/img/marker_delete_selected.png';
import useMapperUi from 'state/mapper/ui/useUi';
import styles from './useMarkers.module.scss';

export default function useMarkers () {
  const ui = useMapperUi();

  const point = L.divIcon({
    className: styles.point,
    iconSize: [10, 10],
  });

  const activePoint = L.divIcon({
    className: styles.activePoint,
    iconSize: [16, 16],
  });

  const activeMovablePoint = L.divIcon({
    className: styles.activeMovablePoint,
    iconSize: [16, 16],
  });

  const vertex = L.divIcon({
    className: styles.vertex,
    iconSize: [ui.toolSettings.vertexSize, ui.toolSettings.vertexSize],
  });
  const firstVertex = L.divIcon({
    className: styles.firstVertex,
    iconSize: [ui.toolSettings.vertexSize * (3 / 2), ui.toolSettings.vertexSize * (3 / 2)],
  });
  const volatileVertex = L.divIcon({
    className: styles.nextVertex,
    iconSize: [ui.toolSettings.vertexSize, ui.toolSettings.vertexSize],
  });
  const possibleVertex = L.divIcon({
    className: styles.possibleVertex,
    iconSize: [ui.toolSettings.vertexSize / 1.5, ui.toolSettings.vertexSize / 1.5],
  });
  const noIcon = L.divIcon({
    className:  styles.noIcon,
    iconSize: [0, 0],
  });

  const deleteVertex = L.icon({
      iconUrl: deleteImg,
      iconSize: [ui.toolSettings.deleteVertexSize, ui.toolSettings.deleteVertexSize],
  });
  const selectedDeleteVertex = L.icon({
      iconUrl: deleteSelectedImg,
      iconSize: [ui.toolSettings.deleteVertexSize, ui.toolSettings.deleteVertexSize],
  });

  function pointLabel (label: string) {
    return L.divIcon({
      className: styles.pointLabel,
      html: `<div><div>${label}</div><div>${label}</div></div>`,
    });
  }

  function polygonLabel (label: string) {
    return L.divIcon({
      className: styles.polygonLabel,
      html: `<div><div>${label}</div><div>${label}</div></div>`,
    });
  }

  return {
    point,
    activePoint,
    activeMovablePoint,
    vertex,
    possibleVertex,
    firstVertex,
    volatileVertex,
    noIcon,
    deleteVertex,
    selectedDeleteVertex,
    pointLabel,
    polygonLabel,
  }
}
