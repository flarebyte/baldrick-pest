export type ShellResponse = {
  exitCode: number;
  stdout?: string;
  stderr?: string;

  stdouterr?: string;
};

export type Context = {
  steps: ShellResponse[];
};
