import { useActiveChainId } from "@3rdweb-sdk/react";
import { useBreakpointValue } from "@chakra-ui/media-query";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Flex,
  FormControl,
  Input,
  Link,
  Select,
  Stack,
  useClipboard,
} from "@chakra-ui/react";
import {
  EditionDrop,
  Marketplace,
  NFTDrop,
  SignatureDrop,
  TokenDrop,
  ValidContractInstance,
} from "@thirdweb-dev/sdk";
import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import { IoMdCheckmark } from "react-icons/io";
import {
  Button,
  Card,
  CodeBlock,
  FormHelperText,
  FormLabel,
  Heading,
} from "tw-components";

interface EmbedSetupProps {
  contract?: ValidContractInstance;
}

const IPFS_URI = "ipfs://QmUfp6thZQTmNKS6tzijJpxdoBe9X7spHwzRjUh3RPTAwF";

const getContractEmbedHash = (contract?: ValidContractInstance) => {
  if (contract instanceof NFTDrop) {
    // NFT drop contract embed hash
    return `${IPFS_URI}/nft-drop.html`;
  }
  if (contract instanceof EditionDrop) {
    // Edition drop contract embed hash
    return `${IPFS_URI}/edition-drop.html`;
  }
  if (contract instanceof Marketplace) {
    // Marketplace contract embed hash
    return `${IPFS_URI}/marketplace.html`;
  }
  if (contract instanceof TokenDrop) {
    // Token drop contract embed hash
    return `${IPFS_URI}/token-drop.html`;
  }
  if (contract instanceof SignatureDrop) {
    // Signature drop contract embed hash
    return `${IPFS_URI}/signature-drop.html`;
  }

  return null;
};

