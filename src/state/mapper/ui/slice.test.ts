import { describe, expect, it } from "vitest";
import { MapperUiActions, mapperUiReducer } from "./slice";

describe('mapperUiSlice', () => {
  describe('setTool', () => {
    it("works", () => {
      const state = mapperUiReducer(
        undefined, MapperUiActions.setTool('move_shape')
      );

      expect(state.tool).toBe('move_shape');
    });
  });
});
