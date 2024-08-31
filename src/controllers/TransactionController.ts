import { Request, Response } from 'express';

import axios from 'axios';
import { fetchTransactionsAndUpdateUser } from '../services/transactionService';

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { address } = req.params;

        const userTransaction = await fetchTransactionsAndUpdateUser(address);

        res.status(200).json({
            address: userTransaction.address,
            totalTransactions: userTransaction.transactions.length,
            latestBlockNumber: userTransaction.latestBlockNumber,
            transactions: userTransaction.transactions
        });

    } catch (error:any) {
        console.error(error);
        if (axios.isAxiosError(error) && error.response) {
            res.status(500).json({ error: 'Error from Etherscan API', details: error.response.data });
        } else {
            res.status(500).json({ error: 'An error occurred while fetching transactions' });
        }
    }
};

  