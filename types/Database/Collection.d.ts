/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface CollectionProps {
  id?: string;

  filters?: string[];

  offset?: number;

  limit?: number;

  orderField?: string;

  orderType?: string;

  orderCast?: string;

  search?: string;

  cache?: boolean;
}

export default class Collection extends SvelteComponentTyped<
  CollectionProps,
  {},
  {
    default: {
      id: string;
      cache: boolean;
      documents: any[];
      actions: {
        reload: () => Promise<object>;
        create: (
          data: any,
          read?: string[],
          write?: string[]
        ) => Promise<object>;
      };
    };
    error: { error: object };
    loading: {};
  }
> {}
