type BenefitProps = {
  header: string;
  paragraph: string;
};

const Benefit = ({ header, paragraph }: BenefitProps) => {
  return (
    <div className="rounded-container flex flex-col text-center justify-center h-[18rem] p-8">
      <h1 className="text-2xl font-bold mb-5">{header}</h1>
      <span className="font-normal">{paragraph}</span>
    </div>
  );
};

export default Benefit;
