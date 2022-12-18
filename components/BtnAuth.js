import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function BtnAuth() {
  const { data: session } = useSession();
  console.log(session);
  if (session) {
    return (
      <>
        <h1>Welcome {session.user.name}</h1>
        Signed in as {session.user.email} <br />
        <Image src={session.user.image} width={400} height={400} />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
