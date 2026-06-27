import { Text } from '@mantine/core';
import { Dropzone, type FileWithPath } from '@mantine/dropzone';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { FileArrowDownIcon, FolderOpenIcon, UploadSimpleIcon, XIcon } from '@phosphor-icons/react';
import Constants from 'Constants';
import { loadGeojsonFile, loadMapperFile } from 'lib/mapperConvert';
import Logger from 'Logger';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { MapperDocActions } from 'state/mapper/doc/slice';
import styles from './FileDragScreen.module.scss';
import { openImportDocument } from './modals/ImportDocument';

export interface FileDragScreenProps {
  
}

function FileDragScreen () {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    function handleWindowDragEnter (evt: DragEvent) {
      if (!evt.dataTransfer?.types.includes('Files')) return;

      dragCounter++;
      setVisible(true);
    };
    function handleWindowDragLeave () {
      dragCounter--;
      if (dragCounter === 0) setVisible(false);
    };
    function handleWindowDrop () {
      dragCounter = 0;
      setVisible(false);
    };

    window.addEventListener('dragenter', handleWindowDragEnter, true);
    window.addEventListener('dragleave', handleWindowDragLeave, true);
    window.addEventListener('drop', handleWindowDrop, true);
    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  if (!visible) return null;

  return createPortal(
    <div
      className={styles.overlay}
    >
      <Dropzone
        classNames={{
          root: styles.dropzoneRoot,
          inner: styles.dropzoneInner,
        }}
        onDrop={handleDropOpen}
        onReject={handleReject}
        accept={[Constants.geojsonAccept]}
      >
        <Dropzone.Accept>
          <UploadSimpleIcon size={52} />
        </Dropzone.Accept>

        <Dropzone.Reject>
          <XIcon size={52} />
        </Dropzone.Reject>

        <Dropzone.Idle>
          <FolderOpenIcon size={52} color="var(--color-secondary-l1)" />
        </Dropzone.Idle>

        <div className={styles.title}>
          <Text size="xl" inline>
            Open
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Drag here to open the file as a new document.
          </Text>
        </div>
      </Dropzone>

      <Dropzone
        classNames={{
          root: styles.dropzoneRoot,
          inner: styles.dropzoneInner,
        }}
        onDrop={handleDropImport}
        onReject={handleReject}
        accept={[Constants.geojsonAccept]}
      >
        <Dropzone.Accept>
          <UploadSimpleIcon size={52} />
        </Dropzone.Accept>

        <Dropzone.Reject>
          <XIcon size={52} />
        </Dropzone.Reject>

        <Dropzone.Idle>
          <FileArrowDownIcon size={52} color="var(--color-secondary-l1)" />
        </Dropzone.Idle>

        <div className={styles.title}>
          <Text size="xl" inline>
            Import
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Drag here to import the elements of a GeoJSON file into the current document.
          </Text>
        </div>
      </Dropzone>
    </div>,
    document.body
  );

  function handleDropOpen (evt: FileWithPath[]) {
    modals.openConfirmModal({
      title: "Open document",
      children: (
        <Text size="sm">
          Do you want to discard the current document to open this one?
        </Text>
      ),
      labels: {
        confirm: "Ok",
        cancel: "Cancel"
      },
      onConfirm: () => handleConfirmOpen(evt[0]),
      onCancel: handleCancelOpen,
    });
  }

  async function handleDropImport (evt: FileWithPath[]) {
    const txt = await evt[0].text();
    const elements = loadGeojsonFile(txt);
    if (elements === null) return;

    openImportDocument({
      elements,
    });
  }

  function handleReject () {
    notifications.show({
      color: 'red',
      title: t("dropzone.invalid_file.title"),
      message: t("dropzone.invalid_file.message"),
    });
  }

  async function handleConfirmOpen (evt: FileWithPath) {
    const txt = await evt.text();
    
    const doc = loadMapperFile(evt.name, txt);

    if (!doc) {
      Logger.info("Failed to load document.");

      notifications.show({
        color: 'red',
        title: t("actions.open.notification.error.title"),
        message: t("actions.open.notification.error.message"),
      });

      return;
    }

    dispatch(MapperDocActions.setDocument(doc));
  }

  function handleCancelOpen () {
    notifications.show({
      color: 'blue',
      title: t("notification.action_cancelled"),
      message: "",
    });
  }
}

export default FileDragScreen;
