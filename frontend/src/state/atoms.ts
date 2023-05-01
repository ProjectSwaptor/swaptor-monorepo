import { atom } from "recoil";

export const swapActive = atom<boolean | undefined>({
  key: "swapActive",
  default: undefined,
});
