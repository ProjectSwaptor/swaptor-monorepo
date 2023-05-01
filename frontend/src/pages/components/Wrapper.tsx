type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper = ({ children }: WrapperProps) => {
  return <div className="w-full px-4 md:px-8 xl:px-36">{children}</div>;
};

export default Wrapper;