interface IframeSrcOptions {
  rpcUrl: string;
  ipfsGateway: string;
  chainId?: number;
  tokenId?: number;
  listingId?: number;
  relayUrl?: string;
  theme?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const colorOptions = [
  "blue",
  "orange",
  "pink",
  "green",
  "purple",
  "red",
  "teal",
  "cyan",
  "yellow",
];

const buildIframeSrc = (
  contract?: ValidContractInstance,
  options?: IframeSrcOptions,
): string => {
  const contractEmbedHash = getContractEmbedHash(contract);
  if (!contract || !options || !contractEmbedHash || !options.chainId) {
    return "";
  }

  const {
    rpcUrl,
    ipfsGateway,
    chainId,
    tokenId,
    listingId,
    relayUrl,
    theme,
    primaryColor,
    secondaryColor,
  } = options;

  const url = new URL(contractEmbedHash.replace("ipfs://", ipfsGateway));

  url.searchParams.append("contract", contract.getAddress());
  url.searchParams.append("chainId", chainId.toString());

  if (tokenId !== undefined && contract instanceof EditionDrop) {
    url.searchParams.append("tokenId", tokenId.toString());
  }
  if (listingId !== undefined && contract instanceof Marketplace) {
    url.searchParams.append("listingId", listingId.toString());
  }
  if (rpcUrl) {
    url.searchParams.append("rpcUrl", rpcUrl);
  }
  if (relayUrl) {
    url.searchParams.append("relayUrl", relayUrl);
  }
  if (theme && theme !== "light") {
    url.searchParams.append("theme", theme);
  }
  if (primaryColor && primaryColor !== "blue") {
    url.searchParams.append("primaryColor", primaryColor);
  }
  if (secondaryColor && secondaryColor !== "orange") {
    url.searchParams.append("secondaryColor", secondaryColor);
  }
  return url.toString();
};
export const EmbedSetup: React.FC<EmbedSetupProps> = ({ contract }) => {
  const [ipfsGateway, setIpfsGateway] = useState(
    "https://gateway.ipfscdn.io/ipfs/",
  );
  const [rpcUrl, setRpcUrl] = useState("");
  const [relayUrl, setRelayUrl] = useState("");
  const [tokenId, setTokenId] = useState(0);
  const [listingId, setListingId] = useState(0);
  const [theme, setTheme] = useState("light");
  const [primaryColor, setPrimaryColor] = useState("blue");
  const [secondaryColor, setSecondaryColor] = useState("orange");

  const chainId = useActiveChainId();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const iframeSrc = buildIframeSrc(contract, {
    chainId,
    ipfsGateway,
    rpcUrl,
    tokenId,
    listingId,
    relayUrl,
    theme,
    primaryColor,
    secondaryColor,
  });

  const embedCode = `<iframe
src="${iframeSrc}"
width="600px"
height="600px"
style="max-width:100%;"
frameborder="0"
></iframe>`;

  const { hasCopied, onCopy } = useClipboard(embedCode, 3000);

  return (
    <Flex gap={8} direction="column">
      <Flex gap={8} direction={{ base: "column", md: "row" }}>
        <Stack as={Card} w={{ base: "100%", md: "50%" }}>
          <Heading size="title.sm">Configuration</Heading>
          <FormControl>
            <FormLabel>IPFS Gateway</FormLabel>
            <Input
              type="url"
              value={ipfsGateway}
              onChange={(e) => setIpfsGateway(e.target.value)}
            />
          </FormControl>
          {contract instanceof Marketplace ? (
            <FormControl>
              <FormLabel>Listing ID</FormLabel>
              <Input
                type="number"
                value={listingId}
                onChange={(e) => setListingId(parseInt(e.target.value))}
              />
              <FormHelperText>
                The listing ID the embed should display
              </FormHelperText>
            </FormControl>
          ) : null}
          {contract instanceof EditionDrop ? (
            <FormControl>
              <FormLabel>Token ID</FormLabel>
              <Input
                type="number"
                value={tokenId}
                onChange={(e) => setTokenId(parseInt(e.target.value))}
              />
              <FormHelperText>
                The token ID the embed should display
              </FormHelperText>
            </FormControl>
          ) : null}
          <FormControl>
            <FormLabel>RPC Url</FormLabel>
            <Input
              type="url"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
            />
            <FormHelperText>
              Provide your own RPC url to use for this embed.
              <strong>(Recommended for production use!)</strong>
            </FormHelperText>
          </FormControl>

          {contract instanceof Marketplace ? null : (
            <FormControl>
              <FormLabel>Relayer Url</FormLabel>
              <Input
                type="url"
                value={relayUrl}
                onChange={(e) => setRelayUrl(e.target.value)}
              />
              <FormHelperText>
                Provide a relayer url to use for this embed. A relayer can be
                used to make the transaction gas-less for the end user.{" "}
                <Link
                  isExternal
                  color="blue.500"
                  href="https://portal.thirdweb.com/guides/setup-gasless-transactions"
                >
                  Learn more
                </Link>
              </FormHelperText>
            </FormControl>
          )}
          <Heading size="title.sm">Customization</Heading>
          <FormControl>
            <FormLabel>Theme</FormLabel>
            <Select onChange={(e) => setTheme(e.target.value)} value={theme}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">User system</option>
            </Select>
            <FormHelperText>
              Selecting system will make it so the embed would change depending
              on the user system&apos;s preferences
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Primary Color</FormLabel>
            <Select
              onChange={(e) => setPrimaryColor(e.target.value)}
              value={primaryColor}
            >
              {colorOptions.map((color) => (
                <option key={color} value={color}>
                  {color[0].toUpperCase() + color.substring(1)}
                </option>
              ))}
            </Select>
            <FormHelperText>
              Used for the main actions button backgrounds.
            </FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel>Secondary Color</FormLabel>
            <Select
              onChange={(e) => setSecondaryColor(e.target.value)}
              value={secondaryColor}
            >
              {colorOptions.map((color) => (
                <option key={color} value={color}>
                  {color[0].toUpperCase() + color.substring(1)}
                </option>
              ))}
            </Select>
            <FormHelperText>
              Use for secondary actions (like when the user is connected to the
              wrong network)
            </FormHelperText>
          </FormControl>
        </Stack>
        <Stack as={Card} w={{ base: "100%", md: "50%" }}>
          <Heading size="title.sm">Embed Code</Heading>
          <CodeBlock
            canCopy={false}
            whiteSpace="pre"
            overflowX="auto"
            code={embedCode}
            language="markup"
          />
          <Button
            colorScheme="purple"
            w="auto"
            variant="outline"
            onClick={onCopy}
            leftIcon={hasCopied ? <IoMdCheckmark /> : <FiCopy />}
          >
            {hasCopied ? "Copied!" : "Copy to clipboard"}
          </Button>
        </Stack>
      </Flex>

      <Stack align="center">
        <Heading size="title.sm">Preview</Heading>
        {iframeSrc ? (
          <iframe
            src={iframeSrc}
            width={isMobile ? "100%" : "600px"}
            height="600px"
            frameBorder="0"
          />
        ) : (
          <>
            {!ipfsGateway && (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle mr={2}>Missing IPFS Gateway</AlertTitle>
              </Alert>
            )}
          </>
        )}
      </Stack>
    </Flex>
  );
};
