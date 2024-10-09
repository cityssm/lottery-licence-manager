import { config as configOntario } from './configOntario.js';
export const config = { ...configOntario };
config.application = {
    applicationName: 'Lottery Licence Manager'
};
config.users = {
    canLogin: [],
    canCreate: [],
    canUpdate: [],
    isAdmin: []
};
config.defaults.city = '';
export default config;
