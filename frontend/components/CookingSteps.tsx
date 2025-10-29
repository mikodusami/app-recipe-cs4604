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
    <div className={cn("", className)}>
      {/* Header Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {showCompletion && (
            <Button
              variant={cookingMode ? "primary" : "secondary"}
              onClick={toggleCookingMode}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-xs font-bold">
                {cookingMode ? "🍳" : "▶️"}
              </span>
              {cookingMode ? "Exit Cooking Mode" : "Start Cooking"}
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 print:hidden"
          >
            <span className="text-xs">🖨️</span>
            Print Recipe
          </Button>
        </div>

        {cookingMode && (
          <div className="text-sm text-[#6B7280] text-center sm:text-left">
            Progress: {completedSteps.size} of {sortedSteps.length} steps
            completed
          </div>
        )}
      </div>

      {/* Cooking Mode Progress Bar */}
      {cookingMode && (
        <div className="mb-8">
          <div className="w-full bg-[#F5F5F5] rounded-full h-2">
            <div
              className="bg-[#8B4513] h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(completedSteps.size / sortedSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Next Step Highlight (Cooking Mode) */}
      {cookingMode && nextIncompleteStep && (
        <div className="mb-8 p-6 bg-[#8B4513] text-white rounded shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-semibold text-lg">Next Step:</span>
            <span className="text-sm font-medium bg-white text-[#8B4513] px-2 py-1 rounded">
              Step {nextIncompleteStep.step_order}
            </span>
          </div>
          <p className="text-white font-medium text-lg leading-relaxed">
            {nextIncompleteStep.instruction}
          </p>
          {nextIncompleteStep.time_in_minutes && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide">TIME</span>
              <span className="font-medium">
                {formatTime(nextIncompleteStep.time_in_minutes)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-6">
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
                "border border-[#F5F5F5] rounded transition-all duration-200",
                isCompleted && cookingMode
                  ? "bg-[#8B4513] text-white border-[#8B4513]"
                  : isNextStep
                  ? "bg-[#F5F5F5] border-[#8B4513] shadow-sm"
                  : isActive
                  ? "bg-[#F5F5F5] border-[#E5E5E5]"
                  : "bg-white hover:border-[#E5E5E5]"
              )}
            >
              <div
                className={cn(
                  "p-6 cursor-pointer",
                  cookingMode && "print:cursor-default"
                )}
                onClick={() => !cookingMode && setStepActive(step.step_order)}
              >
                <div className="flex items-start gap-6">
                  {/* Step Number / Checkbox */}
                  {showCompletion && cookingMode ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStepCompletion(step.step_order);
                      }}
                      className={cn(
                        "w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all print:hidden",
                        "min-h-[48px] min-w-[48px] touch-manipulation",
                        isCompleted
                          ? "bg-white border-white text-[#8B4513]"
                          : isNextStep
                          ? "border-[#8B4513] text-[#8B4513] hover:bg-[#F5F5F5]"
                          : "border-[#E5E5E5] text-[#6B7280] hover:border-[#8B4513]"
                      )}
                    >
                      {isCompleted ? "✓" : step.step_order}
                    </button>
                  ) : (
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
                        isActive
                          ? "bg-[#8B4513] text-white"
                          : "bg-[#F5F5F5] text-[#6B7280]"
                      )}
                    >
                      {step.step_order}
                    </div>
                  )}

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <p
                        className={cn(
                          "leading-relaxed flex-1 text-lg",
                          isCompleted && cookingMode
                            ? "line-through text-white opacity-75"
                            : isCompleted && cookingMode
                            ? "text-white"
                            : "text-[#121212]"
                        )}
                      >
                        {step.instruction}
                      </p>

                      {/* Time Badge */}
                      {step.time_in_minutes && (
                        <div
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium whitespace-nowrap self-start",
                            isNextStep
                              ? "bg-[#8B4513] text-white"
                              : isCompleted && cookingMode
                              ? "bg-white text-[#8B4513]"
                              : "bg-[#F5F5F5] text-[#6B7280]"
                          )}
                        >
                          <span className="text-xs font-bold tracking-wide">
                            TIME
                          </span>
                          {formatTime(step.time_in_minutes)}
                        </div>
                      )}
                    </div>

                    {/* Tips */}
                    {tips.length > 0 && (isActive || cookingMode) && (
                      <div className="mt-4 space-y-2">
                        {tips.map((tip, tipIndex) => (
                          <div
                            key={tipIndex}
                            className={cn(
                              "text-sm px-3 py-2 rounded",
                              isCompleted && cookingMode
                                ? "text-white bg-white bg-opacity-20"
                                : "text-[#6B7280] bg-[#F5F5F5]"
                            )}
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
          <div className="mt-8 p-8 bg-[#8B4513] text-white rounded text-center">
            <div className="text-2xl mb-4">🎉</div>
            <div className="font-poppins font-bold text-2xl mb-2">
              Recipe Complete!
            </div>
            <h3 className="text-lg font-semibold mb-2">Congratulations!</h3>
            <p className="text-white opacity-90">
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
