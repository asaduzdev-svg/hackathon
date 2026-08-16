/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {('OWNER'|'WORKER'|'CUSTOMER')} role
 * @property {string} [phone]
 */

/**
 * @typedef {Object} Session
 * @property {User} user
 * @property {string} token
 */

export default {}
