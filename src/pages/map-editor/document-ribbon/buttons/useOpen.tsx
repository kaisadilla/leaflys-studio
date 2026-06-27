import Constants from 'Constants';
import fileOpen from 'file-open';
import { loadMapperFile } from 'lib/mapperConvert';
import Logger from 'Logger';
import { useDispatch } from 'react-redux';
import { MapperDocActions } from 'state/mapper/doc/slice';

export default function useOpen () {
  const dispatch = useDispatch();

  async function handleOpen () {
    const files = await fileOpen({
      multiple: false,
      accept: Constants.geojsonAccept,
    });

    if (files.length < 1) {
      Logger.error("Empty file array.");
    }
    
    const doc = loadMapperFile(files[0].name, files[0].contents);

    if (!doc) {
      Logger.info("Failed to load document.");
      return;
    }

    dispatch(MapperDocActions.setDocument(doc));
  }

  return {
    handleOpen,
  }
}
