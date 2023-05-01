import { Children, useState } from "react";
import { useSwipeable } from "react-swipeable";

import CircleArrowIcon from "./icons/CircleArrowIcon";
import Fader from "./Fader";

const ARROW_BUTTON_STYLE =
  "hidden z-50 sm:flex sm:absolute text-gray-500 border-gray-500 transition hover:border-teal-400 hover:text-teal-400";
const ACTIVE_CIRCLE_STYLE =
  "border-[1px] border-gray-500 rounded-full h-3 w-3 bg-gray-500";
const INACTIVE_CIRCLE_STYLE =
  "border-[1px] border-gray-500 rounded-full h-3 w-3 bg-inherit";

export type CarouselProps = {
  children: React.ReactNode;
};

const Carousel = ({ children }: CarouselProps) => {
  const childCount = Children.count(children);

  const [currentChild, setCurrentChild] = useState(0);

  const showNextChild = () => setCurrentChild((currentChild + 1) % childCount);
  const showPreviousChild = () =>
    setCurrentChild((childCount + currentChild - 1) % childCount);

  const handlers = useSwipeable({
    onSwipedLeft: showNextChild,
    onSwipedRight: showPreviousChild,
    trackMouse: true,
  });

  return (
    <div className="rounded-container flex mt-4 w-full h-[30rem] sm:h-[25rem] lg:h-[35rem]">
      <div
        {...handlers}
        className="relative flex flex-col w-full items-center justify-center z-40"
      >
        <div
          className={`${ARROW_BUTTON_STYLE} sm:left-4`}
          onClick={showPreviousChild}
        >
          <CircleArrowIcon />
        </div>
        <div
          className={`${ARROW_BUTTON_STYLE} rotate-180 sm:right-4`}
          onClick={showNextChild}
        >
          <CircleArrowIcon />
        </div>

        <div className="relative flex items-center justify-around w-full">
          {Children.map(children, (child, i) => (
            <Fader showChildren={currentChild === i}>{child}</Fader>
          ))}
        </div>

        <div className="flex gap-x-2 absolute bottom-4">
          {Children.map(children, (_child, i) => (
            <div
              className={`${
                currentChild === i ? ACTIVE_CIRCLE_STYLE : INACTIVE_CIRCLE_STYLE
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
