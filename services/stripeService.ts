
export interface StripeTransaction {
  id: string;
  email: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  date: string;
  plan: string;
}

const STORAGE_KEY = 'studio-stripe-transactions';

export const getTransactions = (): StripeTransaction[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const createTransaction = (email: string, amount: number, plan: string): StripeTransaction => {
  const newTx: StripeTransaction = {
    id: `ch_${Math.random().toString(36).substr(2, 9)}`,
    email,
    amount,
    currency: 'USD',
    status: 'succeeded',
    date: new Date().toISOString(),
    plan
  };
  
  const txs = getTransactions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newTx, ...txs]));
  return newTx;
};

export const simulatePayment = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2000);
  });
};
