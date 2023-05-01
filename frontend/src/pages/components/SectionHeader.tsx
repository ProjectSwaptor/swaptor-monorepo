type SectionHeaderProps = {
  children: React.ReactNode;
};

const SectionHeader = ({ children }: SectionHeaderProps) => {
  return (
    <h2 className="text-[2.5rem] leading-[2.5rem] font-bold text-center sm:leading-[4rem] sm:text-[3.4rem]">
      {children}
    </h2>
  );
};

export default SectionHeader;
