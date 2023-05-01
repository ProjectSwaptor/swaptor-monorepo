import Navbar from "./sections/Navbar";
import Benefits from "./sections/Benefits";
import Hero from "./sections/Hero";
import TuneInForMore from "./sections/TuneInForMore";
import Wrapper from "./components/Wrapper";
import Statistics from "./sections/Statistics";
import Container from "./components/Container";
import StepByStepGuide from "./sections/StepByStepGuide";
import Head from "next/head";
import { FRONTEND_URL } from "../environment";

export default function Home() {
  return (
    <Container>
      <Head>
        <title>Swaptor</title>
        <link rel="icon" href="/swaptor-logo.svg" type="image/svg+xml" />
        <meta
          name="description"
          content="Swaptor - A peer-to-peer, decentralized trading platform."
          key="desc"
        />
        <meta
          property="og:title"
          content="Swaptor - Swap directly with anyone."
        />
        <meta
          property="og:description"
          content="Swap ERC20 tokens or NFTs directly with your peers in a couple of simple steps."
        />
        <meta
          property="og:image"
          content={`${FRONTEND_URL}/swaptor-hero.png`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          name="google-site-verification"
          content="QKXN6UR8-2m8YUFQn8_E2SemKeWDJsFdfGBmherRndw"
        />
      </Head>
      <div
        className="absolute w-[20rem] h-[50rem] left-[30rem] -top-[8rem] blur-[6rem] -z-50
                    bg-gradient-to-br from-blue-400 to-teal-400 opacity-[8%] rotate-[50deg]"
      />
      <Wrapper>
        <Navbar />
        <Hero />
      </Wrapper>
      <Statistics />
      <Wrapper>
        <Benefits />
        <StepByStepGuide />
        <TuneInForMore />
      </Wrapper>
    </Container>
  );
}
