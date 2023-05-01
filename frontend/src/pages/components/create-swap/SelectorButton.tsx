import DownArrow from "../icons/DownArrow";

type SelectorButtonProps = {
  defaultText: string;
  imagePath?: string;
  textWhenSelected?: string;
};

const SelectorButton = ({
  defaultText,
  textWhenSelected,
}: SelectorButtonProps) => {
  const commonStyle =
    "flex font-semibold cursor-pointer tracking-wider px-4 py-1 text-lg transition duration-150 w-full";

  if (textWhenSelected === undefined) {
    return (
      <div
        className={`${commonStyle} bg-teal-700 text-teal-100 hover:bg-teal-800`}
      >
        <p className="mr-2">{defaultText}</p>
        <div className="flex items-center ml-auto">
          <DownArrow />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${commonStyle} bg-gray-600 text-gray-100 hover:bg-gray-700`}
    >
      <p className="mr-1">{textWhenSelected}</p>
      <div className="flex items-center ml-auto">
        <DownArrow />
      </div>
    </div>
  );
};

export default SelectorButton;
