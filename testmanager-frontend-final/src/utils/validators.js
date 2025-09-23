export function isEmail(v='') { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
export function isCPF(v='') { return v.replace(/\D/g,'').length === 11 }
export function isCNPJ(v='') { return v.replace(/\D/g,'').length === 14 }
export function isCEP(v='') { return v.replace(/\D/g,'').length === 8 }
export function required(v) { return v != null && String(v).trim().length > 0 }
