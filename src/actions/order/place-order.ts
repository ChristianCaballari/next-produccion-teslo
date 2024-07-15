"use server";

import { auth } from "@/auth.config";
import type { Address, Size } from "@/interfaces";
import prisma from "@/lib/prisma";

interface ProductToOrder {
  productId: string;
  quantity: number;
  size: Size;
}

export const placeOrder = async (
  productIds: ProductToOrder[],
  address: Address
) => {
  const session = await auth();
  const userId = session?.user.id;

  //Verificar informacion del usuario

  if (!userId) {
    return {
      ok: false,
      message: "No hay sesion de usuario",
    };
  }
  //Obtener la informacion de los productos
  //Nota: Recuerden que podemos llevar 2+ productos con el mismo ID

  //Buscar en la tabla de productos, donde cuyo id  exista en el arreglo del productsId
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds.map((p) => p.productId),
      },
    },
  });

  //Calcular los montos //Encabezado

  const itemsInOrder = productIds.reduce((count, p) => count + p.quantity, 0);

  //Los totales de tax, subtotal, y total
  const { subTotal, tax, total } = productIds.reduce(
    (totals, item) => {
      const productQuantity = item.quantity;
      const product = products.find((product) => product.id === item.productId);
      if (!product) throw new Error(`${item.productId} no existe - 500`);

      const subTotal = product.price * productQuantity;
      totals.subTotal += subTotal;
      totals.tax += subTotal * 0.15;
      totals.total += subTotal * 1.15;
      return totals;
    },
    { subTotal: 0, tax: 0, total: 0 }
  );

  //Crear la transaccion de base de datos.

  try {
    const prismaTx = await prisma.$transaction(async (tx) => {
      //1. Actualizar el stock de los productos

      const updatedProductsPromises = products.map((product) => {
        //Acumular los valores
        const productQuantity = productIds
          .filter((p) => p.productId === product.id)
          .reduce((acc, item) => item.quantity + acc, 0);

        if (productQuantity === 0) {
          throw new Error(`${product.id} no tiene la cantidad definidad`);
        }
        return tx.product.update({
          where: { id: product.id },
          data: {
            // inStock: product.inStock - productQuantity // No hacer
            inStock: {
              decrement: productQuantity,
            },
          },
        });
      });

      const updatedProducts = await Promise.all(updatedProductsPromises);

      // Varificar valores negativos en la existencia = no hay stock
      updatedProducts.forEach((product) => {
        if (product.inStock < 0) {
          throw new Error(`${product.title} no tiene inventario suficiente`);
        }
      });

      //2. Crear la orden - Encabezado - Detalles
      const order = await tx.order.create({
        data: {
          userId,
          itemsInOrder,
          subTotal,
          tax,
          total,

          OrderItem: {
            createMany: {
              data: productIds.map((p) => ({
                quantity: p.quantity,
                size: p.size,
                productId: p.productId,
                price:
                  products.find((producto) => producto.id === p.productId)
                    ?.price ?? 0,
              })),
            },
          },
        },
      });

      // Validar, si el price es cero, entonces, lanzar un error
      //3. Crear la direccion de la orden

      //Address
      const { country, ...restAddres } = address;
      const orderAddress = await tx.orderAddress.create({
        data: {
          ...restAddres,
          countryId: country,
          orderId: order.id,
        },
      });

      return {
        updatedProducts,
        order,
        orderAddress,
      };
    });
    return {
      ok: true,
      order: prismaTx.order,
      prismaTx,
    };
  } catch (error: any) {
    console.log(error);
    return {
      ok: false,
      message: error?.message,
    };
  }
};
