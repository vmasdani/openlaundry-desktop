import { writable } from "svelte/store";
import type { Customer, LaundryDocument, LaundryRecord } from "./model";

export let overlayStore = writable(false);
export let customersStore = writable<Customer[]>([]);
export let laundryDocumentsStore = writable<LaundryDocument[]>([]);
export let laundryRecordsStore = writable<LaundryRecord[]>([]);
