import Favicon from "assets/img/favicon.svg?react";
import { APP_FULL_NAME, APP_URL, APP_VER } from "Constants";
import { useActiveElement } from "context/useActiveElement";
import useKeyboardShortcut from "hook/useKeyboardShortcut";
import { useEffect, useRef } from "react";
import { useJoyride } from 'react-joyride';
import { useSelector } from "react-redux";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import useMapperSettings from "state/mapper/useSettings";
import type { RootState } from "state/store";
import { $cl } from "utils";
import AppRibbon from "./app-ribbon/Ribbon";
import Details from "./details-panel/Details";
import DocumentRibbon from "./document-ribbon/Ribbon";
import Ribbon from "./edit-ribbon/Ribbon";
import SettingsPanel from "./edit-ribbon/SettingsPanel";
import ElementPanel from "./element-panel/ElementPanel";
import FileDragScreen from "./FileDragScreen";
import HistoryListener from "./HistoryListener";
import MAP_EDITOR_JOYRIDE_STEPS from "./joyride";
import Map from "./map/Map";
import styles from "./page.module.scss";

export interface MapEditorPageProps {

}

function MapEditorPage (props: MapEditorPageProps) {
  const ui = useSelector((state: RootState) => state.mapEditorUi);
  const settings = useMapperSettings();
  const active = useActiveElement();
  const ref = useRef<HTMLDivElement>(null);

  const { standalone } = useKeyboardShortcut();

  standalone['Escape'] = () => {
    if (ui.tool === null) {
      active.setElement(null);
    }
  }
  
  const tour = useJoyride({
    steps: MAP_EDITOR_JOYRIDE_STEPS,
  });

  useEffect(() => {
    if (!ref.current) return;

    ref.current.style.setProperty('--col-gj-active', settings.colors.active);
  }, [settings]);

  return (
    <div ref={ref} className={styles.page}>
      <HistoryListener />
      <FileDragScreen />

      {tour.Tour}

      <header className={styles.header}>
        <div className={styles.logo}>
          <Favicon width={24} height={24} />
          <div className={styles.name}>
            Yerevan
          </div>
          <div className={styles.appName}>
            &nbsp;· GeoJSON Editor
          </div>
        </div>

        <div className={styles.separator} />

        <DocumentRibbon
        />

        <AppRibbon
          onRunTour={handleRunTour}
        />
        
      </header>

      <div className={styles.guide}>
        🛈 This will be a guide through the app.
      </div>

      <PanelGroup
        className={styles.panelGroup}
        role='main'
        direction='horizontal'
        autoSaveId='azaria/yerevan/map-editor/page'
      >
        <Panel
          className={$cl(styles.panel, styles.elementPanel)}
          defaultSize={16}
          minSize={8}
        >
          <div className={styles.elementFrame}>
            <ElementPanel />
          </div>
        </Panel>

        <PanelResizeHandle />

        <Panel
          className={$cl(styles.panel, styles.mapPanel)} minSize={20}>
          <div className={styles.editRibbon}>
            <Ribbon />
          </div>
          <div className={styles.mapFrame}>
            <Map />
            <SettingsPanel />
          </div>
        </Panel>

        <PanelResizeHandle />

        <Panel
          className={$cl(styles.panel, styles.detailsPanel)}
          defaultSize={25}
          minSize={5}
        >
          <div className={styles.detailsFrame}>
            <Details />
          </div>
        </Panel>
      </PanelGroup>

      <footer className={styles.footer}>
        
      </footer>
      
      {false && <PanelGroup
        className={styles.documentPanelGroup}
        direction='horizontal'
        autoSaveId="map-editor"
      >
        <Panel className={styles.featuresPanel} defaultSize={11} minSize={8}>
          <div className={styles.featuresFrame}>
            <ElementPanel />
          </div>
        </Panel>
        <PanelResizeHandle><div /></PanelResizeHandle>
        <Panel className={styles.mapPanel} minSize={20}>
          <div className={styles.editRibbon}>
            <Ribbon />
          </div>
          <div className={styles.mapFrame}>
            <Map />
            <SettingsPanel />
          </div>
        </Panel>
        <PanelResizeHandle><div /></PanelResizeHandle>
        <Panel className={styles.detailsPanel} defaultSize={20} minSize={5}>
          <div className={styles.detailsFrame}>
            <Details />
          </div>
        </Panel>
      </PanelGroup>}
      {false && <div className={styles.appToolbar}>
        <DocumentRibbon
        />
        <div className={styles.appName}>
          {APP_FULL_NAME} — {APP_VER} (BETA)&nbsp;&nbsp;·&nbsp;&nbsp;{APP_URL}
        </div>
      </div>}
    </div>
  );

  function handleRunTour () {
    tour.controls.start();
  }
}

export default MapEditorPage;
