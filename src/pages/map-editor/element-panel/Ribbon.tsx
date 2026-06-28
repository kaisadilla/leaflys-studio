import Button from "components/Button";
import DescriptiveTooltip from "components/DescriptiveTooltip";
import ToggleButton from "components/ToggleButton";
import { useActiveElement } from "context/useActiveElement";
import useKeyboardShortcut from "hook/useKeyboardShortcut";
import { Boxes, Circle, FolderPlus, MapPin, Pentagon, Square, Waypoints } from 'lucide-react';
import { ElementFactory, type MapperGroup } from "models/MapDocument";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { MapperDocActions } from "state/mapper/doc/slice";
import useMapperDoc from "state/mapper/doc/useDoc";
import { MapperUiActions, type MapperDocumentTool } from "state/mapper/ui/slice";
import useMapperUi from "state/mapper/ui/useUi";
import styles from './Ribbon.module.scss';

function Ribbon () {
  const doc = useMapperDoc();
  const ui = useMapperUi();
  const active = useActiveElement();
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const { alt, standalone } = useKeyboardShortcut();

  alt['1'] = handleNewGroup;
  alt['2'] = () => handleTool('new_point');
  alt['3'] = () => handleTool('new_line');
  alt['4'] = () => handleTool('new_polygon');
  alt['5'] = () => handleTool('new_rectangle');
  alt['6'] = () => handleTool('new_circle');
  standalone['Escape'] = () => dispatch(MapperUiActions.setTool(null));

  return (
    <div className={styles.ribbon}>
      <DescriptiveTooltip
        label={t("element_panel.ribbon.group.name")}
        description={t("element_panel.ribbon.group.desc")}
        shortcut="Alt + 1"
      >
        <Button onClick={handleNewGroup}>
          <FolderPlus />
        </Button>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("element_panel.ribbon.point.name")}
        shortcut="Alt + 2"
      >
        <ToggleButton
          active={ui.tool === 'new_point'}
          onChange={() => handleTool('new_point')}
        >
          <MapPin />
        </ToggleButton>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("element_panel.ribbon.line.name")}
        shortcut="Alt + 3"
      >
        <ToggleButton
          active={ui.tool === 'new_line'}
          onChange={() => handleTool('new_line')}
        >
          <Waypoints />
        </ToggleButton>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("element_panel.ribbon.polygon.name")}
        shortcut="Alt + 4"
      >
        <ToggleButton
          active={ui.tool === 'new_polygon'}
          onChange={() => handleTool('new_polygon')}
        >
          <Pentagon />
        </ToggleButton>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("element_panel.ribbon.rectangle.name")}
        shortcut="Alt + 5"
      >
        <ToggleButton
          active={ui.tool === 'new_rectangle'}
          onChange={() => handleTool('new_rectangle')}
        >
          <Square />
        </ToggleButton>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("element_panel.ribbon.circle.name")}
        shortcut="Alt + 6"
      >
        <ToggleButton
          active={ui.tool === 'new_circle'}
          onChange={() => handleTool('new_circle')}
        >
          <Circle />
        </ToggleButton>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("element_panel.ribbon.collection.name")}
        description={t("element_panel.ribbon.collection.desc")}
        shortcut="Alt + 7"
      >
        <Button>
          <Boxes />
        </Button>
      </DescriptiveTooltip>
    </div>
  );

  function handleNewGroup () {
    const element = ElementFactory.group("New group");

    dispatch(MapperDocActions.addElements({
      elements: [element],
    }));

    active.setElement(element.id);
  }

  function handleTool (tool: MapperDocumentTool) {
    const targetContainer = getActiveGroup();

    dispatch(MapperUiActions.setTool(ui.tool === tool ? null : tool));
    dispatch(MapperUiActions.setTargetContainer(targetContainer.id));
    active.setElement(null, false);
  }

  function getActiveGroup () : MapperGroup {
    const el = active.getElement();
    if (!el) return doc.content;

    if (el.type === 'Group') return el;

    const parent = doc.getParent(el.id);
    if (!parent) return doc.content;
    if (parent.type !== 'Group') return doc.content;

    return parent;
  }
}

export default Ribbon;
