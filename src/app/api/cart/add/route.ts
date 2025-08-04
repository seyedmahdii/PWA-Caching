import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName } = body;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = {
      success: true,
      message: `Product "${productName}" added to cart successfully`,
      productId,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to add product to cart" },
      { status: 500 }
    );
  }
}
