import { SDK as Appwrite }  from "../appwrite";
import { writable, get } from "svelte/store";

export class DocumentsStore {
  constructor() {
    const { subscribe, set, update } = writable(new Map());
    this.subscribe = subscribe;
    this.set = set;
    this.update = update;
  }

  /**
   * Reload the current User.
   * @param {string} id Collection Id
   * @param {boolean} cache
   * @param {{filters?: string[], limit?: number, offset?: number, orderField?: string, orderType?: string, orderCast?: string, search?: string}} query Query Parameters 
   * @returns {object}
   */
  async fetchCollection(collectionId, cache, query) {
    if (cache) {
      const documents = Array.from(get(this)).filter(entry => entry[0].startsWith(collectionId))
      if (documents?.length) {
        return {
          documents,
          sum: documents.length
        }
      }
    }

    const response = await Appwrite.sdk.database.listDocuments(
      collectionId,
      query.filters ?? [],
      query.limit ?? 25,
      query.offset ?? 0,
      query.orderField ?? '',
      query.orderType ?? '',
      query.orderCast ?? 'string',
      query.search ?? '',
    )

    if (cache) {
      this.update(map => {
        for (const document in response.documents) {
          map.set(`${collectionId}:${document.$id}`, document);
          return map;
        }
      });
    }

    return response;
  }

  async fetchDocument(collectionId, documentId, cache) {
    const id = `${collectionId}:${document.$id}`;
    if (cache && get(this).has(id)) {
      return get(this).get(id);
    }

    const response = Appwrite.sdk.database.getDocument(collectionId, documentId)
    if (cache) {
      this.update(map => {
        map.set(id, response);
        return map;
      });
    }

    return response;
  }

  async clearCache() {
    this.set(new Map());
  }
}

