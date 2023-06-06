import { useState } from "react";
import { useSwipeable } from "react-swipeable";

import SectionHeader from "../components/SectionHeader";

import Carousel from "../components/Carousel";
import Link from "next/link";
import SwappedTokens from "../../../public/swapped-tokens.png";
import StepOneModal from "../../../public/step-one-modal.png";
import StepTwoQr from "../../../public/step-two-qr.png";
import Image from "next/image";

const swapStepTitleStyle =
  "text-[1.8rem] sm:text-[2.5rem] font-bold leading-[2.2rem] sm:leading-[3rem] mb-4";

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
      <div className="flex flex-col gap-y-24 py-16 mt-12 w-full items-center rounded-container">
        <div className="flex gap-x-8 w-[50rem]">
          <div className="flex flex-col w-2/3 justify-center">
            <h2 className={swapStepTitleStyle}>1. Create a Swap</h2>
            <div>
              Open the{" "}
              <Link href="#" className="btn-tertiary cursor-pointer">
                swap app
              </Link>
              . Specify what you want to swap and with whom, connect your wallet
              and create the swap.
              <hr className="border-none h-8" />
              <span className="font-bold">Please note:</span> <br /> You can
              allow anybody to accept the swap, or make it exclusive for your
              peer by entering their address.
            </div>
          </div>
          <div className="hidden lg:flex lg:w-[20rem] lg:self-start">
            <Image src={StepOneModal} alt="CreateSwap" unoptimized />
          </div>
        </div>
        <div className="flex gap-x-8 w-[50rem]">
          <div className="flex flex-col w-2/3 justify-center">
            <h2 className={swapStepTitleStyle}>
              2. Share swap link or QR code
            </h2>
            <div>
              After creating the swap, you will be redirected to an overview of
              all the swap terms you defined in the{" "}
              <Link href="#" className="btn-tertiary cursor-pointer">
                swap app
              </Link>
              .{" "}
              <div className="mt-5">
                Click the share button and send the generated swap link or QR
                code to anyone you wish to swap with.
              </div>
            </div>
          </div>
          <div className="hidden lg:flex lg:w-[20rem] lg:self-start">
            <Image src={StepTwoQr} alt="" unoptimized />
          </div>
        </div>

        <div className="flex gap-x-8 w-[50rem]">
          <div className="flex flex-col w-2/3 justify-center">
            <h2 className={swapStepTitleStyle}>3. Receive your tokens</h2>
            <div>
              After the other side checks the swap terms and accepts it, the
              smart contract executes the swap.
            </div>
          </div>
          <div className="relative hidden lg:flex lg:w-[20rem] lg:self-start">
            <Image src={SwappedTokens} alt="" unoptimized />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepByStepGuide;
