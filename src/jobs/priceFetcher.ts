import { startCronJobs } from '../config/croJob';

export const initializeJobs = () => {
  startCronJobs();
};
