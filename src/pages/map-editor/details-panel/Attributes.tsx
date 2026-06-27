import { Button, Checkbox, Slider } from '@mantine/core';
import LabeledControl from 'components/LabeledControl';
import { useFileLoading } from 'hook/useFileLoading';
import { type MapperElement, type MapperRectangle } from 'models/MapDocument';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import MapperDocThunks from 'state/mapper/doc/thunks';
import { type AppDispatch } from 'state/store';
import styles from './Attributes.module.scss';
import Properties from './Properties';

export interface AttributesProps {
  element: MapperElement;
}

function Attributes ({
  element,
}: AttributesProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { t } = useTranslation();

  return (
    <div className={styles.tab}>
      {element.type === 'Rectangle' && <_RectangleAttributes rect={element} />}

      <h5>{t("element_info.properties.name")}</h5>

      <Properties element={element} />
    </div>
  );
}

interface _RectangleAttributesProps {
  rect: MapperRectangle;
}

function _RectangleAttributes ({
  rect,
}: _RectangleAttributesProps) {
  const dispatch = useDispatch<AppDispatch>();
  const fileRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();
  const { loadFile } = useFileLoading();

  return (<>
    <h5>{t("element_info.attributes.name")}</h5>
    
    <LabeledControl
      label={t("element_info.attributes.rect.image.name")}
      labelWidth={120}
      description={t("element_info.attributes.rect.image.desc")}
    >
      <div className={styles.imageControls}>
        <Button
          size='compact-sm'
          onClick={handleLoadImage}
        >
          Load image
        </Button>
        <Button
          size='compact-sm'
          variant='outline'
          onClick={handleClearImage}
        >
          Clear image
        </Button>
      </div>
    </LabeledControl>

    {rect.image && <LabeledControl
      label={t("element_info.attributes.rect.opacity.name")}
      labelWidth={120}
      description={t("element_info.attributes.rect.opacity.desc")}
    >
      <Slider
        min={0}
        max={1}
        step={0.01}
        value={rect.opacity}
        onChange={handleChangeOpacity}
      />
    </LabeledControl>}
    {rect.image && <LabeledControl
      label={t("element_info.attributes.rect.interactive.name")}
      description={t("element_info.attributes.rect.interactive.desc")}
      labelWidth={120}
    >
      <Checkbox
        checked={rect.interactive}
        onChange={evt => handleChangeInteractive(evt.target.checked)}
      />
    </LabeledControl>}
    {rect.image && <LabeledControl
      label={t("element_info.attributes.rect.save_image.name")}
      description={t("element_info.attributes.rect.save_image.desc")}
      labelWidth={120}
    >
      <Checkbox
        checked={rect.saveImage}
        onChange={evt => handleChangeSaveImage(evt.target.checked)}
      />
    </LabeledControl>}
  </>);

  async function handleLoadImage () {
    const file = await loadFile("image/*");
    if (!file) return;

    const reader = new FileReader();

    reader.onload = evt => {
      const base64 = evt.target?.result;
    
      if (!base64) return;
    
      dispatch(MapperDocThunks.updateRectangle(rect.id, {
        image: base64 as string,
      }));
    }

    reader.readAsDataURL(file);
  }

  function handleClearImage () {
    dispatch(MapperDocThunks.updateRectangle(rect.id, {
      image: null,
    }));
  }

  function handleChangeOpacity (value: number) {
    dispatch(MapperDocThunks.updateRectangle(rect.id, {
      opacity: value,
    }));
  }

  function handleChangeInteractive (value: boolean) {
    dispatch(MapperDocThunks.updateRectangle(rect.id, {
      interactive: value,
    }));
  }

  function handleChangeSaveImage (value: boolean) {
    dispatch(MapperDocThunks.updateRectangle(rect.id, {
      saveImage: value,
    }));
  }
}

function binaryStringToDataURL (binaryString: string, mime = "image/png") {
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mime });
  return new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export default Attributes;
