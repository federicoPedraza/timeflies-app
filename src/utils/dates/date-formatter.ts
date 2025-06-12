import { format } from 'date-fns'
import moment from 'moment-timezone'

export const formatDate = (date: Date, formatString: string) => {
    return format(date, formatString);
};

export const getStartOfMonth = (date: Date, timezone: string) => {
    const momentDate = moment.utc(date).tz(timezone)
    return momentDate.startOf('month').toDate()
}

export const getEndOfMonth = (date: Date, timezone: string) => {
    const momentDate = moment.utc(date).tz(timezone)
    return momentDate.endOf('month').toDate()
}
