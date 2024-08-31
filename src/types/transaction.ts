
export interface Transaction {
    id: string;     
    hash: string;
    from: string;
    to: string;
    value: number;  
    gasUsed: number;
    gasPrice: number; 
    blockNumber: number;
    userId: string; 
}


export interface User {
    id: string;
    address: string;
    latestBlockNumber: number;
    transactions: Transaction[];
  }
  
  export interface EtherscanTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    gasPrice: string;
    blockNumber: string;
  }
  
  export interface EtherscanResponse {
    status: string;
    message: string;
    result: EtherscanTransaction[];
  }
  



