import { CaretDoubleDownIcon, CaretDoubleUpIcon } from '@phosphor-icons/react';
import Button from 'components/Button';
import DescriptiveTooltip from 'components/DescriptiveTooltip';
import { useKeyboardCtx } from 'context/useKeyboard';
import type React from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { MapperUiActions } from 'state/mapper/ui/slice';
import useMapperUi from 'state/mapper/ui/useUi';
import { $cl } from 'utils';
import BasePanel_Description from './BasePanel.Description';
import BasePanel_FeatureMenu from './BasePanel.FeatureMenu';
import BasePanel_Keys from './BasePanel.Keys';
import styles from './BasePanel.module.scss';
import BasePanel_Ribbon from './BasePanel.Ribbon';
import BasePanel_Row from './BasePanel.Row';

export interface PanelProps {
  name: string;
  className?: string;
  children: React.ReactNode;
}

function BasePanel ({
  name,
  className,
  children,
}: PanelProps) {
  const ui = useMapperUi();
  const keyboard = useKeyboardCtx();
  const dispatch = useDispatch();

  const { t } = useTranslation();

  useEffect(() => {
    // Shift will collapse the panel. Ctrl + shift will expand it.
    if (keyboard.shift) {
      dispatch(MapperUiActions.setSettingsPanelExpanded(keyboard.ctrl));
    }
  }, [keyboard.shift]);

  if (keyboard.shift === false && ui.isSettingsPanelExpanded === false) return (
    <div className={styles.panel}>
      <DescriptiveTooltip
        label={t("tool.settings.expand.name", { name })}
        description={t("tool.settings.expand.desc")}
      >
        <Button onClick={handleExpand}>
          <CaretDoubleDownIcon size={24} weight='thin' />
        </Button>
      </DescriptiveTooltip>
    </div>
  )

  return (
    <div className={styles.panel} data-expanded={true}>
      <div className={styles.header}>
        <DescriptiveTooltip
          label={t("tool.settings.collapse.name")}
          shortcut="Shift"
        >
          <Button onClick={handleCollapse}>
            <CaretDoubleUpIcon size={24} weight='thin' />
          </Button>
        </DescriptiveTooltip>
        <h3>{name}</h3>
      </div>
      <div className={$cl(styles.content, className)}>
        {children}
      </div>
    </div>
  );

  function handleExpand () {
    dispatch(MapperUiActions.setSettingsPanelExpanded(true));
  }

  function handleCollapse () {
    dispatch(MapperUiActions.setSettingsPanelExpanded(false));
  }
}

BasePanel.Desc = BasePanel_Description;
BasePanel.Ribbon = BasePanel_Ribbon;
BasePanel.Keys = BasePanel_Keys;
BasePanel.FeatureMenu = BasePanel_FeatureMenu;
BasePanel.Row = BasePanel_Row;

export default BasePanel;
