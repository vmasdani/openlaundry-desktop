<script lang="ts">
  import Plus from "svelte-material-icons/Plus.svelte";
  import TrashCan from "svelte-material-icons/TrashCan.svelte";
  import Pencil from "svelte-material-icons/Pencil.svelte";
  import { push } from "svelte-spa-router";

  import { dbzEncode } from "./dbz";
  import * as idbKeyVal from "idb-keyval";
  import type { LaundryDocument, LaundryRecord } from "./model";
  import { v4 as uuidv4 } from "uuid";
  import { defaultLaundryDocument } from "./model_defaults";
  import { laundryDocumentsStore, laundryRecordsStore, overlayStore } from "./Stores";
  import { makeDateString } from "./helpers";

  let laundryDocuments: LaundryDocument[] | null = null;
  let laundryRecords: LaundryRecord[] | null = null;

  let overlay = false;
  let documentNameFilter = "";
  let from: number | null = null;
  let to: number | null = null;

  overlayStore.subscribe((o) => {
    overlay = o;
  });

  laundryDocumentsStore.subscribe((l) => {
    laundryDocuments = l;
  });

  laundryRecordsStore.subscribe((l) => {
    laundryRecords = l;
  });

  const handleRemoveLaundryDocument = async (uuid: string) => {
    const confirmed = window.confirm("Really delete this laundry document?");

    if (confirmed) {
      try {
        overlayStore.update((_) => true);

        laundryDocuments = laundryDocuments.map((laundryDocument) =>
          laundryDocument.uuid === uuid
            ? { ...defaultLaundryDocument, deletedAt: new Date().getTime() }
            : laundryDocument
        );

        await idbKeyVal.set(
          "laundryDocuments",
          dbzEncode(JSON.stringify(laundryDocuments))
        );
      } catch (e) {
        console.error(e);
      } finally {
        overlayStore.update((_) => false);
      }
    }
  };

  const handleAddLaundryDocument = async () => {
    try {
      overlayStore.update((_) => true);

      // console.log(makeDateString);

      laundryDocuments.unshift({
        ...defaultLaundryDocument,
        uuid: uuidv4(),
        name: `Laundry ${Intl.DateTimeFormat("en-US", {
          dateStyle: "long",
        }).format(new Date())} - PC`,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
        date: new Date(`${makeDateString(new Date())}T00:00:00.000Z`).getTime(),
      });

      const encoded = dbzEncode(JSON.stringify(laundryDocuments));

      if (encoded) {
        await idbKeyVal.set("laundryDocuments", encoded);
        laundryDocumentsStore.update((_) => laundryDocuments);
      } else {
        throw "Error dbz encoding";
      }
    } catch (e) {
      console.error(e);
    } finally {
      overlayStore.update((_) => false);
    }
  };

  const handleChangeLaundryDocumentName = async (uuid: string, e: Event) => {
    try {
      overlayStore.update((_) => true);

      const foundLaundryDocument = laundryDocuments.find(
        (laundryDocument) => laundryDocument.uuid === uuid
      );

      if (
        (foundLaundryDocument &&
          foundLaundryDocument.name !==
            (e.target as HTMLInputElement)?.value) ??
        ""
      ) {
        laundryDocumentsStore.update((_) =>
          laundryDocuments.map((laundryDocument) =>
            laundryDocument.uuid === uuid
              ? {
                  ...laundryDocument,
                  name: (e.target as HTMLInputElement)?.value ?? "",
                }
              : laundryDocument
          )
        );

        await idbKeyVal.set(
          "laundryDocuments",
          dbzEncode(JSON.stringify(laundryDocuments))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      overlayStore.update((_) => false);
    }
  };

  const handleChangeDocumentFilterName = (e: Event) => {
    documentNameFilter = (e.target as HTMLInputElement).value;
  };

  $: filteredLaundryDocuments = laundryDocuments.filter(
    (laundryDocument) =>
      !laundryDocument.deletedAt &&
      laundryDocument.name
        ?.toLowerCase()
        ?.includes(documentNameFilter?.toLowerCase() ?? "") &&
      (from ? (laundryDocument.date ?? 0) >= from : true) &&
      (to ? (laundryDocument.date ?? 0) <= to : true)
  );

  const handleSetFromDate = (e: Event) => {
    const date = (e.target as HTMLInputElement).value;
    console.log("from", date);

    from = new Date(`${date}T00:00:00.000Z`).getTime();
  };

  const handleSetToDate = (e: Event) => {
    const date = (e.target as HTMLInputElement).value;
    console.log("to", date);

    to = new Date(`${date}T00:00:00.000Z`).getTime();
  };
</script>

<main>
  <div class="flex font-bold text-lg">
    <div>Laundry Documents</div>
    <div class="mx-2">
      <button
        on:click={handleAddLaundryDocument}
        class="text-white bg-blue-500 px-2 rounded-md hover:bg-blue-700 text-white font-bold flex items-center"
        ><Plus /> Add</button
      >
    </div>
  </div>

  <hr class="my-3 border-gray-300" />

  <div class="flex my-2">
    <div class="flex-grow flex items-center">
      Filter name <input
        on:blur={handleChangeDocumentFilterName}
        class="border-2 p-1 border-gray-400 mx-2 w-full"
        placeholder="Filter name..."
      />
    </div>
    <div class="flex-grow flex items-center">
      From <input
        class="border-2 p-1 border-gray-400 mx-2 w-full"
        type="date"
        value={from ? new Date(from).toISOString().split("T")[0] : null}
        on:change={handleSetFromDate}
      />
      <button
        class="font-bold bg-gray-200 px-2 py-1 mx-1"
        on:click={() => {
          from = null;
        }}>Clear</button
      >
    </div>
    <div class="flex-grow flex items-center">
      To <input
        class="border-2 p-1 border-gray-400 mx-2 w-full"
        type="date"
        value={to ? new Date().toISOString().split("T")[0] : null}
        on:change={handleSetToDate}
      />
      <!-- {to ? new Date().toISOString().split("T")[0] : null} -->
      <button
        class="font-bold bg-gray-200 px-2 py-1 mx-1"
        on:click={() => {
          to = null;
        }}>Clear</button
      >
    </div>
  </div>

  <div
    class="overflow-auto resize-y shadow shadow-lg border border-gray-300"
    style="height:65vh"
  >
    <table class="table table-auto w-full">
      <tr>
        {#each ["#", "Name", "Date", "Laundries", "Income", "Actions"] as head}
          <th class="border border-gray-400 sticky top-0 bg-blue-200">{head}</th
          >
        {/each}
      </tr>
      {#each filteredLaundryDocuments as laundryDocument, i}
        <tr
          class={`${
            laundryDocument.date &&
            new Date(
              `${makeDateString(new Date())}T00:00:00.000Z`
            ).getTime() === new Date(laundryDocument.date).getTime()
              ? "bg-green-100"
              : ""
          }`}
        >
          <td class="border border-gray-400 p-1"
            >{filteredLaundryDocuments.length - i}</td
          >
          <td class="border border-gray-400 p-1"
            ><input
              on:blur={(e) =>
                handleChangeLaundryDocumentName(laundryDocument.uuid, e)}
              class="p-1 border-2 border-gray-300 w-full"
              value={laundryDocument.name}
            />
          </td>
          <td class="border border-gray-400 p-1"
            >{laundryDocument.date
              ? Intl.DateTimeFormat("en-US", {
                  dateStyle: "long",
                  // timeStyle: "long",
                  timeZone: "utc",
                }).format(new Date(laundryDocument.date))
              : ""}</td
          >
          <td class="border border-gray-400 p-1 font-bold text-red-500"
            >0/{laundryRecords?.filter(
              (l) => l.laundryDocumentUuid === laundryDocument.uuid
            )?.length ?? 0}</td
          >
          <td class="border border-gray-400 p-1"
            >{Intl.NumberFormat("id-ID").format(0)}</td
          >

          <td class="border border-gray-400 p-1"
            ><div class="flex">
              <button
                on:click={() =>
                  handleRemoveLaundryDocument(laundryDocument.uuid)}
                class="flex items-center p-1 bg-red-200 hover:bg-red-400"
                ><TrashCan /> Remove</button
              ><button
                class="flex items-center p-1 bg-blue-200 hover:bg-blue-400 mx-2"
                on:click={() =>
                  push(`/laundrydocuments/${laundryDocument.uuid}`)}
                ><Pencil /> Edit</button
              >
            </div></td
          >
        </tr>
      {/each}
    </table>
  </div>
</main>
