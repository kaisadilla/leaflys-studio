import { Radio } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { MapperUiActions, type NewPointToolMode } from 'state/mapper/ui/slice';
import useMapperUi from 'state/mapper/ui/useUi';
import BasePanel from './BasePanel';

export interface NewPointPanelProps {
  
}

function NewPointPanel (props: NewPointPanelProps) {
  const ui = useMapperUi();
  const dispatch = useDispatch();

  const { t } = useTranslation('ui');

  return (
    <BasePanel name={t("tool.new.point.settings.name")}>
      <BasePanel.Desc>
        {t("tool.new.point.settings.desc")}
      </BasePanel.Desc>

      <Radio.Group
        label={t("tool.new.point.settings.mode.name")}
        description={t("tool.new.point.settings.mode.desc")}
        value={ui.toolSettings.newPointMode}
        onChange={handleChangePointMode}
      >
        <Radio
          value="single"
          label={t("tool.new.point.settings.mode.single.name")}
        />
        <Radio
          value="multi"
          label={t("tool.new.point.settings.mode.multi.name")}
        />
        <Radio
          value="named"
          label={t("tool.new.point.settings.mode.named.name")}
        />
      </Radio.Group>
    </BasePanel>
  );

  function handleChangePointMode (value: string) {
    dispatch(MapperUiActions.setToolSettings({
      key: 'newPointMode',
      value: value as NewPointToolMode,
    }));
  }
}

export default NewPointPanel;
