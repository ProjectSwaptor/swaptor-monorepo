type ContainerProps = {
  children: React.ReactNode;
};

const Container = ({ children }: ContainerProps) => {
  return (
    <div className="relative flex flex-col items-center justify-center 2xl:max-w-8xl 2xl:mx-auto">
      {children}
    </div>
  );
};

export default Container;
