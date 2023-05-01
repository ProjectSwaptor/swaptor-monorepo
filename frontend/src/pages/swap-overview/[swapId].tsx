import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Navbar from "../sections/Navbar";
import Container from "../components/Container";
import Wrapper from "../components/Wrapper";
import Overview from "../components/overview/Overview";
import { getSwap } from "@/api/swaptor-backend/swaps";
import { SupportedChain } from "@/constants";
import { GetSwapDto } from "@/constants/blockchain/types";
import { useRecoilState } from "recoil";
import { swapActive } from "@/state/atoms";
import SwapNotFound from "../components/overview/SwapNotFound";
import LoadingSpinnerIcon from "../components/icons/LoadingSpinnerIcon";
import { getBlockchainTime } from "@/api/swaptor-backend/oracles";
import Head from "next/head";
import { FRONTEND_URL } from "@/environment";

const Swap = () => {
  const [swap, setSwap] = useState<GetSwapDto | undefined>();
  const [notFound, setNotFound] = useState(false);

  const [active, setActive] = useRecoilState(swapActive);

  const router = useRouter();
  const {
    query: { swapId },
  } = router;

  useEffect(() => {
    const fetchSwap = async () => {
      if (swapId) {
        const { res, err } = await getSwap(swapId.toString());

        if (err) {
          setNotFound(true);

          return;
        }

        setSwap(res!.data);
      }
    };
    fetchSwap();
  }, [swapId]);

  useEffect(() => {
    if (swap) {
      const fetchTimestamp = async () => {
        const { expirationTime } = swap;

        const chainIdHex = "0x" + (+swap.chainId).toString(16);

        const { err, res } = await getBlockchainTime(
          chainIdHex as SupportedChain
        );

        if (err) {
          return;
        }

        setActive(+res!.data.chainTime < +expirationTime && swap.active);
      };

      fetchTimestamp();
    }
  }, [swap, setActive]);

  return (
    <Container>
      <Head>
        <title>Swap Overview</title>
        <link rel="icon" href="/swaptor-logo.svg" type="image/svg+xml" />
        <meta
          name="description"
          content="Swap overview page - look over the swap conditions, accept or share the swap."
          key="desc"
        />
        <meta property="og:title" content="Swap Overview" />
        <meta
          property="og:description"
          content="Look over the swap conditions and share or accept the swap."
        />
        <meta
          property="og:image"
          content={`${FRONTEND_URL}/swaptor-hero.png`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>
      <Wrapper>
        <Navbar />
        {(() => {
          if (notFound) {
            return <SwapNotFound />;
          }

          if (swap === undefined || active === undefined) {
            return (
              <div className="flex flex-col mt-[15rem] justify-center items-center">
                <h2 className="text-[2rem] font-bold mb-2">Fetching swap...</h2>
                <div className="h-[3rem] w-[3rem] text-gray-600 fill-teal-400">
                  <LoadingSpinnerIcon />
                </div>
              </div>
            );
          }

          return <Overview swap={swap} />;
        })()}
      </Wrapper>
    </Container>
  );
};

export default Swap;
