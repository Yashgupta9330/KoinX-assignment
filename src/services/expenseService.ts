import { fetchAndStoreEthereumPrice } from "./priceService";
import prisma from "../utils/prismaClient"
import { Transaction } from "@prisma/client";

type UserExpensesAndPrice = {
    totalExpenses: number;
    currentPrice: number;
 };
  

export const getUserExpensesAndPrice = async (address: string): Promise<UserExpensesAndPrice> => {
    const user = await prisma.user.findUnique({
      where: { address },
      include: { transactions: true }
    });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    const latestPrice = await prisma.etherPrice.findFirst({
      orderBy: { timestamp: 'desc' }
    });
  
    let ethPrice: number;
  
    if (latestPrice) {
      ethPrice = latestPrice.price;
    } 
    else {
      ethPrice = await fetchAndStoreEthereumPrice();
    }
  

    const totalExpenses = user.transactions.reduce((sum: number, tx: Transaction) => {
        const expense = (tx.gasUsed * tx.gasPrice) / 1e18;
        return sum + expense;
    }, 0);
  
    return {
      totalExpenses,
      currentPrice: ethPrice
    };
  };