import { Button, Checkbox } from '@mantine/core';
import { useActiveElement } from 'context/useActiveElement';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import useMapperDoc from 'state/mapper/doc/useDoc';
import { MapperUiActions } from 'state/mapper/uiSlice';
import useMapperUi from 'state/mapper/useUi';
import BasePanel from '../BasePanel';

export interface DifferencePanelProps {
  
}

function DifferencePanel (props: DifferencePanelProps) {
  const doc = useMapperDoc();
  const active = useActiveElement();
  const ui = useMapperUi();
  const dispatch = useDispatch();

  const { t } = useTranslation('ui');

  const polygon = active.getPolygon();
  const options = doc.getAllElements(false).filter(
    e => e.type === 'Polygon' && e.id !== polygon?.id
  );

  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(
      prev => options.find(e => e.id === prev) === undefined ? null : prev
    );
  }, [options]);

  return (
    <BasePanel name={t("tool.polygon.difference.settings.name")}>
      <BasePanel.Desc>
        {t("tool.polygon.difference.settings.desc")}
      </BasePanel.Desc>

      <BasePanel.Row>
        <BasePanel.FeatureMenu
          elements={options}
          value={value}
          onChange={setValue}
          placeholder={t("tool.polygon.difference.settings.menu_placeholder")}
        />

        <Button
          color='red'
          onClick={handleCarve}
          disabled={value === null}
        >
          {t("tool.polygon.difference.settings.carve")}
        </Button>
      </BasePanel.Row>

      <h3>
        {t("tool.polygon.difference.settings.section.options")}
      </h3>

      <Checkbox
        label={t("tool.polygon.difference.settings.delete_target.label")}
        checked={ui.toolSettings.deleteFeaturesUsedByDifference}
        onChange={handleChangeDeleteFeatures}
      />
    </BasePanel>
  );

  function handleChangeDeleteFeatures (evt: React.ChangeEvent<HTMLInputElement>) {
    dispatch(MapperUiActions.setToolSettings({
      key: 'deleteFeaturesUsedByDifference',
      value: evt.target.checked,
    }));
  }

  function handleCarve () {
    if (!value) return;

    active.difference(value, ui.toolSettings.deleteFeaturesUsedByDifference);
  }
}

export default DifferencePanel;
