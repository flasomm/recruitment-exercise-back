# Recruitment exercise

Contact John for any question: john@bellman.immo

## Objectives

The objective of this exercise is to test you on developing a backend project.

You are evaluated on :

- Having a working project ! 🙂
- Code structure & quality 🤩
- Understanding of the problem 🤓

## Delivery instructions

Send us by email (john@bellman.immo) your project within 4 hours after checking out the exercise for the first time. Your project must be contained in a zip archive, cleaned of any working files.

## Guidelines

You have to use NodeJS, with any library or tool you need.
If your can work with Typescript, it's even better (but not mandatory) !

## What's expected

Your job is to create a script which parse an input CSV file (`./data/sample_1.csv`) and reconstruct it in a valid data object `TParsingResult`.
This type is defined in file `./src/types.ts`

You have to implement the `parse` function in `./src/parser.ts` file.
We implemented some tests to help you knowing if your parser is working correctly : `yarn test`.

Feel free to implement more test during your development if this helps you.

## Description of the problem

### Introduction
This is a real problem we faced and developed : Extract, Parse and import Accounting data from PDF files.
For each new building that we win, we need to initialize the accounting by importing it in our database.
The problem is the only inputs we have are Accounting PDF files provided by the previous property manager firm. These PDF are exported from their software, and each software has different format.

We developed a way to be able to import these PDF for each software in three steps : 
1. Extract raw data from PDF to CSV files (using [Camelot](https://camelot-py.readthedocs.io/en/master/))
2. Parsing CSV files into a common data format <-- This is the part you have to develop in this exercise (for only one type of PDF format)
3. Import this data format in our database

### How data is extracted from PDF to CSV
The provided PDF (`./data/sample_1.pdf`) are only provided to help you understand the structure of the CSV file.
The CSV files where extracted from PDF using [Camelot](https://camelot-py.readthedocs.io/en/master/), which :
- Extracts each row in the PDF
- Splits each row into columns using column coordinates

This is not perfect, and we may have some problems in the CSV : 
- Column text may be truncated
- Some lines must be concatenated when label was too long to be represented on only one line in the PDF (ex: sample_1.pdf, page 3, Répartition des charges (01.01.2021-31.12.2021))
- Some accounts are splitted on multiple pages (ex: sample_1.pdf, account "DARDANI DONATELLA" on page 3 and 4)
- Quality of label extracted is not perfect (characters with accents may be wrongly extracted)

### How to parse this file 
"Grand Livre" is a way to present the accounting of a period. It is structured like following:
- A first line represents an account - `TAccount`
- Following lines represent record items ("lignes d'écriture") - `TRecordItem[]`
- Last line for an account represents the sums for this account: the sum of debits (`totalDebit`), the sum of credits (`totalCredit`) and the balance (`totalDebit - totalCredit`) - `TBalance`

Example for sample 1, second account:
```typescript
const account: TAccountWithRecordItems = {
  code: "105000",
  label: "COTISATION FONDS TRAVAUX",
  totalDebit: 0,
  totalCredit: 6484.82,
  recordItems: [
    {
      label: "Solde Antérieur",
      debit: 0,
      credit: 5619.82,
      date: new Date(2022, 0, 1),
      invoiceNumber: undefined,
    },
    {
      label: "COTISATION FONDS TRAVAUX ALUR",
      debit: 0,
      credit: 432.5,
      date: new Date(2022, 0, 1),
      invoiceNumber: undefined,
    },
    {
      label: "COTISATION FONDS TRAVAUX ALUR",
      debit: 0,
      credit: 432.5,
      date: new Date(2022, 3, 1),
      invoiceNumber: undefined,
    },
  ],
}
```

## Bonus
First step of this exercise is to reconstruct the data represented in the "Grand Livre" : Accounts with their record items.

Record items are also regrouped into records.

If you have enough time, you can try to regroup record items into records. The unicity key is the date and the label of record items.

There is one rule to regroup record items : a record has to be balanced. This means the sum of record items debit must be equal to the sum of record items credit.

