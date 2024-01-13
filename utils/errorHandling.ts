import type { ErrorLike } from '~/types';

export function hasMessage(error: unknown): error is ErrorLike {
  return typeof error === 'object'
    && typeof (error as ErrorLike).message === 'string';
}

export function getUnknownErrorMessage(error: unknown): string {
  if (hasMessage(error))
    return error.message;
  return 'An unknown error occurred.';
}
