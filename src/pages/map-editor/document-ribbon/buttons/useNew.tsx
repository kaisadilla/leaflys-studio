import { openTextInputModal } from "pages/map-editor/modals/TextInputModal";
import useDispatchMapperDocument from "state/mapper/doc/dispatch";

export default function useNew () {
  const dispatch = useDispatchMapperDocument();

  function handleNew () {
    openTextInputModal(
      "New document",
      "Give the document a name:",
      "New document",
      name => {
        dispatch.document.new(name);
      }
    );
  }

  return {
    handleNew,
  };
}
