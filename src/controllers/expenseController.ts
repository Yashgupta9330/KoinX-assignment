import { Request, Response } from 'express';
import { getUserExpensesAndPrice } from '../services/expenseService';


export const getUserExpensesAndPriceController = async (req: Request, res: Response) => {
  try {
    const { address } = req.params; 

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const result = await getUserExpensesAndPrice(address);
    return res.status(200).json(result);

  } catch (error:any) {
    return res.status(500).json({ error: error.message });
  }
};
