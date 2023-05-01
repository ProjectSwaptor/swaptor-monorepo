import { ethers } from "ethers";
import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { CreateSwapDto } from "./dtos/swaps.dtos";

interface SignatureRequest {
  body: CreateSwapDto;
}

export const validateSignature = async <T extends SignatureRequest>(
  req: T,
  res: Response,
  next: NextFunction
) => {
  const {
    signature,
    id,
    swapType,
    seller,
    buyer,
    offeredTokenAddress,
    offeredTokenData,
    wantedTokenAddress,
    wantedTokenData,
    chainId,
    expirationTime,
  } = req.body;
  const hash = ethers.utils.hashMessage(
    ethers.utils.arrayify(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          [
            "string",
            "uint8",
            "address",
            "address",
            "address",
            "uint256",
            "address",
            "uint256",
            "uint256",
            "uint256",
          ],
          [
            id,
            swapType,
            seller,
            buyer,
            offeredTokenAddress,
            offeredTokenData,
            wantedTokenAddress,
            wantedTokenData,
            chainId,
            expirationTime,
          ]
        )
      )
    )
  );

  const recoveredAddress = ethers.utils.recoverAddress(hash, signature);

  if (recoveredAddress.toLowerCase() !== seller.toLowerCase()) {
    return res.status(StatusCodes.UNAUTHORIZED).send("invalid signature");
  }

  next();
};
