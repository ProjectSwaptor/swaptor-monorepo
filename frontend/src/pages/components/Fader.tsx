type FaderProps = {
  showChildren: boolean;
  children: React.ReactNode;
};

const Fader = ({ showChildren, children }: FaderProps) => {
  return (
    <span
      className={`absolute transition-all duration-200 ${
        showChildren ? "opacity-100 z-50" : "opacity-0 -z-50"
      }`}
    >
      {children}
    </span>
  );
};

export default Fader;
