import type { Dayjs } from 'dayjs';
import { AppDateFormats } from '~/types';

export function formatToPhone(input: string) {
  return `(${input.slice(0, 3)}) ${input.slice(3, 6)} - ${input.slice(6)}`;
}

export function formatToAppDate(input: string | Date) {
  return useDayjs()(input).format(AppDateFormats.DATE);
}

export function formatToAppTime(input: string | Date | Dayjs) {
  return useDayjs()(input).format(`${AppDateFormats.TIME} ${AppDateFormats.PERIOD}`);
}

export function formatToAppDateTime(input: string | Date | Dayjs) {
  return useDayjs()(input).format(`${AppDateFormats.DATE} ${AppDateFormats.SEPARATOR} ${AppDateFormats.TIME}`);
}

export function formatToAppDateTimePeriod(input: string | Date | Dayjs) {
  return useDayjs()(input).format(`${AppDateFormats.DATE} ${AppDateFormats.SEPARATOR} ${AppDateFormats.TIME} ${AppDateFormats.PERIOD}`);
}

export function formatToServerTime(input: string | Date | Dayjs) {
  return useDayjs()(input).format(AppDateFormats.SERVER);
}
