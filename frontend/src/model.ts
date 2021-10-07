export interface BaseModel {
  uuid?: string | null;
  createdAt?: number | null;
  updatedAt?: number | null;
  deletedAt?: number | null;
}
export interface Customer extends BaseModel {
  name?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface LaundryDocument extends BaseModel {
  name?: string | null;
  date?: number | null;
}

export interface LaundryRecord extends BaseModel {
  customerUuid?: string | null;
  laundryDocumentUuid?: string | null;
  price?: number | null;
  type?: number | null; // 0 cash, 1 epay
  start?: number | null;
  done?: number | null;
  received?: number | null;
  ePayId?: string | null;
  wash?: boolean | null;
  dry?: boolean | null;
  iron?: boolean | null;
  note?: string | null;
  paidValue?: number | null;
}
