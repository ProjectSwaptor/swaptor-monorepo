import { useConnectWallet } from "@web3-onboard/react";

const ConnectWalletButton = () => {
  const [, connect] = useConnectWallet();

  const handleConnect = async () => {
    await connect();
  };

  return (
    <button
      className="w-full bg-teal-400 hover:bg-teal-500 transition text-black font-semibold rounded-lg py-2 mt-2 text-lg"
      onClick={handleConnect}
    >
      Connect Wallet
    </button>
  );
};

export default ConnectWalletButton;
