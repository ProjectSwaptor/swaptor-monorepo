import Image from "next/image";

import SwaptorModal from "../../../public/swaptor-modal.png";
import DownArrowIcon from "../components/icons/DownArrowIcon";

const Hero = () => {
  const handleClick = () => {
    const element = document.getElementById("guide");

    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex items-center mx-auto max-w-5xl mt-16 mb-8 sm:my-24">
      <div className="flex flex-col items-start mx-auto lg:w-1/2">
        <h1
          className="hero-header text-[3.8rem] leading-[4rem]
                     sm:text-[4.5rem] sm:leading-[5.2rem]"
        >
          Swap <span className="hero-span"> directly</span> with anyone.
        </h1>

        <p className="my-8 lg:w-3/4 lg:mt-0 lg:mb-5">
          Swap coins and NFTs safely with Swaptor. No slippage. Flat fees.
        </p>

        <button
          className="relative btn-secondary flex items-center py-1 pl-4 pr-2 md:py-2"
          onClick={handleClick}
        >
          <span>See How</span>
          <span className="-rotate-90 ml-1">
            <DownArrowIcon />
          </span>
        </button>
      </div>
      <div className="hidden lg:flex ml-auto w-[23rem] rounded-lg overflow-hidden">
        <Image src={SwaptorModal} alt="SwaptorModal" />
      </div>
    </div>
  );
};

export default Hero;
