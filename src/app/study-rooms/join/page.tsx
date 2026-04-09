import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function StudyRoomJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; inviteToken?: string }>;
}) {
  const params = await searchParams;
  const code = (params.code || "").toUpperCase();
  const inviteToken = params.inviteToken || "";
  const target = code ? `/study-rooms/${code}${inviteToken ? `?inviteToken=${encodeURIComponent(inviteToken)}` : ""}` : "/study-rooms";

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Study room invite</CardTitle>
        </CardHeader>
        <CardContent className="grid place-items-center gap-4">
          <p className="text-muted-foreground">
            You are invited to join study room
          </p>
          <Badge variant="outline" className="font-mono">
            {code || "UNKNOWN"}
          </Badge>
          <Button asChild>
            <Link href={target}>Continue to room</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

