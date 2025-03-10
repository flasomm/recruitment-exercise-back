import { parse } from "./parser";
import { TBalance, TRecord } from "./types";

const SAMPLE_1 = "./data/sample_1.csv";
const SAMPLE_3 = "./data/sample_3.csv";

const round2 = (num: number) => Math.round(num * 100) / 100;

describe("With sample 1", () => {
  describe("Basic validation", () => {
    test(`should return the right number of accounts`, async () => {
      const result = await parse(SAMPLE_1);
      expect(result.accounts.length).toBe(63);
    });

    test(`should return the right balance`, async () => {
      const result = await parse(SAMPLE_1);
      const expectedResult: TBalance = {
        totalDebit: 90667.3,
        totalCredit: 90667.3,
      };
      expect(result.balance.totalDebit).toBeCloseTo(
        expectedResult.totalDebit,
        2
      );
      expect(result.balance.totalCredit).toBeCloseTo(
        expectedResult.totalCredit,
        2
      );
    });
  });

  describe("Detailed validations", () => {
    test(`Check accounts 401`, async () => {
      const result = await parse(SAMPLE_1);
      const accounts401 = result.accounts.filter((a) =>
        a.code.startsWith("401")
      );
      expect(accounts401.length).toBe(14);
    });

    test(`Check records for accounts 512`, async () => {
      const result = await parse(SAMPLE_1);
      const account512 = result.accounts.find((a) => a.code.startsWith("512"));

      expect(account512).toBeDefined();
      expect(account512?.recordItems.length).toBe(39);

      const totals = account512?.recordItems.reduce(
        (acc, item) => ({
          debit: round2(acc.debit + item.debit),
          credit: round2(acc.credit + item.credit),
        }),
        { debit: 0, credit: 0 }
      );

      expect(account512?.totalDebit).toBeCloseTo(19604.06, 2);
      expect(account512?.totalCredit).toBeCloseTo(15712.89, 2);
      expect(account512?.totalDebit).toBeCloseTo(totals?.debit || 0, 2);
      expect(account512?.totalCredit).toBeCloseTo(totals?.credit || 0, 2);
    });
  });

  describe("Bonus Feature (Grouped Records)", () => {
    test(`should group transactions into balanced records`, async () => {
      const result = await parse(SAMPLE_1);
      expect(result.records).toBeDefined();
      expect(result.records?.length).toBeGreaterThan(0);

      for (const record of result.records as TRecord[]) {
        expect(record.totalDebit).toBeCloseTo(record.totalCredit, 2);
      }
    });

    test(`should contain a specific record`, async () => {
      const result = await parse(SAMPLE_1);
      const sampleRecord = result.records?.find((r) =>
        r.recordItems.some((item) =>
          item.label.includes("Virement Fonds Travaux")
        )
      );

      expect(sampleRecord).toBeDefined();
      expect(sampleRecord?.totalDebit).toBeCloseTo(
        sampleRecord?.totalCredit || 0,
        2
      );
    });
  });
});

describe("With sample 3", () => {
  describe("Basic validation", () => {
    test(`should return the right number of accounts`, async () => {
      const result = await parse(SAMPLE_3);
      expect(result.accounts.length).toBe(67);
    });

    test(`should return the right balance`, async () => {
      const result = await parse(SAMPLE_3);
      const expectedResult: TBalance = {
        totalDebit: 152401.05,
        totalCredit: 152401.05,
      };
      expect(result.balance.totalDebit).toBeCloseTo(
        expectedResult.totalDebit,
        2
      );
      expect(result.balance.totalCredit).toBeCloseTo(
        expectedResult.totalCredit,
        2
      );
    });
  });

  describe("Detailed validations", () => {
    test(`Check accounts 401`, async () => {
      const result = await parse(SAMPLE_3);
      const accounts401 = result.accounts.filter((a) =>
        a.code.startsWith("401")
      );
      expect(accounts401.length).toBe(20);
    });

    test(`Check records for accounts 512`, async () => {
      const result = await parse(SAMPLE_3);
      const account512 = result.accounts.find((a) => a.code.startsWith("512"));

      expect(account512).toBeDefined();
      expect(account512?.recordItems.length).toBe(57);

      const totals = account512?.recordItems.reduce(
        (acc, item) => ({
          debit: round2(acc.debit + item.debit),
          credit: round2(acc.credit + item.credit),
        }),
        { debit: 0, credit: 0 }
      );

      expect(account512?.totalDebit).toBeCloseTo(60515.53, 2);
      expect(account512?.totalCredit).toBeCloseTo(18177.16, 2);
      expect(account512?.totalDebit).toBeCloseTo(totals?.debit || 0, 2);
      expect(account512?.totalCredit).toBeCloseTo(totals?.credit || 0, 2);
    });
  });

  describe("Bonus Feature (Grouped Records)", () => {
    test(`should group transactions into balanced records`, async () => {
      const result = await parse(SAMPLE_3);
      expect(result.records).toBeDefined();
      expect(result.records?.length).toBeGreaterThan(0);

      for (const record of result.records as TRecord[]) {
        expect(record.totalDebit).toBeCloseTo(record.totalCredit, 2);
      }
    });

    test(`should contain a specific record`, async () => {
      const result = await parse(SAMPLE_3);
      const sampleRecord = result.records?.find((r) =>
        r.recordItems.some((item) =>
          item.label.includes("Répartition des charges")
        )
      );

      expect(sampleRecord).toBeDefined();
      expect(sampleRecord?.totalDebit).toBeCloseTo(
        sampleRecord?.totalCredit || 0,
        2
      );
    });
  });
});
