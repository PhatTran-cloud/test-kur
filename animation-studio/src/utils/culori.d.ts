declare module "culori" {
  export function interpolate(
    colors: string[],
    mode?: string
  ): (t: number) => Record<string, number>;
  export function formatRgb(color: Record<string, number> | undefined): string;
  export function parse(color: string): Record<string, number> | undefined;
}
