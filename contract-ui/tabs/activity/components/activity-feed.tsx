import { useActivity } from "@3rdweb-sdk/react/hooks/useActivity";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  ButtonGroup,
  Center,
  Divider,
  Flex,
  FormControl,
  Icon,
  LightMode,
  List,
  SimpleGrid,
  Stack,
  Switch,
  Tooltip,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { ContractEvent } from "@thirdweb-dev/sdk";
import { AnimatePresence, motion } from "framer-motion";
import { bigNumberReplacer } from "pages/_app";
import React, { useState } from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { FiChevronDown, FiCopy } from "react-icons/fi";
import {
  Button,
  Card,
  CodeBlock,
  FormLabel,
  Heading,
  Text,
} from "tw-components";

interface ContractTransaction {
  transactionHash: ContractEvent["transaction"]["transactionHash"];
  blockNumber: ContractEvent["transaction"]["blockNumber"];
  events: ContractEvent[];
}

interface ActivityFeedProps {
  contractAddress?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  contractAddress,
}) => {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const activityQuery = useActivity(contractAddress, autoUpdate);

  return (
    <Flex gap={3} flexDirection="column">
      <Flex align="center" justify="space-between" w="full">
        <Heading size="subtitle.md">Latest Transactions</Heading>
        <Box>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="auto-update" mb="0">
              Auto-Update
            </FormLabel>
            <LightMode>
              <Switch
                isChecked={autoUpdate}
                onChange={() => setAutoUpdate((val) => !val)}
                id="auto-update"
              />
            </LightMode>
          </FormControl>
        </Box>
      </Flex>
      {activityQuery.data && contractAddress && (
        <Card p={0} overflow="hidden">
          <SimpleGrid
            gap={2}
            columns={12}
            borderBottomWidth="1px"
            borderColor="borderColor"
            padding={4}
            bg="blackAlpha.50"
            _dark={{ bg: "whiteAlpha.50" }}
          >
            <Heading gridColumn="span 4" size="label.md">
              Transaction Hash
            </Heading>
            <Heading gridColumn="span 5" size="label.md">
              Events
            </Heading>
            <Heading gridColumn="span 3" size="label.md">
              Block Number
            </Heading>
          </SimpleGrid>

          <List overflow="auto">
            <Accordion
              as={AnimatePresence}
              initial={false}
              allowToggle
              allowMultiple
            >
              {activityQuery.data.slice(0, 10).map((e) => (
                <ActivityFeedItem key={e.transactionHash} transaction={e} />
              ))}
            </Accordion>
          </List>
        </Card>
      )}
    </Flex>
  );
};

