import axios from 'axios';
import prisma from '../utils/prismaClient';

export const fetchAndStoreEthereumPrice = async (): Promise<number> => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr');
    const ethPrice = response.data.ethereum.inr;

    try {
      await prisma.etherPrice.create({ data: { price: ethPrice } });
    } 
    catch (dbError) {
      console.error('Failed to store price in database:', dbError);
      throw new Error('Database error');
    }

    return ethPrice;
  } catch (error) {
    console.error('Failed to fetch Ethereum price:', error);
    throw new Error('API call failed');
  }
};
