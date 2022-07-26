/*

 
{
  weekday: 'narrow' | 'short' | 'long',
  era: 'narrow' | 'short' | 'long',
  year: 'numeric' | '2-digit',
  month: 'numeric' | '2-digit'12 | 'narrow' D | 'short' Dec | 'long' December,
  day: 'numeric' | '2-digit',
  hour: 'numeric' | '2-digit',
  minute: 'numeric' | '2-digit',
  second: 'numeric' | '2-digit',
  timeZoneName: 'short' | 'long',

  // Time zone to express it in
  timeZone: 'Asia/Shanghai',
  // Force 12-hour or 24-hour
  hour12: true | false,

  // Rarely-used options
  hourCycle: 'h11' | 'h12' | 'h23' | 'h24',
  formatMatcher: 'basic' | 'best fit'
}

todo going to redo this to serve all epoch time in ms
*/

const formatMoEpicTime = (moEpicTime) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
    return Intl.DateTimeFormat("en-US", options).format(new Date(moEpicTime ));
}

const formatMoEpicTimeHHMM = (moEpicTime) => {
    const options = { hour: "numeric", minute: "numeric" };
    return Intl.DateTimeFormat("en-US", options).format(new Date(moEpicTime ));
}

const formatMoEpicTimeHHMM_MMDD = (moEpicTime) => {
    const options = { hour: "numeric", minute: "numeric", month: "numeric", day: "numeric"};
    return Intl.DateTimeFormat("en-US", options).format(new Date(moEpicTime ));
}

const formatMoEpicTimeMMDDYY = (moEpicTime) => {
    const options = { month: "2-digit", day: "numeric", year: "numeric" };
    return Intl.DateTimeFormat("en-US", options).format(new Date(moEpicTime ));
}
// remember to deivide moEpicTime / 1000000
export { formatMoEpicTime, formatMoEpicTimeHHMM, formatMoEpicTimeMMDDYY, formatMoEpicTimeHHMM_MMDD }
