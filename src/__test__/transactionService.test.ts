import * as transactionService from '../services/transactionService';
import { EtherscanTransaction } from '../types/transaction';
import { fetchTransactions } from '../helper/transaction';
import prismaMock from '../__mocks__/prismaClient';

jest.mock('axios');
jest.mock('../__mocks__/prismaClient'); 
jest.mock('../helper/transaction');

describe('Transaction Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); 
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchTransactionsAndUpdateUser', () => {
    it('should create a user if not found and fetch new transactions', async () => {
      const address = '0x123';
      const mockTransactions: EtherscanTransaction[] = [
        { hash: '0xabc', from: '0xdef', to: '0xghi', value: '1000000000000000000', gasUsed: '21000', gasPrice: '20000000000', blockNumber: '123456' },
      ];

      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.user.create as jest.Mock).mockResolvedValue({ id: '1', address, latestBlockNumber: 0, transactions: [] });
      (fetchTransactions as jest.Mock).mockResolvedValue(mockTransactions);
      (prismaMock.transaction.createMany as jest.Mock).mockResolvedValue({ count: mockTransactions.length });
      (prismaMock.user.update as jest.Mock).mockResolvedValue({
        id: '1',
        address,
        latestBlockNumber: 123456,
        transactions: mockTransactions,
      });

      const user = await transactionService.fetchTransactionsAndUpdateUser(address);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { address },
        include: { transactions: true },
      });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          address,
          latestBlockNumber: 0,
        },
        include: { transactions: true },
      });
      expect(fetchTransactions).toHaveBeenCalledWith(address);
      expect(prismaMock.transaction.createMany).toHaveBeenCalledWith({
        data: mockTransactions.map(tx => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
          blockNumber: parseInt(tx.blockNumber, 10),
          userId: '1',
        })),
      });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { address },
        data: { latestBlockNumber: 123456 },
        include: { transactions: true },
      });
      expect(user).toEqual({
        id: '1',
        address,
        latestBlockNumber: 123456,
        transactions: mockTransactions,
      });
    });

    it('should handle API errors gracefully', async () => {
      const address = '0x123';
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.user.create as jest.Mock).mockResolvedValue({ id: '1', address, latestBlockNumber: 0, transactions: [] });

      const errorMessage = 'API call failed';
      (fetchTransactions as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(transactionService.fetchTransactionsAndUpdateUser(address)).rejects.toThrow('Failed to fetch or update transactions');

      expect(console.error).toHaveBeenCalledWith('Error fetching or updating transactions:', errorMessage);
    });
  });
});
