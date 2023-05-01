export type InfoButtonProps = {
  info: string;
};

const InfoButton = ({ info }: InfoButtonProps) => {
  return (
    <button
      className="w-full bg-gray-600 transition text-gray-400 font-semibold rounded-lg py-2 mt-2 text-lg"
      disabled={true}
    >
      {info}
    </button>
  );
};

export default InfoButton;