interface ActivityFeedItemProps {
  transaction: ContractTransaction;
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({
  transaction,
}) => {
  const toast = useToast();
  const { onCopy } = useClipboard(transaction.transactionHash);

  return (
    <AccordionItem
      borderBottom="none"
      borderColor="borderColor"
      _first={{ borderTop: "none" }}
    >
      <AccordionButton padding={0}>
        <SimpleGrid
          columns={12}
          gap={2}
          as={motion.li}
          initial={{
            y: -30,
            opacity: 0,
            paddingTop: 0,
            paddingBottom: 0,
            height: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
            height: "auto",
            paddingTop: "var(--chakra-space-3)",
            paddingBottom: "var(--chakra-space-3)",
            transition: { duration: 0.15 },
          }}
          exit={{
            y: 30,
            opacity: 0,
            paddingTop: 0,
            paddingBottom: 0,
            height: 0,
            transition: { duration: 0.3 },
          }}
          willChange="opacity, height, paddingTop, paddingBottom"
          borderBottomWidth="1px"
          borderColor="borderColor"
          padding={4}
          overflow="hidden"
          alignItems="center"
          _last={{ borderBottomWidth: 0 }}
        >
          <Box gridColumn="span 3">
            <Stack direction="row" align="center" spacing={3}>
              <Tooltip
                p={0}
                bg="transparent"
                boxShadow="none"
                label={
                  <Card py={2} px={4}>
                    <Text size="label.sm">
                      Copy transaction hash to clipboard
                    </Text>
                  </Card>
                }
              >
                <Button
                  size="sm"
                  bg="transparent"
                  onClick={() => {
                    onCopy();
                    toast({
                      variant: "solid",
                      position: "bottom",
                      title: "Transaction hash copied.",
                      status: "success",
                      duration: 5000,
                      isClosable: true,
                    });
                  }}
                >
                  <Icon as={FiCopy} boxSize={3} />
                </Button>
              </Tooltip>
              <Text fontFamily="mono" noOfLines={1}>
                {transaction.transactionHash.slice(0, 32)}...
              </Text>
            </Stack>
          </Box>

          <Box gridColumn="span 1" />

          <ButtonGroup
            size="sm"
            variant="outline"
            gridColumn="span 5"
            flexWrap="wrap"
            gap={2}
            spacing={0}
            pointerEvents="none"
          >
            {transaction.events.slice(0, 2).map((e, idx) => (
              <Button as="span" key={idx}>
                {e.eventName}
              </Button>
            ))}
            {transaction.events.length > 2 && (
              <Button as="span">+ {transaction.events.length - 2}</Button>
            )}
          </ButtonGroup>

          <Box gridColumn="span 3">
            <Stack direction="row" justify="space-between">
              <Text fontFamily="mono" noOfLines={1}>
                {transaction.blockNumber}
              </Text>
              <Box>
                <Icon as={FiChevronDown} />
              </Box>
            </Stack>
          </Box>
        </SimpleGrid>
      </AccordionButton>
      <AccordionPanel>
        <Card>
          <Stack spacing={4}>
            <Heading size="subtitle.sm" fontWeight="bold">
              Transaction Data
            </Heading>

            <Divider />

            <TransactionData
              name="Transaction Hash"
              value={transaction.transactionHash}
              description={`
                  A transaction hash is a unique 66 character identifier
                  that is generated whenever a transaction is executed.
                `}
            />

            <TransactionData
              name="Block Number"
              value={transaction.blockNumber}
              description={`
                  The number of the block in which the transaction was recorded.
                  Block confirmation indicate how many blocks since the transaction was validated.
                `}
            />

            <Heading size="subtitle.sm" fontWeight="bold" pt={6}>
              Event Data
            </Heading>

            <Divider />

            {transaction.events.map((event, idx, arr) => (
              <React.Fragment
                key={`${event.transaction.transactionHash}_${event.transaction.logIndex}`}
              >
                <SimpleGrid columns={12} gap={2}>
                  <Box gridColumn="span 3">
                    <Text fontWeight="bold">{event.eventName}</Text>
                  </Box>

                  <CodeBlock
                    gridColumn="span 9"
                    code={JSON.stringify(event.data, bigNumberReplacer, 2)}
                    language="json"
                  />
                </SimpleGrid>

                {arr.length - 1 === idx ? null : <Divider />}
              </React.Fragment>
            ))}
          </Stack>
        </Card>
      </AccordionPanel>
    </AccordionItem>
  );
};

interface TransactionDataProps {
  name: string;
  value: string | number;
  description: string;
}

const TransactionData: React.FC<TransactionDataProps> = ({
  name,
  value,
  description,
}) => {
  return (
    <>
      <SimpleGrid columns={12} gap={2}>
        <Stack direction="row" align="center" gridColumn="span 3">
          <Tooltip
            p={0}
            bg="transparent"
            boxShadow="none"
            label={
              <Card py={2} px={4}>
                <Text size="label.sm">{description}</Text>
              </Card>
            }
          >
            <Center>
              <Icon as={AiOutlineQuestionCircle} color="gray.600" />
            </Center>
          </Tooltip>

          <Text fontWeight="bold">{name}</Text>
        </Stack>

        <Text gridColumn="span 9">{value}</Text>
      </SimpleGrid>
      <Divider />
    </>
  );
};
