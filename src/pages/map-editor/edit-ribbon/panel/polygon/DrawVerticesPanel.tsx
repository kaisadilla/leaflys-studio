import styles from './DrawVerticesPanel.module.scss';

import { Slider } from '@mantine/core';
import { MagnetIcon, MapPinIcon } from '@phosphor-icons/react';
import DescriptiveTooltip from 'components/DescriptiveTooltip';
import LabeledControl from 'components/LabeledControl';
import ToggleButton from 'components/ToggleButton';
import Constants from 'Constants';
import MathExt from 'MathExt';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { MapperUiActions } from 'state/mapper/ui/slice';
import useMapperUi from 'state/mapper/ui/useUi';
import BasePanel from "../BasePanel";

export interface DrawVerticesPanelProps {
  
}

function DrawVerticesPanel (props: DrawVerticesPanelProps) {
  const ui = useMapperUi();
  const dispatch = useDispatch();

  const { t } = useTranslation();

  return (
    <BasePanel className={styles.panel} name="Draw vertices tool">
      <BasePanel.Desc>
        {t("tool.polygon.draw_vertices.settings.desc")}
      </BasePanel.Desc>
      
      <h3>
        {t("tool.polygon.draw_vertices.settings.section.options")}
      </h3>
      <BasePanel.Ribbon>
        <DescriptiveTooltip
          label={t("tool.polygon.draw_vertices.settings.snap.name")}
          description={t("tool.polygon.draw_vertices.settings.snap.desc")}
        >
          <ToggleButton
            active={ui.toolSettings.snap}
            onChange={handleChangeSnap}
          >
            <MagnetIcon size={24} weight='thin' />
          </ToggleButton>
        </DescriptiveTooltip>

        <DescriptiveTooltip
          label={t("tool.polygon.draw_vertices.settings.show_verts.name")}
          description={t("tool.polygon.draw_vertices.settings.show_verts.desc")}
        >
          <ToggleButton
            active={ui.toolSettings.showVertices}
            onChange={handleChangeShowVertices}
          >
            <MapPinIcon size={24} weight='thin' />
          </ToggleButton>
        </DescriptiveTooltip>
      </BasePanel.Ribbon>
      
      <LabeledControl
        label={t("tool.polygon.draw_vertices.settings.snap_distance.name")}
        labelWidth={120}
        description={t("tool.polygon.draw_vertices.settings.snap_distance.desc")}
      >
        <Slider
          min={Constants.minSnapDistance}
          max={Constants.maxSnapDistance}
          value={ui.toolSettings.snapDistance}
          onChange={handleChangeSnapDistance}
        />
      </LabeledControl>
      
      <LabeledControl
        label={t("tool.polygon.draw_vertices.settings.pencil_step.name")}
        labelWidth={120}
        description={t("tool.polygon.draw_vertices.settings.pencil_step.desc")}
      >
        <Slider
          min={Constants.minPencilStep}
          max={Constants.maxPencilStep}
          value={ui.toolSettings.pencilStep}
          onChange={handleChangePencilStep}
        />
      </LabeledControl>
      
      <LabeledControl
        label={t("tool.polygon.draw_vertices.settings.vertex_size.name")}
        labelWidth={120}
        description={t("tool.polygon.draw_vertices.settings.vertex_size.desc")}
      >
        <Slider
          min={Constants.minVertexSize}
          max={Constants.maxVertexSize}
          value={ui.toolSettings.vertexSize}
          onChange={handleChangeVertexSize}
        />
      </LabeledControl>
    </BasePanel>
  );

  function handleChangeSnap (value: boolean) {
    dispatch(MapperUiActions.setToolSettings({
      key: 'snap',
      value,
    }));
  }

  function handleChangeSnapDistance (value: number) {
    dispatch(MapperUiActions.setToolSettings({
      key: 'snapDistance',
      value: MathExt.clamp(
        value, Constants.minSnapDistance, Constants.maxSnapDistance
      ),
    }));
  }

  function handleChangePencilStep (value: number) {
    dispatch(MapperUiActions.setToolSettings({
      key: 'pencilStep',
      value: MathExt.clamp(
        value, Constants.minPencilStep, Constants.maxPencilStep
      ),
    }));
  }

  function handleChangeVertexSize (value: number) {
    dispatch(MapperUiActions.setToolSettings({
      key: 'vertexSize',
      value: MathExt.clamp(
        value, Constants.minVertexSize, Constants.maxVertexSize
      ),
    }));
  }

  function handleChangeShowVertices (value: boolean) {
    dispatch(MapperUiActions.setToolSettings({
      key: 'showVertices',
      value,
    }));
  }
}

export default DrawVerticesPanel;
