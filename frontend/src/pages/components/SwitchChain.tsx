import { useSetChain } from "@web3-onboard/react";

type SwitchChainProps = {
  text: string;
  chainId: string;
  chainNamespace?: string;
};

const SwitchChain = ({ text, chainId, chainNamespace }: SwitchChainProps) => {
  const [{}, setChain] = useSetChain();

  const switchChain = async () => {
    await setChain({
      chainId,
      chainNamespace,
    });
  };

  return (
    <button
      onClick={switchChain}
      className="w-full bg-teal-400 hover:bg-teal-500 transition text-black font-semibold rounded-lg py-2 mt-2 text-lg"
    >
      {text}
    </button>
  );
};

export default SwitchChain;
