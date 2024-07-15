-- CreateTable
CREATE TABLE "ProducImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProducImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProducImage" ADD CONSTRAINT "ProducImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
