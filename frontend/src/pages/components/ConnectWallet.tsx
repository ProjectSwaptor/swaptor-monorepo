import { useConnectWallet } from "@web3-onboard/react";
import { useSetChain } from "@web3-onboard/react";

import { truncateAddress } from "@/utils/truncate";
import PolygonLogo from "./PolygonLogo";

const commonButtonStyle =
  "flex items-center justify-center w-[7rem] sm:w-[10.8rem] sm:h-[2.65rem]";

const ConnectWallet = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ chains }, setChain] = useSetChain();

  const connectWallet = async () => {
    const walletState = await connect();

    if (walletState[0]) {
      await setChain({
        chainId: chains[0].id,
        chainNamespace: chains[0].namespace,
      });
    }
  };

  if (connecting) {
    return (
      <button className={`btn-secondary ${commonButtonStyle}`} disabled={true}>
        Connecting...
      </button>
    );
  }

  if (wallet) {
    return (
      <button
        onClick={() => disconnect(wallet)}
        className={`btn-secondary ${commonButtonStyle}`}
      >
        <PolygonLogo className="hidden sm:flex mr-2 w-6 h-6" />

        {truncateAddress(wallet.accounts[0].address)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connectWallet()}
      className={`btn-primary ${commonButtonStyle}`}
    >
      Connect
    </button>
  );
};

export default ConnectWallet;
