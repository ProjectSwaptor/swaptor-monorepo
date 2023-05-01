import Image from "next/image";

import StepTwoModal from "../../../../../public/step-two-qr.png";

const ShareSwapStep = () => (
  <div className="step-container">
    <div className="flex flex-col px-4 lg:px-0 lg:w-[24rem]">
      <h1 className="text-[1.8rem] sm:text-[2.5rem] font-bold h-full leading-[2.2rem] sm:leading-[3rem] mb-4">
        2. Share swap link or QR code
      </h1>
      <span className="text-base">
        After creating the swap, you will be able to see an overview of all the
        details you entered.
        <span>
          <hr className="border-none h-6" /> Click the share button and send the
          generated swap link or QR code to someone you wish to swap with.
        </span>
      </span>
    </div>
    <div className="hidden lg:flex lg:w-[19rem] lg:rounded-xl lg:overflow-hidden lg:self-start">
      <Image src={StepTwoModal} alt="Share your Swap" />
    </div>
  </div>
);

export default ShareSwapStep;
