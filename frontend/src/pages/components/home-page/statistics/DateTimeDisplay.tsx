import React from "react";

type DateTimeDisplayProps = {
  value: number;
  type: string;
  isSoonExpiring: boolean;
};

const DateTimeDisplay = ({
  value,
  type,
  isSoonExpiring,
}: DateTimeDisplayProps) => {
  return (
    <div className={isSoonExpiring ? "bg-red-400 bg-clip-text" : ""}>
      <h1 className="leading-10 0 font-bold mx-[0.5rem] text-[1.8rem] sm:mx-[0.75rem] sm:text-[2.2rem]">
        {value && value.toString().length == 1 && "0"}
        {value}
        <span>{type}</span>
      </h1>
    </div>
  );
};

export default DateTimeDisplay;
