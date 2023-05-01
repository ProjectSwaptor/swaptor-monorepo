import LoadingSpinnerIcon from "../../icons/LoadingSpinnerIcon";

type StatDisplayProps = {
  label: string;
  value?: number;
};

const StatDisplay = ({ label, value }: StatDisplayProps) => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="font-bold uppercase text-[2rem] leading-[1.6rem]">
        {value ? (
          <span>
            {Intl.NumberFormat("en", { notation: "compact" }).format(value)}
          </span>
        ) : (
          <div className="h-[1.8rem] w-[1.8rem] text-gray-600 fill-gray-400">
            <LoadingSpinnerIcon />
          </div>
        )}
      </h1>

      <h2 className="text-xs text-gray-400 mt-1 leading-3">{label}</h2>
    </div>
  );
};

export default StatDisplay;
