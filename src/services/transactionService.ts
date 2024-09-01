import prisma from '../utils/prismaClient';
import { EtherscanTransaction, User } from '../types/transaction';
import { fetchTransactions } from '../helper/transaction';


export const fetchTransactionsAndUpdateUser = async (address: string): Promise<User> => {
    let user = await prisma.user.findUnique({
        where: { address },
        include: { transactions: true }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                address,
                latestBlockNumber: 0,
            },
            include: { transactions: true }
        });
    }

    if (!user) {
        throw new Error('User not found or created');
    }

    const startBlock = user.latestBlockNumber;

    try {
        const result = await fetchTransactions(address, startBlock);

        if (!Array.isArray(result) || result.length === 0) {
            console.log('No new transactions found for address:', address);
            return user;
        }

    
        const existingTransactions = user.transactions; 
        const existingHashes = new Set(existingTransactions.map(tx => tx.hash));
        const newTransactions = result.filter((tx: EtherscanTransaction) => !existingHashes.has(tx.hash));

        if (newTransactions.length > 0) {
            if (!user.id) {
                throw new Error('User ID is not defined');
            }

            await prisma.transaction.createMany({
                data: newTransactions.map(tx => ({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: tx.value,
                    gasUsed: tx.gasUsed,
                    gasPrice: tx.gasPrice,
                    blockNumber: parseInt(tx.blockNumber, 10),
                    userId: user!.id,
                }))
            });

            const maxBlockNumber = Math.max(...newTransactions.map(tx => parseInt(tx.blockNumber, 10)));
            user = await prisma.user.update({
                where: { address },
                data: { latestBlockNumber: maxBlockNumber },
                include: { transactions: true }
            });
        }

        return user;
    } catch (error: any) {
        if (error instanceof Error) {
            console.error('Error fetching or updating transactions:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        throw new Error('Failed to fetch or update transactions');
    }
};
