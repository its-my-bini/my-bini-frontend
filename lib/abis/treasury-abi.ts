export const treasuryAbi = [
  {
    inputs: [{ name: 'userId', type: 'string' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;
