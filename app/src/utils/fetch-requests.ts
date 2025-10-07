const baseUrl = "http://localhost"
const port = "3001"
const url = `${baseUrl}:${port}/`

export async function postLogin(payload:{username: string, password: string}){
  return await fetch(`${url}auth/login`, {method: "POST", headers:{"Content-Type": "application/json"}, body: JSON.stringify(payload)})
}