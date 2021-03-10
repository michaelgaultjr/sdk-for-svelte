import { SDK as Appwrite }  from "../appwrite";
import { writable, get } from "svelte/store";

export function documentsStore() {
  const { subscribe, set, update } = writable(new Map());
  return {
    subscribe,
    set,
    update,

    fetchCollection: async (collectionId, cache, query) => {
      if (cache) {
        const documents = Array.from(get(this).entries()).filter(entry => entry[0].startsWith(collectionId))
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
        update(map => {
          for (const document in response.documents) {
            map[`${collectionId}:${document.$id}`] = document;
            return map;
          }
        });
      }
  
      return response;
    },
    fetchDocument: async () =>(collectionId, documentId, cache) {
      const id = `${collectionId}:${document.$id}`;
      if (cache && get(this)[id]) {
        return get(this)[id];
      }
  
      const response = Appwrite.sdk.database.getDocument(collectionId, documentId)
      if (cache) {
        update(map => {
          map[id] = response;
          return map;
        });
      }
  
      return response;
    },
    clearCache: () => {
      set(new Map());
    }
  }
}

