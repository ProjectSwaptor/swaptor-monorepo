import React from "react";
import { useCountdown } from "../../../../hooks/useCountdown";
import DateTimeDisplay from "./DateTimeDisplay";

type PromoTimerProps = {
  promoDuration: number;
};

const PromoTimer = ({ promoDuration }: PromoTimerProps) => {
  const [days, hours, minutes, seconds] = useCountdown(promoDuration);

  const isSoonExpiring = promoDuration > 0 && days < 7;

  return (
    <div className="flex font-robotomono">
      <DateTimeDisplay
        value={days > 0 ? days : 0}
        type="D"
        isSoonExpiring={isSoonExpiring}
      />
      <DateTimeDisplay
        value={hours > 0 ? hours : 0}
        type="H"
        isSoonExpiring={isSoonExpiring}
      />
      <DateTimeDisplay
        value={minutes > 0 ? minutes : 0}
        type="M"
        isSoonExpiring={isSoonExpiring}
      />
      <DateTimeDisplay
        value={seconds > 0 ? seconds : 0}
        type="S"
        isSoonExpiring={isSoonExpiring}
      />
    </div>
  );
};

export default PromoTimer;
