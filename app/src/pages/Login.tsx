import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormEvent } from "react";
import { postLogin } from "@/utils/fetch-requests";
import { useUserContext } from "@/providers/UserProvider";


export function Login() {
  const {setUser} = useUserContext();

  async function submitHandler(event:FormEvent){
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const payload = {
      "username": username,
      "password": password
    }
    const response = await postLogin(payload);
    if( response?.status ){ return }

    setUser({username: username, ...response, role: "user"});
  }

  return (<div className="layout-public-content">
    <Card className="w-full max-w-sm main-display">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your username and password below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login" onSubmit={(e)=>{submitHandler(e)}}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="test"
                placeholder="username"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" form="login">
          Login
        </Button>
      </CardFooter>
    </Card>
  </div>);
}
