import { nanoid } from "nanoid";
import Head from "next/head";
import { useState } from "react";

import Container from "./components/Container";
import DownArrowIcon from "./components/icons/DownArrowIcon";
import Wrapper from "./components/Wrapper";
import Navbar from "./sections/Navbar";

type AccordionProps = {
  title: string;
  children: React.ReactNode;
};

const Accordion = ({ title, children }: AccordionProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const [collapsibleDivId] = useState(() => nanoid());

  const flip = () => setCollapsed(!collapsed);

  return (
    <article className="transition border-t-[1px] border-gray-500 last:border-b-[1px]">
      <button
        className="px-8 py-8 w-full text-left"
        onClick={flip}
        aria-controls={collapsibleDivId}
        aria-expanded={!collapsed}
      >
        <div className="flex items-center w-full">
          <span className="text-lg font-light text-gray-100">{title}</span>
          <span
            className={`${
              !collapsed ? "rotate-180" : ""
            } ml-auto text-gray-500 transition-transform duration-50`}
          >
            <DownArrowIcon />
          </span>
        </div>

        <div
          className={`overflow-hidden transition-[max-height] font-light ${
            collapsed
              ? "max-h-0 pb-0 duration-[0.5s] ease-[cubic-bezier(0,1,0,1)]"
              : "max-h-[100rem] duration-[1s] ease-in-out"
          }`}
          id={collapsibleDivId}
        >
          <div className="mt-6">{children}</div>
        </div>
      </button>
    </article>
  );
};

const FAQ = () => {
  return (
    <div className="relative h-screen">
      <Head>
        <title>FAQ | Swaptor</title>
        <link rel="icon" href="/swaptor-logo.svg" type="image/svg+xml" />
        <meta name="description" content="Frequently asked questions." key="desc" />
      </Head>
      <div
        className="absolute w-[20rem] h-[135rem] right-[2rem] -top-[50rem] blur-[6rem] -z-50
                    bg-gradient-to-br from-blue-400 to-teal-400 opacity-10 -rotate-[50deg]"
      />
      <Container>
        <Wrapper>
          <Navbar />
          <div className="mt-[5rem] md:mt-[4.5rem] md:m-24 flex flex-col">
            <h1 className="text-[3rem] font-semibold mx-auto mb-8">
              Frequently Asked Questions
            </h1>

            <Accordion title="How much does it cost to create a swap?">
              <p>Creating a swap is FREE and always will be.</p>
            </Accordion>

            <Accordion title="What are swap fees and who pays them?">
              <p>
                Swaptor charges a small flat fee upon accepting the swap. The
                fee is paid by the buyer, meaning that the user that accepts the
                swap is responsible for paying the fee.
              </p>
              <div className="mt-2">
                <p className="font-semibold">Please note:</p>
                Swapping during promotional periods is FREE, meaning that the
                swap fee is set to zero.
              </div>
            </Accordion>

            <Accordion title="What if nobody accepts the swap?">
              <p>
                Since creating a swap is free, you don’t lose anything if nobody
                accepts the swap. Your tokens stay yours and the swap expires 24
                hours after creation.
              </p>
            </Accordion>

            <Accordion title="What kind of tokens can I swap?">
              <p>
                Swaptor only supports ERC721 and ERC20 tokens in the present
                moment. However, there are plans to add support for ERC1155
                tokens in the future depending on community feedback.
              </p>
            </Accordion>

            <Accordion title="How do I avoid being scammed?">
              <p>
                Scams in the web3 world are extremely common, but you can take
                the necessary steps to protect yourself and others.
              </p>
              <p className="mt-2">
                Firstly, do not share your private key with anyone. Swaptor will
                never ask you for your private key or any information that might
                reveal your private key.
              </p>
              <p className="mt-2">
                Secondly, make sure to look for a padlock icon next to the site
                name. Check the URL carefully. If swapping on mainnet, the swap
                URL must start with{" "}
                <span className="font-semibold">swaptor.io/swap/</span>
                or{" "}
                <span className="font-semibold">https://swaptor.io/swap/</span>.
                If swapping on testnet, the swap URL must start with{" "}
                <span className="font-semibold">test.swaptor.io/swap/</span> or{" "}
                <span className="font-semibold">
                  https://test.swaptor.io/swap/
                </span>
                . Scammers often use similar site names that appear legit, but
                differ from the legit URL in one or more characters.
              </p>
            </Accordion>
          </div>
        </Wrapper>
      </Container>
    </div>
  );
};

export default FAQ;
