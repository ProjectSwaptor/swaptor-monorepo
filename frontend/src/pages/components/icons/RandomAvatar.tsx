import Image from "next/image";

type RandomAvatarProps = {
  seed: string;
};

const RandomAvatar = ({ seed }: RandomAvatarProps) => (
  <Image
    loader={() => `https://source.boringavatars.com/marble/120/${seed}`}
    src={`https://source.boringavatars.com/marble/120/${seed}`}
    alt="random avatar"
    fill
  />
);

export default RandomAvatar;
