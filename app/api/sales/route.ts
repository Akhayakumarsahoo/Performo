import { NextResponse } from "next/server";

export async function GET() {
  // In a real application, you would fetch this data from your database
  const sales = [
    {
      id: 1,
      amount: 150.0,
      customer: "John Doe",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      amount: 75.5,
      customer: "Jane Smith",
      createdAt: new Date(
        new Date().getTime() - 23 * 60 * 60 * 1000
      ).toISOString(), // 23 hours ago
    },
    {
      id: 3,
      amount: 220.0,
      customer: "Peter Jones",
      createdAt: new Date(
        new Date().getTime() - 48 * 60 * 60 * 1000
      ).toISOString(), // 48 hours ago
    },
  ];

  return NextResponse.json(sales);
}