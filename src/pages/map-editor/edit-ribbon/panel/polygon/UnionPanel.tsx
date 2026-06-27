import { Button, Checkbox } from '@mantine/core';
import { useActiveElement } from 'context/useActiveElement';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import useMapperDoc from 'state/mapper/doc/useDoc';
import { MapperUiActions } from 'state/mapper/uiSlice';
import useMapperUi from 'state/mapper/useUi';
import BasePanel from '../BasePanel';

export interface UnionPanelProps {
  
}

function UnionPanel (props: UnionPanelProps) {
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
    <BasePanel name="Union tool">
      <BasePanel.Desc>
        {t("tool.polygon.union.settings.desc")}
      </BasePanel.Desc>

      <BasePanel.Row>
        <BasePanel.FeatureMenu
          elements={options}
          value={value}
          onChange={setValue}
          placeholder={t("tool.polygon.union.settings.menu_placeholder")}
        />

        <Button
          color='red'
          onClick={handleJoin}
          disabled={value === null}
        >
          {t("tool.polygon.union.settings.join")}
        </Button>
      </BasePanel.Row>

      <h3>
        {t("tool.polygon.union.settings.section.options")}
      </h3>

      <Checkbox
        label={t("tool.polygon.union.settings.delete_target.label")}
        checked={ui.toolSettings.deleteFeaturesUsedByCombine}
        onChange={handleChangeDeleteFeatures}
      />
    </BasePanel>
  );

  function handleChangeDeleteFeatures (evt: React.ChangeEvent<HTMLInputElement>) {
    dispatch(MapperUiActions.setToolSettings({
      key: 'deleteFeaturesUsedByCombine',
      value: evt.target.checked,
    }));
  }

  function handleJoin () {
    if (!value) return;

    active.union(value, ui.toolSettings.deleteFeaturesUsedByCombine);
  }
}

export default UnionPanel;
