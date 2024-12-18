const MAX_TIMESLOT = (process.env.MAX_TIMESLOT === undefined) ? 11 : parseInt(process.env.MAX_TIMESLOT);
const MAX_DAY = (process.env.MAX_DAY === undefined) ? 4 : parseInt(process.env.MAX_DAY);
const MAX_SCHEDULE_LENGTH = (process.env.MAX_SCHEDULE_LENGTH === undefined) ? 3 : parseInt(process.env.MAX_SCHEDULE_LENGTH);
const MAX_RESERVE_LENGTH = (process.env.MAX_RESERVE_LENGTH === undefined) ? 3 : parseInt(process.env.MAX_RESERVE_LENGTH);

export default [MAX_TIMESLOT, MAX_DAY, MAX_SCHEDULE_LENGTH, MAX_RESERVE_LENGTH];
