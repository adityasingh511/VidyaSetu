import { NextResponse } from 'next/server';
import {prisma} from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    // Bypassing strict TS checking on the user ID
    if (!session || !(session.user as any)?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

    const existingNotification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existingNotification || existingNotification.userId !== (session.user as any).id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}