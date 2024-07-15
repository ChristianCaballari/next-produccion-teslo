
"use client";
import { getStockBySlug } from '@/actions';
import { titleFont } from '@/config/fonts'
import { useEffect, useState } from 'react';

interface Props {
     slug: string;
}
export const StockLabel = ({ slug }: Props) => {

     const [stock, setStock] = useState<number>(0);
     const [isLoading, setIsLoading] = useState<boolean>(true);

     useEffect(() => {
          const getStock = async () => {
               const inStock = await getStockBySlug(slug);
               setStock(inStock);
               setIsLoading(false);
          }
          getStock();
     }, [slug]);



     return (
          <>
               {
                    isLoading
                         ?
                         (
                              <h1 className={`${titleFont} antialiased font-bold text-lg bg-gray-200 animate-pulse`}>
                                   &nbsp;
                              </h1>
                         ) : (
                              <h1 className={`${titleFont} antialiased font-bold text-lg`}>
                                   Stock:   {stock}
                              </h1>
                         )
               }

          </>
     )
}
