import { Button as MButton, Popover } from '@mantine/core';
import { CaretDownIcon, FileIcon, PencilIcon, XIcon } from '@phosphor-icons/react';
import Button from 'components/Button';
import Fmt from 'Fmt';
import { useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useDispatchMapperDocument from 'state/mapper/doc/dispatch';
import type { MapperDocHeader } from 'state/mapper/doc/slice';
import type { RootState } from 'state/store';
import { openConfirmModal } from '../modals/ConfirmModal';
import { openTextInputModal } from '../modals/TextInputModal';
import styles from './DocumentsButton.module.scss';

export interface DocumentsButtonProps {
  
}

function DocumentsButton (props: DocumentsButtonProps) {
  const doc = useSelector((state: RootState) => state.mapEditorDoc);
  const dispatch = useDispatchMapperDocument();

  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate();
    }, 1_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Popover
      position='bottom-start'
      opened={open}
      onChange={setOpen}
    >
      <Popover.Target>
        <MButton
          classNames={{
            root: styles.buttonRoot,
            inner: styles.inner,
            label: styles.label,
          }}
          variant='outline'
          color='gray'
          onClick={() => setOpen(prev => !prev)}
        >
          <FileIcon size={24} weight='thin' />

          <span className={styles.name}>
            {doc.content.name}
          </span>

          <CaretDownIcon />
        </MButton>
      </Popover.Target>

      <Popover.Dropdown
        classNames={{ dropdown: styles.dropdown }}
        w={300}
      >
        {doc.headers.map(h => (
          <div
            key={h.id}
            className={styles.item}
            data-active={h.id === doc.activeId}
            onClick={() => handleLoadDocument(h.id)}
          >
            <div className={styles.header}>
              <span className={styles.name}>
                {h.name}
              </span>
              <span className={styles.timeSince}>
                {Fmt.timeSince(new Date(h.modifiedAt))} ago
              </span>
            </div>
            <div className={styles.actions}>
              <Button
                onClick={evt => handleRenameDocument(evt, h)}
              >
                <PencilIcon />
              </Button>
              {doc.headers.length > 1 && <Button
                onClick={evt => handleDeleteDocument(evt, h)}
              >
                <XIcon />
              </Button>}
            </div>
          </div>
        ))}
      </Popover.Dropdown>
    </Popover>
  );

  function handleLoadDocument (id: string) {
    setOpen(false);
    dispatch.document.load(id);
  }

  function handleRenameDocument (evt: React.MouseEvent, header: MapperDocHeader) {
    evt.stopPropagation();
    setOpen(false);
    
    openTextInputModal(
      "Rename document",
      "Give the document a new name:",
      header.name,
      name => {
        dispatch.document.rename(header.id, name);
      }
    );
  }

  function handleDeleteDocument (evt: React.MouseEvent, header: MapperDocHeader) {
    evt.stopPropagation();
    setOpen(false);

    openConfirmModal(
      "Delete document",
      `Are you sure you want to delete "${header.name}"? This action cannot ` +
      "be undone.",
      () => {
        dispatch.document.delete(header.id);
      }
    );
  }
}

export default DocumentsButton;
