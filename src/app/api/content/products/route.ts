import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const content = {
    products: [
      {
        id: "1",
        name: "Apple iPhone 15 Pro",
        description:
          "The latest iPhone with A17 Pro chip, 6.1-inch Super Retina XDR display, and advanced camera system.",
        price: 999,
        category: "Smartphone",
      },
      {
        id: "2",
        name: "Samsung Galaxy S24 Ultra",
        description:
          "Flagship Android phone featuring a 6.8-inch QHD+ display, Snapdragon 8 Gen 3, and 200MP camera.",
        price: 1199,
        category: "Smartphone",
      },
      {
        id: "3",
        name: "Sony WH-1000XM5",
        description:
          "Industry-leading wireless noise-canceling headphones with up to 30 hours of battery life.",
        price: 399,
        category: "Audio",
      },
      {
        id: "4",
        name: "Apple MacBook Air M2",
        description:
          "Ultra-light laptop with Apple M2 chip, 13.6-inch Liquid Retina display, and all-day battery life.",
        price: 1199,
        category: "Laptop",
      },
      {
        id: "5",
        name: "Nintendo Switch OLED",
        description:
          "Versatile gaming console with a vibrant 7-inch OLED screen and enhanced audio for handheld and docked play.",
        price: 349,
        category: "Gaming",
      },
      {
        id: "6",
        name: "Fitbit Charge 6",
        description:
          "Advanced fitness tracker with heart rate monitoring, built-in GPS, and up to 7 days of battery life.",
        price: 159,
        category: "Wearable",
      },
    ],
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(content);
}
