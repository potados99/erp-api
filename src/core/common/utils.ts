import uuid from 'uuid-with-v6';

export function oneOf(array: Array<any>) {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateUUID(): string {
  return uuid.v6();
}
