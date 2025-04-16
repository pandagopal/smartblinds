import React from 'react';

interface ConfiguratorStepperProps {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

const ConfiguratorStepper: React.FC<ConfiguratorStepperProps> = ({
  steps,
  currentStep,
  onStepClick
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step circle with number */}
            <div
              className={`relative flex items-center justify-center ${
                index < currentStep
                  ? 'cursor-pointer' // completed step (clickable)
                  : index === currentStep
                  ? '' // current step
                  : 'cursor-not-allowed' // future step (not clickable yet)
              }`}
              onClick={() => index < currentStep && onStepClick(index)}
            >
              <div
                className={`
                  z-10 flex h-8 w-8 items-center justify-center rounded-full
                  ${
                    index < currentStep
                      ? 'bg-green-500 text-white' // completed step
                      : index === currentStep
                      ? 'bg-primary-red text-white' // current step
                      : 'bg-gray-200 text-gray-500' // future step
                  }
                `}
              >
                {index + 1}
              </div>
              <span
                className={`
                  absolute top-10 whitespace-nowrap text-xs font-medium
                  ${
                    index < currentStep
                      ? 'text-green-500' // completed step
                      : index === currentStep
                      ? 'text-primary-red' // current step
                      : 'text-gray-500' // future step
                  }
                `}
              >
                {step}
              </span>
            </div>

            {/* Connecting line between steps (except after the last step) */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStep
                    ? 'bg-green-500' // completed line
                    : 'bg-gray-200' // incomplete line
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ConfiguratorStepper;
