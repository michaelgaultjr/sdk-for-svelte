import { writable } from "svelte/store";
import { documentsStore } from "./Stores/documents";
import { UserStore } from "./Stores/user";

export const active = writable(false);
export const currentUser = new UserStore();
export const documents = documentsStore();
