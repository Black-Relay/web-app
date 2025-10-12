import config from "../configs/config.json";
const {baseUrl, basePort} = config;
const url = `${baseUrl}:${basePort}/`

export async function postLogin(payload:{username: string, password: string}){
  const response = await fetch(`${url}auth/login`, {method: "POST", headers:{"Content-Type": "application/json"}, body: JSON.stringify(payload), credentials: "include"})
  if( response.status == 200 ){
    return await response.json();
  } else {
    return response;
  }
}