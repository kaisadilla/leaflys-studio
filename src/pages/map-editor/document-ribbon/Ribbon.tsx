import { Button as MButton, Menu } from '@mantine/core';
import { ArrowLineDownIcon, CaretDownIcon, FileArrowDownIcon, FileArrowUpIcon, FileIcon, FilePlusIcon, FloppyDiskIcon, FolderOpenIcon, GearIcon } from '@phosphor-icons/react';
import { ClockCounterClockwiseIcon } from '@phosphor-icons/react/dist/ssr';
import Button from 'components/Button';
import DescriptiveTooltip from 'components/DescriptiveTooltip';
import { Redo, Undo } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from 'state/store';
import { isEventTargetEditable } from 'utils';
import { MapperHistory } from '../MapperHistory';
import styles from './Ribbon.module.scss';
import useImport from './buttons/useImport';
import useOpen from './buttons/useOpen';
import useRedo from './buttons/useRedo';
import useSave from './buttons/useSave';
import useUndo from './buttons/useUndo';

export interface EditorRibbonProps {

}

function DocumentRibbon ({

}: EditorRibbonProps) {
  const doc = useSelector((state: RootState) => state.mapEditorDoc);
  const { t, i18n } = useTranslation();

  const { handleUndo } = useUndo();
  const { handleRedo } = useRedo();
  const { handleOpen } = useOpen();
  const { handleSave } = useSave();
  const { handleImport } = useImport();

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  function handleCommit () {}
  function handleShowHistory () {}

  useEffect(() => {
    MapperHistory.onHistoryChange(handleHistoryChange);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      MapperHistory.offHistoryChange(handleHistoryChange);
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return (
    <div className={styles.ribbon}>
      <Menu width={200}>
        <Menu.Target>
          <MButton
            classNames={{
              root: styles.docButton,
              inner: styles.inner,
              label: styles.label,
            }}
            variant='outline'
            color='gray'
          >
            <FileIcon size={24} weight='thin' />

            <span className={styles.name}>
              {doc.content.name}
            </span>

            <CaretDownIcon />
          </MButton>
        </Menu.Target>

        <Menu.Dropdown w={240}>
          {doc.headers.map(h => (
            <Menu.Item key={h.id}>
              {t("mapper.name")} ({h.modifiedAt})
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      
      <DescriptiveTooltip
        label={t("ribbon.new.name")}
        description={t("ribbon.new.desc")}
      >
        <Button>
          <FilePlusIcon size={24} weight='thin' />
        </Button>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("ribbon.open.name")}
        description={t("ribbon.open.desc")}
      >
        <Button
          onClick={handleOpen}
        >
          <FolderOpenIcon size={24} weight='thin' />
        </Button>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("ribbon.commit.name")}
        description={t("ribbon.commit.desc")}
      >
        <Button
          onClick={handleCommit}
        >
          <ArrowLineDownIcon size={24} weight='thin' />
        </Button>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("ribbon.save.name")}
        description={t("ribbon.save.desc")}
      >
        <Button
          onClick={handleSave}
        >
          <FloppyDiskIcon size={24} weight='thin' />
        </Button>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("ribbon.import.name")}
        description={t("ribbon.import.desc")}
      >
        <Button
          onClick={handleImport}
        >
          <FileArrowDownIcon size={24} weight='thin' />
        </Button>
      </DescriptiveTooltip>

      <DescriptiveTooltip
        label={t("ribbon.export.name")}
        description={t("ribbon.export.desc")}
      > 
        <Button>
          <FileArrowUpIcon size={24} weight='thin' />
        </Button>
      </DescriptiveTooltip>

      <div className={styles.historyRibbon}>
        <DescriptiveTooltip
          label={t("ribbon.undo.name")}
          shortcut="Ctrl + Z"
        > 
          <Button
            onClick={handleUndo}
            disabled={canUndo === false}
          >
            <Undo />
          </Button>
        </DescriptiveTooltip>

        <DescriptiveTooltip
          label={t("ribbon.redo.name")}
          shortcut="Ctrl + Y"
        > 
          <Button
            onClick={handleRedo}
            disabled={canRedo === false}
          >
            <Redo />
          </Button>
        </DescriptiveTooltip>

        <DescriptiveTooltip
          label={t("ribbon.history.name")}
          shortcut="Ctrl + H"
        > 
          <Button
            onClick={handleShowHistory}
          >
            <ClockCounterClockwiseIcon />
          </Button>
        </DescriptiveTooltip>
      </div>

      {false && <div className={styles.appRibbon}>

        <DescriptiveTooltip
          label={t("ribbon.settings.name")}
          description={t("ribbon.settings.desc")}
        > 
          <Button>
            <GearIcon size={24} weight='thin' />
          </Button>
        </DescriptiveTooltip>
      </div>}
    </div>
  );

  function handleHistoryChange (hasPast: boolean, hasFuture: boolean) {
    setCanUndo(hasPast);
    setCanRedo(hasFuture);
  }

  function handleKeyDown (evt: KeyboardEvent) {
    if (isEventTargetEditable(evt.target)) return;

    if (evt.code === 'KeyZ') {
      handleUndo();
    }
    else if (evt.code === 'KeyY') {
      handleRedo();
    }
  }
}

export default DocumentRibbon;
