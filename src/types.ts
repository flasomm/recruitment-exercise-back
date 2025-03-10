export type TRecordItem = {
  label: string;
  debit: number;
  credit: number;
  date: Date;
  invoiceNumber?: string;
};

export type TBalance = {
  totalDebit: number;
  totalCredit: number;
};

export type TAccount = TBalance & {
  code: string;
  label: string;
};

export type TRecordItemWithAccount = TRecordItem & {
  account: TAccount;
};

export type TAccountWithRecordItems = TAccount & {
  recordItems: TRecordItem[];
};

export type TRecord = TBalance & {
  recordItems: TRecordItemWithAccount[];
};

export type TParsingResult = {
  accounts: TAccountWithRecordItems[];
  balance: TBalance;
  records?: TRecord[]; // Optional - bonus
};
