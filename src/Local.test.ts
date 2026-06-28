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

      await Local.saveDocument(doc);
      const loaded = await Local.loadDocument(doc.id);

      expect(loaded).toEqual(doc);
    });
  });

  describe('updating documents', () => {
    it("fails when document id doesn't exist", async () => {
      const doc = ElementFactory.document("Test doc");
      const updated = await Local.updateDocument("fake-id", doc);

      expect(updated).toBe(false);

      const loaded = await Local.loadDocument("fake-id");
      expect(loaded).toBeNull();
    });

    it("updates document and metadata", async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

      const doc = ElementFactory.document("Update test doc");
      await Local.saveDocument(doc);
      const before = Local.getDocumentHeader(doc.id)?.modifiedAt;
      const loaded = await Local.loadDocument(doc.id);
      
      vi.setSystemTime(new Date("2020-01-01T00:00:01.000Z"));

      expect(loaded).toEqual(doc);
      loaded?.elements.push(ElementFactory.point([5, 5], "Point 2"));

      const updated = await Local.updateDocument(doc.id, loaded!);
      expect(updated).toBe(true);

      const after = Local.getDocumentHeader(doc.id)?.modifiedAt;
      const reloaded = await Local.loadDocument(doc.id);

      expect(reloaded).toEqual(loaded);
      expect(after).not.toBe(before);

      vi.useRealTimers();
    });
  });

  describe('deleting documents', () => {
    let id1: string;
    let id2: string;

    beforeEach(async () => {
      const doc1 = ElementFactory.document("doc-1");
      const doc2 = ElementFactory.document("doc-2");

      await Local.saveDocument(doc1);
      await Local.saveDocument(doc2);

      id1 = doc1.id;
      id2 = doc2.id;
    });

    it("doesn't do anything when document id doesn't exist", async () => {
      const headersBefore = Local.getDocumentHeaders();
      const deleted = await Local.deleteDocument("fake-id");
      const headersAfter = Local.getDocumentHeaders();

      expect(headersBefore).toEqual(headersAfter);
    });

    it("correctly removes the id given", async () => {
      const headersBefore = Local.getDocumentHeaders();
      const deleted = await Local.deleteDocument(id1);
      expect(deleted).toBe(true);

      const headersAfter = Local.getDocumentHeaders();
      expect(headersAfter.length).toBe(headersBefore.length - 1);
      expect(headersAfter.filter(h => h.id === id1).length).toBe(0);

      const deletedDoc = await Local.loadDocument(id1);
      expect(deletedDoc).toBe(null);

      const survivingDoc = await Local.loadDocument(id2);
      expect(survivingDoc).not.toBe(null);
    });
  });

  describe('renaming documents', () => {
    it("doesn't do anything when document id doesn't exist", async () => {
      const doc = ElementFactory.document("do-not-change");
      await Local.saveDocument(doc);

      await Local.renameDocument("fake-id", "different-name");

      const loaded = await Local.loadDocument(doc.id);
      const header = Local.getDocumentHeader(doc.id);

      expect(loaded?.name).toBe(doc.name);
      expect(header?.name).toBe(doc.name);
    });

    it("renames the document given and changes metadata", async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

      const doc = ElementFactory.document("first-name");
      await Local.saveDocument(doc);

      const before = Local.getDocumentHeader(doc.id)?.modifiedAt;

      vi.setSystemTime(new Date("2020-01-01T00:00:01.000Z"));

      const newName = "second-name";
      await Local.renameDocument(doc.id, newName);

      const loaded = await Local.loadDocument(doc.id);
      const header = Local.getDocumentHeader(doc.id);

      expect(loaded?.name).toBe(newName);
      expect(header?.name).toBe(newName);
      expect(header?.modifiedAt).not.toBe(before);
      
      vi.useRealTimers();
    });
  });
});
