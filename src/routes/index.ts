import { Router } from 'express';
import { getTransactions } from '../controllers/TransactionController';
import { getUserExpensesAndPriceController } from '../controllers/expenseController';


const router = Router();


router.get('/transactions/:address', getTransactions);
router.get('/user/:address/expenses-and-price',getUserExpensesAndPriceController);

export default router;
