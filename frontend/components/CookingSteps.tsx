"use client";

import React, { useState } from "react";
import { RecipeStep } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CookingStepsProps {
  steps: RecipeStep[];
  showCompletion?: boolean;
  className?: string;
}

export function CookingSteps({
  steps,
  showCompletion = true,
  className,
}: CookingStepsProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [cookingMode, setCookingMode] = useState(false);

  // Sort steps by step_order
  const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);

  const toggleStepCompletion = (stepOrder: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepOrder)) {
      newCompleted.delete(stepOrder);
    } else {
      newCompleted.add(stepOrder);
    }
    setCompletedSteps(newCompleted);
  };

  const setStepActive = (stepOrder: number) => {
    setActiveStep(activeStep === stepOrder ? null : stepOrder);
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getStepTips = (instruction: string): string[] => {
    // Simple tip extraction based on common cooking patterns
    const tips: string[] = [];

    if (instruction.toLowerCase().includes("until golden")) {
      tips.push("💡 Look for a golden-brown color as your visual cue");
    }

    if (instruction.toLowerCase().includes("season to taste")) {
      tips.push("💡 Start with less seasoning and add more gradually");
    }

    if (instruction.toLowerCase().includes("simmer")) {
      tips.push("💡 Simmering means gentle bubbling, not a rolling boil");
    }

    if (instruction.toLowerCase().includes("fold")) {
      tips.push("💡 Folding means gentle mixing to preserve air bubbles");
    }

    if (
      instruction.toLowerCase().includes("rest") ||
      instruction.toLowerCase().includes("let stand")
    ) {
      tips.push(
        "💡 Resting allows flavors to develop and temperatures to equalize"
      );
    }

    return tips;
  };

  const toggleCookingMode = () => {
    setCookingMode(!cookingMode);
    if (!cookingMode) {
      // Reset completion when entering cooking mode
      setCompletedSteps(new Set());
      setActiveStep(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const nextIncompleteStep = sortedSteps.find(
    (step) => !completedSteps.has(step.step_order)
  );

  return (
    <div className={cn("bg-white", className)}>
      {/* Header Controls - Mobile optimized */}
      <div className="flex flex-col gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {showCompletion && (
            <Button
              variant={cookingMode ? "primary" : "secondary"}
              onClick={toggleCookingMode}
              className={cn(
                "flex items-center justify-center gap-2 touch-manipulation",
                "min-h-[48px] text-base font-medium",
                "active:scale-95 transition-transform"
              )}
            >
              <span className="text-sm font-bold text-orange-500">
                {cookingMode ? "EXIT COOKING" : "START COOKING"}
              </span>
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={handlePrint}
            className={cn(
              "flex items-center justify-center gap-2 print:hidden touch-manipulation",
              "min-h-[48px] text-base",
              "active:scale-95 transition-transform"
            )}
          >
            <span className="text-sm font-bold text-blue-500">
              <span className="hidden sm:inline">PRINT RECIPE</span>
              <span className="sm:hidden">PRINT</span>
            </span>
          </Button>
        </div>

        {cookingMode && (
          <div className="text-sm sm:text-base text-gray-600 text-center sm:text-left">
            Progress: {completedSteps.size} of {sortedSteps.length} steps
            completed
          </div>
        )}
      </div>

      {/* Cooking Mode Progress Bar */}
      {cookingMode && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(completedSteps.size / sortedSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Next Step Highlight (Cooking Mode) - Mobile optimized */}
      {cookingMode && nextIncompleteStep && (
        <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-orange-50 border-2 border-orange-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-600 font-bold text-base sm:text-lg">
              Next Step:
            </span>
            <span className="text-sm sm:text-base text-orange-600 font-medium">
              Step {nextIncompleteStep.step_order}
            </span>
          </div>
          <p className="text-gray-900 font-medium text-base sm:text-lg leading-relaxed">
            {nextIncompleteStep.instruction}
          </p>
          {nextIncompleteStep.time_in_minutes && (
            <div className="mt-3 flex items-center gap-1">
              <span className="text-orange-500 font-bold text-sm">TIME</span>
              <span className="text-orange-600 font-medium text-sm sm:text-base">
                {formatTime(nextIncompleteStep.time_in_minutes)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-4">
        {sortedSteps.map((step, index) => {
          const isCompleted = completedSteps.has(step.step_order);
          const isActive = activeStep === step.step_order;
          const tips = getStepTips(step.instruction);
          const isNextStep =
            cookingMode && nextIncompleteStep?.step_order === step.step_order;

          return (
            <div
              key={step.step_order}
              className={cn(
                "border rounded-lg transition-all duration-200",
                isCompleted && cookingMode
                  ? "bg-green-50 border-green-200"
                  : isNextStep
                  ? "bg-orange-50 border-orange-200 shadow-md"
                  : isActive
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-gray-200 hover:border-gray-300"
              )}
            >
              <div
                className={cn(
                  "p-4 cursor-pointer",
                  cookingMode && "print:cursor-default"
                )}
                onClick={() => !cookingMode && setStepActive(step.step_order)}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number / Checkbox - Mobile optimized */}
                  {showCompletion && cookingMode ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStepCompletion(step.step_order);
                      }}
                      className={cn(
                        "w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold text-base sm:text-sm transition-all print:hidden touch-manipulation",
                        "min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]", // Better touch targets
                        "active:scale-90 transition-transform",
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white shadow-sm"
                          : isNextStep
                          ? "border-orange-500 text-orange-500 hover:bg-orange-50 shadow-sm"
                          : "border-gray-300 text-gray-600 hover:border-gray-400"
                      )}
                    >
                      {isCompleted ? "✓" : step.step_order}
                    </button>
                  ) : (
                    <div
                      className={cn(
                        "w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-base sm:text-sm shrink-0",
                        isActive
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      {step.step_order}
                    </div>
                  )}

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <p
                        className={cn(
                          "text-gray-900 leading-relaxed flex-1",
                          isCompleted &&
                            cookingMode &&
                            "line-through text-gray-500",
                          cookingMode
                            ? "text-lg sm:text-xl"
                            : "text-base sm:text-lg", // Larger text for mobile cooking
                          "wrap-break-word"
                        )}
                      >
                        {step.instruction}
                      </p>

                      {/* Time Badge - Mobile optimized */}
                      {step.time_in_minutes && (
                        <div
                          className={cn(
                            "flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap self-start",
                            "min-h-[32px]", // Better touch target
                            isNextStep
                              ? "bg-orange-100 text-orange-700 shadow-sm"
                              : "bg-gray-100 text-gray-600"
                          )}
                        >
                          <span className="text-orange-500 font-bold text-xs">
                            TIME
                          </span>
                          {formatTime(step.time_in_minutes)}
                        </div>
                      )}
                    </div>

                    {/* Tips */}
                    {tips.length > 0 && (isActive || cookingMode) && (
                      <div className="mt-3 space-y-1">
                        {tips.map((tip, tipIndex) => (
                          <div
                            key={tipIndex}
                            className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded"
                          >
                            {tip}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {cookingMode &&
        completedSteps.size === sortedSteps.length &&
        sortedSteps.length > 0 && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <div className="text-green-600 font-bold text-2xl mb-2">
              COMPLETE!
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-1">
              Congratulations!
            </h3>
            <p className="text-green-700">
              You've completed all the cooking steps. Enjoy your meal!
            </p>
          </div>
        )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }

          .print\\:cursor-default {
            cursor: default !important;
          }

          body {
            font-size: 12pt;
            line-height: 1.4;
          }

          h1,
          h2,
          h3 {
            page-break-after: avoid;
          }

          .step-item {
            page-break-inside: avoid;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
