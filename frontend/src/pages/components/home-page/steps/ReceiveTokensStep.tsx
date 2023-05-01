import Image from "next/image";

import StepThreeBAYC from "../../../../../public/step-three-bayc.svg";
import StepThreeFadingBAYC from "../../../../../public/step-three-fading-bayc.svg";
import FloatingBTC from "../../../../../public/floating-btc.svg";
import FloatingAVAX from "../../../../../public/floating-avax-coin.svg";
import FloatingETHLeft from "../../../../../public/floating-eth-coin.svg";
import FloatingETHRight from "../../../../../public/floating-eth-right.svg";

const ReceiveTokensStep = () => (
  <div className="step-container">
    <div className="flex flex-col px-4 sm:px-0 lg:w-[24rem]">
      <h1 className="text-[1.8rem] sm:text-[2.5rem] font-bold h-full leading-[2.2rem] sm:leading-[3rem] mb-4">
        3. Receive your tokens
      </h1>
      <span className="text-base">
        After the other side checks the swap terms and accepts it, the smart
        contract will execute the swap.
      </span>
    </div>
    <div className="hidden lg:flex lg:h-[25rem] lg:w-[19rem]">
      <Image src={StepThreeBAYC} alt="BAYC" className="" />
      <Image
        src={StepThreeFadingBAYC}
        alt="BAYC"
        className="relative z-[-1] right-28 bottom-20"
      />
      <Image
        src={FloatingBTC}
        alt="BTC"
        className="relative z-10 right-[18rem] bottom-[10rem]"
        height={68}
      />
      <Image
        src={FloatingAVAX}
        alt="AVAX"
        className="relative z-10 right-[18rem] top-[4rem]"
        height={110}
      />
      <Image
        src={FloatingETHLeft}
        alt="ETH"
        className="relative z-10 right-[37rem] bottom-[7rem]"
        height={90}
      />
      <Image
        src={FloatingETHRight}
        alt="ETH"
        className="relative z-10 right-[25rem] bottom-[4rem]"
        height={72}
      />
    </div>
  </div>
);

export default ReceiveTokensStep;
