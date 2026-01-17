'use client';

import { FormEvent, useEffect, useState } from "react";

function Name({name}: {name: string}) {
  return (
    <div className="flex max-w-100 min-w-70 border-5 border-blue-400">
      <p className="text-xl">{name}</p>
    </div>
  )
}

type HelloName = {
  id: number;
  name: string;
}
export default function Home() {
  const [nameList, setNameList] = useState<HelloName[]>([]);
  const [currentName, setCurrentName] = useState<string>("");

  const api_url = process.env.NEXT_PUBLIC_API_URL;
  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch(`${api_url}/hello`);
        const result = await response.json();
        setNameList(result);
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, [])

  const addName = async () => {
    try {
      const request = await fetch(`${api_url}/hello`, {
        method: "POST",
        body: JSON.stringify({name: currentName}),
        headers: {
          "Content-Type": "application/json"
        }
      })
      const response = await request.json();
      console.log(`Added name ${response.name} with id ${response.id}`);
      setNameList([...nameList, response]);
    } catch (error) {
      console.error(error);
    }
  }
  return (
<div className="flex flex-col justify-center items-center w-screen h-screen">
  <p className="text-blue-500 text-6xl">Hello world</p>
  <p className="text-blue-500 text-4xl">Nhập tên của bạn: ABC</p>
  <div className="flex-col justify-evenly">
    {nameList.map((value: HelloName) => (
      <Name key={value.id} name={value.name} />
    ))}
  </div>

  <div className="flex">
    <input type="text" value={currentName} onChange={e=>setCurrentName(e.target.value)} />
    <button onClick={()=>addName()}>Submit</button>
  </div>
</div>
  );
}
