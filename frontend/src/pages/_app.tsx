import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import { Web3OnboardProvider } from "@web3-onboard/react";
import { onboardConfig } from "@/config/onboard-config";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3OnboardProvider web3Onboard={onboardConfig}>
      <RecoilRoot>
        <Component {...pageProps} />
        <Analytics />
      </RecoilRoot>
    </Web3OnboardProvider>
  );
}
