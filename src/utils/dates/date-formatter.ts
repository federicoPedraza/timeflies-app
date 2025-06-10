import { endOfMonth, format, startOfMonth } from 'date-fns'

export const formatDate = (date: Date, formatString: string) => {
    return format(date, formatString);
};

export const getStartOfMonth = (date: Date) => {
    return startOfMonth(date)
}

export const getEndOfMonth = (date: Date) => {
    return endOfMonth(date)
}
