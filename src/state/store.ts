import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { mapperDocMiddleware } from "./mapper/docMiddleware";
import { mapperDocReducer } from "./mapper/docSlice";
import { mapperSettingsReducer } from "./mapper/settingsSlice";
import { mapperUiReducer } from "./mapper/uiSlice";

const rootReducer = combineReducers({
  mapEditorDoc: mapperDocReducer,
  mapEditorUi: mapperUiReducer,
  mapEditorSettings: mapperSettingsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefault => getDefault().concat(mapperDocMiddleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
