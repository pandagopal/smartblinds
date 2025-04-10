import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveMeasurement, { MeasurementValues } from './InteractiveMeasurement';

// Define the measurement guide steps
const measurementSteps = [
  {
    id: 'intro',
    title: 'Measurement Guide',
    content: 'Accurate measurements are crucial for your blinds to fit perfectly. Follow these simple steps to ensure you get the right measurements for your windows.',
    imageSrc: 'https://ext.same-assets.com/2035588304/732564792.jpeg',
    imageAlt: 'Measuring window for blinds'
  },
  {
    id: 'tools',
    title: 'Gather Your Tools',
    content: "Before you start, make sure you have a steel measuring tape (not cloth or paper), a pencil, and our measurement worksheet. For the most accurate measurements, use a steel tape measure that's at least 6 feet long.",
    imageSrc: 'https://ext.same-assets.com/2035588304/8234652991.jpeg',
    imageAlt: 'Measuring tools for window blinds',
    tips: [
      'Always use a steel tape measure for accuracy',
      'Measure to the nearest 1/8 inch',
      'Write down your measurements right away'
    ]
  },
  {
    id: 'inside-vs-outside',
    title: 'Choose Mount Type',
    content: 'Decide whether you want inside mount (within the window frame) or outside mount (on the wall or trim surrounding the window). Each has different advantages and measurement requirements.',
    imageSrc: 'https://ext.same-assets.com/2035588304/5234597102.jpeg',
    imageAlt: 'Inside vs outside mount illustration',
    compareItems: [
      {
        title: 'Inside Mount',
        pros: ['Clean, built-in look', 'Showcases window trim', 'Takes up less space'],
        cons: ['Requires minimum depth', 'Shows light gaps on sides', 'May expose more of the window frame']
      },
      {
        title: 'Outside Mount',
        pros: ['Adds height/width appearance', 'Better light blockage', 'Hides imperfect windows'],
        cons: ['Covers window trim', 'Requires space around window', 'More visible from exterior']
      }
    ]
  },
  {
    id: 'inside-mount',
    title: 'Inside Mount Measurements',
    content: 'For inside mount, measure the exact window opening in three places for both width and height. Use the smallest measurement.',
    imageSrc: 'https://ext.same-assets.com/2035588304/1234567892.jpeg',
    imageAlt: 'Inside mount measurement diagram',
    steps: [
      {
        title: 'Width',
        instructions: 'Measure the exact width of the window opening at the top, middle, and bottom. Use the narrowest measurement.',
        warning: 'Do NOT make any deductions. Our factory will make necessary adjustments for proper fit.'
      },
      {
        title: 'Height',
        instructions: 'Measure the exact height of the window opening at the left, middle, and right. Use the shortest measurement.',
        warning: 'Measure from the top of the opening to the window sill.'
      },
      {
        title: 'Depth',
        instructions: 'Measure the depth of your window frame from the front to the glass or any obstructions.',
        tip: 'Minimum depth required varies by product. Check product specifications before ordering.'
      }
    ]
  },
  {
    id: 'outside-mount',
    title: 'Outside Mount Measurements',
    content: 'For outside mount, measure where you want the blinds to be positioned. Consider overlap on all sides for maximum light blockage.',
    imageSrc: 'https://ext.same-assets.com/2035588304/6543219871.jpeg',
    imageAlt: 'Outside mount measurement diagram',
    steps: [
      {
        title: 'Width',
        instructions: 'Measure the width where you want the blinds to be positioned. Add 3-4 inches to the window opening width (1.5-2 inches per side) for optimal light control.',
        tip: 'For maximum light blockage, extend 2-3 inches beyond the window opening on each side.'
      },
      {
        title: 'Height',
        instructions: 'Measure the height where you want the blinds to be positioned. For optimal light control, add 3-4 inches to the window opening height.',
        tip: 'If you have a protruding window sill, measure from where you want to mount the blinds down to the sill.'
      }
    ]
  },
  {
    id: 'interactive-measurement',
    title: 'Interactive Measurement Tool',
    content: 'Use this interactive tool to visualize how to measure your window. You can drag the measurement lines to adjust dimensions and see how they affect your blinds.'
  },
  {
    id: 'special-cases',
    title: 'Special Window Types',
    content: 'Different window styles require specific measurement approaches. Select your window type for detailed instructions.',
    specialWindows: [
      {
        type: 'Bay Windows',
        instructions: 'Measure each section separately as inside mounts. Consider using mounting brackets designed specifically for bay windows.',
        depthNote: 'Check for depth variations in each section.'
      },
      {
        type: 'Arched Windows',
        instructions: 'Measure width at the widest point and height from the bottom to the highest point of the arch. Usually requires outside mount.',
        specialNote: 'Consider specialty shaped blinds for the arched portion.'
      },
      {
        type: 'French Doors',
        instructions: 'Measure the glass area, then add 2 inches to both width and height for outside mount. Check handle/doorknob clearance.',
        mountNote: 'Hold-down brackets are recommended to prevent swinging.'
      },
      {
        type: 'Skylights',
        instructions: 'Measure the exact opening inside the frame. Special tension systems may be required to hold blinds in place.',
        specialNote: 'Consider motorized options for hard-to-reach skylights.'
      }
    ]
  },
  {
    id: 'common-mistakes',
    title: 'Common Measurement Mistakes',
    content: 'Avoid these frequent measurement errors to ensure your blinds fit perfectly.',
    mistakesList: [
      {
        mistake: 'Not measuring each window',
        explanation: 'Even if windows appear identical, small variations are common. Always measure each window individually.'
      },
      {
        mistake: 'Measuring old blinds',
        explanation: 'Your old blinds may have been custom-cut or might not have been measured correctly. Always measure the window directly.'
      },
      {
        mistake: 'Confusing width and height',
        explanation: 'Always list width first, then height. Mixing them up is a common and costly mistake.'
      },
      {
        mistake: 'Not checking for obstructions',
        explanation: 'Check for handles, locks, alarm sensors, or anything that might interfere with your blind operation.'
      },
      {
        mistake: 'Rounding measurements',
        explanation: 'Always measure to the nearest 1/8 inch. Don\'t round up or down to the nearest inch or half-inch.'
      }
    ]
  },
  {
    id: 'final-checklist',
    title: 'Final Measurement Checklist',
    content: 'Before placing your order, verify these important details:',
    checklistItems: [
      'You\'ve selected either inside or outside mount for each window',
      'You\'ve measured width and height in at least 3 places for each dimension',
      'You\'ve noted the smallest measurement for inside mounts',
      'You\'ve checked window depth for inside mounts',
      'You\'ve accounted for any obstructions',
      'You\'ve double-checked all your measurements',
      'Your measurements are in the correct order (width × height)',
      'You\'ve measured to the nearest 1/8 inch'
    ]
  }
];

