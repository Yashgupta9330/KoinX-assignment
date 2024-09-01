import axios from 'axios';
import { EtherscanTransaction } from '../types/transaction';

const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';

export const fetchTransactions = async (address: string,startBlock:number): Promise<EtherscanTransaction[]> => {
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        startblock: startBlock,
        endblock: 99999999,
        sort: 'asc',
        apikey: process.env.ETHERSCAN_API_KEY,
      },
    });

    if (response.data.status === '1') {
      return response.data.result.map((tx: any) => ({
        address,
        hash: tx.hash,
        blockNumber: parseInt(tx.blockNumber),
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasUsed:tx.gasUsed,
        gasPrice: tx.gasPrice,
      }));
    } else {
      throw new Error(response.data.message || 'Unknown API error');
    }
  } catch (error: any) {
    if (error.response) {
      console.error('API response error:', error.response.data);
    } else if (error.request) {
      console.error('API request error:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw new Error('Failed to fetch transactions from Etherscan');
  }
};
