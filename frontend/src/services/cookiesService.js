import Cookies from 'universal-cookie';
const cookies = new Cookies();

export function get(key) {
    return cookies.get(key);
}

export function set(key,value,options){
    cookies.set(key,value,options);
}

export function remove(key) {
    return cookies.remove(key);
}

export default {
    get,
    set,
    remove
  };