interface MeasurementGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const MeasurementGuide: React.FC<MeasurementGuideProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next');
  const [mountType, setMountType] = useState<'inside' | 'outside'>('inside');
  const [currentMeasurements, setCurrentMeasurements] = useState<MeasurementValues | null>(null);

  const handleNext = () => {
    if (currentStep < measurementSteps.length - 1) {
      setAnimationDirection('next');
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setAnimationDirection('prev');
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    setAnimationDirection(index > currentStep ? 'next' : 'prev');
    setCurrentStep(index);
  };

  // If closed, don't render anything
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 overflow-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-medium">SmartBlindsHub Measurement Guide</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {measurementSteps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                <button
                  onClick={() => goToStep(index)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    index === currentStep
                      ? 'bg-primary-red text-white'
                      : index < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>
                <div
                  className={`hidden sm:block text-xs mt-1 ${
                    index === currentStep ? 'text-primary-red font-medium' : 'text-gray-500'
                  }`}
                >
                  {step.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </div>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 mt-3 relative">
            <div
              className="absolute top-0 left-0 h-full bg-primary-red transition-all duration-300"
              style={{ width: `${(currentStep / (measurementSteps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{
                x: animationDirection === 'next' ? 100 : -100,
                opacity: 0
              }}
              animate={{ x: 0, opacity: 1 }}
              exit={{
                x: animationDirection === 'next' ? -100 : 100,
                opacity: 0
              }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{measurementSteps[currentStep].title}</h3>
                <p className="text-gray-600">{measurementSteps[currentStep].content}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column - Image */}
                <div className="flex flex-col">
                  {measurementSteps[currentStep].imageSrc && (
                    <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={measurementSteps[currentStep].imageSrc}
                        alt={measurementSteps[currentStep].imageAlt || 'Measurement guide illustration'}
                        className="w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Tips */}
                  {measurementSteps[currentStep].tips && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                      <h4 className="font-medium text-blue-700 mb-2">Pro Tips</h4>
                      <ul className="list-disc pl-5 space-y-1 text-blue-700">
                        {measurementSteps[currentStep].tips.map((tip, index) => (
                          <li key={index} className="text-sm">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right column - Details */}
                <div>
                  {/* Interactive Measurement Tool */}
                  {currentStep === 4 && ( // Assuming the interactive step is at index 4
                    <div className="interactive-step">
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-3">Choose Mount Type:</h3>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => setMountType('inside')}
                            className={`px-4 py-2 rounded-lg ${
                              mountType === 'inside'
                                ? 'bg-primary-red text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                          >
                            Inside Mount
                          </button>
                          <button
                            onClick={() => setMountType('outside')}
                            className={`px-4 py-2 rounded-lg ${
                              mountType === 'outside'
                                ? 'bg-primary-red text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                          >
                            Outside Mount
                          </button>
                        </div>
                      </div>

                      <InteractiveMeasurement
                        mountType={mountType}
                        onMeasurementsChange={setCurrentMeasurements}
                      />

                      {currentMeasurements && (
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-bold text-green-700 mb-2">Your Measurements</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-gray-700"><span className="font-medium">Mount Type:</span> {currentMeasurements.mountType === 'inside' ? 'Inside Mount' : 'Outside Mount'}</p>
                              <p className="text-gray-700"><span className="font-medium">Width:</span> {currentMeasurements.width} inches</p>
                              <p className="text-gray-700"><span className="font-medium">Height:</span> {currentMeasurements.height} inches</p>
                              {currentMeasurements.depth && (
                                <p className="text-gray-700"><span className="font-medium">Depth:</span> {currentMeasurements.depth} inches</p>
                              )}
                            </div>
                            <div>
                              <p className="text-green-700 font-medium">Remember:</p>
                              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                                <li>Always double-check your measurements</li>
                                <li>Measure each window individually</li>
                                <li>For inside mount, use the smallest measurements</li>
                                <li>Order as width × height (always width first)</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comparison */}
                  {measurementSteps[currentStep].compareItems && (
                    <div className="space-y-4">
                      {measurementSteps[currentStep].compareItems.map((item, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>

                          <div className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium text-green-600 mb-1">Advantages:</h5>
                              <ul className="list-disc pl-5 space-y-1">
                                {item.pros.map((pro, idx) => (
                                  <li key={idx} className="text-sm text-gray-600">{pro}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-red-600 mb-1">Considerations:</h5>
                              <ul className="list-disc pl-5 space-y-1">
                                {item.cons.map((con, idx) => (
                                  <li key={idx} className="text-sm text-gray-600">{con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step by step instructions */}
                  {measurementSteps[currentStep].steps && (
                    <div className="space-y-4">
                      {measurementSteps[currentStep].steps.map((step, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-bold text-gray-800 mb-2">
                            <span className="inline-block w-6 h-6 bg-primary-red text-white rounded-full text-center text-sm mr-2">
                              {index + 1}
                            </span>
                            {step.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">{step.instructions}</p>

                          {step.warning && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3">
                              <p className="text-red-700 text-sm font-medium">{step.warning}</p>
                            </div>
                          )}

                          {step.tip && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                              <p className="text-blue-700 text-sm">{step.tip}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special window types */}
                  {measurementSteps[currentStep].specialWindows && (
                    <div className="space-y-4">
                      {measurementSteps[currentStep].specialWindows.map((window, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-bold text-gray-800 mb-2">{window.type}</h4>
                          <p className="text-gray-600 text-sm mb-3">{window.instructions}</p>

                          {window.depthNote && (
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mb-3">
                              <p className="text-amber-700 text-sm">{window.depthNote}</p>
                            </div>
                          )}

                          {window.mountNote && (
                            <div className="bg-purple-50 border-l-4 border-purple-500 p-3 mb-3">
                              <p className="text-purple-700 text-sm">{window.mountNote}</p>
                            </div>
                          )}

                          {window.specialNote && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                              <p className="text-blue-700 text-sm">{window.specialNote}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Common mistakes */}
                  {measurementSteps[currentStep].mistakesList && (
                    <div className="space-y-4">
                      {measurementSteps[currentStep].mistakesList.map((item, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="font-bold text-red-700 mb-1">{item.mistake}</h4>
                          <p className="text-gray-600 text-sm">{item.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Checklist */}
                  {measurementSteps[currentStep].checklistItems && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-green-700 mb-3">Measurement Checklist</h4>
                      <div className="space-y-2">
                        {measurementSteps[currentStep].checklistItems.map((item, index) => (
                          <div key={index} className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="ml-2 text-gray-600 text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with navigation */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded flex items-center ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {measurementSteps.length}
          </div>

          <button
            onClick={currentStep === measurementSteps.length - 1 ? onClose : handleNext}
            className={`px-4 py-2 rounded flex items-center ${
              currentStep === measurementSteps.length - 1
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-primary-red text-white hover:bg-secondary-red'
            }`}
          >
            {currentStep === measurementSteps.length - 1 ? (
              <>Finish</>
            ) : (
              <>
                Next
                <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MeasurementGuide;
