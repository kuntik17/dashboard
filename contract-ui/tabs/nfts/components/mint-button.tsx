import { NFTMintForm } from "./mint-form";
import { Icon, useDisclosure } from "@chakra-ui/react";
import { NFTContract, useMintNFT } from "@thirdweb-dev/react";
import { extensionDetectedState } from "components/buttons/ExtensionDetectButton";
import React from "react";
import { FiPlus } from "react-icons/fi";
import { Button, Drawer } from "tw-components";

interface NFTMintButtonProps {
  contract: NFTContract;
}

export const NFTMintButton: React.FC<NFTMintButtonProps> = ({
  contract,
  ...restButtonProps
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const mutation = useMintNFT(contract);

  const detectedState = extensionDetectedState({
    contract,
    feature: ["ERC721Mintable", "ERC1155Mintable"],
  });

  if (detectedState !== "enabled") {
    return null;
  }

  return (
    <>
      <Drawer
        allowPinchZoom
        preserveScrollBarGap
        size="lg"
        onClose={onClose}
        isOpen={isOpen}
      >
        <NFTMintForm contract={contract} mintMutation={mutation} />
      </Drawer>
      <Button
        colorScheme="primary"
        leftIcon={<Icon as={FiPlus} />}
        {...restButtonProps}
        onClick={onOpen}
      >
        Mint
      </Button>
    </>
  );
};
