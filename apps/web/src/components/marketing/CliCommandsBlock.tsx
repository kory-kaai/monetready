import { CLI_COMMANDS } from "@/lib/oss";

interface CliCommandsBlockProps {
  compact?: boolean;
}

export function CliCommandsBlock({ compact = false }: CliCommandsBlockProps) {
  const commands = compact
    ? [
        { label: "New project", command: CLI_COMMANDS.create },
        { label: "Existing repo", command: CLI_COMMANDS.init },
        { label: "Run audit", command: CLI_COMMANDS.score },
      ]
    : [
        { label: "Scaffold", command: CLI_COMMANDS.create },
        { label: "Init spec", command: CLI_COMMANDS.init },
        { label: "Score audit", command: CLI_COMMANDS.score },
        { label: "Local dashboard", command: CLI_COMMANDS.dashboard },
      ];

  return (
    <div className="cli-grid">
      {commands.map(({ label, command }) => (
        <div key={label} className="cli-card">
          <span className="cli-label">{label}</span>
          <code>{command}</code>
        </div>
      ))}
    </div>
  );
}
