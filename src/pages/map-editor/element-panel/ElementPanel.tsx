import { ScrollArea } from '@mantine/core';
import { useActiveElement } from 'context/useActiveElement';
import { useSelector } from 'react-redux';
import type { RootState } from 'state/store';
import Element from './Element';
import styles from './ElementPanel.module.scss';
import Ribbon from "./Ribbon";
import { ElementDragProvider } from './useElementDragContext';

export interface ElementPanelProps {
  
}

function ElementPanel (props: ElementPanelProps) {
  const doc = useSelector((state: RootState) => state.mapEditorDoc);
  const active = useActiveElement();

  return (
    <div className={styles.panel}>      
      <Ribbon />

      <ScrollArea
        classNames={{
          root: styles.treeContainer,
          content: styles.content,
        }}
        onClick={handleClick}
      >
        <ElementDragProvider>
          <Element element={doc.content} depth={-1} />
        </ElementDragProvider>
      </ScrollArea>
    </div>
  );

  function handleClick () {
    active.setElement(null);
  }
}

export default ElementPanel;
