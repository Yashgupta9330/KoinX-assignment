import cron from 'node-cron';
import { fetchAndStoreEthereumPrice } from '../services/priceService';

export const startCronJobs = () => {
  cron.schedule('*/10 * * * *', async () => {
    try {
      await fetchAndStoreEthereumPrice();
      console.log('Ethereum price fetched and stored successfully.');
    } catch (error) {
      console.error('Error fetching and storing Ethereum price:', error);
    }
  });
};
