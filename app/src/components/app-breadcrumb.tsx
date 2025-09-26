import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";
import { SidebarTrigger } from "./ui/sidebar";

export default function AppBreadcrumb(){
  const location = useLocation();
  const segments = location.pathname.split('/');
  const breadCrumbList = () => {
    if( segments.filter(s => s === '').length === 2 ){
      return (<>
        <BreadcrumbSeparator>|</BreadcrumbSeparator>
        <BreadcrumbItem>
          <Link to="/">Home</Link>
        </BreadcrumbItem>
      </>)
    }
    return segments.map((s, i) => {
      let breadCrumbSeperator = s === '' ? <BreadcrumbSeparator key={`BS-${i}`}>|</BreadcrumbSeparator> : <BreadcrumbSeparator key={`BS-${i}`}/>
      let link = s === '' ? <Link key={`BL-${i}`} to="/">Home</Link> : <Link key={`BL-${i}`} to={`./${s}`}>{s}</Link>
      return (<>
        {breadCrumbSeperator}
        <BreadcrumbItem key={`BC-${i}`}>{link}</BreadcrumbItem>
      </>);
    })
  }

  return (<div className="bread-crumb">
    <Breadcrumb>
      <BreadcrumbList>
        <SidebarTrigger/>
        {breadCrumbList()}
        {/* Put rest of breadcrumbs here */}
      </BreadcrumbList>
    </Breadcrumb>
  </div>)
}
