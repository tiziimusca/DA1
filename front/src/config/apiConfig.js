import { Platform } from 'react-native';

const DEV_API_URL = 'http://192.168.0.13:8080/api';
const DEV_SERVER_URL = 'http://192.168.0.13:8080';
const PROD_API_URL = 'http://192.168.0.13:8080/api';
const PROD_SERVER_URL = 'http://192.168.0.13:8080';

const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;
const SERVER_BASE_URL = __DEV__ ? DEV_SERVER_URL : PROD_SERVER_URL;

export { API_BASE_URL, SERVER_BASE_URL };
