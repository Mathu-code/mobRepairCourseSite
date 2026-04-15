export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ClassValue = string | number | boolean | undefined | null | ClassValue[]

function clsx(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
}

function twMerge(...inputs: string[]): string {
  return inputs.join(' ')
}
