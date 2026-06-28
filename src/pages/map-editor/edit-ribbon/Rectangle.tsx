import { IntersectSquareIcon, PolygonIcon, SubtractSquareIcon, UniteSquareIcon } from "@phosphor-icons/react";
import useKeyboardShortcut from "hook/useKeyboardShortcut";
import { Eraser, Scissors } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { MapperUiActions, type MapperPolygonTool } from "state/mapper/ui/slice";
import useMapperUi from "state/mapper/ui/useUi";
import Ribbon from "./Ribbon";
import styles from './Ribbon.module.scss';

export interface RectangleProps {
  
}

function Rectangle (props: RectangleProps) {
  const ui = useMapperUi();
  const dispatch = useDispatch();

  const { t } = useTranslation("ui");
  const { standalone } = useKeyboardShortcut();

  standalone['1'] = () => selectTool('move_vertices');
  standalone['2'] = () => selectTool('cut');
  standalone['3'] = () => selectTool('delete_vertices');
  standalone['4'] = () => selectTool('union');
  standalone['5'] = () => selectTool('difference');
  standalone['6'] = () => selectTool('intersection');
  standalone['Escape'] = () => dispatch(MapperUiActions.setTool(null));

  return (
    <div className={styles.toolset}>
      <div className={styles.title}>{t("tool_ribbon.polygon.title")}</div>

      <Ribbon.Toggle
        tool='move_vertices'
        shortcut="2"
        label={t("tool.polygon.move_vertices.name")}
        description={t("tool.polygon.move_vertices.desc")}
      >
        <PolygonIcon width={24} height={24} weight='thin' />
      </Ribbon.Toggle>

      <Ribbon.Toggle
        tool='cut'
        shortcut="3"
        label={t("tool.polygon.cut.name")}
        description={t("tool.polygon.cut.desc")}
      >
        <Scissors />
      </Ribbon.Toggle>

      <Ribbon.Toggle
        tool='delete_vertices'
        shortcut="4"
        label={t("tool.polygon.delete_vertices.name")}
        description={t("tool.polygon.delete_vertices.desc")}
      >
        <Eraser />
      </Ribbon.Toggle>

      <Ribbon.Toggle
        tool='union'
        shortcut="5"
        label={t("tool.polygon.union.name")}
        description={t("tool.polygon.union.desc")}
      >
        <UniteSquareIcon width={24} height={24} weight='thin' />
      </Ribbon.Toggle>

      <Ribbon.Toggle
        tool='difference'
        shortcut="6"
        label={t("tool.polygon.difference.name")}
        description={t("tool.polygon.difference.desc")}
      >
        <SubtractSquareIcon width={24} height={24} weight='thin' />
      </Ribbon.Toggle>

      <Ribbon.Toggle
        tool='intersection'
        shortcut="7"
        label={t("tool.polygon.intersection.name")}
        description={t("tool.polygon.intersection.desc")}
      >
        <IntersectSquareIcon width={24} height={24} weight='thin' />
      </Ribbon.Toggle>
    </div>
  );
  
  function selectTool (tool: MapperPolygonTool) {
    dispatch(MapperUiActions.setTool(ui.tool === tool ? null : tool))
  }
}

export default Rectangle;
