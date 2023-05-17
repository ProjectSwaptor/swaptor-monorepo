import Image from "next/image";

type BenefitProps = {
  icon: any; // next recommends to use any for svg imports
  header: string;
  paragraph: string;
};

const Benefit = ({ icon, header, paragraph }: BenefitProps) => {
  return (
    <div className="rounded-container flex flex-col text-center justify-center p-8">
      <Image src={icon} alt={`${header} icon`} className="mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-5">{header}</h1>
      <span className="font-normal">{paragraph}</span>
    </div>
  );
};

export default Benefit;
