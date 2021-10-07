<script lang="ts">
  import { v4 as uuidv4 } from "uuid";
  import "./tailwind.css";
  import LaundryDocumentPage from "./LaundryDocumentPage.svelte";
  import CustomerPage from "./CustomerPage.svelte";
  import Router from "svelte-spa-router";
  import QrPage from "./QRPage.svelte";
  import DataSync from "./DataSync.svelte";
  import Navbar from "./Navbar.svelte";
  import LaundryRecordDetailPage from "./LaundryRecordDetailPage.svelte";
  import Modal from "./Modal.svelte";
  import * as idbKeyVal from "idb-keyval";
  import LoadingModal from "./LoadingModal.svelte";
  import {
    customersStore,
    laundryDocumentsStore,
    laundryRecordsStore,
    overlayStore,
  } from "./Stores";
  import { onMount } from "svelte";
  import { dbzDecode, dbzEncode } from "./dbz";
  import {
    defaultCustomer,
    defaultLaundryDocument,
    defaultLaundryRecord,
  } from "./model_defaults";
  import type { Customer, LaundryDocument, LaundryRecord } from "./model";
import LaundryDocumentDetailPage from "./LaundryDocumentDetailPage.svelte";

  export let name: string;
  let currentUuid: string | null = null;
  let overlay: boolean = false;

  overlayStore.subscribe((o) => {
    overlay = o;
  });

  const handleEditUuid = () => {
    currentUuid = uuidv4();
  };

  const routes = {
    "/": LaundryDocumentPage,
    "/laundrydocuments/:id": LaundryDocumentDetailPage,
    "/laundryrecords/:id": LaundryRecordDetailPage,
    "/customers": CustomerPage,
    "/qr": QrPage,
    "/datasync": DataSync,
  };

  const initTable = async <T extends unknown>(name: string, _: T) => {
    const contents = await idbKeyVal.get(name);

    console.log(name, contents);

    if (contents) {
      const unGzipped = dbzDecode(contents);

      console.log("ungzipped", unGzipped);

      try {
        return JSON.parse(unGzipped) as T[];
      } catch (e) {
        return null;
      }
    } else {
      await idbKeyVal.set(name, dbzEncode(JSON.stringify([])));
      return [] as T[];
    }
  };

  onMount(async () => {
    await Promise.all(
      [
        {
          table: "customers",
          default: { ...defaultCustomer } as Customer,
          callback: (customers: Customer[]) => {
            customersStore.update((_) => customers);
          },
        },
        {
          table: "laundryDocuments",
          default: { ...defaultLaundryDocument } as LaundryDocument,
          callback: (laundryDocuments: LaundryDocument[]) => {
            laundryDocumentsStore.update((_) => laundryDocuments);
          },
        },
        {
          table: "laundryRecords",
          default: { ...defaultLaundryRecord } as LaundryRecord,
          callback: (laundryRecords: LaundryRecord[]) => {
            laundryRecordsStore.update((_) => laundryRecords);
          },
        },
      ].map(async (table) => {
        const res = await initTable(table.table, table.default);

        if (res) {
          table.callback(res);
        }
      })
    );
  });
</script>

<main>
  <Navbar
    menu={[
      { title: "Home", to: "/" },
      { title: "Customers", to: "/customers" },
      { title: "QR", to: "/qr" },
      { title: "Data Sync", to: "/datasync" },
    ]}
  />

  <div class="container mx-auto my-2">
    <!-- {dbzEncode(JSON.stringify([{ uuid: "fdsfsaifu0sa9" }]))}
    {dbzDecode(dbzEncode(JSON.stringify([{ uuid: "fdsfsaifu0sa9" }])))} -->

    <Router {routes} />

    {#if overlay}
      <Modal comp={LoadingModal} />
    {/if}
  </div>
</main>
