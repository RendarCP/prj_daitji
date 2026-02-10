import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ItemAddClient } from "./ItemAddClient";
import { Header } from "@/components/layout/Header";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "물품 추가 - DAITJI",
  description: "새로운 물품을 등록하세요",
};

export default async function ItemAddPage() {
  const supabase = await createClient();

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/auth/login')
  // }

  return (
    <>
      <Header />
      <ItemAddClient />
    </>
  );
}
