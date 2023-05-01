import { useState } from "react";

import InfoIcon from "../icons/InfoIcon";

const InfoPanel = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className="cursor-pointer"
        onMouseOver={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <InfoIcon />
      </div>
      <div
        className={`${
          open ? "opacity-100" : "opacity-0 -z-50"
        } text-xs transition duration-300 flex flex-col font-light absolute right-0 inset-y-[1.2rem] 
            justify-center rounded-xl bg-gray-800 w-[17rem] h-[11rem] px-[2.5rem] border-[1px] border-gray-600`}
      >
        <p className="font-semibold mb-3 -ml-[0.7rem] tracking-wider">
          QUICK INFO
        </p>
        <ul className="list-disc">
          <li className="mb-2">Creating a swap is FREE.</li>
          <li className="mb-2">
            Your coins stay yours until the other party accepts the swap.
          </li>
          <li>Accepting the swap is currently FREE.</li>
        </ul>
      </div>
    </div>
  );
};

export default InfoPanel;
