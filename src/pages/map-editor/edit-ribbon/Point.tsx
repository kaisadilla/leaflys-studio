import useKeyboardShortcut from 'hook/useKeyboardShortcut';
import { Move } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { MapperUiActions, type MapperPointTool } from 'state/mapper/ui/slice';
import useMapperUi from "state/mapper/ui/useUi";
import Ribbon from "./Ribbon";
import styles from "./Ribbon.module.scss";

export interface PointProps {
  
}

function Point (props: PointProps) {
  const ui = useMapperUi();
  const dispatch = useDispatch();

  const { standalone } = useKeyboardShortcut();
  const { t } = useTranslation("ui");

  standalone["1"] = () => selectTool('move_shape');
  standalone['Escape'] = () => dispatch(MapperUiActions.setTool(null));

  return (
    <div className={styles.toolset}>
      <div className={styles.title}>
        {t("tool_ribbon.point.title")}
      </div>

      <Ribbon.Toggle
        tool='move_shape'
        shortcut="1"
        label={t("tool.point.move_shape.name")}
        description={t("tool.point.move_shape.desc")}
      >
        <Move />
      </Ribbon.Toggle>
    </div>
  );

  function selectTool (tool: MapperPointTool) {
    dispatch(MapperUiActions.setTool(ui.tool === tool ? null : tool))
  }
}

export default Point;
