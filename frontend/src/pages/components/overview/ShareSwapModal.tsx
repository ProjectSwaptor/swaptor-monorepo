import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

import ClipboardIcon from "../icons/ClipboardIcon";
import CheckIcon from "../icons/CheckIcon";
import CloseIcon from "../icons/CloseIcon";

type ShareSwapModalProps = {
  visible: boolean;
  setVisible: any;
  swapLink: string;
};

const ShareSwapModal = ({
  visible,
  setVisible,
  swapLink,
}: ShareSwapModalProps) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);

  const qrCodeRef = useRef<HTMLButtonElement>(null);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(swapLink);
    setLinkCopied(true);
  };

  const handleCopyQr = async () => {
    if (qrCodeRef.current === null) {
      return;
    }

    const canvas = qrCodeRef.current.querySelector("canvas");

    if (canvas === null) {
      return;
    }

    const clipboardData = new ClipboardItem({
      "image/png": (async () => {
        /**
         * To be able to use `ClipboardItem` in safari, need to pass promise directly into it.
         * @see https://stackoverflow.com/questions/66312944/javascript-clipboard-api-write-does-not-work-in-safari
         */
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(blob)),
            "image/png",
            1
          )
        );

        return blob;
      })(),
    });

    await navigator.clipboard.write([clipboardData]);

    setQrCopied(true);
  };

  useEffect(() => {
    if (visible) {
      setLinkCopied(false);
      setQrCopied(false);

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return;
    }

    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, [visible]);

  return (
    <div
      onClick={() => setVisible(false)}
      className={`${
        visible
          ? "z-50 opacity-100 ease-in transition-[opacity]"
          : "-z-50 opacity-0 ease-out transition-[z-index,opacity]"
      } 
      bg-black bg-opacity-70 backdrop-blur-sm fixed left-0 top-0 right-0 bottom-0 h-screen w-screen 
      flex items-center justify-center duration-150`}
    >
      <div
        className="flex flex-col bg-gray-800 w-[20rem] p-5 space-y-3 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between pb-1">
          <h1>Share Swap</h1>
          <button aria-label="close" onClick={() => setVisible(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <p className="font-thin text-sm">Share link:</p>
          <button
            className="flex bg-gray-900 rounded-lg p-4 break-all"
            onClick={handleCopyLink}
          >
            <p className="text-left text-sm font-robotomono">{swapLink}</p>
            <span className="text-teal-400 mt-auto ml-auto">
              {linkCopied ? <CheckIcon /> : <ClipboardIcon />}
            </span>
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <p className="font-thin text-sm">...or QR:</p>
          <button
            className="flex bg-gray-900 rounded-lg p-4"
            aria-label="copy"
            onClick={handleCopyQr}
            ref={qrCodeRef}
          >
            <div>
              <QRCodeCanvas value={swapLink} />
            </div>
            <span className="text-teal-400 mt-auto ml-auto">
              {qrCopied ? <CheckIcon /> : <ClipboardIcon />}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareSwapModal;
