type BalanceDisplayProps = {
  balance?: string;
};

const BalanceDisplay = ({ balance }: BalanceDisplayProps) => (
  <p className="my-auto text-sm font-light text-gray-400 truncate">
    Balance: {balance}
  </p>
);

export default BalanceDisplay;
