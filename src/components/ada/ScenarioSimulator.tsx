import React, { useState } from 'react';

interface ScenarioSimulatorProps {
  type: 'retirement' | 'investment' | 'spending' | 'tax';
  initialValues?: Record<string, number>;
}

export function ScenarioSimulator({ type, initialValues = {} }: ScenarioSimulatorProps) {
  const [values, setValues] = useState<Record<string, number>>(
    type === 'retirement' ? {
      monthlyContribution: initialValues.monthlyContribution || 5000,
      years: initialValues.years || 20,
      returnRate: initialValues.returnRate || 7,
    } : type === 'investment' ? {
      initialAmount: initialValues.initialAmount || 100000,
      monthlyAddition: initialValues.monthlyAddition || 2000,
      years: initialValues.years || 10,
      returnRate: initialValues.returnRate || 8,
    } : type === 'spending' ? {
      monthlySpending: initialValues.monthlySpending || 8000,
      inflationRate: initialValues.inflationRate || 3,
      years: initialValues.years || 30,
    } : {
      income: initialValues.income || 500000,
      deductions: initialValues.deductions || 50000,
      taxRate: initialValues.taxRate || 35,
    }
  );

  const handleChange = (key: string, value: number) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const calculateResults = () => {
    if (type === 'retirement') {
      const monthly = values.monthlyContribution;
      const months = values.years * 12;
      const rate = values.returnRate / 100 / 12;
      const futureValue = monthly * (((1 + rate) ** months - 1) / rate);
      return {
        total: futureValue,
        contributions: monthly * months,
        gains: futureValue - (monthly * months),
      };
    } else if (type === 'investment') {
      const initial = values.initialAmount;
      const monthly = values.monthlyAddition;
      const months = values.years * 12;
      const rate = values.returnRate / 100 / 12;
      const futureValue = initial * (1 + rate) ** months + monthly * (((1 + rate) ** months - 1) / rate);
      return {
        total: futureValue,
        contributions: initial + (monthly * months),
        gains: futureValue - (initial + monthly * months),
      };
    } else if (type === 'spending') {
      const monthly = values.monthlySpending;
      const rate = values.inflationRate / 100;
      const futureMonthly = monthly * ((1 + rate) ** values.years);
      const totalSpent = monthly * 12 * values.years * (1 + rate / 2); // Approximate total with avg inflation
      return {
        currentAnnual: monthly * 12,
        futureAnnual: futureMonthly * 12,
        totalSpent: totalSpent,
      };
    } else {
      const taxable = values.income - values.deductions;
      const tax = taxable * (values.taxRate / 100);
      return {
        taxableIncome: taxable,
        estimatedTax: tax,
        afterTax: values.income - tax,
      };
    }
  };

  const results = calculateResults();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[12px] p-[20px] my-[16px]">
      <h3 className="text-[16px] text-[#1A1A1A] mb-[20px] font-medium">
        {type === 'retirement' && 'Retirement Scenario'}
        {type === 'investment' && 'Investment Comparison'}
        {type === 'spending' && 'Spending Projection'}
        {type === 'tax' && 'Tax Optimization'}
      </h3>

      {/* Inputs */}
      <div className="space-y-[16px] mb-[24px]">
        {Object.entries(values).map(([key, value]) => {
          const labels: Record<string, string> = {
            monthlyContribution: 'Monthly Contribution',
            years: 'Years',
            returnRate: 'Expected Return (%)',
            initialAmount: 'Initial Investment',
            monthlyAddition: 'Monthly Addition',
            monthlySpending: 'Current Monthly Spending',
            inflationRate: 'Inflation Rate (%)',
            income: 'Annual Income',
            deductions: 'Deductions',
            taxRate: 'Tax Rate (%)',
          };

          const ranges: Record<string, { min: number; max: number; step: number }> = {
            monthlyContribution: { min: 0, max: 20000, step: 500 },
            years: { min: 1, max: 40, step: 1 },
            returnRate: { min: 0, max: 15, step: 0.5 },
            initialAmount: { min: 0, max: 1000000, step: 10000 },
            monthlyAddition: { min: 0, max: 10000, step: 500 },
            monthlySpending: { min: 0, max: 50000, step: 500 },
            inflationRate: { min: 0, max: 10, step: 0.5 },
            income: { min: 0, max: 2000000, step: 10000 },
            deductions: { min: 0, max: 500000, step: 5000 },
            taxRate: { min: 0, max: 50, step: 1 },
          };

          const { min, max, step } = ranges[key];
          const isPercentage = key.includes('Rate') || key.includes('taxRate');
          const isCurrency = !isPercentage && !key.includes('years');

          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-[8px]">
                <label className="text-[14px] text-[#555555]">{labels[key]}</label>
                <span className="text-[14px] text-[#1A1A1A] font-medium min-w-[100px] text-right tabular-nums">
                  {isCurrency ? formatCurrency(value) : isPercentage ? `${value}%` : value}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                className="w-full h-[4px] bg-[#E5E5E5] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[16px] [&::-webkit-slider-thumb]:h-[16px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#441316] [&::-moz-range-thumb]:w-[16px] [&::-moz-range-thumb]:h-[16px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#441316] [&::-moz-range-thumb]:border-0"
              />
            </div>
          );
        })}
      </div>

      {/* Results */}
      <div className="bg-[#F9F9F9] rounded-[8px] p-[16px] space-y-[12px]">
        {type === 'retirement' && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#555555]">Total at Retirement</span>
              <span className="text-[18px] text-[#441316] font-medium min-w-[130px] text-right tabular-nums">{formatCurrency(results.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#555555]">Your Contributions</span>
              <span className="text-[14px] text-[#1A1A1A] min-w-[130px] text-right tabular-nums">{formatCurrency(results.contributions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#555555]">Investment Gains</span>
              <span className="text-[14px] text-[#0F6F4E] min-w-[130px] text-right tabular-nums">{formatCurrency(results.gains)}</span>
            </div>
          </>
        )}
        {type === 'investment' && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#555555]">Future Value</span>
              <span className="text-[18px] text-[#441316] font-medium min-w-[130px] text-right tabular-nums">{formatCurrency(results.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-[#555555]">Total Invested</span>
              <span className="text-[14px] text-[#1A1A1A] min-w-[130px] text-right tabular-nums">{formatCurrency(results.contributions)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-[#555555]">Expected Gains</span>
              <span className="text-[14px] text-[#0F6F4E] min-w-[130px] text-right tabular-nums">{formatCurrency(results.gains)}</span>
            </div>
          </>
        )}
        {type === 'spending' && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#555555]">Current Annual</span>
              <span className="text-[14px] text-[#1A1A1A] min-w-[130px] text-right tabular-nums">{formatCurrency(results.currentAnnual)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#555555]">Future Annual (Year {values.years})</span>
              <span className="text-[18px] text-[#441316] font-medium min-w-[130px] text-right tabular-nums">{formatCurrency(results.futureAnnual)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#555555]">Total Spent ({values.years} years)</span>
              <span className="text-[14px] text-[#1A1A1A] min-w-[130px] text-right tabular-nums">{formatCurrency(results.totalSpent)}</span>
            </div>
          </>
        )}
        {type === 'tax' && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#555555]">Taxable Income</span>
              <span className="text-[14px] text-[#1A1A1A] min-w-[130px] text-right tabular-nums">{formatCurrency(results.taxableIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#555555]">Estimated Tax</span>
              <span className="text-[18px] text-[#C1464F] font-medium min-w-[130px] text-right tabular-nums">{formatCurrency(results.estimatedTax)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#555555]">After-Tax Income</span>
              <span className="text-[14px] text-[#0F6F4E] min-w-[130px] text-right tabular-nums">{formatCurrency(results.afterTax)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}