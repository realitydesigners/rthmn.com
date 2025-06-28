"use client";

import { TourButton } from "@/components/Buttons/TourButton";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ONBOARDING_STEPS,
  useOnboardingStore,
} from "../../../stores/onboardingStore";
import ExperienceStep from "./_components/Steps/ExperienceStep";
import IntroSequence from "./_components/Steps/IntroSequence";
import PairsStep from "./_components/Steps/PairsStep";
import ProfileUpload from "./_components/Steps/ProfileUpload";

const COMPONENTS: {
  ProfileUpload: any;
  ExperienceStep: any;
  PairsStep: any;
} = {
  ProfileUpload,
  ExperienceStep,
  PairsStep,
};

export default function OnboardingPage() {
  const router = useRouter();
  const {
    currentStepId,
    completeStep,
    goToNextStep,
    userData,
    updateUserData,
    setCurrentStep,
  } = useOnboardingStore();
  const [showIntro, setShowIntro] = useState(true);

  const currentStep = ONBOARDING_STEPS.find(
    (step) => step.id === currentStepId
  );

  useEffect(() => {
    if (!currentStep || currentStep.type !== "page") {
      router.replace("/dashboard");
    }
  }, [currentStep, router]);

  if (!currentStep || currentStep.type !== "page") {
    return null;
  }

  const handleNext = () => {
    // Prepare the completion data
    const completionData = {
      ...(currentStep.id === "profile" && { photoUrl: userData.photoUrl }),
      ...(currentStep.id === "experience" && {
        experience: userData.experience,
      }),
      ...(currentStep.id === "pairs" && {
        favorites: userData.favorites,
      }),
    };

    // Find next step before completing current
    const currentIndex = ONBOARDING_STEPS.findIndex(
      (step) => step.id === currentStepId
    );
    const nextStep = ONBOARDING_STEPS[currentIndex + 1];

    if (nextStep?.type === "feature-tour") {
      // For feature tours:
      // 1. Complete current step
      completeStep(currentStep.id, completionData);
      // 2. Set next step (feature tour)
      setCurrentStep(nextStep.id);
      // 3. Use router for smooth navigation
      setTimeout(() => {
        router.push("/dashboard");
      }, 0);
    } else {
      // For regular steps:
      // 1. Complete current step
      completeStep(currentStep.id, completionData);
      // 2. Go to next step
      goToNextStep();
    }
  };

  const handleBack = () => {
    const currentIndex = ONBOARDING_STEPS.findIndex(
      (step) => step.id === currentStepId
    );
    if (currentIndex > 0) {
      const previousStep = ONBOARDING_STEPS[currentIndex - 1];
      useOnboardingStore.setState({ currentStepId: previousStep.id });
    }
  };

  const renderStep = () => {
    if (!currentStep?.component || !(currentStep.component in COMPONENTS)) {
      return null;
    }

    switch (currentStep.component) {
      case "ProfileUpload":
        return (
          <ProfileUpload
            onPhotoUpload={(url: string) => updateUserData({ photoUrl: url })}
          />
        );
      case "ExperienceStep":
        return (
          <ExperienceStep
            experience={userData.experience}
            setExperience={(exp: string) => updateUserData({ experience: exp })}
          />
        );
      case "PairsStep":
        return (
          <PairsStep
            favorites={userData.favorites}
            setSelectedPairs={(pairs: string[]) =>
              updateUserData({ favorites: pairs })
            }
          />
        );
      default:
        return null;
    }
  };

  const stepNumber =
    ONBOARDING_STEPS.findIndex((step) => step.id === currentStepId) + 1;
  const totalSteps = ONBOARDING_STEPS.filter(
    (step) => step.type === "page"
  ).length;

  return (
    <div className="relative min-h-screen bg-black">
      {/* Main onboarding content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="flex min-h-screen items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
          animate={{
            opacity: showIntro ? 0 : 1,
            scale: showIntro ? 0.98 : 1,
            filter: showIntro ? "blur(10px)" : "blur(0px)",
            maxWidth: currentStep?.id === "pairs" ? "48rem" : "28rem",
          }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className={`relative w-full rounded-2xl border border-[#0A0B0D] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-4 sm:p-8 shadow-2xl before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05),rgba(255,255,255,0))]`}
        >
          {/* Progress indicator */}
          <div className="no-select absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs font-medium shadow-xl">
              <div className="flex h-1.5 w-8 sm:w-12 items-center rounded-full bg-[#0A0B0D]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#24FF66] to-[#1ECC52]"
                  initial={false}
                  animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
              <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent whitespace-nowrap">
                Step {stepNumber} of {totalSteps}
              </span>
            </div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="no-select relative py-4"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="font-russo flex justify-end space-x-3 mt-6">
            {stepNumber > 1 && (
              <TourButton onClick={handleBack} variant="black">
                Back
              </TourButton>
            )}
            <TourButton
              onClick={handleNext}
              disabled={
                (currentStep.id === "experience" && !userData.experience) ||
                (currentStep.id === "pairs" && userData.favorites.length < 4)
              }
              variant="green"
            >
              {ONBOARDING_STEPS[
                ONBOARDING_STEPS.findIndex(
                  (step) => step.id === currentStepId
                ) + 1
              ]?.type === "feature-tour"
                ? "Complete"
                : "Next"}
            </TourButton>
          </div>

          {/* Bottom pattern */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent opacity-50" />
        </motion.div>
      </motion.div>

      {/* Step title with enhanced styling */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4">
        <div className="no-select group relative flex items-center gap-2 rounded-full border border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] px-3 sm:px-4 py-1.5 shadow-xl transition-all duration-300 hover:border-[#24FF66]/20 hover:shadow-[#24FF66]/10">
          <div className="flex h-4 sm:h-5 w-4 sm:w-5 items-center justify-center rounded-full bg-gradient-to-b from-[#24FF66]/20 to-[#24FF66]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#24FF66]" />
          </div>
          <span className="no-select text-xs sm:text-sm font-medium text-white/70 transition-colors group-hover:text-white whitespace-nowrap">
            {currentStep?.id === "profile"
              ? "Upload Profile Photo"
              : currentStep?.id === "experience"
                ? "Trading Experience"
                : currentStep?.id === "pairs"
                  ? "Select Trading Pairs"
                  : ""}
          </span>
          <div className="absolute inset-0 -z-10 rounded-full bg-[#24FF66] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-10" />
        </div>
      </div>
      {showIntro && <IntroSequence onComplete={() => setShowIntro(false)} />}
    </div>
  );
}
