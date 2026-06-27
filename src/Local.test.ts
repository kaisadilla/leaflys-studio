import 'fake-indexeddb/auto';
import { ElementFactory } from 'models/MapDocument';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let uuidCounter = 0;
vi.mock('uuid', () => ({
  v4: vi.fn(() => `fixed-uuid-${uuidCounter++}`),
}));

beforeEach(() => {
  uuidCounter = 0;
});

describe('Local', () => {
  let Local: typeof import('./Local').default;

  beforeEach(async () => {
    localStorage.clear();
    vi.resetModules(); // This is to reset fake-indexeddb.
    const mod = await import('./Local');
    Local = mod.default;
  });

  describe('locale', () => {
    it("returns null when not set", () => {
      expect(Local.getLocale()).toBeNull();
    });

    it("returns the last value set", () => {
      Local.setLocale('en-GB');
      expect(Local.getLocale()).toBe('en-GB');
    });
  });

  describe('build', () => {
    it("returns -1 when not set", () => {
      expect(Local.getBuild()).toBe(-1);
    });

    it("returns the last value set", () => {
      Local.setBuild(42);
      expect(Local.getBuild()).toBe(42);
    });
  });

  describe('document headers', () => {
    it("returns [] when not set", () => {
      expect(Local.getDocumentHeaders()).toEqual([]);
    });
  });

  describe('loading and saving documents', () => {
    it("returns null when document id doesn't exist", async () => {
      expect(await Local.loadDocument("fake-id")).toBeNull();
    });

    it("saves a document that can be retrieved", async () => {
      const doc = ElementFactory.document("Test doc");
      doc.elements.push(ElementFactory.point([3, 3], "Point 1"));

      const id = await Local.saveDocument(doc.name, doc);
      const loaded = await Local.loadDocument(id);

      expect(loaded).toEqual(doc);
    });
  });
});
