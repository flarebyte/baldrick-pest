export interface ShellResponse {
    exitCode: number;
    stdout?: string;
    stderr?: string;

    stdouterr?: string;
}

export interface Context {
    steps: ShellResponse[];
}