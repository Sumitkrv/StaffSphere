# AY 2026-27 — New Tax Regime (India), progressive slabs on annual taxable income.

_RELIEF_ON_INCOME_ABOVE_12L = 75000.0
_CESS_RATE_ON_TAX = 0.04


def calculate_income_tax(income: float) -> int:
    """
    Annual tax via top-down marginal slabs (progressive; same logic as JS).
    `income` is annual taxable income (₹).

    Fixed relief ₹75,000 applies only to the portion above ₹12,00,000 (cannot drive
    that portion below zero), then slabs apply to the resulting amount.
    After slab tax, add 4% on that calculated tax (cess); return final annual tax.

    ₹0–₹12,00,000: nil; ₹12,00,001–₹16,00,000: 15%; ₹16,00,001–₹20,00,000: 20%;
    ₹20,00,001–₹24,00,000: 25%; above ₹24,00,000: 30%.
    """
    full = max(0.0, float(income or 0))
    above_12 = max(0.0, full - 1200000.0)
    x = 1200000.0 + max(0.0, above_12 - _RELIEF_ON_INCOME_ABOVE_12L)
    tax = 0.0
    if x > 2400000:
        tax += (x - 2400000) * 0.30
        x = 2400000
    if x > 2000000:
        tax += (x - 2000000) * 0.25
        x = 2000000
    if x > 1600000:
        tax += (x - 1600000) * 0.20
        x = 1600000
    if x > 1200000:
        tax += (x - 1200000) * 0.15
        x = 1200000
    final_tax = tax * (1.0 + _CESS_RATE_ON_TAX)
    return int(round(final_tax))


def derive_tds_from_monthly_taxable(monthly_taxable_income: float) -> tuple[float, float, int]:
    """
    annual_taxable = monthly_taxable_income × 12
    annual_tax = calculate_income_tax(annual_taxable)
    monthly_tds = annual_tax / 12

    Returns (monthly_tds_rounded_2dp, annual_taxable_rounded_2dp, annual_tax_int).
    """
    m = max(0.0, float(monthly_taxable_income or 0))
    annual_taxable = round(m * 12, 2)
    annual_tax = calculate_income_tax(annual_taxable)
    monthly_tds = round(float(annual_tax) / 12.0, 2)
    return monthly_tds, annual_taxable, annual_tax


def clamp_monthly_tds_for_payroll(monthly_tds: float, effective_gross: float, non_tds_deductions: float) -> float:
    """
    Apply payroll safety after corporate slab TDS:
    - withheld TDS must not exceed effective gross for the period (heavy LOP),
    - and must not consume more than remaining room after PF/advance/other non-TDS (net ≥ 0).
    """
    eg = max(0.0, round(float(effective_gross or 0), 2))
    nt = max(0.0, round(float(non_tds_deductions or 0), 2))
    t_raw = float(monthly_tds or 0)
    room = max(0.0, round(eg - nt, 2))
    return round(min(max(0.0, t_raw), eg, room), 2)


# Backward-compat alias used in some callers
def cap_monthly_tds(monthly_tds: float, effective_gross: float, non_tds_deductions: float) -> float:
    return clamp_monthly_tds_for_payroll(monthly_tds, effective_gross, non_tds_deductions)
