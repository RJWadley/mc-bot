import { bot } from "../bot";
import goTo from "../commands/goto";
import { VM } from "vm2";
import { sayTextWithDelay } from "../commands/say";

const commands = [
  {
    name: "setGoal",
    parameters: [
      {
        name: "coordinates",
        type: "string",
      },
      {
        name: "withinDistance",
        type: "number",
        default: "= 1",
      },
    ],
    description: `set a goal for the bot to go to
    format coords as "x y z", or "x z" if you don\'t know y.`,
  },
  {
    name: "say",
    parameters: [
      {
        name: "message",
        type: "string",
      },
    ],
    description: "say a chat message",
  },
  {
    name: "done",
    parameters: [],
    description: "exit the process until the next message",
  },
];

export const pluginInstructions = `
# Available Functions
You have the following functions available to you:
${commands
  .map(
    (command) =>
      `\`${command.name}(${command.parameters
        .map(
          (parameter) =>
            `${parameter.name}: ${parameter.type}${
              parameter.default ? " = " + parameter.default : ""
            }`
        )
        .join(", ")})\` ${command.description}`
  )
  .join("\n")}
`;

export const parsePrompt = (text: string) => {
  // create a sandboxed environment to run the command in
  const vm = new VM();

  const commandCode = commands
    .map((command) => {
      const parameters = command.parameters
        .map((parameter) => parameter.name)
        .join(", ");
      return `
        const ${command.name} = (${parameters}) => {
            output.push({
                command: "${command.name}",
                args: [${parameters}]
            })
        };
    `;
    })
    .join("\n");

  const sandbox = `
    const output = [];
    ${commandCode}
    ${text.split("done()")[0]};
    output;
  `;

  let output = vm.run(sandbox);

  if (Array.isArray(output))
    for (const command of output) {
      const [first, second] = command.args;
      switch (command.command) {
        case "setGoal":
          if (
            typeof first === "string" &&
            (typeof second === "number" || second === undefined)
          )
            goTo(first, second);
          break;
        case "say":
          if (typeof first === "string") sayTextWithDelay(first);
          break;
        default:
          console.error(`Unknown command ${command.command}`);
      }
    }
};
