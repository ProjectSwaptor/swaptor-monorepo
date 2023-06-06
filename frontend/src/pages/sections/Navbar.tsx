import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import Link from "next/link";

import ConnectWallet from "../components/ConnectWallet";
import DownArrowIcon from "../components/icons/DownArrowIcon";
import SwaptorLogo from "../../../public/swaptor-logo.svg";
import Fader from "../components/Fader";

const url = "https://hesoyam.swaptor.io/";

const Navbar = () => {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const flipMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="relative w-full pt-6">
      {/** large screen */}
      <div className="hidden lg:flex lg:w-full lg:items-center">
        <Link href="/" className="flex gap-x-3">
          <Image src={SwaptorLogo} alt="Swaptor" />
          <h1 className="font-bold text-lg">Swaptor</h1>
        </Link>

        <div className="flex gap-x-12 items-center ml-auto">
          <button>
            <Link href="https://github.com/ProjectSwaptor/swaptor-monorepo/blob/dev/docs/whitepaper.pdf" target="_blank">
              Whitepaper
            </Link>
          </button>
          <button>
            <Link href="https://discord.com/invite/AufTrXDwzS" target="_blank">
              Discord
            </Link>
          </button>
          <button>
            <Link
              href="https://twitter.com/swaptor_?s=21&t=-v29YDQJLgkd8bcYLUBktg"
              target="_blank"
            >
              Twitter
            </Link>
          </button>
          <button>
            <Link href={"/faq"}>FAQ</Link>
          </button>
          <button className="relative btn-secondary flex items-center p-2 px-4 -mr-6 bg-teal-800/60 text-white">
            <Link href={url} target="_blank" rel="noopener noreferrer">
              Get Test Tokens
            </Link>
          </button>
          {router.pathname.startsWith("/swap") ? (
            <ConnectWallet />
          ) : (
            <div className="flex gap-4">
              <button
                className="btn-primary px-4 py-1 md:px-6 md:py-2"
                onClick={() => router.push("/swap")}
              >
                Enter App
              </button>
            </div>
          )}
        </div>
      </div>

      {/** small screen */}
      <div className="relative lg:hidden">
        <div className="relative">
          <Link href="/" className="flex gap-x-3">
            <Image
              src={SwaptorLogo}
              alt="Swaptor"
              className="absolute left-1 top-[0.9rem]"
            />
          </Link>

          <div className="absolute right-0 top-2">
            <div className="flex gap-x-3">
              <button
                onClick={flipMenu}
                className="p-2 btn-secondary flex space-x-1 pl-4 pr-2 py-1 sm:pl-6 sm:pr-4 sm:py-2"
              >
                <span>Explore</span>
                <span className={`${menuOpen ? "rotate-180 pr-1" : "pl-1"}`}>
                  <DownArrowIcon />
                </span>
              </button>
              <Fader showChildren={menuOpen}>
                <div
                  className="absolute flex flex-col bg-slate-800 text-white text-md rounded-xl
                              px-6 pt-6 gap-y-8 h-[15rem] w-[12rem] inset-y-[2.1rem] sm:inset-y-[2.7rem]"
                >
                  <button className="flex w-full text-teal-400">
                    <Link href={url} target="_blank" rel="noopener noreferrer">
                      Get Test Tokens
                    </Link>
                  </button>
                  <button className="flex w-full">
                    <Link
                      href="https://github.com/ProjectSwaptor/swaptor-monorepo/blob/dev/docs/whitepaper.pdf"
                      target="_blank"
                    >
                      Whitepaper
                    </Link>
                  </button>
                  <button className="flex w-full">
                    <Link
                      href="https://discord.com/invite/AufTrXDwzS"
                      target="_blank"
                    >
                      Discord
                    </Link>
                  </button>
                  <button className="flex w-full">
                    <Link
                      href="https://twitter.com/swaptor_?s=21&t=-v29YDQJLgkd8bcYLUBktg"
                      target="_blank"
                    >
                      Twitter
                    </Link>
                  </button>
                  <button className="flex w-full">
                    <Link href={"/faq"}>FAQ</Link>
                  </button>
                </div>
              </Fader>

              {router.pathname.startsWith("/swap") ? (
                <ConnectWallet />
              ) : (
                <button
                  className="btn-primary px-4 py-1 sm:px-6 sm:py-2"
                  onClick={() => router.push("/swap")}
                >
                  Enter App
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
