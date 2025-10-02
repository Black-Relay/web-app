export function Switch({labels}:{labels: Array<string>}){

  return (<div>
    {labels.map((label, index)=>{return <div key={index}>{label}</div>})}
  </div>)
}