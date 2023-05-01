import { useEffect, useState } from "react";

import PromoDisplay from "../components/home-page/statistics/PromoDisplay";
import StatDisplay from "../components/home-page/statistics/StatDisplay";
import Wrapper from "../components/Wrapper";

const Statistics = () => {
  const [promoDuration, setPromoDuration] = useState<number>();

  const [swapsCreated, setSwapsCreated] = useState<number>();
  const [tokensTraded, setTokensTraded] = useState<number>();

  useEffect(() => {
    setPromoDuration(new Date("2023-04-14").getTime() - new Date().getTime());

    setSwapsCreated(540000);
    setTokensTraded(1340000);
  }, []);

  return (
    <div className="countdown flex items-center justify-around w-screen py-8">
      <Wrapper>
        {/** small screen */}
        <div className="hidden sm:flex sm:w-full sm:justify-between sm:items-center sm:mx-auto sm:max-w-[60rem] sm:space-y-0">
          <StatDisplay label="swaps created" value={swapsCreated} />
          <PromoDisplay promoDuration={promoDuration} />
          <StatDisplay label="tokens traded" value={tokensTraded} />
        </div>

        {/** large screen */}
        <div className="flex flex-col w-full justify-between items-center space-y-0 sm:hidden">
          <div className="flex items-center space-x-24 mb-4">
            <StatDisplay label="swaps created" value={swapsCreated} />
            <StatDisplay label="tokens traded" value={tokensTraded} />
          </div>
          <PromoDisplay promoDuration={promoDuration} />
        </div>
      </Wrapper>
    </div>
  );
};

export default Statistics;
