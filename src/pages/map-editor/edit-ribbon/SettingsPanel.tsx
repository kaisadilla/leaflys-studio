import useMapperUi from 'state/mapper/ui/useUi';
import NewPointPanel from './panel/NewPointPanel';
import DeleteVerticesPanel from './panel/polygon/DeleteVerticesPanel';
import DifferencePanel from './panel/polygon/DifferencePanel';
import DrawVerticesPanel from './panel/polygon/DrawVerticesPanel';
import IntersectionPanel from './panel/polygon/IntersectionPanel';
import SetOriginPanel from './panel/polygon/SetOriginPanel';
import UnionPanel from './panel/polygon/UnionPanel';

export interface SettingsPanelProps {
  
}

function SettingsPanel (props: SettingsPanelProps) {
  const ui = useMapperUi();

  if (ui.tool === 'new_point') return <NewPointPanel />;
  if (ui.tool === 'draw_vertices') return <DrawVerticesPanel />;
  if (ui.tool === 'delete_vertices') return <DeleteVerticesPanel />;
  if (ui.tool === 'union') return <UnionPanel />;
  if (ui.tool === 'difference') return <DifferencePanel />;
  if (ui.tool === 'intersection') return <IntersectionPanel />;
  if (ui.tool === 'set_origin') return <SetOriginPanel />;

  return null;
}

export default SettingsPanel;
