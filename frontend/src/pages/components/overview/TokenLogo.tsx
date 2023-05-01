import Image from "next/image";

const TokenLogo = ({ tokenAddress }: { tokenAddress: string }) => {
  return (
    <div className="absolute w-full -inset-y-8">
      <div className="flex items-center justify-center rounded-full h-16 w-16 bg-[#1F2937] mx-auto">
        <Image
          src={`https://source.boringavatars.com/marble/120/${tokenAddress}`}
          unoptimized
          alt="Token"
          height={48}
          width={48}
        />
      </div>
    </div>
  );
};

export default TokenLogo;
