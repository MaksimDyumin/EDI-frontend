import { createPinia } from 'pinia';
import { useUserStore } from '@/store/user';

const pinia = createPinia();
const userStore = useUserStore(pinia);

export async function authMiddleware(to, from, next) {

  let response
  try {
    response = await userStore.getProfile()
  }
  catch(e) {
    console.log(e)
  }
  
  if (response?.statusText === 'OK') {
    next();
  } else {
    next({ name: 'login' });
  }
}