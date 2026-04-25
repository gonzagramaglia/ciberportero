import RoomChatClient from "@/components/RoomChatClient";
import { auth } from "@/auth";

export default async function RoomMainPage({ params }: any) {
  const { roomId } = await params;
  const session = await auth();
  const isGuest = roomId.startsWith('guest-') || roomId === 'test-room' || !session;

  return (
    <RoomChatClient 
      subcategoryId={null} 
      initialMessages={[]} 
      session={session} 
      isGuest={isGuest}
    />
  );
}
