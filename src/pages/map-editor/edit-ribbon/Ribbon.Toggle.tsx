import DescriptiveTooltip from "components/DescriptiveTooltip";
import ToggleButton from "components/ToggleButton";
import type React from "react";
import { useDispatch } from "react-redux";
import { MapperUiActions, type MapperTool } from "state/mapper/ui/slice";
import useMapperUi from "state/mapper/ui/useUi";


export interface Ribbon_ToggleProps {
  tool: MapperTool;
  label: string;
  description?: string;
  shortcut?: string;
  children: React.ReactElement;
}

function Ribbon_Toggle ({
  tool,
  label,
  description,
  shortcut,
  children,
}: Ribbon_ToggleProps) {
  const ui = useMapperUi();
  const dispatch = useDispatch();

  return (
    <DescriptiveTooltip
      label={label}
      description={description}
      shortcut={shortcut}
      position='bottom'
      offset={16}
    >
      <ToggleButton
        active={ui.tool === tool}
        onChange={v => setTool(tool, v)}
      >
        {children}
      </ToggleButton>
    </DescriptiveTooltip>
  );

  function setTool (tool: MapperTool, value: boolean) {
    dispatch(MapperUiActions.setTool(value ? tool : null));
  }
}

export default Ribbon_Toggle;
