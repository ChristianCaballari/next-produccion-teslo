"use client";

import { createUpdateProduct, deleteProductImage } from "@/actions";
import { ProductImage } from "@/components";
import { ICategory, Product, ProductImage as ProductWithImage } from "@/interfaces";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface Props {
     product: Partial<Product> & { ProductImage?: ProductWithImage[] };
     categories: ICategory[];
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

interface FormInputs {
     title: string;
     slug: string;
     description: string;
     price: number;
     inStock: number;
     sizes: string[];
     tags: string;  // camisa, t-shrit,
     gender: 'men' | 'women' | 'kid' | 'unisex';
     categoryId: string;

     //TODO: Images
     images?: FileList
}

export const ProductForm = ({ product, categories }: Props) => {

     const router = useRouter();

     const {
          handleSubmit,
          register,
          formState: { isValid },
          setValue,
          getValues,
          watch

     } = useForm<FormInputs>({
          defaultValues: {
               ...product,
               tags: product.tags?.join(', '),
               sizes: product.sizes ?? [],

               //TODO: IMAGES
               images: undefined
          }
     });

     watch('sizes');
     const onSizeChanged = (size: string) => {
          const sizes = new Set(getValues("sizes"));//EEs como un arreglo pero no acepta duplicados
          sizes.has(size) ? sizes.delete(size) : sizes.add(size);
          setValue("sizes", Array.from(sizes));
     };

     const onSubmit = async (data: FormInputs) => {
          const formData = new FormData();

          const { images, ...productToSave } = data;

          if (product.id) {
               formData.append("id", product.id ?? "");
          }

          formData.append("title", productToSave.title);
          formData.append("slug", productToSave.slug);
          formData.append("description", productToSave.description);
          formData.append("price", productToSave.price.toString());
          formData.append("inStock", productToSave.inStock.toString());
          formData.append("sizes", productToSave.sizes.toString());
          formData.append("tags", productToSave.tags);
          formData.append("categoryId", productToSave.categoryId);
          formData.append("gender", productToSave.gender);

          if (images) {
               for (let i = 0; i < images.length; i++) {
                    formData.append('images', images[i]);
               }
          }

          const { ok, product: updateProduct } = await createUpdateProduct(formData);

          if (!ok) {
               alert('Producto no se pudo actualizar')
               return;
          }
          router.replace(`/admin/product/${updateProduct?.slug}`)
     }

     return (
          <form onSubmit={handleSubmit(onSubmit)} className="grid px-5 mb-16 grid-cols-1 sm:px-0 sm:grid-cols-2 gap-3">
               {/* Textos */}
               <div className="w-full">
                    <div className="flex flex-col mb-2">
                         <span>Título</span>
                         <input
                              type="text"
                              {...register('title', { required: true })}
                              className="p-2 border rounded-md bg-gray-200" />
                    </div>

                    <div className="flex flex-col mb-2">
                         <span>Slug</span>
                         <input
                              type="text"
                              {...register('slug', { required: true })}
                              className="p-2 border rounded-md bg-gray-200" />
                    </div>

                    <div className="flex flex-col mb-2">
                         <span>Descripción</span>
                         <textarea
                              rows={5}
                              {...register('description', { required: true })}
                              className="p-2 border rounded-md bg-gray-200"
                         ></textarea>
                    </div>

                    <div className="flex flex-col mb-2">
                         <span>Price</span>
                         <input
                              type="number"
                              {...register('price', { required: true, min: 0 })}
                              className="p-2 border rounded-md bg-gray-200" />
                    </div>

                    <div className="flex flex-col mb-2">
                         <span>Tags</span>
                         <input
                              type="text"
                              {...register('tags', { required: true })}
                              className="p-2 border rounded-md bg-gray-200" />
                    </div>

                    <div className="flex flex-col mb-2">
                         <span>Gender</span>
                         <select
                              {...register('gender', { required: true })}
                              className="p-2 border rounded-md bg-gray-200">
                              <option value="">[Seleccione]</option>
                              <option value="men">Men</option>
                              <option value="women">Women</option>
                              <option value="kid">Kid</option>
                              <option value="unisex">Unisex</option>
                         </select>
                    </div>

                    <div className="flex flex-col mb-2">
                         <span>Categoria</span>
                         <select
                              {...register('categoryId', { required: true })}
                              className="p-2 border rounded-md bg-gray-200">
                              <option value="">[Seleccione]</option>
                              {
                                   categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                   ))
                              }

                         </select>
                    </div>

                    <button className="btn-primary w-full">
                         Guardar
                    </button>
               </div>

               {/* Selector de tallas y fotos */}
               <div className="w-full">
                    {/* As checkboxes */}
                    <div className="flex flex-col mb-2">
                         <span>Inventario</span>
                         <input
                              type="number"
                              {...register('inStock', { required: true, min: 0 })}
                              className="p-2 border rounded-md bg-gray-200" />
                    </div>
                    <div className="flex flex-col">

                         <span>Tallas</span>
                         <div className="flex flex-wrap">

                              {sizes.map((size) => (
                                   // bg-blue-500 text-white <--- si está seleccionado
                                   <div
                                        key={size}
                                        onClick={() => onSizeChanged(size)}
                                        className={clsx(
                                             "p-2 border cursor-pointer rounded-md mr-2 mb-2 w-14 transition-all text-center",
                                             {
                                                  "bg-blue-500 text-white": getValues("sizes").includes(size),
                                             }
                                        )}
                                   >
                                        <span>{size}</span>
                                   </div>
                              ))}

                         </div>


                         <div className="flex flex-col mb-2">

                              <span>Fotos</span>
                              <input
                                   type="file"
                                   {...register('images')}
                                   multiple
                                   className="p-2 border rounded-md bg-gray-200"
                                   accept="image/png, image/jpeg, image/avif"
                              />

                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {
                                   product.ProductImage?.map(image => (
                                        <div key={image.id}>
                                             <ProductImage
                                                  alt={product.title ?? ''}
                                                  src={image.url}
                                                  width={300}
                                                  height={300}
                                                  className="rounded-t shadow-md"
                                             />
                                             <button
                                                  type="button"
                                                  onClick={() => deleteProductImage(image.id, image.url)}
                                                  className="btn-danger w-full  rounded-b-xl">Eliminar</button>
                                        </div>
                                   ))}
                         </div>
                    </div>
               </div>

          </form>
     );
};