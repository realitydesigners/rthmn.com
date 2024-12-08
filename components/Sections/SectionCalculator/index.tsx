'use client';
import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  FaCalculator,
  FaChartLine,
  FaPercentage,
  FaDollarSign,
  FaExchangeAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { TradeDirection, Direction, TradeStats } from './components';
import {
  CurrencySelector,
  type Currency,
  getCurrencySymbol
} from './components/CurrencySelector';
import { RiskRewardGrid } from './components/RiskRewardGrid';

interface CalculatorInputs {
  accountSize: number;
  riskPercentage: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  direction: Direction;
  currency: Currency;
}

const initialState: CalculatorInputs = {
  accountSize: 10000,
  riskPercentage: 1,
  entryPrice: 0,
  stopLoss: 0,
  takeProfit: 0,
  direction: 'long',
  currency: 'USD'
};

// Add validation types
interface ValidationError {
  field: keyof CalculatorInputs;
  message: string;
}

// Add input validation
const validateInputs = (inputs: CalculatorInputs): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (isNaN(inputs.accountSize) || inputs.accountSize <= 0) {
    errors.push({
      field: 'accountSize',
      message: 'Account size must be greater than 0'
    });
  }

  if (
    isNaN(inputs.riskPercentage) ||
    inputs.riskPercentage <= 0 ||
    inputs.riskPercentage > 100
  ) {
    errors.push({
      field: 'riskPercentage',
      message: 'Risk percentage must be between 0 and 100'
    });
  }

  if (isNaN(inputs.entryPrice) || inputs.entryPrice <= 0) {
    errors.push({
      field: 'entryPrice',
      message: 'Entry price must be greater than 0'
    });
  }

  if (isNaN(inputs.stopLoss) || inputs.stopLoss <= 0) {
    errors.push({
      field: 'stopLoss',
      message: 'Stop loss must be greater than 0'
    });
  }

  if (isNaN(inputs.takeProfit) || inputs.takeProfit <= 0) {
    errors.push({
      field: 'takeProfit',
      message: 'Take profit must be greater than 0'
    });
  }

  return errors;
};

// Enhanced Input Field Component
const InputField = memo(
  ({
    label,
    value,
    onChange,
    icon,
    tooltip,
    error,
    placeholder
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    icon: React.ReactNode;
    tooltip?: string;
    error?: string;
    placeholder?: string;
  }) => (
    <div className="relative">
      <label className="font-kodemono mb-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {label}
          {tooltip && (
            <div className="group relative">
              <FaInfoCircle className="h-4 w-4 cursor-help text-gray-400" />
              <div className="absolute bottom-full left-1/2 mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-black/90 p-2 text-xs text-white shadow-lg group-hover:block">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs text-red-400 transition-all duration-300">
            {error}
          </span>
        )}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          {icon}
        </div>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white/5 py-4 pr-4 pl-12 text-white placeholder-white/40 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-300 focus:outline-none ${
            error
              ? 'border-red-400/50 focus:border-red-400/50 focus:bg-red-400/5 focus:ring-2 focus:ring-red-400/20'
              : 'border-white/10 focus:border-emerald-400/50 focus:bg-emerald-400/5 focus:ring-2 focus:ring-emerald-400/20'
          }`}
        />
      </div>
    </div>
  )
);

InputField.displayName = 'InputField';

// Enhanced Results Card
const ResultCard = memo(
  ({
    label,
    value,
    subValue,
    icon,
    positive,
    isInvalid
  }: {
    label: string;
    value: string;
    subValue?: string | React.ReactNode;
    icon: React.ReactNode;
    positive?: boolean;
    isInvalid?: boolean;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm transition-all duration-300"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isInvalid
                ? 'bg-red-400/10 text-red-400'
                : positive
                  ? 'bg-emerald-400/10 text-emerald-400'
                  : 'bg-white/5 text-gray-400'
            }`}
          >
            {icon}
          </div>
          <div className="font-kodemono text-sm text-gray-400">{label}</div>
        </div>
        <div className="font-outfit text-2xl font-bold text-white">
          {isInvalid ? '—' : value}
        </div>
        {subValue && !isInvalid && (
          <div className="font-kodemono mt-1 text-sm text-gray-400">
            {subValue}
          </div>
        )}
      </div>
    </motion.div>
  )
);

ResultCard.displayName = 'ResultCard';

// Add new interfaces for risk templates
interface RiskTemplate {
  label: string;
  value: number;
  description: string;
}

const RISK_TEMPLATES: RiskTemplate[] = [
  {
    label: 'Conservative',
    value: 0.5,
    description: 'Low risk, low reward'
  },
  {
    label: 'Balanced',
    value: 1.0,
    description: 'Moderate risk, moderate reward'
  },
  {
    label: 'Aggressive',
    value: 2.0,
    description: 'High risk, high reward'
  }
];

