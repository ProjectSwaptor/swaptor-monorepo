import Benefit from "../components/home-page/benefits/Benefit";
import staySafeIcon from "../../../public/stay-safe.svg";
import flatFeeIcon from "../../../public/flat-fee.svg";
import beyondCoinsIcon from "../../../public/beyond-coins.svg";

const Benefits = () => {
  const scamlessBenefitHeader = "Stay safe from scams.";
  const scamlessBenefitParagraph =
    "Found someone to swap with? Swaptor makes it easy while protecting you from scammers. Just create a swap and share the link or QR with your peer.";
  const noSlippageBenefitHeader = "Flat fee. Zero slippage.";
  const noSlippageBenefitParagraph =
    "Avoid slippage and high swap fees. Swaptor charges a small flat fee for every swap. Enjoy swapping free of charge during our promotional periods!";
  const beyondCoinsBenefitHeader = "Beyond just coins.";
  const beyondCoinsBenefitParagraph =
    "Swaptor allows you to swap NFTs just like you would with any coins. Simply choose from one of the most popular collections or specify your own.";

  return (
    <div className="w-full mt-14 flex align-center flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
      <Benefit
        icon={staySafeIcon}
        header={scamlessBenefitHeader}
        paragraph={scamlessBenefitParagraph}
      />

      <Benefit
        icon={flatFeeIcon}
        header={noSlippageBenefitHeader}
        paragraph={noSlippageBenefitParagraph}
      />

      <Benefit
        icon={beyondCoinsIcon}
        header={beyondCoinsBenefitHeader}
        paragraph={beyondCoinsBenefitParagraph}
      />
    </div>
  );
};

export default Benefits;
