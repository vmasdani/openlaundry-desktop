<script lang="ts">
  import { onMount } from "svelte";
  import Plus from "svelte-material-icons/Plus.svelte";
  import ChevronLeft from "svelte-material-icons/ChevronLeft.svelte";
  import type { Customer, LaundryDocument, LaundryRecord } from "./model";
  import { v4 as uuidv4 } from "uuid";
  import * as idbKeyVal from "idb-keyval";
  import {
    customersStore,
    laundryDocumentsStore,
    laundryRecordsStore,
    overlayStore,
  } from "./Stores";
  import { push } from "svelte-spa-router";
  import { defaultLaundryRecord } from "./model_defaults";
  import { dbzEncode } from "./dbz";
  import CustomerPage from "./CustomerPage.svelte";

  export let params: { id: string } = { id: "" };

  let laundryDocuments: LaundryDocument[] = [];
  let laundryRecords: LaundryRecord[] = [];
  let customers: Customer[] = [];

  let overlay = false;

  laundryRecordsStore.subscribe((l) => {
    laundryRecords = l;
  });

  laundryDocumentsStore.subscribe((l) => {
    laundryDocuments = l;
  });

  overlayStore.subscribe((o) => {
    overlay = o;
  });

  customersStore.subscribe((c) => {
    customers = c;
  });

  onMount(async () => {
    console.log("id", params);
  });

  $: foundLaundryDocument = laundryDocuments.find((l) => l.uuid === params.id);

  $: filteredLaundryRecords = laundryRecords.filter(
    (l) => l.laundryDocumentUuid === params.id
  );

  $: filteredCustomers = customers.filter((c) => !c.deletedAt);

  const handleAddLaundryRecord = async () => {
    overlayStore.update((_) => true);

    laundryRecords.unshift({
      ...defaultLaundryRecord,
      uuid: uuidv4(),
      laundryDocumentUuid: params.id,
      wash: true,
      dry: true,
      iron: true,
    });

    laundryRecords = laundryRecords;

    await idbKeyVal.set(
      "laundryRecords",
      dbzEncode(JSON.stringify(laundryRecords))
    );

    overlayStore.update((_) => false);
  };

  const handleToggleWash = async (uuid: string) => {
    const foundLaundryRecord = laundryRecords.find((l) => l.uuid === uuid);

    if (foundLaundryDocument) {
      overlayStore.update((_) => true);

      foundLaundryRecord.wash = !(foundLaundryRecord.wash ?? false);
      await idbKeyVal.set(
        "laundryRecords",
        dbzEncode(JSON.stringify(laundryRecords))
      );

      overlayStore.update((_) => false);
    }
  };

  const handleToggleDry = async (uuid: string) => {
    const foundLaundryRecord = laundryRecords.find((l) => l.uuid === uuid);

    if (foundLaundryDocument) {
      overlayStore.update((_) => true);

      foundLaundryRecord.dry = !(foundLaundryRecord.dry ?? false);
      await idbKeyVal.set(
        "laundryRecords",
        dbzEncode(JSON.stringify(laundryRecords))
      );

      overlayStore.update((_) => false);
    }
  };

  const handleToggleIron = async (uuid: string) => {
    const foundLaundryRecord = laundryRecords.find((l) => l.uuid === uuid);

    if (foundLaundryDocument) {
      overlayStore.update((_) => true);

      foundLaundryRecord.iron = !(foundLaundryRecord.iron ?? false);
      await idbKeyVal.set(
        "laundryRecords",
        dbzEncode(JSON.stringify(laundryRecords))
      );

      overlayStore.update((_) => false);
    }
  };
</script>

<h3 class="flex items-center">
  <button
    on:click={() => {
      push("/");
    }}
    class="flex items-center text-lg font-bold text-blue-500 hover:text-blue-700"
    ><ChevronLeft /> Back</button
  >
  <div class="mx-2">
    Document: {foundLaundryDocument?.name}
  </div>
</h3>

<hr class="my-2 border-gray-400" />

<div>
  <div class="flex items-center">
    <h3 class="text-lg font-bold flex">Laundry records</h3>
    <div class="mx-2">
      <button
        on:click={handleAddLaundryRecord}
        class="px-2 py-1 font-bold text-white bg-blue-500 hover:bg-blue-700 flex items-center rounded-md"
        ><Plus /> Add</button
      >
    </div>
  </div>
</div>

<div class="overflow-auto top-0 sticky w-full my-2 overflow-auto resize-y" style="height:65vh">
  <table class="table table-auto w-full">
    <tr>
      {#each ["#", "Customer", "Wash", "Dry", "Iron", "Weight", "Price", "Date", "Paid", "Action"] as head}
        <th class="border border-gray-400 bg-blue-100 sticky top-0">{head}</th>
      {/each}
    </tr>
    {#each filteredLaundryRecords as laundryRecord, i}
      <tr>
        <td class="border border-gray-400 p-1"
          >{filteredLaundryRecords.length - i}</td
        >
        <td class="border border-gray-400">
          <select class="w-full p-2">
            <option selected disabled />
            {#each filteredCustomers as customer, i}
              <option>
                {customer.name} ({customer.address}, {customer.phone})</option
              >
            {/each}
          </select>
        </td>
        <td class="border border-gray-400"
          ><div class="flex justify-center">
            <input
              type="checkbox"
              on:click={() => handleToggleWash(laundryRecord.uuid)}
              checked={laundryRecord.wash ?? false}
            />
          </div></td
        >
        <td class="border border-gray-400"
          ><div class="flex justify-center">
            <input
              type="checkbox"
              on:click={() => handleToggleDry(laundryRecord.uuid)}
              class={`${laundryRecord.dry ? "checked" : ""}`}
              checked={laundryRecord.dry ?? false}
            />
          </div></td
        >
        <td class="border border-gray-400"
          ><div class="flex justify-center">
            <input
              on:click={() => handleToggleIron(laundryRecord.uuid)}
              type="checkbox"
              checked={laundryRecord.iron ?? false}
            />
          </div></td
        >
        <td class="border border-gray-400 p-2">
          <input
            class="border border-gray-300 w-full p-2"
            placeholder="Weight..."
            style="width:75px"
          />
        </td>

        <td class="border border-gray-400 p-2">
          <input
            class="border border-gray-300 w-full p-2"
            placeholder="Price..."
          />
        </td>
        <td class="border border-gray-400 p-2">
          <div class="flex flex-col">
            <div class="text-sm">Start</div>
            <input
              class="text-sm border border-gray-300 w-full p-2"
              type="datetime-local"
            />
            <div class="text-sm">Done</div>

            <input
              class="text-sm border border-gray-300 w-full p-2"
              type="datetime-local"
            />
            <div class="text-sm">Received</div>
            <input
              class="text-sm border border-gray-300 w-full p-2"
              type="datetime-local"
            />
          </div>
        </td>

        <td class="border border-gray-400 p-2">
          <input
            class="border border-gray-300 w-full p-2"
            placeholder="Paid..."
          />
        </td>
        <td class="border border-gray-400 p-1" />
      </tr>
    {/each}
  </table>
</div>
