/**
 * Replicates the logic for generating a leasing schedule.
 * Since specific business logic for schedule generation might depend on 
 * fine-grained rules (grace periods, etc.), this is a standard flat-rate version.
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
