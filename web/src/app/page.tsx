"use client";

import dynamic from "next/dynamic";

const Home = dynamic(
  () => import("@/components/home").then((mod) => mod.Home),
  {
    loading: () => <div>Loading...</div>,
  }
);

export default function Page() {
  return <Home />;
}
