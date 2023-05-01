import { useEffect, useState } from "react";

const useCountdown = (duration: number) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(timeRemaining - 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

export { useCountdown };
