import { saveAs } from "file-saver";
import createMapperFile from "lib/createMapperFile";
import useMapperDoc from "state/mapper/doc/useDoc";

export default function useSave () {
  const doc = useMapperDoc();

  function handleSave () {
    const obj = createMapperFile(doc.content);
    const txt = JSON.stringify(obj);

    const blob = new Blob([txt], {
      type: "text/plain;charset=utf-8"
    });
    
    saveAs(blob, "unnamed.geojson");
  }

  return {
    handleSave,
  }
}
