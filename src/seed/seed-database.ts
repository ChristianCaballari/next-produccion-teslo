import prisma from "../lib/prisma";
import { initialData } from "./seed";
import { countries } from "./seed-countries";

async function main() {
  // 1. Borrar registros previos
  // await Promise.all([
  await prisma.orderAddress.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.country.deleteMany();
  await prisma.producImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  // ]);

  const { categories, products, users } = initialData;

  //Create users
  await prisma.user.createMany({
    data: users,
  });

  //Create countries
  await prisma.country.createMany({
    data: countries,
  });

  //Categorias
  const categoriesData = categories.map((name) => ({ name }));
  await prisma.category.createMany({
    data: categoriesData,
  });

  //Products
  const categoriesDB = await prisma.category.findMany();
  const categoriesMap = categoriesDB.reduce((map, category) => {
    map[category.name.toLowerCase()] = category.id;
    return map;
  }, {} as Record<string, string>); //<string = shirt, categoryID>

  products.forEach(async (product) => {
    const { type, images, ...rest } = product;

    const dbProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoriesMap[type],
      },
    });

    // Images
    const imagesData = images.map((image) => ({
      url: image,
      productId: dbProduct.id,
    }));

    await prisma.producImage.createMany({
      data: imagesData,
    });
  });

  console.log("Seed ejecutado correctamente");
}
(() => {
  main();
})();
