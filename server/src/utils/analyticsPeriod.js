const indiaDate=value=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(value);

export function getAnalyticsDateRange(period,now=new Date()){
  const end=new Date(now);
  const start=new Date(end);
  if(period==="today"){
    const date=indiaDate(end);
    start.setTime(new Date(`${date}T00:00:00+05:30`).getTime());
  }else if(period==="week")start.setTime(end.getTime()-7*24*60*60*1000);
  else if(period==="month")start.setTime(end.getTime()-30*24*60*60*1000);
  else throw new Error("Choose a supported analytics period.");
  return {start,end};
}
