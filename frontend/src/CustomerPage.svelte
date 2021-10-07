<script lang="ts">
  import Plus from "svelte-material-icons/Plus.svelte";
  import TrashCan from "svelte-material-icons/TrashCan.svelte";
  import type { Customer } from "./model";

  import { defaultCustomer } from "./model_defaults";
  import { v4 as uuidv4 } from "uuid";
  import * as idbKeyVal from "idb-keyval";
  import { customersStore, overlayStore } from "./Stores";
  import { dbzEncode } from "./dbz";
  import App from "./App.svelte";

  let customers: Customer[] = [];
  let overlay = false;
  let searchInput = "";

  overlayStore.subscribe((o) => {
    overlay = o;
  });

  customersStore.subscribe((c) => {
    customers = c;
  });

  const handleAddCustomer = async () => {
    overlayStore.update((_) => true);
    customers.unshift({ ...defaultCustomer, uuid: uuidv4() });

    await idbKeyVal.set("customers", dbzEncode(JSON.stringify(customers)));

    customersStore.update((_) => customers);
    overlayStore.update((_) => false);
  };

  $: filteredCustomers = customers.filter(
    (c) =>
      !c.deletedAt &&
      c.name?.toLowerCase()?.includes(searchInput?.toLowerCase() ?? "")
  );

  const handleRemoveCustomer = async (uuid: string) => {
    const confirmed = window.confirm("Really remove?");

    if (confirmed) {
      overlayStore.update((_) => true);

      customers = customers.map((c) =>
        c.uuid === uuid
          ? { ...defaultCustomer, deletedAt: new Date().getTime() }
          : c
      );

      customersStore.update((_) => customers);

      await idbKeyVal.set("customers", dbzEncode(JSON.stringify(customers)));

      overlayStore.update((_) => false);
    }
  };

  const handleChangeCustomerName = async (e: Event, uuid: string) => {
    const name = (e.target as HTMLInputElement).value;

    overlayStore.update((_) => true);

    const foundCustomer = customers.find((c) => c.uuid === uuid);

    console.log(foundCustomer.name, name);

    if (foundCustomer && foundCustomer.name !== name) {
      foundCustomer.name = name;
      customersStore.update((_) => customers);

      await idbKeyVal.set("customers", dbzEncode(JSON.stringify(customers)));
    }
    overlayStore.update((_) => false);
  };

  const handleChangeCustomerPhone = async (e: Event, uuid: string) => {
    const phone = (e.target as HTMLInputElement).value;

    overlayStore.update((_) => true);

    const foundCustomer = customers.find((c) => c.uuid === uuid);

    if (foundCustomer && foundCustomer.phone !== phone) {
      foundCustomer.phone = phone;
      customersStore.update((_) => customers);

      await idbKeyVal.set("customers", dbzEncode(JSON.stringify(customers)));
    }
    overlayStore.update((_) => false);
  };

  const handleChangeCustomerAddress = async (e: Event, uuid: string) => {
    const address = (e.target as HTMLInputElement).value;

    overlayStore.update((_) => true);
    const foundCustomer = customers.find((c) => c.uuid === uuid);

    if (foundCustomer && foundCustomer.address !== address) {
      foundCustomer.address = address;
      customersStore.update((_) => customers);

      await idbKeyVal.set("customers", dbzEncode(JSON.stringify(customers)));
    }
    overlayStore.update((_) => false);
  };

  const handleChangeSearchInput = (e: Event) => {
    searchInput = (e.target as HTMLInputElement).value;
  };
</script>

<main>
  <div class="flex font-bold text-lg">
    <div>Customers</div>
    <div class="mx-2">
      <button
        on:click={handleAddCustomer}
        class="text-white bg-blue-500 px-2 rounded-md hover:bg-blue-700 text-white font-bold flex items-center"
        ><Plus /> Add</button
      >
    </div>
  </div>

  <div class="my-2">
    <input
      class="w-full border border-gray-300 p-1"
      placeholder="Search by name, phone, address..."
      on:blur={handleChangeSearchInput}
    />
  </div>

  <hr class="my-3 border-gray-300" />

  <div
    class="overflow-auto resize-y shadow shadow-lg border border-gray-300"
    style="height:65vh"
  >
    <table class="table table-auto w-full">
      <tr>
        {#each ["#", "Name", "Phone", "Address", "Action"] as head}
          <th class="border border-gray-400 sticky top-0 bg-blue-200">{head}</th
          >
        {/each}
      </tr>
      {#each filteredCustomers as customer, i}
        <tr>
          <td class="p-1 border border-gray-400"
            >{filteredCustomers.length - i}</td
          >
          <td class="p-1 border border-gray-400"
            ><input
              class="p-1 border border-gray-400 w-full"
              placeholder="Name..."
              value={customer.name}
              on:blur={(e) => {
                handleChangeCustomerName(e, customer.uuid);
              }}
            /></td
          >
          <td class="p-1 border border-gray-400"
            ><input
              class="p-1 border border-gray-400 w-full"
              placeholder="Phone..."
              value={customer.phone}
              on:blur={(e) => {
                handleChangeCustomerPhone(e, customer.uuid);
              }}
            /></td
          >
          <td class="p-1 border border-gray-400"
            ><textarea
              class="p-1 border border-gray-400 w-full"
              placeholder="Address..."
              style="height:50px"
              value={customer.address}
              on:blur={(e) => {
                handleChangeCustomerAddress(e, customer.uuid);
              }}
            /></td
          >
          <td class="p-1 border border-gray-400">
            <button
              on:click={() => handleRemoveCustomer(customer.uuid)}
              class="flex items-center p-1 bg-red-200 hover:bg-red-400"
              ><TrashCan /> Remove</button
            >
          </td>
        </tr>
      {/each}
    </table>
  </div>
</main>
