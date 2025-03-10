import { TParsingResult, TAccountWithRecordItems, TRecordItem, TRecord, TRecordItemWithAccount } from "./types";
import { parse as csvParse } from "csv-parse/sync";
import * as fs from "fs";

const ACCOUNT_CODES = new Set([
  "103100", "103200", "105000", "4011", "401100003", "401100174",
  "401100291", "401100502", "401100503", "401100714", "401100PRO",
  "401101063", "401101104", "401101199", "401101209", "401101220",
  "401101304", "401101443", "401101468", "401101962", "401102745",
  "401102806", "401103437", "401103812", "401104423", "401104434",
  "401105338", "401105997", "401106184", "4011GEM", "4011HUMAP",
  "4011NEOPO", "4011SPGAF", "4011SPGAG", "4011SPGHO", "4011SPGPE",
  "4011SPGSI", "421000", "431000", "437100", "437300", "438630",
  "442100", "443100", "45000001", "45000002", "45000003", "45000004",
  "45000005", "45000006", "45000007", "45000011", "45000021", "45000031",
  "45000042", "45000051", "45000061", "45000071", "45000081", "45000092",
  "45000102", "45000111", "45000121", "45000131", "45000142", "45000151",
  "45000421", "45000651", "45000661", "45000701", "45000731", "457000",
  "458000", "462", "471000", "471100", "488000", "488616", "501C0403",
  "50212200", "5125200", "512C0403", "580000", "601000", "601110",
  "602000", "602072", "602073", "606000", "606101", "606963", "611000",
  "613050", "614000", "614122", "614123", "614128", "614400", "614501",
  "614801", "615020", "615031", "615702", "621100", "621110", "622050",
  "622210", "622220", "62238", "623050", "623500", "623925", "632000",
  "633120", "633121", "641100", "642100", "642300", "671210101", "701000",
  "701200", "7021200101", "7021210101", "713100", "713110"
]);

const DEFAULT_ACCOUNT = {
  code: "",
  label: "",
  totalDebit: 0,
  totalCredit: 0,
} as const;

const round2 = (num: number): number => Number(num.toFixed(2));

const parseNumber = (str?: string): number => 
  parseFloat(str?.replace(/\s/g, "").replace(",", ".") || "0");

const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

const isDateString = (str: string): boolean => /^\d{2}\/\d{2}\/\d{4}$/.test(str);

const createRecordItem = (
  date: Date,
  label: string,
  debit: number,
  credit: number,
  invoiceNumber: string | undefined,
  account: TAccountWithRecordItems | null
): TRecordItemWithAccount => ({
  label,
  date,
  debit,
  credit,
  invoiceNumber,
  account: account || DEFAULT_ACCOUNT
});

const updateAccountTotals = (
  account: TAccountWithRecordItems,
  debit: number,
  credit: number
): void => {
  account.totalDebit = round2(account.totalDebit + debit);
  account.totalCredit = round2(account.totalCredit + credit);
};

const processRecordItem = (
  recordItem: TRecordItemWithAccount,
  currentAccount: TAccountWithRecordItems | null,
  recordItemMap: Map<string, TRecordItemWithAccount[]>,
  key: string
): void => {
  if (currentAccount) {
    currentAccount.recordItems.push(recordItem);
    updateAccountTotals(currentAccount, recordItem.debit, recordItem.credit);
  }

  const items = recordItemMap.get(key) || [];
  items.push(recordItem);
  recordItemMap.set(key, items);
};

export const parse = async (inputCSVFile: string): Promise<TParsingResult> => {
  try {
    const fileContent = fs.readFileSync(inputCSVFile, "utf-8");
    const records = csvParse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ",",
      relax_column_count: true,
    });

    const accounts: TAccountWithRecordItems[] = [];
    const groupedRecords: TRecord[] = [];
    let currentAccount: TAccountWithRecordItems | null = null;
    let totalDebit = 0;
    let totalCredit = 0;
    const recordItemMap = new Map<string, TRecordItemWithAccount[]>();

    for (const record of records) {
      const accountCode = record["Compte"];

      if (
        accountCode &&
        ACCOUNT_CODES.has(accountCode) &&
        (!currentAccount || currentAccount.code !== accountCode)
      ) {
        if (currentAccount) {
          accounts.push(currentAccount);
        }

        currentAccount = {
          code: accountCode,
          label: record["Libellé"] || "",
          totalDebit: 0,
          totalCredit: 0,
          recordItems: [],
        };
      }

      const dateStr = record["Compte"];
      if (dateStr && isDateString(dateStr)) {
        const date = parseDate(dateStr);
        const label = record["Libellé"] || "";
        const debit = parseNumber(record["Débit"]);
        const credit = parseNumber(record["Crédit"]);
        const invoiceNumber = record["Pièce"];

        const recordItem = createRecordItem(
          date,
          label,
          debit,
          credit,
          invoiceNumber,
          currentAccount
        );

        totalDebit = round2(totalDebit + debit);
        totalCredit = round2(totalCredit + credit);

        // Add to grouping map for records (Bonus)
        const key = `${dateStr}-${label}`;
        processRecordItem(recordItem, currentAccount, recordItemMap, key);
      }
    }

    if (currentAccount) {
      accounts.push(currentAccount);
    }

    // Process grouped records
    for (const items of recordItemMap.values()) {
      const recordDebit = round2(items.reduce((sum, item) => sum + item.debit, 0));
      const recordCredit = round2(items.reduce((sum, item) => sum + item.credit, 0));

      if (recordDebit === recordCredit) {
        groupedRecords.push({ recordItems: items, totalDebit: recordDebit, totalCredit: recordCredit });
      }
    }

    return {
      accounts,
      balance: { totalDebit, totalCredit },
      records: groupedRecords,
    };
  } catch (error) {
    throw new Error(`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
