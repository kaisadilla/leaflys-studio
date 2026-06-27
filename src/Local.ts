import { openDB, type IDBPDatabase } from 'idb';
import type { MapperDocument } from "models/MapDocument";
import type { MapperDocHeader } from "state/mapper/doc/slice";
import { v4 as uuid } from "uuid";

const KEY_PREFIX = "azaria/yerevan";
const KEY_VERSION = KEY_PREFIX + "/version";
const KEY_LOCALE = KEY_PREFIX + "/locale";
const KEY_DOC_HEADERS = KEY_PREFIX + "/document/headers";
const KEY_ACTIVE_DOC = KEY_PREFIX + "/document/active";

const DB_NAME = "azaria/yerevan";
const DB_VERSION = 1;
const TABLE_DOCS = "documents";

export type ILocal = typeof Local;


let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb () {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade (db) {
        db.createObjectStore(TABLE_DOCS);
      }
    })
  }

  return dbPromise;
}

const Local = {
  getLocale () {
    return localStorage.getItem(KEY_LOCALE);
  },

  setLocale (key: string) {
    localStorage.setItem(KEY_LOCALE, key);
  },

  getBuild () : number {
    const ver = localStorage.getItem(KEY_VERSION);

    if (ver === null) return -1;

    return parseInt(ver);
  },

  setBuild (version: number) {
    localStorage.setItem(KEY_VERSION, version.toString());
  },

  getDocumentHeaders () : MapperDocHeader[] {
    const ids = localStorage.getItem(KEY_DOC_HEADERS);

    if (ids) return JSON.parse(ids);

    return [];
  },

  getActiveDocumentId () : string | null {
    const id = localStorage.getItem(KEY_ACTIVE_DOC);

    if (id) return id;
    
    const headers = Local.getDocumentHeaders();
    if (headers.length > 0) {
      Local.setActiveDocumentId(headers[0].id);
      return headers[0].id;
    }

    return null;
  },

  setActiveDocumentId (id: string) {
    localStorage.setItem(KEY_ACTIVE_DOC, id);
  },

  async loadDocument (id: string) : Promise<MapperDocument | null> {
    const db = await getDb();

    return (await db.get(TABLE_DOCS, id)) ?? null;
  },

  async saveDocument (name: string, doc: MapperDocument) : Promise<string> {
    const db = await getDb();
    const id = uuid();
    const now = new Date().toISOString();

    await db.put(TABLE_DOCS, doc, id);

    const headers = Local.getDocumentHeaders();
    headers.push({
      id,
      name,
      createdAt: now,
      modifiedAt: now,
    });
    
    localStorage.setItem(KEY_DOC_HEADERS, JSON.stringify(headers));

    return id;
  },

  async updateDocument (id: string, doc: MapperDocument) {
    const db = await getDb();
    await db.put(TABLE_DOCS, doc, id);

    const headers = Local.getDocumentHeaders();
    const idx = headers.findIndex(h => h.id === id);

    if (idx === -1) {
      console.warn(`No header found with id '${id}'`);
      return;
    }

    headers[idx].modifiedAt = new Date().toISOString();

    localStorage.setItem(KEY_DOC_HEADERS, JSON.stringify(headers));
  },

  async deleteDocument (id: string) : Promise<boolean> {
    let headers = Local.getDocumentHeaders().filter(h => h.id !== id);

    localStorage.setItem(KEY_DOC_HEADERS, JSON.stringify(headers));
    
    const db = await getDb();
    await db.delete(TABLE_DOCS, id);

    return true;
  },

  async renameDocument (id: string, name: string) : Promise<boolean> {
    const db = await getDb();
    const doc = await db.get(TABLE_DOCS, id) as MapperDocument | null;
    if (!doc) return false;

    const headers = Local.getDocumentHeaders();
    const idx = headers.findIndex(h => h.id === id);
    if (idx === -1) return false;

    headers[idx].name = name;
    headers[idx].modifiedAt = new Date().toISOString();

    localStorage.setItem(KEY_DOC_HEADERS, JSON.stringify(headers));

    doc.name = name;
    await db.put(TABLE_DOCS, doc, id);
    return true;
  }
}

export default Local;
