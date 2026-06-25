import { Tabs } from '@mantine/core';
import type { MapperElement } from 'models/MapDocument';
import { useState } from 'react';
import Attributes from './Attributes';
import styles from './Details.module.scss';
import Metadata from './Metadata';
import Source from './Source';

type TabId = 'properties' | 'source' | 'actions';

export interface ElementDetailsProps {
  element: MapperElement,
}

function ElementDetails ({
  element,
}: ElementDetailsProps) {
  const [tab, setTab] = useState<TabId>('properties');

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>{element.name}</h2>
      </div>

      <Tabs
        value={tab}
        onChange={v => setTab(v as TabId)}
        classNames={{
          root: styles.propsContainer
        }}
      >
        <Tabs.List>
          <Tabs.Tab value='properties'>Properties</Tabs.Tab>
          <Tabs.Tab value='source'>Source</Tabs.Tab>
          <Tabs.Tab value='actions'>Actions</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel
          classNames={{panel: styles.propsPanel}}
          value='properties'
        >
          <Attributes element={element} />
        </Tabs.Panel>

        <Tabs.Panel value='source'>
          <Source element={element} />
        </Tabs.Panel>

        <Tabs.Panel value='actions'>
          Optimize vertices, reduce precision, etc.
        </Tabs.Panel>
      </Tabs>

      <div className={styles.metadata}>
        <Metadata element={element} />
      </div>
    </div>
  );
}

export default ElementDetails;
