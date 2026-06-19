/**
 * Pre-generated test account fixtures for wallet E2E tests
 * These are deterministic test keypairs generated using Stellar SDK
 * 
 * ⚠️ WARNING: These are test-only keys - NEVER use in production or with real funds
 * 
 * Generated: 2026-06-19T08:55:00.689Z
 */

export interface TestAccount {
  publicKey: string;
  secret: string;
  displayName: string;
}

/**
 * Test accounts with pre-computed Stellar keypairs
 * IMPORTANT: These are test-only keys - never use in production
 */
export const TEST_ACCOUNTS: TestAccount[] = [
  {
    displayName: 'Alice',
    publicKey: 'GDFVYP2HTPCFMQO7PZ6EPN4MI5QT4LUN2GAEZGPUV5LH3MBVB3IMO6AB',
    secret: 'SBSLV43VZBT6TLTFMGPDZPCOV4WBD3FBRNNS5LG46XSH256ITLQI33X4H',
  },
  {
    displayName: 'Bob',
    publicKey: 'GAOLGFVD6XP5LWHJI7GKQC54DW4ZV7VLFOXE252HMUYLEBC4OZCIZHI4',
    secret: 'SCNOK6QEQQBBVAM3XPTXBYLSONDETUO4SYIBTYD7THJQXGWBFXFQDDAO3',
  },
  {
    displayName: 'Charlie',
    publicKey: 'GCC55YUG7V5WI4NZ2W4GF6WWIZJF2ZBURKJ3DPJDFUZOE7Z3HTJSLZTC',
    secret: 'SC67LWRMKU6YWWSD6T5DZLYI4BUUQRCC4RS5BEJPTZMYP5NNZLAZHHZ6Z',
  },
  {
    displayName: 'Diana',
    publicKey: 'GAQJFGWS2UCLQDKSIV7WHRRYUWQI26WW5G4BOFWBK5IN55LKWBJIMY66',
    secret: 'SAICW42JRGRJS3VKPC6ANKGZZEGDS6BHJPNRRY74EE7LNSZJAOFBIIURZ',
  },
  {
    displayName: 'Eve',
    publicKey: 'GBE55SXRL5EDDCHYO45AGLHBEOUACGD5P3JIZ5CDLPKYQ2ZAFH7MAZNO',
    secret: 'SC6ORVZRIPCQ6XUNRFCU2ODSAXFCMO3KVOTAH5QSCFVQUKMUICD5KKCGJ',
  },
];

/**
 * Default test account (Alice) for single-account tests
 */
export const DEFAULT_TEST_ACCOUNT = TEST_ACCOUNTS[0];
