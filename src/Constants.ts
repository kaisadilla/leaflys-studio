const Constants = {
  geojsonAccept: ".geojson,application/geo+json,.json,application/json",
  minSnapDistance: 1,
  maxSnapDistance: 50,
  minPencilStep: 1,
  maxPencilStep: 50,
  minVertexSize: 4,
  maxVertexSize: 20,
}

export const APP_ID = import.meta.env.VITE_APP_ID;
export const APP_FULL_NAME = import.meta.env.VITE_APP_FULL_NAME;
export const APP_TITLE = import.meta.env.VITE_APP_TITLE;
export const APP_URL = import.meta.env.VITE_APP_URL;
export const APP_VER = import.meta.env.VITE_APP_VER;
export const APP_BUILD = parseInt(import.meta.env.VITE_APP_BUILD);

export default Constants;
