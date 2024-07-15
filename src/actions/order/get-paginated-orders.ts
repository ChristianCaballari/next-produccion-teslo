"use server";

import { auth } from "@/auth.config";
import prisma from "@/lib/prisma";

export const getPaginatedOrders = async () => {
  const session = await auth();

  try {
    if (session?.user.role !== "admin") {
      return {
        ok: false,
        message: "Debe estar autenticado",
      };
    }
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        OrderAddress: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      ok: true,
      orders: orders,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "Hable con el administrador",
    };
  }
};