// Add TakeProfit suggestion component
const TakeProfitSuggestion = memo(
  ({
    entryPrice,
    stopLoss,
    onSelect
  }: {
    entryPrice: number;
    stopLoss: number;
    onSelect: (value: number) => void;
  }) => {
    if (!entryPrice || !stopLoss) return null;

    const riskDistance = Math.abs(entryPrice - stopLoss);
    const suggestions = [1.5, 2, 3].map((multiplier) => ({
      ratio: multiplier,
      price: entryPrice + riskDistance * multiplier
    }));

    return (
      <div className="mt-2 flex gap-2">
        {suggestions.map(({ ratio, price }) => (
          <button
            key={ratio}
            onClick={() => onSelect(price)}
            className="group flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-xs text-gray-400 transition-all duration-300 hover:border-emerald-400/50 hover:bg-emerald-400/5"
          >
            <span>{ratio}:1</span>
            <span className="text-emerald-400">${price.toFixed(2)}</span>
          </button>
        ))}
      </div>
    );
  }
);

export const SectionCalculator = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(initialState);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Memoize validation to prevent unnecessary recalculations
  const validationErrors = useMemo(() => validateInputs(inputs), [inputs]);

  // Memoize results calculation
  const results = useMemo(() => {
    if (validationErrors.length > 0) {
      return {
        riskAmount: NaN,
        positionSize: NaN,
        potentialProfit: NaN,
        riskRewardRatio: NaN
      };
    }

    const riskAmount = (inputs.accountSize * inputs.riskPercentage) / 100;
    const pips = Math.abs(inputs.entryPrice - inputs.stopLoss);
    const positionSize = riskAmount / pips;
    const potentialProfit =
      positionSize * Math.abs(inputs.takeProfit - inputs.entryPrice);
    const riskRewardRatio = potentialProfit / riskAmount;

    return {
      riskAmount,
      positionSize,
      potentialProfit,
      riskRewardRatio
    };
  }, [inputs]);

  // Update errors when validation changes
  useEffect(() => {
    setErrors(validationErrors);
  }, [validationErrors]);

  // Memoize error getter
  const getError = useCallback(
    (field: keyof CalculatorInputs) =>
      errors.find((error) => error.field === field)?.message,
    [errors]
  );

  // Memoize value formatter
  const formatValue = useCallback(
    (value: number) => {
      if (isNaN(value) || !isFinite(value))
        return `${getCurrencySymbol(inputs.currency)}0.00`;
      return `${getCurrencySymbol(inputs.currency)}${value.toLocaleString(
        'en-US',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      )}`;
    },
    [inputs.currency]
  );

  // Memoize input handler
  const handleInputChange = useCallback(
    (field: keyof CalculatorInputs, value: number) => {
      setInputs((prev) => ({
        ...prev,
        [field]: value
      }));
    },
    []
  );

  // Add handlers for suggestions
  const handleRiskTemplateSelect = (value: number) => {
    handleInputChange('riskPercentage', value);
  };

  const handleTakeProfitSelect = (value: number) => {
    handleInputChange('takeProfit', value);
  };

  const handleDirectionChange = useCallback((direction: Direction) => {
    setInputs((prev) => ({ ...prev, direction }));
  }, []);

  const handleCurrencyChange = useCallback((currency: Currency) => {
    setInputs((prev) => ({ ...prev, currency }));
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
        <div className="absolute -top-1/2 left-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute right-0 -bottom-1/2 h-96 w-96 translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-gray-gradient font-outfit mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Position Size Calculator
          </h2>
          <p className="font-kodemono mx-auto max-w-2xl text-base text-gray-400 sm:text-lg">
            Calculate your optimal position size and risk management parameters
            with precision.
          </p>
        </motion.div>

        {/* Three Column Layout */}
        <div className="mx-auto flex gap-8">
          {/* Quick Risk Templates - Left Sidebar */}
          <div className="hidden w-1/4 shrink-0 lg:block">
            <div className="sticky top-8 rounded-xl border border-white/10 bg-black/40 p-6">
              <h3 className="font-outfit mb-6 text-lg font-semibold text-white">
                Quick Risk Templates
              </h3>
              <div className="space-y-4">
                {RISK_TEMPLATES.map((template) => (
                  <button
                    key={template.value}
                    onClick={() => handleRiskTemplateSelect(template.value)}
                    className={`group relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                      inputs.riskPercentage === template.value
                        ? 'border-emerald-400/50 bg-emerald-400/5'
                        : 'border-white/10 bg-black/40 hover:border-white/20 hover:bg-black/60'
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                    <div className="relative z-10">
                      <div className="font-outfit mb-1 text-lg font-semibold text-white">
                        {template.label}
                      </div>
                      <div className="font-kodemono mb-2 text-2xl text-emerald-400">
                        {template.value}%
                      </div>
                      <p className="font-kodemono text-sm text-gray-400">
                        {template.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Calculator Content - Center */}
          <div className="w-full lg:w-1/2">
            {/* Account & Risk Section */}
            <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6">
              <h3 className="font-outfit mb-6 text-lg font-semibold text-white">
                Account Details
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                <InputField
                  label="Account Size"
                  value={inputs.accountSize}
                  onChange={(value) => handleInputChange('accountSize', value)}
                  icon={<FaDollarSign className="h-5 w-5 text-gray-400" />}
                  tooltip="Your total account balance"
                  error={getError('accountSize')}
                  placeholder="Enter account size"
                />
                <CurrencySelector
                  currency={inputs.currency}
                  onCurrencyChange={handleCurrencyChange}
                />
                <InputField
                  label="Risk Percentage"
                  value={inputs.riskPercentage}
                  onChange={(value) =>
                    handleInputChange('riskPercentage', value)
                  }
                  icon={<FaPercentage className="h-5 w-5 text-gray-400" />}
                  tooltip="Percentage of account to risk"
                  error={getError('riskPercentage')}
                  placeholder="Enter risk %"
                />
              </div>
            </div>

            {/* Trade Direction Section */}
            <div className="mb-8 rounded-xl border border-white/10 bg-black/40 p-6">
              <h3 className="font-outfit mb-6 text-lg font-semibold text-white">
                Trade Direction
              </h3>
              <TradeDirection
                direction={inputs.direction}
                onDirectionChange={handleDirectionChange}
              />
            </div>

            {/* Price Levels Section */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-outfit text-lg font-semibold text-white">
                  Price Levels
                </h3>
                <div className="flex gap-2">
                  {inputs.entryPrice > 0 && inputs.stopLoss > 0 && (
                    <TakeProfitSuggestion
                      entryPrice={inputs.entryPrice}
                      stopLoss={inputs.stopLoss}
                      onSelect={handleTakeProfitSelect}
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-6">
                <InputField
                  label="Entry Price"
                  value={inputs.entryPrice}
                  onChange={(value) => handleInputChange('entryPrice', value)}
                  icon={<FaExchangeAlt className="h-5 w-5 text-gray-400" />}
                  error={getError('entryPrice')}
                  placeholder="Enter entry price"
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <InputField
                    label="Stop Loss"
                    value={inputs.stopLoss}
                    onChange={(value) => handleInputChange('stopLoss', value)}
                    icon={<FaChartLine className="h-5 w-5 text-red-400" />}
                    error={getError('stopLoss')}
                    placeholder="Enter stop loss"
                  />

                  <InputField
                    label="Take Profit"
                    value={inputs.takeProfit}
                    onChange={(value) => handleInputChange('takeProfit', value)}
                    icon={<FaChartLine className="h-5 w-5 text-emerald-400" />}
                    error={getError('takeProfit')}
                    placeholder="Enter take profit"
                  />
                </div>

                {/* Visual Price Levels */}
                {/* {inputs.entryPrice > 0 &&
                  inputs.stopLoss > 0 &&
                  inputs.takeProfit > 0 && (
                    <div className="mt-4 flex justify-center">
                      <PriceLevels
                        direction={inputs.direction}
                        entryPrice={inputs.entryPrice}
                        stopLoss={inputs.stopLoss}
                        takeProfit={inputs.takeProfit}
                      />
                    </div>
                  )} */}
              </div>
            </div>

            {/* Trade Statistics - Mobile Only */}
            <div className="mt-8 block lg:hidden">
              <TradeStats
                entryPrice={inputs.entryPrice}
                stopLoss={inputs.stopLoss}
                takeProfit={inputs.takeProfit}
                positionSize={results.positionSize}
                riskAmount={results.riskAmount}
                potentialProfit={results.potentialProfit}
              />
            </div>
          </div>

          {/* Results Cards - Right Sidebar */}
          <div className="hidden w-1/4 space-y-4 lg:block">
            <div className="sticky top-8 space-y-4">
              <ResultCard
                label="Risk Amount"
                value={`-${formatValue(results.riskAmount)}`}
                subValue="Maximum Loss"
                icon={<FaDollarSign className="h-5 w-5" />}
                isInvalid={isNaN(results.riskAmount)}
              />
              <ResultCard
                label="Potential Profit"
                value={`+${formatValue(results.potentialProfit)}`}
                subValue="Maximum Gain"
                icon={<FaChartLine className="h-5 w-5" />}
                positive
                isInvalid={isNaN(results.potentialProfit)}
              />
              <ResultCard
                label="Risk/Reward Visualization"
                value={`${formatValue(results.riskAmount)} → ${formatValue(results.potentialProfit)}`}
                subValue={
                  <RiskRewardGrid
                    riskAmount={results.riskAmount}
                    potentialProfit={results.potentialProfit}
                    ratio={results.riskRewardRatio}
                  />
                }
                icon={<FaCalculator className="h-5 w-5" />}
                positive={results.riskRewardRatio >= 2}
                isInvalid={
                  isNaN(results.riskRewardRatio) ||
                  !isFinite(results.riskRewardRatio)
                }
              />
              <ResultCard
                label="Trade Summary"
                value={`${formatValue(results.riskAmount)} → ${formatValue(
                  results.potentialProfit
                )}`}
                subValue={`Risk ${inputs.riskPercentage}% for ${(
                  (results.potentialProfit / results.riskAmount - 1) *
                  100
                ).toFixed(1)}% return`}
                icon={<FaChartLine className="h-5 w-5" />}
                positive={results.potentialProfit > results.riskAmount}
                isInvalid={
                  isNaN(results.potentialProfit) || isNaN(results.riskAmount)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
