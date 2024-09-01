import { getUserExpensesAndPrice } from '../services/expenseService';
import { fetchAndStoreEthereumPrice } from '../services/priceService';
import prisma from '../utils/prismaClient';

jest.mock('../utils/prismaClient', () => ({
  user: {
    findUnique: jest.fn(),
  },
  etherPrice: {
    findFirst: jest.fn(),
  },
}));

jest.mock('../services/priceService');

describe('Transaction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate total expenses and get current price for a user with transactions', async () => {
    const mockTransactions = [
      { gasUsed: '21000', gasPrice: '20000000000' },
      { gasUsed: '15000', gasPrice: '25000000000' },
    ];
    const mockUser = {
      address: '0x789',
      transactions: mockTransactions,
    };
    const mockLatestPrice = { price: 200000 };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.etherPrice.findFirst as jest.Mock).mockResolvedValue(mockLatestPrice);
    
    const expectedTotalExpenses = (21000 * 20000000000 + 15000 * 25000000000) / 1e18;

    const result = await getUserExpensesAndPrice('0x789');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { address: '0x789' },
      include: { transactions: true }
    });
    expect(prisma.etherPrice.findFirst).toHaveBeenCalledWith({
      orderBy: { timestamp: 'desc' }
    });
    expect(result).toEqual({
      totalExpenses: expectedTotalExpenses,
      currentPrice: 200000
    });
  });

  it('should fetch a new Ethereum price if no latest price is available', async () => {
    const mockUser = {
      address: '0x789',
      transactions: [{ gasUsed: '21000', gasPrice: '20000000000' }]
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prisma.etherPrice.findFirst as jest.Mock).mockResolvedValue(null);
    (fetchAndStoreEthereumPrice as jest.Mock).mockResolvedValue(150000);

    const expectedTotalExpenses = (21000 * 20000000000) / 1e18;

    const result = await getUserExpensesAndPrice('0x789');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { address: '0x789' },
      include: { transactions: true }
    });
    expect(prisma.etherPrice.findFirst).toHaveBeenCalledWith({
      orderBy: { timestamp: 'desc' }
    });
    expect(fetchAndStoreEthereumPrice).toHaveBeenCalled();
    expect(result).toEqual({
      totalExpenses: expectedTotalExpenses,
      currentPrice: 150000
    });
  });

  it('should throw an error if user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.etherPrice.findFirst as jest.Mock).mockResolvedValue({ price: 200000 });
  
    await expect(getUserExpensesAndPrice('0x789')).rejects.toThrow('User not found');
  
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { address: '0x789' },
      include: { transactions: true }
    });
  })
});
