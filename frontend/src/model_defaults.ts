import type { BaseModel, Customer, LaundryDocument, LaundryRecord } from "./model";

export const defaultBaseModel: BaseModel = {
  uuid: null,
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
};

export const defaultCustomer: Customer = {
  ...defaultBaseModel,
  name: "",
  phone: "",
  address: "",
};

export const defaultLaundryDocument: LaundryDocument = {
  ...defaultBaseModel,
  name: "",
  date: null,
};

export const defaultLaundryRecord: LaundryRecord = {
  ...defaultBaseModel,
  customerUuid: null,
  laundryDocumentUuid: null,
  price: 0,
  type: 0, // 0 cash, 1 epay
  start: null,
  done: null,
  received: null,
  ePayId: "",
  wash: false,
  dry: false,
  iron: false,
  note: "string | null",
};
