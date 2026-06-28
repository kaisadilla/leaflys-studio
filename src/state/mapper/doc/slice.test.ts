import getSampleDocument from "@test/fixtures/sampleDocument";
import { ElementFactory, type MapperGroup } from "models/MapDocument";
import { beforeEach, describe, expect, it } from "vitest";
import { getElement, getElementIndex, getElementParent, insertElement, insertElementBetween, isElementHidden, removeElement } from "./slice";

//describe('mapperDocSlice', () => {
//  //describe('')
//});

describe("helper functions", () => {
  let root: MapperGroup;

  beforeEach(() => {
    root = getSampleDocument();
  });

  describe('getElement', () => {
    it("can find an arbitrarily nested element", () => {
      const el1 = getElement(root, "linestring", true);
      expect(el1).not.toBeNull();
      expect(el1?.id).toBe("linestring");

      const el3 = getElement(root, "point-1-1-1", true);
      expect(el3).not.toBeNull();
      expect(el3?.id).toBe("point-1-1-1");
    });

    it("returns null when element doesn't exist", () => {
      const el1 = getElement(root, "fake-id", true);
      expect(el1).toBeNull();
    });

    it("fails to find nested elements when search isn't recursive", () => {
      const el1 = getElement(root, "linestring", false);
      expect(el1).not.toBeNull();
      expect(el1?.id).toBe("linestring");

      const el3 = getElement(root, "point-1-1-1", false);
      expect(el3).toBeNull();
    });

    it("can find the container given itself", () => {
      const el1 = getElement(root, "root", true);
      expect(el1).toEqual(root);
    });
  });

  describe('getElementParent', () => {
    it("can find the parent of an element given", () => {
      const parent = getElementParent(root, "point-1-1-1");
      expect(parent?.id).toBe("group-1-1");
    });

    it("returns null when element doesn't have parent", () => {
      const parent = getElementParent(root, "root");
      expect(parent).toBeNull();
    });

    it(
      "when querying a hole's parent, returns the element that owns it",
      () => {
        const parent = getElementParent(root, "germany-hole-1");
        expect(parent?.id).toBe("germany");
      },
    );
  });

  describe('getElementIndex', () => {
    it("finds the correct index", () => {
      const idx1 = getElementIndex(root, "linestring");
      expect(idx1).toBe(2);

      const idx2 = getElementIndex(root, "group-1-1");
      expect(idx2).toBe(1);
    });

    it("returns null when element doesn't exist", () => {
      const idx = getElementIndex(root, "fake-id");
      expect(idx).toBeNull();
    });
  });

  describe('isElementHidden', () => {
    it("correctly determines whether an element is hidden", () => {
      const el = getElement(root, "group-1-1", true);
      el!.isHidden = true;

      expect(isElementHidden(root, el!.id, false)).toBe(true);
      expect(isElementHidden(root, "point-1-1-1", false)).toBe(true);
      expect(isElementHidden(root, "group-1", false)).toBe(false);
      expect(isElementHidden(root, "point-1-1", false)).toBe(false);

      el!.isHidden = false;

      const gr = getElement(root, "group-1", true);
      gr!.isHidden = true;
      expect(isElementHidden(root, "point-1-1-1", false)).toBe(true);
    });

    it("returns null when root is not a container", () => {
      expect(isElementHidden(root.elements[0], "group-1", false)).toBeNull();
    });
  });

  describe('removeElement', () => {
    it("returns null if container has no children", () => {
      const clone = structuredClone(root);
      const el = removeElement(clone.elements[0], "linestring");
      expect(el).toBeNull();
    });

    it("does nothing when given an invalid id", () => {
      const clone = structuredClone(root);
      const el = removeElement(clone, "fake-id");
      expect(clone).toEqual(root);
      expect(el).toBeNull();
    });

    it("removes the element with the given id", () => {
      const clone = structuredClone(root);
      const el = removeElement(clone, "linestring");
      expect(clone.elements.find(e => e.id === "linestring")).toBeUndefined();
      expect(el?.id).toBe("linestring");
    });

    it("isn't recursive", () => {
      const clone = structuredClone(root);
      removeElement(clone, "group-1-1");
      expect(clone).toEqual(root);
    });
  });

  describe('insertElement', () => {
    it("inserts element at the index given", () => {
      const clone = structuredClone(root);
      const el = ElementFactory.rectangle(3, 3, 3, 3, "rect2");

      insertElement(clone, el, 3);

      expect(clone.elements[3].id).toBe(el.id);
    });

    it("appends element at the end", () => {
      const clone = structuredClone(root);
      const el = ElementFactory.rectangle(3, 3, 3, 3, "rect2");

      insertElement(clone, el, null);

      expect(clone.elements[clone.elements.length - 1].id).toBe(el.id);
    });
  });

  describe('insertElementBetween', () => {
    it("inserts element before id given", () => {
      const clone = structuredClone(root);
      const el = ElementFactory.rectangle(3, 3, 3, 3, "rect2");

      insertElementBetween(clone, el, "linestring", 'before');

      const idxEl = clone.elements.findIndex(e => e.id === el.id);
      const idxRef = clone.elements.findIndex(e => e.id === "linestring");

      expect(idxEl).toBe(idxRef - 1);
    });

    it("inserts element after id given", () => {
      const clone = structuredClone(root);
      const el = ElementFactory.rectangle(3, 3, 3, 3, "rect2");

      insertElementBetween(clone, el, "linestring", 'after');

      const idxEl = clone.elements.findIndex(e => e.id === el.id);
      const idxRef = clone.elements.findIndex(e => e.id === "linestring");

      expect(idxEl).toBe(idxRef + 1);
    });

    it("inserts element at end if id is not found", () => {
      const clone = structuredClone(root);
      const el = ElementFactory.rectangle(3, 3, 3, 3, "rect2");

      insertElementBetween(clone, el, "fake-id", 'after');

      const idxEl = clone.elements.findIndex(e => e.id === el.id);
      expect(idxEl).toBe(clone.elements.length - 1);
    });
  });
});
