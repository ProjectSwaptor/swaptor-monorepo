import Image from "next/image";
import Link from "next/link";

import StepOneModal from "../../../../../public/step-one-modal.png";

const CreateSwapStep = () => (
  <div className="step-container">
    <div className="flex flex-col px-4 sm:px-0">
      <h1 className="text-[1.8rem] sm:text-[2.5rem] font-bold h-full leading-[2.2rem] sm:leading-[3rem] mb-4">
        1. Create a Swap
      </h1>
      <span className="text-base">
        Open the{" "}
        <Link href="#" className="btn-tertiary cursor-pointer">
          swap app
        </Link>
        . Specify what you want to swap and with whom, connect your wallet and
        create the swap.
        <hr className="border-none h-8" />
        <span className="font-bold">Please note:</span> <br /> You can allow
        anybody to accept the swap, or make it exclusive for your peer by
        entering their address.
      </span>
    </div>
    <div className="hidden lg:flex lg:w-[39rem] lg:self-start">
      <Image
        src={StepOneModal}
        alt="CreateSwap"
        className="rounded-md object-cover"
      />
    </div>
  </div>
);

export default CreateSwapStep;
