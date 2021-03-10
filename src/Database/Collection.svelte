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
  export let filters;

  /** @type {number} */
  export let offset;

  /** @type {number} */
  export let limit;

  /** @type {string} */
  export let orderField;

  /** @type {string} */
  export let orderType;

  /** @type {string} */
  export let orderCast;

  /** @type {string} */
  export let search;

  /** @type {boolean} */
  export let cache;
  setContext(cacheKey, cache);

  const fetchDocuments = async () => {
    return await documents.fetchCollection(id, cache, {
      filters,
      limit,
      offset,
      orderField,
      orderType,
      orderCast,
      search
    })
  };

  const actions = {
    reload: () => (documents = fetchDocuments()),
    create: async (
      data,
      read = [`user:${$currentUser.$id}`],
      write = [`user:${$currentUser.$id}`]
    ) => {
      const response = await Appwrite.sdk.database.createDocument(id, data, read, write);
      documents.clearCache();
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
