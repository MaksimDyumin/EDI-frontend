import VueCookies from 'vue-cookies';

export default function useCookie(keyName) {
  let obj = {
    get value() {
      return VueCookies.get(keyName)
    },
    set value(val) {
      VueCookies.set(keyName, val)
    }
  };

  return obj
}