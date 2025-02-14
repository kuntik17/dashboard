import { CodeSnippet, Environment, SupportedEnvironment } from "./types";
import { ButtonGroup, Flex, Icon, Stack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useMemo } from "react";
import {
  SiGo,
  SiJavascript,
  SiPython,
  SiReact,
  SiTypescript,
} from "react-icons/si";
import { Button, CodeBlock } from "tw-components";
import { ComponentWithChildren } from "types/component-with-children";

interface ICodeSegment {
  snippet: CodeSnippet;
  environment: Environment;
  setEnvironment: Dispatch<SetStateAction<Environment>>;
  isInstallCommand?: boolean;
  hideTabs?: boolean;
}

const Environments: SupportedEnvironment[] = [
  {
    environment: "react",
    title: "React",
    icon: SiReact,
    colorScheme: "purple",
  },
  {
    environment: "javascript",
    title: "JavaScript",
    icon: SiJavascript,
    colorScheme: "yellow",
  },
  {
    environment: "typescript",
    title: "TypeScript",
    icon: SiTypescript,
    colorScheme: "blue",
  },
  {
    environment: "python",
    title: "Python",
    icon: SiPython,
    colorScheme: "blue",
  },
  {
    environment: "go",
    title: "Go",
    icon: SiGo,
    colorScheme: "blue",
  },
];

export const CodeSegment: React.FC<ICodeSegment> = ({
  snippet,
  environment,
  setEnvironment,
  isInstallCommand,
  hideTabs,
}) => {
  const activeEnvironment: Environment = useMemo(() => {
    return (
      snippet[environment] ? environment : Object.keys(snippet)[0]
    ) as Environment;
  }, [environment, snippet]);

  const activeSnippet = useMemo(() => {
    return snippet[activeEnvironment];
  }, [activeEnvironment, snippet]);

  const lines = useMemo(
    () => (activeSnippet ? activeSnippet.split("\n") : []),
    [activeSnippet],
  );

  const code = lines.join("\n").trim();

  const environments = Environments.filter(
    (env) =>
      Object.keys(snippet).includes(env.environment) &&
      snippet[env.environment],
  );

  return (
    <Stack spacing={2}>
      {!hideTabs && (
        <Flex justify="space-between" align="flex-end">
          <Flex direction="column" gap={4}>
            <ButtonGroup
              isAttached
              size="sm"
              variant="outline"
              flexWrap="wrap"
              rowGap={2}
            >
              {environments.map((env) => (
                <SupportedEnvironmentButton
                  key={env.environment}
                  icon={<Icon as={env.icon} />}
                  active={activeEnvironment === env.environment}
                  onClick={() => setEnvironment(env.environment)}
                >
                  {env.title}
                </SupportedEnvironmentButton>
              ))}
            </ButtonGroup>
          </Flex>
        </Flex>
      )}

      <CodeBlock
        code={code}
        language={
          isInstallCommand
            ? "bash"
            : activeEnvironment === "react"
            ? "jsx"
            : activeEnvironment
        }
      />
    </Stack>
  );
};

interface ISupportedEnvironment {
  active: boolean;
  icon?: JSX.Element;
  isDisabled?: boolean;
  onClick: () => void;
}

const SupportedEnvironmentButton: ComponentWithChildren<
  ISupportedEnvironment
> = ({ active, icon, onClick, children, isDisabled }) => {
  return (
    <Button
      variant={active ? "solid" : "outline"}
      onClick={onClick}
      leftIcon={icon}
      fill={"red"}
      isDisabled={isDisabled}
    >
      {children}
    </Button>
  );
};
