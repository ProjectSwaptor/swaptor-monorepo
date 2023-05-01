type OptionContainerProps = {
  children: React.ReactNode;
};

const OptionContainer = ({ children }: OptionContainerProps) => (
  <div className="w-full">
    <div className="p-4">{children}</div>
    <hr className="h-[1px] bg-gray-600 border-0" />
  </div>
);

export default OptionContainer;
