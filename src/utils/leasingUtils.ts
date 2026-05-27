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
 * Client-side loan schedule generator matching legacy LoanScheduleService.php and FinanceLeaseController.php
 */
export const generateRepaymentSchedule = (
  loanAmount: number,
  interestRate: number,
  loanPeriod: number,
  collectionPeriod: number,
  startDateStr: string,
  product: any,
  _productItemId?: number | null
): any[] => {
  if (!loanAmount || !interestRate || !loanPeriod || !product) {
    return [];
  }

  // Interest Normalization
  const unitDays: Record<string, number> = {
    days: 1,
    per_day: 1,
    per_days: 1,
    weeks: 7.5,
    per_week: 7.5,
    months: 30,
    per_month: 30,
    per_months: 30,
    year: 360,
    per_year: 360,
  };

  const loanUnitDays = unitDays[product.loan_period_type ?? "months"] ?? 30;
  const interestUnitDays = unitDays[product.interest_period_type ?? "per_month"] ?? 30;

  const totalInterestRate = interestRate * (loanUnitDays / interestUnitDays);

  const isReducing =
    product.interest_method === "Reducing Balance" ||
    product.interest_method === "reducing_balance";
  let outstandingBalance = loanAmount;
  let periodicRate = 0;
  let emi = 0;
  let totalInterest = 0;

  if (isReducing) {
    if (collectionPeriod > 0) {
      periodicRate = (totalInterestRate * loanPeriod) / (100 * collectionPeriod);
      if (periodicRate > 0) {
        emi =
          (loanAmount * periodicRate * Math.pow(1 + periodicRate, collectionPeriod)) /
          (Math.pow(1 + periodicRate, collectionPeriod) - 1);
      } else {
        emi = loanAmount / collectionPeriod;
      }
    }
    totalInterest = emi * collectionPeriod - loanAmount;
  } else {
    // Flat Rate
    totalInterest = loanAmount * (totalInterestRate / 100) * loanPeriod;
  }

  if (collectionPeriod <= 0) return [];

  // Per Installment Allocations
  const capitalPerMainInst = loanAmount / collectionPeriod;
  const interestPerMainInst = totalInterest / collectionPeriod;

  // Charges
  let perInstCharges = 0;
  let firstInstCharges = 0;

  const chargesList = product.additional_charges || [];
  chargesList.forEach((charge: any) => {
    const deductionType = (charge.deduction_type || "").toLowerCase();
    const isPercent = (charge.value_type || "").toLowerCase() === "percentage";
    const amount = isPercent
      ? loanAmount * (parseFloat(charge.value) / 100)
      : parseFloat(charge.value) || 0;

    if (deductionType.includes("first") && deductionType.includes("installment")) {
      firstInstCharges += amount;
    } else if (deductionType.includes("installment")) {
      perInstCharges += amount;
    }
  });

  // Determine if there should be an additional Setup Row (0 Capital/Interest)
  const isSetupInstallment = firstInstCharges > 0; // In leasing context, savings are stripped, so only firstInstCharges matters
  const totalInstallmentCount = isSetupInstallment ? collectionPeriod + 1 : collectionPeriod;

  const schedule = [];
  let currentDate = startDateStr ? new Date(startDateStr) : new Date();
  const pType = (product.collection_period_type || "months").toLowerCase();

  const addOffset = (date: Date, type: string): Date => {
    const d = new Date(date);
    if (type.includes("day") || type === "daily") {
      d.setDate(d.getDate() + 1);
    } else if (type.includes("week") || type === "weekly" || type === "by_weekly") {
      d.setDate(d.getDate() + 7);
    } else if (type.includes("month") || type === "monthly") {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    return d;
  };

  const formatDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  for (let i = 1; i <= totalInstallmentCount; i++) {
    if (i > 1) {
      currentDate = addOffset(currentDate, pType);
    }

    const currentCharges = i === 1 ? perInstCharges + firstInstCharges : perInstCharges;

    let currentCapital = 0;
    let currentInterest = 0;

    if (isSetupInstallment && i === 1) {
      currentCapital = 0;
      currentInterest = 0;
    } else {
      if (isReducing) {
        currentInterest = outstandingBalance * periodicRate;
        currentCapital = emi - currentInterest;

        // Last row adjustment
        if (i === totalInstallmentCount) {
          currentCapital = outstandingBalance;
        }
        outstandingBalance -= currentCapital;
      } else {
        currentCapital = capitalPerMainInst;
        currentInterest = interestPerMainInst;
      }
    }

    const totalDue = currentCapital + currentInterest + currentCharges;

    schedule.push({
      no: i,
      collection_date: formatDate(currentDate),
      capital: currentCapital.toFixed(2),
      interest: currentInterest.toFixed(2),
      charges: currentCharges.toFixed(2),
      total_due: totalDue.toFixed(2),
    });
  }

  return schedule;
};
