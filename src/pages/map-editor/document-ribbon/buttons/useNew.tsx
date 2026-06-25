import { openNewDocumentModal } from "pages/map-editor/modals/NewDocument";
import useDispatchMapperDocument from "state/mapper/useMapperDocument";

export default function useNew () {
  const dispatch = useDispatchMapperDocument();

  async function handleNew () {
    openNewDocumentModal(name => {
      dispatch.document.new(name);
    });
  }

  return {
    handleNew,
  };
}
