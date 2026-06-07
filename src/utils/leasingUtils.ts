/**
 * Replicates the logic for generating a leasing schedule.
 */
export const calculateInstallments = (
  loanAmount: number,
  interestRate: number,
  periodInMonths: number
) => {
  if (!loanAmount || !interestRate || !periodInMonths) return {
    monthlyInstallment: 0,
    totalInterest: 0,
    totalPayable: 0
  };

  const totalInterest = (loanAmount * interestRate * periodInMonths) / 100;
  const totalPayable = loanAmount + totalInterest;
  const monthlyInstallment = totalPayable / periodInMonths;

  return {
    monthlyInstallment: Math.round(monthlyInstallment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayable: Math.round(totalPayable * 100) / 100
  };
};

/**
 * Sync vehicle market value to lease loan amount (LTV check might happen here)
 */
export const calculateMaxLoanAmount = (marketValue: number, ltvPercentage: number) => {
  return (marketValue * ltvPercentage) / 100;
};

/**
 * Derives the number of installments from the repayment period and
 * the collection (installment date) frequency type.
 *
 * - loanPeriod:           numeric period value (e.g. 12 for 12 months)
 * - loanPeriodType:       "months" | "weeks" | "days"
 * - collectionPeriodType: "daily" | "weekly" | "monthly" | "first_of_month" | …
 */
export const deriveInstallmentCount = (
  loanPeriod: number,
  loanPeriodType: string,
  collectionPeriodType: string
): number => {
  const lpType = loanPeriodType.toLowerCase();
  const cpType = collectionPeriodType.toLowerCase();

  if (lpType === "months") {
    if (cpType === "daily") return loanPeriod * 30;
    if (cpType === "weekly" || cpType === "by_weekly") return Math.round(loanPeriod * 52 / 12); // 4.333 weeks/month
    // monthly / first_of_month / end_of_month / on_selected_date
    return loanPeriod;
  }

  if (lpType === "weeks") {
    if (cpType === "daily") return loanPeriod * 7;
    // weekly
    return loanPeriod;
  }

  if (lpType === "days") {
    // daily collection only meaningful match
    return loanPeriod;
  }

  return loanPeriod;
};

/**
 * Client-side loan schedule generator matching LoanScheduleService.php.
 *
 * The `collectionPeriod` parameter is intentionally removed.
 * Installment count is derived from loanPeriod + product types.
 */
export const generateRepaymentSchedule = (
  loanAmount: number,
  interestRate: number,
  loanPeriod: number,
  startDateStr: string,
  product: any,
  _productItemId?: number | null
): any[] => {
  if (!loanAmount || !interestRate || !loanPeriod || !product) {
    return [];
  }

  // ── Interest Normalization ────────────────────────────────────────────────
  // Mirrors the PHP backend's explicit conversion matrix in LoanScheduleService.php
  const loanPeriodType     = (product.loan_period_type     ?? "months").toLowerCase();
  const interestPeriodType = (product.interest_period_type ?? "per_month").toLowerCase();

  let totalInterestRate: number;

  switch (interestPeriodType) {
    case "per_month":
    case "per_months":
      switch (loanPeriodType) {
        case "months": totalInterestRate = interestRate;          break;
        case "weeks":  totalInterestRate = interestRate / 4;      break;
        case "days":   totalInterestRate = interestRate / 30;     break;
        default:       totalInterestRate = interestRate;
      }
      break;

    case "per_week":
      switch (loanPeriodType) {
        case "months": totalInterestRate = interestRate * 4;      break;
        case "weeks":  totalInterestRate = interestRate;          break;
        case "days":   totalInterestRate = interestRate / 7;      break;
        default:       totalInterestRate = interestRate;
      }
      break;

    case "per_day":
    case "per_days":
      switch (loanPeriodType) {
        case "months": totalInterestRate = (interestRate * 365) / 12; break;
        case "weeks":  totalInterestRate = interestRate * 7;          break;
        case "days":   totalInterestRate = interestRate;              break;
        default:       totalInterestRate = interestRate;
      }
      break;

    case "per_year":
    case "per_years":
      switch (loanPeriodType) {
        case "months": totalInterestRate = interestRate / 12;     break;
        case "weeks":  totalInterestRate = interestRate / 52;     break;
        case "days":   totalInterestRate = interestRate / 365;    break;
        default:       totalInterestRate = interestRate;
      }
      break;

    case "per_loan":
    case "per_loans":
      totalInterestRate = interestRate;
      break;

    default:
      totalInterestRate = interestRate;
  }

  // ── Derive installment count from repayment period & collection frequency ─
  const collectionPeriodType = (product.collection_period_type ?? loanPeriodType).toLowerCase();
  const collectionPeriod = deriveInstallmentCount(loanPeriod, loanPeriodType, collectionPeriodType);

  if (collectionPeriod <= 0) return [];

  // ── Interest method ───────────────────────────────────────────────────────
  const isReducing = ["reducing balance", "reducing_balance"].includes(
    (product.interest_method ?? "").toLowerCase().trim()
  );

  let outstandingBalance = loanAmount;
  let periodicRate = 0;
  let emi = 0;
  let totalInterest = 0;

  if (isReducing) {
    periodicRate = (totalInterestRate * loanPeriod) / (100 * collectionPeriod);
    if (periodicRate > 0) {
      emi =
        (loanAmount * periodicRate * Math.pow(1 + periodicRate, collectionPeriod)) /
        (Math.pow(1 + periodicRate, collectionPeriod) - 1);
    } else {
      emi = loanAmount / collectionPeriod;
    }
    totalInterest = emi * collectionPeriod - loanAmount;
  } else {
    // Flat Rate
    totalInterest = loanAmount * (totalInterestRate / 100) * loanPeriod;
  }

  // ── Per-installment allocations ───────────────────────────────────────────
  const capitalPerMainInst  = loanAmount    / collectionPeriod;
  const interestPerMainInst = totalInterest / collectionPeriod;

  // ── Charges ───────────────────────────────────────────────────────────────
  let perInstCharges  = 0;
  let firstInstCharges = 0;

  const chargesList = product.additional_charges || [];
  chargesList.forEach((charge: any) => {
    const deductionType = (charge.deduction_type || "").toLowerCase();
    const isPercent     = (charge.value_type     || "").toLowerCase() === "percentage";
    const amount        = isPercent
      ? loanAmount * (parseFloat(charge.value) / 100)
      : parseFloat(charge.value) || 0;

    if (deductionType.includes("first") && deductionType.includes("installment")) {
      firstInstCharges += amount;
    } else if (deductionType.includes("installment")) {
      perInstCharges += amount;
    }
  });

  // ── Setup row (0-capital) check ───────────────────────────────────────────
  const isSetupInstallment = firstInstCharges > 0;
  const totalInstallmentCount = isSetupInstallment ? collectionPeriod + 1 : collectionPeriod;

  // ── Date generation ───────────────────────────────────────────────────────
  // Use the collection_period_type to decide the interval between due dates,
  // matching how the PHP backend uses its $pType variable.
  const pType = collectionPeriodType;

  let currentDate = startDateStr ? new Date(startDateStr) : new Date();

  const addOffset = (date: Date, type: string): Date => {
    const d = new Date(date);
    if (type === "daily" || type.includes("day")) {
      d.setDate(d.getDate() + 1);
    } else if (type === "weekly" || type === "by_weekly" || type.includes("week")) {
      d.setDate(d.getDate() + 7);
    } else {
      // monthly / first_of_month / end_of_month / on_selected_date / default
      d.setMonth(d.getMonth() + 1);
    }
    return d;
  };

  const formatDate = (d: Date): string => {
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const schedule = [];

  for (let i = 1; i <= totalInstallmentCount; i++) {
    if (i > 1) {
      currentDate = addOffset(currentDate, pType);
    }

    let currentCharges  = perInstCharges;
    let currentCapital  = 0;
    let currentInterest = 0;

    if (isSetupInstallment && i === 1) {
      // Setup row: charges only, no capital/interest
      currentCharges = firstInstCharges;
    } else {
      // Merge one-time first-installment charges into the first main row when
      // there is no dedicated setup row
      if (i === 1 && !isSetupInstallment) {
        currentCharges += firstInstCharges;
      }

      if (isReducing) {
        currentInterest = outstandingBalance * periodicRate;
        currentCapital  = emi - currentInterest;

        // Last row: clear the remaining balance exactly
        if (i === totalInstallmentCount) {
          currentCapital = outstandingBalance;
        }
        outstandingBalance -= currentCapital;
      } else {
        currentCapital  = capitalPerMainInst;
        currentInterest = interestPerMainInst;
        outstandingBalance -= currentCapital;
      }
    }

    const totalDue = currentCapital + currentInterest + currentCharges;

    schedule.push({
      no:              i,
      collection_date: formatDate(currentDate),
      capital:         currentCapital.toFixed(2),
      interest:        currentInterest.toFixed(2),
      charges:         currentCharges.toFixed(2),
      total_due:       totalDue.toFixed(2),
      remaining_balance: Math.max(0, outstandingBalance).toFixed(2),
    });
  }

  return schedule;
};
