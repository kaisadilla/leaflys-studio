import Local from "Local";
import { useSelector } from "react-redux";
import useDispatchMapperDocument from "state/mapper/useMapperDocument";
import type { RootState } from "state/store";

export default function useCommit () {
  const doc = useSelector((state: RootState) => state.mapEditorDoc);
  const dispatch = useDispatchMapperDocument();

  async function handleCommit () {
    Local.updateDocument(doc.activeId, doc.content);
  }

  return {
    handleCommit,
  };
}
