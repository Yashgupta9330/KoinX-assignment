import axios from 'axios';
import prisma from "../utils/prismaClient"


const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr';


export const fetchAndStoreEthereumPrice = async (): Promise<number> => {
  const { data } = await axios.get(COINGECKO_API_URL);
  const ethPrice = data.ethereum.inr;
  await prisma.etherPrice.create({
    data: {
      price: ethPrice,
    },
  });

  return ethPrice;
};
