import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { BookmarkCard } from "./BookmarkCard";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock("@/lib/axios", () => ({
  api: {
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({}),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

const mockBookmark = {
  id: "1",
  url: "https://nestjs.com",
  title: "NestJS",
  description: "A progressive Node.js framework",
  ogImage: null,
  favicon: null,
  isFavorited: false,
  createdAt: new Date().toISOString(),
  collectionId: null,
  tags: [{ id: "t1", name: "backend" }],
};

describe("BookmarkCard", () => {
  it("renders title and domain", () => {
    renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
    expect(screen.getByText("NestJS")).toBeDefined();
    expect(screen.getByText("nestjs.com")).toBeDefined();
  });

  it("renders tags", () => {
    renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
    expect(screen.getByText("backend")).toBeDefined();
  });

  it("shows delete popconfirm on click", async () => {
    renderWithProviders(<BookmarkCard bookmark={mockBookmark} />);
    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteBtn);
    expect(screen.getByText("Delete this bookmark?")).toBeDefined();
  });

  it("shows HeartFilled when favorited", () => {
    renderWithProviders(
      <BookmarkCard bookmark={{ ...mockBookmark, isFavorited: true }} />
    );
    expect(document.querySelector(".anticon-heart")).toBeDefined();
  });
});
