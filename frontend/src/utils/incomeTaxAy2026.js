/**
 * AY 2026-27 New Tax Regime — progressive slabs (annual income).
 * Mirrors backend `src/utils/income_tax_ay2026.py`.
 */

const RELIEF_ON_INCOME_ABOVE_12L = 75000
const CESS_RATE_ON_TAX = 0.04

export function calculateIncomeTax(income) {
  const full = Math.max(0, Number(income) || 0)
  const above12 = Math.max(0, full - 1200000)
  let tax = 0
  let x = 1200000 + Math.max(0, above12 - RELIEF_ON_INCOME_ABOVE_12L)
  if (x > 2400000) {
    tax += (x - 2400000) * 0.30
    x = 2400000
  }
  if (x > 2000000) {
    tax += (x - 2000000) * 0.25
    x = 2000000
  }
  if (x > 1600000) {
    tax += (x - 1600000) * 0.20
    x = 1600000
  }
  if (x > 1200000) {
    tax += (x - 1200000) * 0.15
    x = 1200000
  }
  return Math.round(tax * (1 + CESS_RATE_ON_TAX))
}

/**
 * @param {number} monthlyTaxableIncome — one month’s taxable income (₹)
 * @returns {{ annualTaxableIncome: number, annualTax: number, monthlyTds: number }}
 */
export function deriveTdsFromMonthlyTaxable(monthlyTaxableIncome) {
  const m = Math.max(0, Number(monthlyTaxableIncome) || 0)
  const annualTaxableIncome = Math.round(m * 12 * 100) / 100
  const annualTax = calculateIncomeTax(annualTaxableIncome)
  const monthlyTds = Math.round((annualTax / 12) * 100) / 100
  return { annualTaxableIncome, annualTax, monthlyTds }
}

/**
 * @param {number} monthlyTds
 * @param {number} effectiveGross
 * @param {number} nonTdsDeductions
 */
export function clampMonthlyTdsForPayroll(monthlyTds, effectiveGross, nonTdsDeductions) {
  const eg = Math.round(Math.max(0, Number(effectiveGross) || 0) * 100) / 100
  const nt = Math.round(Math.max(0, Number(nonTdsDeductions) || 0) * 100) / 100
  const room = Math.round(Math.max(0, eg - nt) * 100) / 100
  const t = Number(monthlyTds) || 0
  return Math.round(Math.min(Math.max(0, t), eg, room) * 100) / 100
}

export function capMonthlyTds(monthlyTds, effectiveGross, nonTdsDeductions) {
  return clampMonthlyTdsForPayroll(monthlyTds, effectiveGross, nonTdsDeductions)
}
