"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { submitOrder } from "../utils/api";
import { getProducts } from "../utils/smartbill/products";

const mochiFlavors = ["Классический", "Матча", "Клубника", "Манго", "Шоколад"];

const orderSchema = z.object({
  clientName: z.string().min(2, "Введите имя клиента"),
  address: z.string().min(5, "Введите адрес доставки"),
  flavor: z.string().min(1, "Выберите вкус"),
  quantity: z
    .number({ invalid_type_error: "Введите количество" })
    .min(1, "Минимум 1")
    .max(100, "Максимум 100"),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    mode: "onTouched",
    defaultValues: { quantity: 1 },
  });

  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    setProductsLoading(true);
    getProducts()
      .then((data) => {
        setProducts(data);
        setProductsError(null);
      })
      .catch((err) => {
        setProductsError(err.message || "Ошибка загрузки товаров");
      })
      .finally(() => setProductsLoading(false));
  }, []);

  const onSubmit = async (data: OrderFormData) => {
    try {
      await submitOrder(data);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        reset();
      }, 2000);
    } catch (error) {
      alert("Ошибка при отправке заказа. Попробуйте еще раз.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-12 mt-12 mb-6">
        <h1 className="text-5xl font-extrabold text-center mb-4 text-pink-600">
          Форма заказа моти
        </h1>
        <p className="text-center text-lg text-gray-500 mb-12">
          Пожалуйста, заполните форму, чтобы сделать заказ на вкусные моти с
          доставкой!
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div>
            <label className="block mb-2 text-lg font-semibold">
              Имя клиента
            </label>
            <input
              type="text"
              {...register("clientName")}
              className={`w-full px-6 py-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.clientName ? "border-red-400" : "border-gray-300"}`}
              placeholder="Введите ваше имя"
            />
            {errors.clientName && (
              <span className="text-red-500 text-base">
                {errors.clientName.message}
              </span>
            )}
          </div>
          <div>
            <label className="block mb-2 text-lg font-semibold">
              Адрес доставки
            </label>
            <input
              type="text"
              {...register("address")}
              className={`w-full px-6 py-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.address ? "border-red-400" : "border-gray-300"}`}
              placeholder="Введите адрес доставки"
            />
            {errors.address && (
              <span className="text-red-500 text-base">
                {errors.address.message}
              </span>
            )}
          </div>
          <div>
            <label className="block mb-2 text-lg font-semibold">
              Вкус моти
            </label>
            <select
              {...register("flavor")}
              className={`w-full px-6 py-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.flavor ? "border-red-400" : "border-gray-300"}`}
              defaultValue=""
            >
              <option value="" disabled>
                Выберите вкус
              </option>
              {mochiFlavors.map((flavor) => (
                <option key={flavor} value={flavor}>
                  {flavor}
                </option>
              ))}
            </select>
            {errors.flavor && (
              <span className="text-red-500 text-base">
                {errors.flavor.message}
              </span>
            )}
          </div>
          <div>
            <label className="block mb-2 text-lg font-semibold">
              Количество
            </label>
            <input
              type="number"
              min={1}
              max={100}
              {...register("quantity", { valueAsNumber: true })}
              className={`w-full px-6 py-4 text-lg border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 ${errors.quantity ? "border-red-400" : "border-gray-300"}`}
              placeholder="1"
            />
            {errors.quantity && (
              <span className="text-red-500 text-base">
                {errors.quantity.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 text-2xl font-extrabold rounded-xl bg-pink-500 hover:bg-pink-600 text-white transition-colors duration-200 disabled:opacity-60 mt-6 shadow-lg"
          >
            {isSubmitting ? "Отправка..." : "Отправить заказ"}
          </button>
          {submitted && (
            <div className="text-green-600 text-center font-bold text-xl mt-6">
              Заказ отправлен!
            </div>
          )}
        </form>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Товары из SmartBill (тест):
          </h2>
          {productsLoading && <div>Загрузка...</div>}
          {productsError && <div className="text-red-500">{productsError}</div>}
          {!productsLoading && !productsError && (
            <ul className="list-disc pl-6 space-y-1">
              {products.map((p) => (
                <li key={p.id || p.name}>
                  {p.name} {p.price ? `— ${p.price}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
