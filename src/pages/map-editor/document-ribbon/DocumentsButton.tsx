import { Button as MButton, Menu } from '@mantine/core';
import { CaretDownIcon, FileIcon, PencilIcon, XIcon } from '@phosphor-icons/react';
import Button from 'components/Button';
import Fmt from 'Fmt';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import useDispatchMapperDocument from 'state/mapper/useMapperDocument';
import type { RootState } from 'state/store';
import styles from './DocumentsButton.module.scss';

export interface DocumentsButtonProps {
  
}

function DocumentsButton (props: DocumentsButtonProps) {
  const doc = useSelector((state: RootState) => state.mapEditorDoc);
  const dispatch = useDispatchMapperDocument();

  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  return (
    <Menu position='bottom-start'>
      <Menu.Target>
        <MButton
          classNames={{
            root: styles.buttonRoot,
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

      <Menu.Dropdown
        classNames={{ dropdown: styles.dropdown }}
        w={300}
      >
        {doc.headers.map(h => (
          <Menu.Item
            key={h.id}
            classNames={{
              item: styles.item,
              itemLabel: styles.label,
            }}
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
              <Button>
                <PencilIcon />
              </Button>
              <Button>
                <XIcon />
              </Button>
            </div>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );

  function handleLoadDocument (id: string) {
    dispatch.document.load(id);
  }

  function handleDeleteDocument (id: string) {

  }
}

export default DocumentsButton;
