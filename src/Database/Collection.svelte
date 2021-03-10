<script>
  /**
   * @slot {{
   * id: string;
   * cache: boolean;
   * documents: any[];
   * actions: {
   *  reload: () => Promise<object>;
   *  create: (data: any, read?: string[], write?: string[]) => Promise<object>;
   * }
   * }}
   * @slot {{ error: object }} error
   */
  import { setContext } from 'svelte';
  import { cacheKey } from '../keys';
  import { SDK as Appwrite }  from "../appwrite";
  import { currentUser, documents } from "../stores";

  /**
   * @name Collection ID
   * @type {string}
   */
  export let id;

  /** @type {string[]} */
  export let filters = [];

  /** @type {number} */
  export let offset = 0;

  /** @type {number} */
  export let limit = 25;

  /** @type {string} */
  export let orderField = '';

  /** @type {string} */
  export let orderType = '';

  /** @type {string} */
  export let orderCast = 'string';

  /** @type {string} */
  export let search = '';

  /** @type {boolean} */
  export let cache;
  setContext(cacheKey, cache);

  const fetchDocuments = async () => {
    if (cache) {
      const docs = Array
        .from($documents.entries())
        .filter(entry => entry[0].startsWith(id))
        .map(entry => entry[1])
        
      if (docs?.length) {
        return {
          documents: docs,
          sum: documents.length
        }
      }
    }

    const response = await Appwrite.sdk.database.listDocuments(
      id,
      filters,
      limit,
      offset,
      orderField,
      orderType,
      orderCast,
      search,
    )

    if (cache) {
      documents.update(map => {
        for (const document of response.documents) {
          map.set(`${id}:${document.$id}`, document);
        }
        return map;
      })
    }

    return response;
  };

  const actions = {
    reload: () => (documents = fetchDocuments()),
    create: async (
      data,
      read = [`user:${$currentUser.$id}`],
      write = [`user:${$currentUser.$id}`]
    ) => {
      const response = await Appwrite.sdk.database.createDocument(id, data, read, write);
      documents.set(new Map());
      actions.reload();
      return response;
    },
  };

  let documentsPromise = fetchDocuments();
</script>
{#await documentsPromise}
  <slot name="loading" />
{:then current}
  <slot documents={current?.documents ?? []} {actions} />
{:catch error}
  <slot name="error" {error} />
{/await}
