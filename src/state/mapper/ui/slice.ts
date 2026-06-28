import { createSlice, type PayloadAction, type WritableDraft } from "@reduxjs/toolkit";

const TOOLS_THAT_AUTO_EXPAND_SETTINGS = new Set<MapperTool>([
  'delete_vertices',
  'union',
  'difference',
  'intersection',
]);

interface MapperUiState {
  /**
   * The editing tool currently in use, or `null` if no tool is selected.
   */
  tool: MapperTool | null;
  isSettingsPanelExpanded: boolean;
  toolSettings: {
    newPointMode: NewPointToolMode;
    snap: boolean;
    snapDistance: number;
    pencilStep: number;
    vertexSize: number;
    showVertices: boolean;
    deleteVertexSize: number;
    deleteFeaturesUsedByCombine: boolean;
    deleteFeaturesUsedByDifference: boolean;
  };
  /**
   * The container where elements will be added when created with the creation
   * tools (new_point, new_polygon, etc).
   */
  targetContainerId: string | null;
}

const initialState: MapperUiState = {
  tool: null,
  isSettingsPanelExpanded: true,
  toolSettings: {
    newPointMode: 'single',
    snap: false,
    snapDistance: 20,
    pencilStep: 10,
    vertexSize: 12,
    showVertices: true,
    deleteVertexSize: 20,
    deleteFeaturesUsedByCombine: false,
    deleteFeaturesUsedByDifference: false,
  },
  targetContainerId: null,
}

const mapperUiSlice = createSlice({
  name: "mapEditorUi",
  initialState,
  reducers: {
    setTool (state, action: PayloadAction<MapperTool | null>) {
      const tool = action.payload;

      state.tool = tool;

      if (tool && TOOLS_THAT_AUTO_EXPAND_SETTINGS.has(tool)) {
        state.isSettingsPanelExpanded = true;
      }
    },

    setSettingsPanelExpanded (state, action: PayloadAction<boolean>) {
      const value = action.payload;

      state.isSettingsPanelExpanded = value;
    },

    setToolSettings<K extends keyof MapperUiState['toolSettings']> (
      state: WritableDraft<MapperUiState>, action: PayloadAction<{
        key: K,
        value: MapperUiState['toolSettings'][K],
      }>
    ) {
      const { key, value } = action.payload;

      state.toolSettings[key] = value;
    },

    setTargetContainer(state, action: PayloadAction<string>) {
      state.targetContainerId = action.payload;
    }
  },
});

export const mapperUiReducer = mapperUiSlice.reducer;
export const MapperUiActions = mapperUiSlice.actions;

export type MapperDocumentTool = 'new_point'
  | 'new_line'
  | 'new_polygon'
  | 'new_rectangle'
  | 'new_circle'
  ;

export type MapperPointTool = 'move_shape'
  ;

export type MapperPolygonTool = 'draw_vertices'
  | 'move_vertices'
  | 'cut'
  | 'delete_vertices'
  | 'union'
  | 'difference'
  | 'intersection'
  | 'set_origin'
  | 'move_shape'
  ;

export type MapperTool = MapperDocumentTool
  | MapperPointTool
  | MapperPolygonTool
  ;

export type NewPointToolMode = 'single' | 'multi' | 'named';
