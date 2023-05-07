import { bot } from "./bot";
import goTo from "./goto";
import { VM } from "vm2";

const commands = [
  {
    name: "goto",
    parameters: [
      {
        name: "coordinates",
        type: "string",
      },
      {
        name: "withinDistance",
        type: "number",
        default: "1",
      },
    ],
    description: 'format coords as either "x z" or "y"',
  },
  {
    name: "say",
    parameters: [
      {
        name: "message",
        type: "string",
      },
    ],
    description: "say something, such as why you are going somewhere",
  },
];

export const pluginInstructions = `
Commands run in node. For example:
goto(0, 0); say("I'm going to 0, 0!");

Available commands:
${commands
  .map(
    (command) =>
      `${command.name}(${command.parameters
        .map(
          (parameter) =>
            `${parameter.name}: ${parameter.type}${
              parameter.default ? " = " + parameter.default : ""
            }`
        )
        .join(", ")}) - ${command.description}`
  )
  .join("\n")}
`;

export const parsePrompt = (text: string) => {
  const commands = text.split(";").map((command) => command.trim());
  commands.forEach((command) => {
    if (command) parseCommand(command);
  });
};

const parseCommand = (text: string) => {
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
    ${text};
    output;
  `;

  const output = vm.run(sandbox);

  for (const command of output) {
    const [first, second] = command.args;
    switch (command.command) {
      case "goto":
        if (
          typeof first === "string" &&
          (typeof second === "number" || second === undefined)
        )
          goTo(first, second);
        break;
      case "say":
        if (typeof first === "string") bot.chat(first);
        break;
    }
  }
};
