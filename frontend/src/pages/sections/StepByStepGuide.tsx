import { useState } from "react";
import { useSwipeable } from "react-swipeable";

import SectionHeader from "../components/SectionHeader";
import CreateSwapStep from "../components/home-page/steps/CreateSwapStep";
import ShareSwapStep from "../components/home-page/steps/ShareSwapStep";
import ReceiveTokensStep from "../components/home-page/steps/ReceiveTokensStep";
import Carousel from "../components/Carousel";

const StepByStepGuide = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const showNextStep = () => setCurrentStep((currentStep + 1) % 3);
  const showPreviousStep = () => setCurrentStep((3 + currentStep - 1) % 3);

  const handlers = useSwipeable({
    onSwipedLeft: showNextStep,
    onSwipedRight: showPreviousStep,
    trackMouse: true,
  });

  return (
    <div className="flex flex-col w-full items-center p-2 mt-14" id="guide">
      <SectionHeader>Step by Step Guide</SectionHeader>
      <Carousel>
        <CreateSwapStep />
        <ShareSwapStep />
        <ReceiveTokensStep />
      </Carousel>
    </div>
  );
};

export default StepByStepGuide;
