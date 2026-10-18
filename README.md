# Takatak.shop 🛍️

Takatak.shop is a modern, full-featured e-commerce web application built for the Bangladeshi market. It features a seamless shopping experience with dynamic product variants, automated district-wise shipping fee calculations, cash on delivery support, and a robust admin dashboard for product and inventory management.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server & Client Components)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) & [Lucide Icons](https://lucide.dev/)
- **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
- **Media Storage:** [Cloudinary API](https://cloudinary.com/) (with automatic asset synchronization and deletion cleanup)
- **Markdown Rendering:** `react-markdown` with `remark-gfm`

---

## Key Features

- **Dynamic Product Details & Gallery:** Responsive image gallery with zoom-in capability and formatted markdown product descriptions.
- **Variant Management:** Support for dynamic color and size selections with stock availability checks.
- **Admin Dashboard:** Complete CRUD operations for products (`/dashboard/products`), including instant image preview, custom variant management, and secure server actions.
- **Automated Cloudinary Cleanup:** Automatically syncs uploaded product images and safely deletes assets from Cloudinary when a product is updated or removed.
- **Local Shipping & Address Selector:** Integrated Bangladesh districts and thanas dataset with automatic delivery charge calculation (Inside Dhaka vs Outside Dhaka).
- **Mobile-First Responsive Design:** Optimized layouts with sticky bottom CTAs for mobile users and clean data tables for desktop administrators.