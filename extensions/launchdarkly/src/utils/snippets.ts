import { LDFlag } from "../types";

export interface Snippet {
  id: string;
  title: string;
  code: string;
}

function toCamelCase(key: string): string {
  return key.replace(/[-_.](\w)/g, (_, c: string) => c.toUpperCase());
}

/** Default value literal per language, based on the flag kind. */
function defaults(flag: LDFlag) {
  const isBoolean = flag.kind === "boolean";
  return {
    isBoolean,
    js: isBoolean ? "false" : '"default"',
    py: isBoolean ? "False" : '"default"',
    go: isBoolean ? "false" : '"default"',
    java: isBoolean ? "false" : '"default"',
    ruby: isBoolean ? "false" : '"default"',
  };
}

/** SDK evaluation snippets for the most common LaunchDarkly server and client SDKs. */
export function getSnippets(flag: LDFlag): Snippet[] {
  const d = defaults(flag);
  const key = flag.key;
  return [
    {
      id: "node",
      title: "JavaScript / Node.js",
      code: `const value = await ldClient.variation("${key}", context, ${d.js});`,
    },
    {
      id: "react",
      title: "TypeScript (React SDK)",
      code: `const { ${toCamelCase(key)} } = useFlags();`,
    },
    {
      id: "python",
      title: "Python",
      code: `value = ld_client.variation("${key}", context, ${d.py})`,
    },
    {
      id: "go",
      title: "Go",
      code: d.isBoolean
        ? `value, _ := ldClient.BoolVariation("${key}", context, ${d.go})`
        : `value, _ := ldClient.StringVariation("${key}", context, ${d.go})`,
    },
    {
      id: "java",
      title: "Java",
      code: d.isBoolean
        ? `boolean value = ldClient.boolVariation("${key}", context, ${d.java});`
        : `String value = ldClient.stringVariation("${key}", context, ${d.java});`,
    },
    {
      id: "ruby",
      title: "Ruby",
      code: `value = ld_client.variation("${key}", context, ${d.ruby})`,
    },
  ];
}
