/**
 * @typedef {Object} Order
 * @property {string} id - e.g. "ORD-1024"
 * @property {string} customerId
 * @property {string} customerName
 * @property {string} phone
 * @property {('phone'|'laptop'|'computer'|'tablet'|'macbook')} deviceType
 * @property {string} brand
 * @property {string} model
 * @property {string} [imei]
 * @property {string} issue
 * @property {string} [condition]
 * @property {string} workerId
 * @property {string} workerName
 * @property {('new'|'waiting'|'diagnosing'|'repairing'|'ready'|'completed'|'cancelled'|'no_show')} status
 * @property {('low'|'normal'|'high'|'urgent')} priority
 * @property {number} price
 * @property {number} paid
 * @property {string} createdAt - ISO
 * @property {string} [expectedDate] - ISO
 * @property {string} [notes]
 * @property {string} [cancelledReason]
 * @property {Array<{id:string, key:string, at:string}>} timeline
 * @property {Array<{method:string, amount:number, at:string, date:string}>} payments
 */

export default {}
